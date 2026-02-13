import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';

interface CurrentLocationButtonProps {
  map: google.maps.Map | null;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({ map, onLocationUpdate }) => {
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = { lat: latitude, lng: longitude };

        if (map) {
          map.panTo(newPos);
        }

        onLocationUpdate?.(latitude, longitude);
      },
      (error) => {
        console.error('Error getting current location:', error.message);
        alert('Unable to get your current location. Please check your location permissions.');
      },
      /*{
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }*/
    );
  };

  return (
    <button
      className="absolute right-2 bottom-[190px] bg-white hover:bg-gray-50 w-[45px] h-[45px] cursor-pointer rounded-full border border-gray-200 transition-all duration-200 flex items-center justify-center"
      onClick={getCurrentLocation}
      title="ตำแหน่งปัจจุบัน"
    >
      <FontAwesomeIcon icon={faLocationCrosshairs} className="text-[18px] text-gray-700"/>
    </button>
  );
};

export default CurrentLocationButton;
