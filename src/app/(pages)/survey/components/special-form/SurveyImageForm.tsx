import React, {useEffect, useRef, useState} from "react";
import {Survey, UploadedFile} from "@/types";
import {uploadWorkOrderSurveyImage} from "@/app/api/WorkOrderSurveyApi";
import {showError} from "@/app/helpers/Alert";
import {Upload} from "lucide-react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashCan} from "@fortawesome/free-solid-svg-icons";
import {now} from "lodash";

type surveyImageProps = {
  data: Survey,
  updateData: (d: Survey) => void,
  field: string,
  value: string | null
  title: string,
  fileInfo: UploadedFile | null
}

interface ImageState {
  file: File | null;
  preview: string | null;
  id: number | null
}

const SurveyImageForm = ({
                            data,
                            updateData,
                            field,
                            value,
                            title,
                            fileInfo
                          }: surveyImageProps) => {
  const [image, setImages] = useState<ImageState>({file: null, preview: null, id: null});

  useEffect(() => {
    if (value && !image.preview) {
      setImages({file: null, preview: value, id: null});
    }
  }, [value]);

  const handleImageChange = async (file: File | null) => {
    if (file) {
      // Set preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setImages({file, preview, id: null});
      };
      reader.readAsDataURL(file);

      // Upload file
      const response = await uploadWorkOrderSurveyImage(file);

      if (!response || response?.status !== 201) {
        showError('อัปโหลดไม่สำเร็จ');
        setImages({file: null, preview: null, id: null});
        return;
      }

      const newImage = {
        file,
        preview: URL.createObjectURL(file),
        id: response?.data?.id as number
      };
      setImages(newImage);
      updateSurveyData(newImage);
    } else {
      setImages({file: null, preview: null, id: null});
      updateSurveyData({file: null, preview: null, id: null});
    }
  };

  const updateSurveyData = (newImage: ImageState) => {
    const newSurveyData = {
      ...data,
      surveyData: {
        ...data.surveyData,
        serviceSpecificData: {
          ...data.surveyData.serviceSpecificData,
          [field]: newImage.id
        } as any
      }
    } as Survey

    updateData(newSurveyData)
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('รองรับเฉพาะไฟล์ .png หรือ .jpg เท่านั้น');
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('ขนาดไฟล์ต้องไม่เกิน 10 MB');
      return;
    }

    handleImageChange(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <div className="md:w-1/2 w-full mb-2">
      <div className="px-2">
        <div className="border-1 rounded-md p-4">
          <div className="bg-[#E1D2FF] p-3 rounded-md mb-2 text-center font-medium">
            {title}
          </div>
          <div
            onClick={handleClick}
            className="w-full border-2 border-purple-200 rounded-2xl cursor-pointer transition-all hover:border-purple-300 h-[105px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />

            {image.preview ? (
              // State B: Image Selected (Preview Mode)
              <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200 h-full">
                <div className="w-16 h-16 rounded-md border-2 overflow-hidden flex-shrink-0 mr-3">
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 fles jus">
                  <div className="font-medium text-gray-900 truncate">
                    {image.file?.name || 'รูปภาพ'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {image.file ? `${Math.round(image.file.size / 1024)} KB of ${Math.round(image.file.size / 1024)} KB •` : ''}
                  </div>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center mr-2">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>เสร็จสิ้น</span>
                    <span className="ml-2 text-gray-400">
                      {new Date(fileInfo?.updatedAt || now()).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}, {new Date(fileInfo?.updatedAt || now()).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} น.
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-3">
                  <button
                    onClick={handleRemove}
                    className="p-1 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faTrashCan} color="#9538EA"/>
                  </button>
                </div>
              </div>
            ) : (
              // State A: Empty (Upload Mode)
              <div className="flex items-center justify-center h-full p-6">
                <button className="flex items-center space-x-2 px-4 py-2 border border-purple-600 text-purple-600 rounded-full hover:bg-purple-50 transition-colors mr-2 cursor-pointer">
                  <Upload size={16} />
                  <span className="font-medium text-nowrap">อัพโหลดรูปภาพ</span>
                </button>

                <p className="font-semibold text-center">อัปโหลดไฟล์ที่รองรับ 1 รายการ ขนาดสูงสุด 10 MB</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveyImageForm;
