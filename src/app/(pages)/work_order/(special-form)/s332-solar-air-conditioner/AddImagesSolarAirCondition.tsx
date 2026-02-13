import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUpload, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";

import { useAppSelector } from "@/app/redux/hook";
import CardCollapse from '../component/CardCollapse';
import {MOBILE_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface UploadedImage {
  id: string;
  name: string;
  size: number;
  url: string;
  file: File;
  uploadDate: Date;
}

interface AddImagesSolarAirProps {
  onImagesChange?: (images: UploadedImage[]) => void;
  disabled?: boolean;
}

const AddImagesSolarAirCondition: React.FC<AddImagesSolarAirProps> = ({ onImagesChange, disabled = false }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const screenSize = useAppSelector(state => state.screen_size);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

  // Define categories for images
  const imageCategories = [
    {
      id: 'front_house_media_id',
      title: 'ภาพหน้าบ้านลูกค้า'
    },
    {
      id: 'roof_installation_media_id',
      title: 'ภาพหลังคาที่จะติดตั้งแผงโซลาร์'
    },
    {
      id: 'outdoor_unit_location_media_id',
      title: 'ภาพตำแหน่งติดตั้งคอยล์ร้อน'
    },
    {
      id: 'indoor_unit_location_media_id',
      title: 'ภาพตำแหน่งติดตั้งคอยล์เย็น'
    },
    {
      id: 'ac_wiring_path_media_id',
      title: 'ภาพแนวการเดินสายไฟ AC'
    },
    {
      id: 'dc_wiring_path_media_id',
      title: 'ภาพแนวการเดินสายไฟ DC'
    }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, categoryId: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(`ไฟล์ ${file.name} ไม่ใช่รูปภาพที่รองรับ (PNG, JPG)`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert(`ไฟล์ ${file.name} มีขนาดเกิน 10MB`);
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage: UploadedImage = {
        id: categoryId,
        name: file.name,
        size: file.size,
        url: e.target?.result as string,
        file: file,
        uploadDate: new Date()
      };

      setUploadedImages(prev => {
        // Replace existing image for this category or add new one
        const filtered = prev.filter(img => img.id !== categoryId);
        const updated = [...filtered, newImage];
        onImagesChange?.(updated);
        return updated;
      });
      setUploading(false);
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
  };

  const removeImage = (categoryId: string) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.id !== categoryId);
      onImagesChange?.(updated);
      return updated;
    });
  };

  const saveImage = (categoryId: string) => {
    console.log('Saving image:', categoryId);
    alert('บันทึกรูปภาพเรียบร้อยแล้ว');
  };

  const getImageForCategory = (categoryId: string) => {
    return uploadedImages.find(img => img.id === categoryId);
  };

  // Mobile Layout
  if (screenSize === MOBILE_SCREEN) {
    return (
      <CardCollapse title="ภาพถ่าย">
        <div className="">
          {imageCategories.map((category) => {
            const image = getImageForCategory(category.id);

            return (
              <div key={category.id} className="bg-white border border-[#E1D2FF] rounded-lg p-2 mb-4">
                <div className="bg-[#E1D2FF] rounded-lg p-3 mb-3 text-center font-medium text-gray-700">
                  {category.title}
                </div>

                {image ? (
                  <div className="space-y-3">
                    {/* Image thumbnail and details */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {image.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(image.size)}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveImage(image.id)}
                            className="w-8 h-8 bg-purple-100 hover:bg-purple-200 rounded-lg flex items-center justify-center"
                            disabled={disabled}
                          >
                            <FontAwesomeIcon icon={faSave} className="text-purple-600 text-sm" />
                          </button>
                          <button
                            onClick={() => removeImage(image.id)}
                            className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center"
                            disabled={disabled}
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-red-600 text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center border border-[#E1D2FF] rounded-lg p-4">
                    <input
                      id={`upload-${category.id}`}
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={(e) => handleFileUpload(e, category.id)}
                      className="hidden"
                      disabled={uploading || disabled}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById(`upload-${category.id}`)?.click()}
                      className="pea-button-outline my-2 w-full"
                      disabled={uploading || disabled}
                    >
                      <FontAwesomeIcon icon={faCloudUpload} className="mr-2" />
                      {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดรูปภาพ'}
                    </button>
                    <div className="text-xs text-gray-500 mt-2">
                      อัปโหลดไฟล์ที่รองรับ 1 รายการ ขนาดสูงสุด 10 MB
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardCollapse>
    );
  }

  // Desktop Layout
  return (
    <CardCollapse title="ภาพถ่าย">
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {imageCategories.map((category) => {
            const image = getImageForCategory(category.id);

            return (
              <div key={category.id} className="bg-white border border-[#E1D2FF] rounded-lg p-4">
                {/* Title Bar */}
                <div className="bg-[#E1D2FF] rounded-lg p-3 mb-4 text-center font-medium text-gray-700">
                  {category.title}
                </div>

                {image ? (
                  /* Image Details in Row Layout */
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-4">
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Image Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate mb-1">
                          {image.name}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {formatFileSize(image.size)}
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="inline-flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                            <span className="text-gray-600">เสร็จสิ้น</span>
                          </span>
                          <span className="text-gray-500">
                            {formatDate(image.uploadDate)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveImage(image.id)}
                          className="w-10 h-10 bg-purple-100 hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors"
                          title="บันทึก"
                          disabled={disabled}
                        >
                          <FontAwesomeIcon icon={faSave} className="text-purple-600" />
                        </button>
                        <button
                          onClick={() => removeImage(image.id)}
                          className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors"
                          title="ลบ"
                          disabled={disabled}
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Upload Section */
                  <div className="flex flex-row text-center py-8 gap-4 justify-center border border-[#E1D2FF] rounded-lg">
                     <input
                      id={`upload-${category.id}`}
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={(e) => handleFileUpload(e, category.id)}
                      className="hidden"
                      disabled={uploading || disabled}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById(`upload-${category.id}`)?.click()}
                      className="pea-button-outline my-2 w-[30%]"
                      disabled={uploading || disabled}
                    >
                      <FontAwesomeIcon icon={faCloudUpload} className="mr-2" />
                      {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดรูปภาพ'}
                    </button>
                    <div className="text-md text-gray-500 mt-5">
                      อัปโหลดไฟล์ที่รองรับ 1 รายการ ขนาดสูงสุด 10 MB
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </CardCollapse>
  );
};

export default AddImagesSolarAirCondition;
