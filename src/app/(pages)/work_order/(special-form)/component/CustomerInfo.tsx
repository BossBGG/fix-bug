"use client";
import React, { useCallback, useEffect, useState } from "react";
import InputText from "@/app/components/form/InputText";
import { ParsedAddress, WorkOrderObj } from "@/types";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import debounce from "lodash/debounce";
import MapLocationSelector from "@/app/(pages)/work_order/(special-form)/component/map/MapLocationSelector";
import { useJsApiLoader } from "@react-google-maps/api";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

interface CustomerInfoProps {
  data: WorkOrderObj;
  updateData: (value: WorkOrderObj) => void;
  disabled?: boolean;
  hasInitialCustomerBp?: boolean;
  hasInitialCustomerCa?: boolean;
}

const libraries: ("places" | "geometry")[] = ["places", "geometry"];
const CustomerInfo = ({
  data,
  updateData,
  disabled,
  hasInitialCustomerBp,
  hasInitialCustomerCa,
}: CustomerInfoProps) => {
  const [workOrder, setWorkOrder] = useState<WorkOrderObj>(data);
  const [showMap, setShowMap] = useState<boolean>(false);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: window.__ENV__?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  useEffect(() => {
    if (!workOrder.workOrderNo) {
      setWorkOrder(data);
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
      setWorkOrder(newData);
      updateData(newData);
    }
  };

  const debounceSetAddressData = useCallback(
    debounce(async (d: WorkOrderObj) => {
      const location = await getLatLngFromAddress(d.customerAddress);
      d.customerLatitude = location?.latitude || 0;
      d.customerLongitude = location?.longitude || 0;
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

  const handleChange = async (
    key: keyof WorkOrderObj,
    value: string | number
  ) => {
    let newData = { ...data, [key]: value };
    setWorkOrder(newData);
    if (key === "customerAddress") {
      await debounceSetAddressData(newData);
    } else {
      updateData(newData);
    }
  };

  const onAddressUpdate = async (
    lat: number,
    lng: number,
    address: ParsedAddress
  ) => {
    let work_order = {
      ...data,
      customerAddress: address.formattedAddress,
      customerLatitude: lat,
      customerLongitude: lng,
      // latitude: lat,
      // longitude: lng
    }

    setWorkOrder(work_order);
    updateData(work_order);
  };

  return (
    <CardCollapse title={"ข้อมูลลูกค้า"}>
      <div className="flex flex-wrap px-0 py-2 ">
        <div className="w-full md:w-1/2 p-2">
          <CustomTooltip
            fieldValue={workOrder.customerName}
            fieldLabel="ชื่อลูกค้า"
            variant="label"
          >
            <InputText
              placeholder="ชื่อลูกค้า"
              label="ชื่อลูกค้า"
              value={workOrder.customerName}
              onChange={(v) => handleChange("customerName", v)}
              disabled={disabled}
              isRequired={true}
            />
          </CustomTooltip>
        </div>
        <div className="w-full md:w-1/2 p-2">
          <CustomTooltip
            fieldValue={workOrder.customerMobileNo}
            fieldLabel="โทรศัพท์มือถือ"
            variant="label"
          >
            <InputText
              placeholder="โทรศัพท์มือถือ"
              label="โทรศัพท์มือถือ"
              value={workOrder.customerMobileNo}
              numberOnly={true}
              onChange={(v) => handleChange("customerMobileNo", v)}
              format="phone"
              disabled={disabled}
              isRequired={true}
            />
          </CustomTooltip>
        </div>
        <div className="w-full md:w-1/2 p-2">
          <CustomTooltip
            fieldValue={workOrder.customerAddress}
            fieldLabel="ที่อยู่ขอรับบริการ"
            variant="label"
          >
            <InputText
              placeholder="ที่อยู่ขอรับบริการ"
              label="ที่อยู่ขอรับบริการ"
              value={workOrder.customerAddress}
              onChange={(v) => handleChange("customerAddress", v)}
              disabled={disabled}
              isRequired={true}
            />
          </CustomTooltip>
        </div>
        <div className="w-full md:w-1/2 p-2">
          <CustomTooltip
            fieldValue={workOrder.customerEmail}
            fieldLabel="อีเมล"
            variant="label"
          >
            <InputText
              placeholder="อีเมล"
              label="อีเมล"
              value={workOrder.customerEmail}
              onChange={(v) => handleChange("customerEmail", v)}
              disabled={disabled}
            />
          </CustomTooltip>
        </div>
        <div className="w-full md:w-1/2 p-2">
          <CustomTooltip
            fieldValue={workOrder.customerBp}
            fieldLabel="BP"
            variant="label"
          >
            <InputText
              placeholder="BP"
              label="BP"
              value={workOrder.customerBp}
              onChange={(v) => handleChange("customerBp", v)}
              disabled={disabled || hasInitialCustomerBp}
              // isRequired={true}
            />
          </CustomTooltip>
        </div>
        <div className="w-full md:w-1/2 p-2">
          <CustomTooltip
            fieldValue={workOrder.customerCa}
            fieldLabel="CA"
            variant="label"
          >
            <InputText
              placeholder="CA"
              label="CA"
              value={workOrder.customerCa}
              onChange={(v) => handleChange("customerCa", v)}
              disabled={disabled || hasInitialCustomerCa}
              // isRequired={true}
            />
          </CustomTooltip>
        </div>
      </div>

      <div className="flex flex-wrap px-0 items-end">
        <div className="w-full md:w-[50%] p-2">
          <CustomTooltip
            fieldValue={workOrder.customerLatitude?.toString()}
            fieldLabel="Latitude"
            variant="label"
          >
            <InputText
              placeholder="Latitude"
              label="Latitude"
              value={workOrder.customerLatitude}
              onChange={(v) => handleChange("customerLatitude", v)}
              format="latitude"
              disabled={disabled}
            />
          </CustomTooltip>
        </div>
        <div className="w-full lg:w-[32%] md:w-[28%] p-2">
          <CustomTooltip
            fieldValue={workOrder.customerLongitude?.toString()}
            fieldLabel="Longitude"
            variant="label"
          >
            <InputText
              placeholder="Longitude"
              label="Longitude"
              value={workOrder.customerLongitude}
              onChange={(v) => handleChange("customerLongitude", v)}
              format="longitude"
              disabled={disabled}
            />
          </CustomTooltip>
        </div>

        <div className="w-full lg:w-[18%] md:w-[22%] p-2">
          <button
            className=" bg-[#671fab] text-white rounded-md px-2 py-[10px] w-full cursor-pointer text-nowrap"
            onClick={() => setShowMap(true)}
          >
            ไป Google Map
          </button>
        </div>
      </div>

      {showMap && (
        <MapLocationSelector
          open={showMap}
          onClose={() => setShowMap(false)}
          onUpdateAddress={onAddressUpdate}
          latitude={workOrder.customerLatitude}
          longitude={workOrder.customerLongitude}
          disabled={disabled}
        />
      )}
    </CardCollapse>
  );
};

export default CustomerInfo;
