"use client";
import React, { useCallback, useEffect, useState } from "react";
import InputText from "@/app/components/form/InputText";
import { ParsedAddress, Survey, WorkOrderObj } from "@/types";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import debounce from "lodash/debounce";
import MapLocationSelector from "@/app/(pages)/work_order/(special-form)/component/map/MapLocationSelector";
import { useJsApiLoader } from "@react-google-maps/api";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

interface CustomerInfoProps {
  data: Survey;
  updateData: (value: Survey) => void;
  disabled?: boolean;
}

const libraries: ("places" | "geometry")[] = ["places", "geometry"];
const CustomerInfo = ({ data, updateData, disabled }: CustomerInfoProps) => {
  const [customer, setCustomerInfo] = useState<Survey>(data || ({} as Survey));
  const [showMap, setShowMap] = useState<boolean>(false);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: window.__ENV__?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  useEffect(() => {
    if (!customer.customerRequestNo) {
      setCustomerInfo(data);
      if (!data.customerLatitude && !data.customerLongitude) {
        fetchLatLngFromAddress(data.customerAddress);
      }
    }
  }, [data]);

  const fetchLatLngFromAddress = async (customerAddress: string) => {
    const location = await getLatLngFromAddress(customerAddress);
    if (location) {
      const newData = {
        ...data,
        customerLatitude: location.latitude,
        customerLongitude: location.longitude,
      };
      setCustomerInfo(newData);
      updateData(newData);
    }
  };

  const debounceSetData = useCallback(
    debounce(async (d: Survey, field: string) => {
      if (field === "customerAddress") {
        const location = await getLatLngFromAddress(d.customerAddress);
        d.customerLatitude = location?.latitude || 0;
        d.customerLongitude = location?.longitude || 0;
      }
      updateData(d);
    }, 1000),
    []
  );

  const getLatLngFromAddress = async (address: string) => {
    if (!window.google?.maps?.Geocoder) {
      console.error("โหลด Google Maps API ไม่เสร็จ");
      if (!isLoaded) return;
    }

    if (!address) return;

    // 1. สร้าง Geocoder instance
    const geocoder = new window.google.maps.Geocoder();

    try {
      // 2. เรียกใช้ .geocode() (แบบ Promise)
      const { results } = await geocoder.geocode({ address: address });

      // 3. ตรวจสอบผลลัพธ์และดึงค่า
      if (results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        return { latitude: lat, longitude: lng };
      } else {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude: currentLat, longitude: currentLng } =
                position.coords;
              return { latitude: currentLat, longitude: currentLng };
            },
            () => {
              return { latitude: 0, longitude: 0 };
            }
          );
        } else {
          return { latitude: 0, longitude: 0 };
        }
      }
    } catch (e: any) {
      // console.log(`Geocoding failed: ${e.message || 'Unknown error'}`);
      console.error(e);
      return { latitude: 0, longitude: 0 };
    }
  };

  const handleChange = async (key: keyof Survey, value: string | number) => {
    let newData = { ...data, [key]: value };
    setCustomerInfo(newData);
    await debounceSetData(newData, key);
  };

  const onAddressUpdate = async (
    lat: number,
    lng: number,
    address: ParsedAddress
  ) => {
    let surveyData = {
      ...data,
      customerLatitude: lat,
      customerLongitude: lng,
      customerAddress: address.formattedAddress || "",
    };
    setCustomerInfo(surveyData);
    await debounceSetData(surveyData, "");
  };

  return (
    <CardCollapse title={"ข้อมูลลูกค้า"}>
      <div className="flex flex-wrap px-0 py-2 ">
        <div className="w-full md:w-1/2 p-2">
          <CustomTooltip 
            fieldValue={customer.customerName}
            fieldLabel="ชื่อผู้ใช้ไฟ"
          >
            <InputText
              placeholder="ชื่อผู้ใช้ไฟ"
              label="ชื่อผู้ใช้ไฟ"
              value={customer.customerName}
              onChange={(v) => handleChange("customerName", v)}
              disabled={true}
            />
          </CustomTooltip>
        </div>
        <div className="w-full md:w-1/2 p-2">
          <CustomTooltip 
            fieldValue={customer.customerMobileNo?.toString()}
            fieldLabel="โทรศัพท์มือถือ"
          >
            <InputText
              placeholder="โทรศัพท์มือถือ"
              label="โทรศัพท์มือถือ"
              value={customer.customerMobileNo}
              numberOnly={true}
              onChange={(v) => handleChange("customerMobileNo", v)}
              format="phone"
              disabled={true}
            />
          </CustomTooltip>
        </div>
      </div>

      <div className="flex flex-wrap items-end">
        <div className="w-full md:w-[90%] p-2">
          <CustomTooltip 
            fieldValue={customer.customerAddress}
            fieldLabel="ที่อยู่"
          >
            <InputText
              placeholder="ที่อยู่"
              label="ที่อยู่"
              value={customer.customerAddress}
              onChange={(v) => handleChange("customerAddress", v)}
              disabled={true}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-[10%] p-2">
          <button
            className=" bg-[#671fab] text-white rounded-md px-2 py-3 w-full cursor-pointer"
            onClick={() => setShowMap(true)}
          >
            ไป Google Map
          </button>
        </div>
      </div>

      <div className="flex flex-wrap px-0 items-end">
        <div className="w-full md:w-1/2 p-2">
          <CustomTooltip 
            fieldValue={customer.customerLatitude?.toString()}
            fieldLabel="Latitude"
          >
            <InputText
              placeholder="Latitude"
              label="Latitude"
              value={customer.customerLatitude}
              onChange={(v) => handleChange("customerLatitude", v)}
              format="latitude"
              disabled={true}
            />
          </CustomTooltip>
        </div>
        <div className="w-full md:w-1/2 p-2">
          <CustomTooltip 
            fieldValue={customer.customerLongitude?.toString()}
            fieldLabel="Longitude"
          >
            <InputText
              placeholder="Longitude"
              label="Longitude"
              value={customer.customerLongitude}
              onChange={(v) => handleChange("customerLongitude", v)}
              format="longitude"
              disabled={true}
            />
          </CustomTooltip>
        </div>
      </div>

      {showMap && (
        <MapLocationSelector
          open={showMap}
          onClose={() => setShowMap(false)}
          onUpdateAddress={onAddressUpdate}
          latitude={customer.customerLatitude}
          longitude={customer.customerLongitude}
          disabled={disabled}
        />
      )}
    </CardCollapse>
  );
};

export default CustomerInfo;
