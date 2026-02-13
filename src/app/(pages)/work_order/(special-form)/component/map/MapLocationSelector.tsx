import Modal from "@/app/layout/Modal";
import {Button} from "@/components/ui/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDiamondTurnRight, faLocationDot} from "@fortawesome/free-solid-svg-icons";
import CurrentLocationButton from './CurrentLocationButton';
import {Autocomplete, GoogleMap, Marker, useJsApiLoader} from "@react-google-maps/api";
import React, {useEffect, useRef, useState} from "react";
import {ParsedAddress} from "@/types";

type MapLocationSelector = {
  latitude: number,
  longitude: number,
  open: boolean,
  onClose: () => void,
  onLocationUpdate?: (lat: number, lng: number) => void,
  onUpdateAddress?: (lat: number, lng: number, address: ParsedAddress) => void,
  disabled?: boolean
}

const MapLocationSelector: React.FC<MapLocationSelector> = ({
                                                              latitude,
                                                              longitude,
                                                              open,
                                                              onClose,
                                                              onLocationUpdate,
                                                              onUpdateAddress,
                                                              disabled
                                                            }) => {

  const isLoaded = typeof window !== "undefined" && window.google;
  const [center, setCenter] = useState({lat: latitude, lng: longitude});
  const [markerPos, setMarkerPos] = useState(center);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const placesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        const pacContainer = document.querySelector('.pac-container');
        if (pacContainer && placesContainerRef.current) {
          placesContainerRef.current.appendChild(pacContainer);
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  const handlePlaceChanged = () => {
    console.log('autocompleteRef>>> ', autocompleteRef)
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      console.log('place', place);
      if (place.geometry?.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setCenter(newPos);
        setMarkerPos(newPos);

        onLocationUpdate?.(newPos.lat, newPos.lng)

        // Keep the dropdown open by triggering a new search
        setTimeout(() => {
          const input = document.querySelector('input[placeholder="ค้นหาสถานที่..."]') as HTMLInputElement;
          if (input) {
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
          }
        }, 100);
      }
    }
  };

  const getSafeCoordinate = (coord: any)=> {
    if(typeof coord !== "number" && typeof coord !== 'string') {
      return '0';
    }
    const num = Number(coord);
    if (isNaN(num)) return '0';
    return encodeURIComponent(String(num));
  }

  const openDirectionFromCurrentLocation = () => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      const safeDestLat = getSafeCoordinate(latitude);
      const safeDestLng = getSafeCoordinate(longitude);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: currentLat, longitude: currentLng } = position.coords;
          const safeCurrentLat = getSafeCoordinate(currentLat);
          const safeCurrentLng = getSafeCoordinate(currentLng);
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${safeCurrentLat},${safeCurrentLng}&destination=${safeDestLat},${safeDestLng}&travelmode=driving`;

          if (isMobile) {
            window.location.href = mapUrl;
          } else {
            window.open(mapUrl, '_blank', 'noopener,noreferrer');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

          if (isMobile) {
            const url = `https://maps.google.com/maps?daddr=${safeDestLat},${safeDestLng}&dirflg=d`;
            window.location.href = url;
          } else {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${safeDestLat},${safeDestLng}`;
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        },
        options
      );
    }
  };

  const parseAddressComponents = (
    components: google.maps.GeocoderAddressComponent[],
  ): Omit<ParsedAddress, 'formattedAddress'> => {

    // ฟังก์ชันย่อยสำหรับค้นหา type ที่ต้องการ
    const findComponent = (type: string): string => {
      const component = components.find((c) => c.types.includes(type));
      return component ? component.long_name : '';
    };

    return {
      streetNumber: findComponent('street_number'),
      route: findComponent('route'),
      sublocality: findComponent('sublocality_level_1'), // ตำบล
      district: findComponent('administrative_area_level_2'),
      province: findComponent('administrative_area_level_1'),
      postalCode: findComponent('postal_code'),
      country: findComponent('country'),
    };
  };

  const selectedLocation = async () => {
    if(onUpdateAddress) {
      //update lat lng and address
      await performReverseGeocoding({lat: markerPos.lat, lng: markerPos.lng})
    }else {
      //update lat lng only
      onLocationUpdate?.(markerPos.lat, markerPos.lng)
    }
  }

  const performReverseGeocoding = async (
    location: google.maps.LatLngLiteral,
  ) => {
    if (!isLoaded) {
      console.error('Google Maps API is not loaded yet.');
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    try {
      const { results } = await geocoder.geocode({ location: location });

      if (results && results[0]) {
        const formattedAddress = results[0].formatted_address;

        const parsedComponents = parseAddressComponents(
          results[0].address_components,
        );

        let itemAddress = {
          ...parsedComponents,
          formattedAddress: formattedAddress,
        }
        onUpdateAddress?.(markerPos.lat, markerPos.lng, itemAddress);
      } else {
        console.error('No results found for this location.');
      }
    } catch (e: any) {
      console.error(`Reverse geocoding failed: ${e.message}`);
      console.error(e);
    }
  };

  return (
    <Modal title={"ตรวจสอบ/แก้ไขตำแหน่ง"}
           classContent="w-[80%] xl:w-[65%] 2xl:w-[45%] !max-w-[80%]"
           open={open} onClose={onClose}
           footer={<div className="w-full flex justify-center items-center">
             <Button className="pea-button h-[44px]" onClick={() => selectedLocation()}>
               <FontAwesomeIcon icon={faLocationDot}/>
               เลือกตำแหน่ง
             </Button>
           </div>}
    >
      <div className="w-full flex flex-col gap-2">
        {/* Search Box */}
        {isLoaded && !disabled && (
          <div className="relative">
            <Autocomplete
              onLoad={(ref) => (autocompleteRef.current = ref)}
              onPlaceChanged={handlePlaceChanged}
              options={{
                componentRestrictions: { country: "th" },
                fields: ["place_id", "geometry", "name", "formatted_address", "address_components"],
                types: ["establishment", "geocode"]
              }}
            >
              <input
                type="text"
                placeholder="ค้นหาสถานที่..."
                className="w-full border rounded-md p-2 text-sm focus:outline-none"
                autoComplete="off"
                onFocus={(e) => {
                  // Trigger search when focused to show suggestions
                  setTimeout(() => {
                    const event = new Event('input', { bubbles: true });
                    e.target.dispatchEvent(event);
                  }, 100);
                }}
              />
            </Autocomplete>

            <div ref={placesContainerRef} />
          </div>
        )}

        {/* Map */}
        <div className="w-full h-[400px]">
          {isLoaded ? (
            <div className="relative w-full h-full">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={center}
                zoom={15}
                onLoad={(map) => setMapInstance(map)}
                onClick={(e) => {
                  if (e.latLng && !disabled) {
                    const pos = {
                      lat: e.latLng.lat(),
                      lng: e.latLng.lng(),
                    };
                    setMarkerPos(pos);
                  }
                }}
              >
                <Marker
                  position={markerPos}
                  draggable
                  onDragEnd={(e) => {
                    if (e.latLng && !disabled) {
                      setMarkerPos({
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng(),
                      });
                    }
                  }}
                />
              </GoogleMap>

              <CurrentLocationButton
                map={mapInstance}
                onLocationUpdate={(lat, lng) => {
                  const newPos = { lat, lng };
                  setCenter(newPos);
                  setMarkerPos(newPos);
                  onLocationUpdate?.(lat, lng);
                }}
              />

              <button
                className="absolute right-2 bottom-[140px] bg-white hover:bg-gray-50 w-[45px] h-[45px] cursor-pointer rounded-full border border-gray-200 transition-all duration-200 flex items-center justify-center"
                onClick={openDirectionFromCurrentLocation}
                title="เปิดเส้นทาง"
              >
                <FontAwesomeIcon icon={faDiamondTurnRight} className="text-[18px] text-blue-600"/>
              </button>

            </div>
          ) : (
            <p>Loading map...</p>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default MapLocationSelector;
