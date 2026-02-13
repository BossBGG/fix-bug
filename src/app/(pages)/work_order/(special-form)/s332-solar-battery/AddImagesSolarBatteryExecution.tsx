import React, { useEffect, useState } from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUpload, faTrash, faSave, faCheck, faArrowUpFromBracket, faCalendarDays } from "@fortawesome/free-solid-svg-icons";

import { useAppSelector } from "@/app/redux/hook";
import CardCollapse from '../component/CardCollapse';
import {MOBILE_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";
import { uploadWorkOrderExecutionImage } from "@/app/api/WorkOrderApi";
import { showError } from "@/app/helpers/Alert";
import { S332SolarBatteryData, UploaddedImage, WorkOrderObj } from "@/types";
import { formatJSDateTH } from "@/app/helpers/DatetimeHelper";

interface AddImagesSolarBatteryProps {
  disabled?: boolean;
  data: WorkOrderObj;
  updateData: (d: WorkOrderObj) => void;
}

interface CategoryType {
  id: string;
  title: string;
  url_key: string;
}

const AddImagesSolarBatteryExecution: React.FC<AddImagesSolarBatteryProps> = ({ data, disabled = false, updateData }) => {
  const [uploadedImages, setUploadedImages] = useState<S332SolarBatteryData>({} as S332SolarBatteryData);
  const [uploading, setUploading] = useState(false);
  const screenSize = useAppSelector(state => state.screen_size);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

  // Define categories for images
  const imageCategories: CategoryType[] = [
    {
      id: 'frontHouseMediaId',
      title: 'ภาพหน้าบ้านลูกค้า',
      url_key: 'frontHouse'
    },
    {
      id: 'inverterSerialMediaId',
      title: 'ภาพ Inverter (Serial Number, รุ่น/model)',
      url_key: 'inverterSerial'
    },
    {
      id: 'solarPanelSerialMediaId',
      title: 'ภาพ แผงโซลาร์ (Serial Number, รุ่น/model)',
      url_key: 'solarPanelSerial'
    },
    {
      id: 'inverterInstallationMediaId',
      title: 'ภาพการติดตั้ง Inverter',
      url_key: 'inverterInstallation'
    },
    {
      id: 'combinerBoxMediaId',
      title: 'ภาพตู้ Combiner',
      url_key: 'combinerBox'
    },
    {
      id: 'mdbInsideMediaId',
      title: 'ภาพภายในตู้ MDB(จุดขนานระบบ Solar Cell)',
      url_key: 'mdbInside'
    },
    {
      id: 'fuseDcMediaId',
      title: 'ภาพ Fuse DC',
      url_key: 'fuseDc'
    },
    {
      id: 'surgeDcMediaId',
      title: 'ภาพ Surge DC',
      url_key: 'surgeDc'
    },
    {
      id: 'cableAcSizeMediaId',
      title: 'ภาพขนาดสาย AC Cable',
      url_key: 'cableAcSize'
    },
    {
      id: 'cableDcSizeMediaId',
      title: 'ภาพขนาดสาย DC Cable',
      url_key: 'cableDcSize'
    },
    {
      id: 'cableGroundSizeMediaId',
      title: 'ภาพขนาดสาย Ground',
      url_key: 'cableGroundSize'
    },
    {
      id: 'ctInstallationMediaId',
      title: 'ภาพจุดคล้อง CT สำหรับ Zero Export',
      url_key: 'ctInstallation'
    },
    {
      id: 'wiringPathAcdcMediaId',
      title: 'ภาพแนวเดินรางไฟ / ก่อ AC / DC',
      url_key: 'wiringPathAcdc'
    },
    {
      id: 'mountingStructureMediaId',
      title: 'ภาพโครงสร้างยึดแผง (Mounting Structure)',
      url_key: 'mountingStructure'
    },
    {
      id: 'solarPanelTopViewMediaId',
      title: 'ภาพแผงโซล่าเซลล์ (Top View)',
      url_key: 'solarPanelTopView'
    },
    {
      id: 'batteryLocationMediaId',
      title: 'ภาพจุดติดตั้ง Battery',
      url_key: 'batteryLocation'
    },
    {
      id: 'groundingSystemMediaId',
      title: 'ภาพระบบกราวด์ (Grounding System)',
      url_key: 'groundingSystem'
    },
    {
      id: 'installationPlanPdfMediaId',
      title: 'ภาพแผนการติดตั้ง (PDF)',
      url_key: 'installationPlanPdf'
    },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (data.execution?.serviceSpecificData) {
      const newData = data;
      newData.serviceSpecificData = {
        ...data.serviceSpecificData,
        ...data.execution.serviceSpecificData
      };
      updateData(newData);

      let images = {} as S332SolarBatteryData;
      imageCategories.map((category) => {
        const item: UploaddedImage = (data.execution.serviceSpecificData as S332SolarBatteryData)[category.url_key as keyof S332SolarBatteryData] as UploaddedImage;
        if (!item) return;

        images = {
          ...images,
          [category.url_key]: {
            id: item?.id as number || 0,
            url: item?.url as string || undefined,
            name: item?.originalName as string || '',
            size: item?.fileSize || 0,
            uploadDate: item?.uploadDate || undefined
          }
        };
      });
      setUploadedImages(images);
    }
  }, [data?.execution?.serviceSpecificData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, categoryId: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      showError(`ไฟล์ ${file.name} ไม่ใช่รูปภาพที่รองรับ (PNG, JPG)`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      showError(`ไฟล์ ${file.name} มีขนาดเกิน 10MB`);
      return;
    }

    setUploading(true);

    try {
      const response = await uploadWorkOrderExecutionImage(file);

      if (!response || response?.status !== 201) {
        showError('อัปโหลดไม่สำเร็จ');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages({
          ...uploadedImages,
          [categoryId]: {
            id: response?.data?.id || 0,
            name: file.name,
            size: file.size,
            url: e.target?.result as string,
            file: file,
            uploadDate: new Date()
          }
        });
        handleUpdateData(categoryId, response?.data?.id || 0);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      showError(`การอัปโหลด ${file.name} ล้มเหลว`);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleUpdateData = (categoryId: string, imageId: number | null) => {
    const newData = {
      ...data,
      serviceSpecificData: {
        ...data.serviceSpecificData,
        [categoryId]: imageId
      }
    };
    updateData(newData);
  };

  const removeImage = (category: CategoryType) => {
    let images = uploadedImages;
    delete images[category.id as keyof S332SolarBatteryData]
    delete images[category.url_key as keyof S332SolarBatteryData];

    setUploadedImages(images);
    handleUpdateData(category.id, null);
  };

  // Mobile Layout
  if (screenSize === MOBILE_SCREEN) {
    return (
      <CardCollapse title="ภาพถ่าย">
        <div className="">
          {imageCategories.map((category, index) => {
            let image = uploadedImages[category.url_key as keyof S332SolarBatteryData] as UploaddedImage;
            if(!image) {
              image = uploadedImages[category.id as keyof S332SolarBatteryData] as UploaddedImage
            }

            return (
              <div key={category.id} className="mb-4">
                {/* Header */}
                <div className="bg-[#E1D2FF] rounded-t-lg p-3 text-center font-medium text-gray-700">
                  {category.title}
                </div>

                {/* Body */}
                <div className="bg-white border border-[#E1D2FF] rounded-b-lg p-4">
                  {image?.url ? (
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
                        <div className="flex items-center space-x-2 text-xs mt-1">
                          <FontAwesomeIcon icon={faCheck} className="text-green-500"/>
                          <span className="text-gray-600">เสร็จสิ้น</span>
                          <span className="text-gray-500">
                            <FontAwesomeIcon icon={faCalendarDays} className="me-1"/>
                            {image.uploadDate ? formatJSDateTH(new Date(image.uploadDate), 'dd MMMM yyyy, HH:mm') : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => removeImage(category)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center cursor-pointer"
                          disabled={disabled}
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-red-600 text-sm"/>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-row items-center space-x-4">
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
                        className="border border-purple-500 text-purple-600 rounded-full px-4 py-2 flex items-center space-x-2 hover:bg-purple-50 transition-colors"
                        disabled={uploading || disabled}
                      >
                        <FontAwesomeIcon icon={faCloudUpload}/>
                        <span>{uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดรูปภาพ'}</span>
                      </button>
                      <div className="text-sm text-gray-500">
                        อัปโหลดไฟล์ที่รองรับ 1 รายการ ขนาดสูงสุด 10 MB
                      </div>
                    </div>
                  )}
                </div>
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
          {imageCategories.map((category, index) => {
            let image = uploadedImages[category.url_key as keyof S332SolarBatteryData] as UploaddedImage;
            if(!image) {
              image = uploadedImages[category.id as keyof S332SolarBatteryData] as UploaddedImage
              console.log('image')
              console.log('uploadedImages >>>> ', uploadedImages)
            }

            return (
              <div key={category.id} className="">
                {/* Header */}
                <div className="bg-[#E1D2FF] rounded-t-lg p-3 text-center font-medium text-gray-700">
                  {category.title}
                </div>

                {/* Body */}
                <div className="bg-white border border-[#E1D2FF] rounded-b-lg p-4">
                  {image?.url ? (
                    /* Filled State - Horizontal Layout */
                    <div className="flex items-center space-x-4">
                      {/* Square Thumbnail */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate mb-1">
                          {image.name}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {formatFileSize(image.size)}
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <FontAwesomeIcon icon={faCheck} className="text-green-500"/>
                          <span className="text-gray-600">เสร็จสิ้น</span>
                          <span className="text-gray-500">
                            <FontAwesomeIcon icon={faCalendarDays} className="me-1"/>
                            {image.uploadDate ? formatJSDateTH(new Date(image.uploadDate), 'dd MMMM yyyy, HH:mm') : ''}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons - Top Right */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => removeImage(category)}
                          className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                          title="ลบ"
                          disabled={disabled}
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-red-600"/>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Empty State - Horizontal Layout */
                    <div className="flex flex-row items-center space-x-4 py-4">
                      <input
                        id={`upload-${category.id}`}
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e, category.id)}
                        className="hidden"
                        disabled={uploading || disabled}
                      />
                      {/* Left: Pill-shaped Button */}
                      <button
                        type="button"
                        onClick={() => document.getElementById(`upload-${category.id}`)?.click()}
                        className="border border-purple-500 text-purple-600 rounded-full px-4 py-2 flex items-center space-x-2 hover:bg-purple-50 transition-colors flex-shrink-0 cursor-pointer"
                        disabled={uploading || disabled}
                      >
                        <FontAwesomeIcon icon={faArrowUpFromBracket} size={"sm"}/>
                        <span>{uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดรูปภาพ'}</span>
                      </button>
                      {/* Right: Helper Text */}
                      <div className="text-sm text-gray-500 flex-1">
                        อัปโหลดไฟล์ที่รองรับ 1 รายการ ขนาดสูงสุด 10 MB
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CardCollapse>
  );
};

export default AddImagesSolarBatteryExecution;

