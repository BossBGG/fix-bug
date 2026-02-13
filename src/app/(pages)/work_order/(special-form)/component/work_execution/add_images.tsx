import React, {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faCloudUpload,
  faImage,
  faTrash,
  faSave,
  faCalendarDays,
  faCircleCheck,
  faWifi,
} from "@fortawesome/free-solid-svg-icons";
import CardCollapse from "../CardCollapse";
import {useAppSelector} from "@/app/redux/hook";
import {uploadWorkOrderExecutionImage} from "@/app/api/WorkOrderApi";
import {Survey, UploaddedImage, WorkOrderObj} from "@/types";
import {showError} from "@/app/helpers/Alert";
import {DESKTOP_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";
import {useOfflineExecutionImageUpload, isOfflineExecutionImageId} from "@/components/offline/OfflineExecutionImageUpload";

interface UploadedImage {
  id: number | string;
  name: string;
  size: number;
  url: string;
  file: File;
  uploadDate?: Date;
  isUploading?: boolean;
  isOffline?: boolean;
}

interface AddImagesOptions {
  isCompleted?: boolean;
  isReadOnly?: boolean;
}

interface AddImagesProps {
  data: WorkOrderObj,
  setData: (data: any) => void;
  options?: AddImagesOptions;
}

const AddImages: React.FC<AddImagesProps> = ({
                                               setData,
                                               data,
                                               options = {},
                                             }) => {
  const {isCompleted = false, isReadOnly = false} = options;
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const screenSize = useAppSelector((state) => state.screen_size);
  const workOrderId = data?.workOrderNo || data?.id || '';
  const { uploadImage: uploadImageOffline, isOnline } = useOfflineExecutionImageUpload(workOrderId);

  useEffect(() => {
    if(data.execution?.images?.length > 0) {
      let ids: (number | string)[] = [];
      data.execution.images.map((image: UploaddedImage) => {
        const tempImage: UploadedImage = {
          id: image.id,
          name: image.originalName || image.name || image.fileName,
          size: image.size || image.fileSize,
          url: image.url,
          file: image.file,
          isOffline: isOfflineExecutionImageId(image.id),
        }
        setUploadedImages((prev) => [...prev, tempImage]);
        ids.push(image.id)
      })
      setData({...data, images: ids});
    }
  }, [data.execution?.images])

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
  const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"];
  const MAX_FILES = 10;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly || isCompleted) return;

    const files = event.target.files;
    if (!files) return;

    setUploading(true);

    // Check total files limit
    if (uploadedImages.length + files.length > MAX_FILES) {
      showError(`สามารถอัปโหลดได้สูงสุด ${MAX_FILES} ไฟล์`);
      setUploading(false);
      event.target.value = "";
      return;
    }

    // Filter valid files first
    const validFiles = Array.from(files).filter((file) => {
      // Validate file extension
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        showError(`ไฟล์ ${file.name} ไม่ใช่รูปภาพที่รองรับ (PNG, JPG)`);
        return false;
      }

      // Validate MIME type
      if (!ALLOWED_TYPES.includes(file.type)) {
        showError(`ไฟล์ ${file.name} มี MIME type ไม่ถูกต้อง`);
        return false;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        showError(`ไฟล์ ${file.name} มีขนาดเกิน 10MB`);
        return false;
      }

      // Check for empty files
      if (file.size === 0) {
        showError(`ไฟล์ ${file.name} เป็นไฟล์ว่าง`);
        return false;
      }

      return true;
    });

    // If no valid files, stop uploading
    if (validFiles.length === 0) {
      setUploading(false);
      event.target.value = "";
      return;
    }

    let processedCount = 0;

    // Add images with loading state first
    const tempImages: UploadedImage[] = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      url: "",
      file: file,
      isUploading: true,
    }));

    console.log('tempImages >>> ', tempImages)
    setUploadedImages((prev) => {
      return [...prev, ...tempImages];
    });

    validFiles.forEach(async (file, index) => {
      try {
        // Validate file before upload
        const isValidImage = await validateImageFile(file);
        if (!isValidImage) {
          setUploadedImages((prev) => prev.filter((img) => img.id !== tempImages[index].id));
          processedCount++;
          if (processedCount === validFiles.length) {
            setUploading(false);
          }
          return;
        }

        const result = await uploadImageOffline(file);

        if (!result.success) {
          showError(result.error || 'อัปโหลดไม่สำเร็จ');
          setUploadedImages((prev) => prev.filter((img) => img.id !== tempImages[index].id));
          processedCount++;
          if (processedCount === validFiles.length) {
            setUploading(false);
          }
          return;
        }

        const uploadedImage: UploadedImage = {
          ...tempImages[index],
          url: result.preview,
          uploadDate: new Date(),
          isUploading: false,
          id: result.id,
          isOffline: result.isOffline,
        };

        setUploadedImages(prev => {
          const updated = prev.map(img =>
            img.id === tempImages[index].id ? uploadedImage : img
          );

          const ids = updated.map(f => f.id);
          setData({...data, images: ids});

          return updated;
        });

        processedCount++;
      } catch (error) {
        console.error('Upload failed:', error);
        showError(`การอัปโหลด ${file.name} ล้มเหลว: ${error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'}`);

        setUploadedImages((prev) => {
          return prev.filter((img) => img.id !== tempImages[index].id)
        });
        processedCount++;
      }

      if (processedCount === validFiles.length) {
        setUploading(false);
      }
    })

    // Reset input
    event.target.value = "";
  };

  // Validate image file content
  const validateImageFile = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          resolve(false);
          return;
        }

        const uint8Array = new Uint8Array(arrayBuffer);

        // Check PNG signature
        if (file.type === 'image/png') {
          const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
          const isValidPng = pngSignature.every((byte, index) => uint8Array[index] === byte);
          resolve(isValidPng);
          return;
        }

        // Check JPEG signature
        if (file.type === 'image/jpeg') {
          const isValidJpeg = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF;
          resolve(isValidJpeg);
          return;
        }

        resolve(false);
      };

      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 10));
    });
  };

  const removeImage = (id: number | string) => {
    if (isReadOnly) return;

    setUploadedImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      let newData = {...data, images: updated.map((img) => img.id)}
      setData(newData)
      return updated;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUploadTime = (date: Date) => {
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUploadStatus = (image: UploadedImage) => {
    if (image.isUploading) {
      return "อัพโหลดไฟล์";
    }
    return "เสร็จสิ้น";
  };

  // Desktop Layout
  if (screenSize === DESKTOP_SCREEN) {
    return (
      <CardCollapse title="รูปแนบเพิ่มเติม">
        <div className="px-4 -mt-4">
          {/* สำหรับ completed mode แสดงรูปภาพแบบ grid */}
          {isCompleted && uploadedImages.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">
                รูปแนบเพิ่มเติม ({uploadedImages.length})
              </h4>

              {/* Grid layout สำหรับแสดงรูปภาพ */}
              <div className="grid grid-cols-3 gap-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cove r"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Original layout สำหรับ normal mode */
            <div className="grid grid-cols-2 gap-6 ">
              {/* Left Column - Uploaded Images List */}
              <div className="space-y-4 ">
                <h4 className="font-medium text-gray-700">
                  รูปแนบเพิ่มเติม ({uploadedImages.length})
                </h4>

                {uploadedImages.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {uploadedImages.map((image) => (
                      <div
                        key={image.id}
                        className="flex  items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {image.isUploading ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                            </div>
                          ) : (
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 ">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {image.name}
                          </p>

                          {/* Upload Progress/Status */}
                          <div className="flex flex-row mt-1">
                            {image.isUploading ? (
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div className="bg-purple-600 h-1 rounded-full w-full animate-pulse"></div>
                              </div>
                            ) : (
                              <span className="mr-2 text-xs text-gray-500 ">
                                {formatFileSize(image.size)}
                                <span className="ml-2">•</span>
                              </span>
                            )}

                            <div className="flex items-center space-x-2 text-xs text-gray-500 ">
                              <div className="text-xs text-green-600 mr-2">
                                <FontAwesomeIcon icon={faCircleCheck}/>{" "}
                                {getUploadStatus(image)}
                              </div>
                              {image.uploadDate && (
                                <>
                                  <div className="mr-2">
                                    <FontAwesomeIcon
                                      icon={faCalendarDays}
                                      className="text-[#9538EA]"
                                    />
                                  </div>

                                  <span className="mr-2">
                                    {formatUploadTime(image.uploadDate)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {!isReadOnly && (
                          <div className="flex space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-[#9538EA] hover:text-[#9538EA] cursor-pointer"
                              disabled={image.isUploading}
                            >
                              <FontAwesomeIcon icon={faSave}/>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(image.id)}
                              className="text-[#E02424] hover:text-[#E02424] cursor-pointer"
                              disabled={image.isUploading}
                            >
                              <FontAwesomeIcon icon={faTrash}/>
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="text-4xl text-gray-300 mb-2"
                    />
                    <p>ไม่มีรูปแนบเพิ่มเติม</p>
                  </div>
                )}
              </div>

              {/* Right Column - Upload Area (ไม่แสดงใน completed mode) */}
              {!isCompleted && !isReadOnly && (
                <div className="flex flex-col justify-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faImage}
                          className="text-gray-400 text-2xl"
                        />
                      </div>

                      <div>
                        <p className="text-gray-600 mb-2">
                          รองรับไฟล์นามสกุล .png หรือ .jpg
                        </p>
                        <p className="text-sm text-gray-500">
                          ขนาดสูงสุด 10 MB
                        </p>
                      </div>

                      <div>
                        <input
                          type="file"
                          multiple
                          accept=".png,.jpg,.jpeg"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="image-upload"
                          disabled={uploading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("image-upload")?.click()
                          }
                          className="pea-button-outline my-2 w-[50%]"
                          disabled={uploading}
                        >
                          <FontAwesomeIcon
                            icon={faCloudUpload}
                            className="mr-2"
                          />
                          {uploading ? "กำลังอัพโหลด..." : "อัพโหลดรูปภาพ"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardCollapse>
    );
  }

  // Mobile/Tablet Layout
  return (
    <CardCollapse title="รูปแนบเพิ่มเติม">
      <div className="p-4">
        {/* Show Upload Area only when no images uploaded and not completed */}
        {uploadedImages.length === 0 && !isCompleted && !isReadOnly && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faImage}
                  className="text-gray-400 text-xl"
                />
              </div>

              <div>
                <p className="text-gray-600 mb-2">
                  รองรับไฟล์นามสกุล .png หรือ .jpg
                </p>
                <p className="text-sm text-gray-500">ขนาดสูงสุด 10 MB</p>
              </div>

              <div>
                <input
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload-mobile"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("image-upload-mobile")?.click()
                  }
                  className="pea-button-outline my-2 w-full"
                  disabled={uploading}
                >
                  <FontAwesomeIcon icon={faCloudUpload} className="mr-2"/>
                  {uploading ? "กำลังอัพโหลด..." : "ถ่ายภาพ / อัปโหลดรูปภาพ"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show Images List */}
        {uploadedImages.length > 0 && (
          <div className="space-y-4">
            {/* สำหรับ completed mode แสดงเป็น grid */}
            {isCompleted ? (
              <div>
                <h4 className="font-medium text-gray-700 mb-4">
                  รูปแนบเพิ่มเติม ({uploadedImages.length})
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Normal list view */
              <>
                <h4 className="font-medium text-gray-700 -mt-5">
                  อัพโหลดภาพแล้ว (
                  {uploadedImages.filter((img) => !img.isUploading).length}/
                  {uploadedImages.length})
                </h4>

                {/* Uploaded Images List */}
                <div className="space-y-3">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {image.isUploading ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                          </div>
                        ) : (
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {image.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(image.size)}
                        </p>
                      </div>

                      {!isReadOnly && (
                        <div className="flex space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-[#9538EA] cursor-pointer"
                            disabled={image.isUploading}
                          >
                            <FontAwesomeIcon icon={faSave}/>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(image.id)}
                            className="text-[#E02424] cursor-pointer"
                            disabled={image.isUploading}
                          >
                            <FontAwesomeIcon icon={faTrash}/>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer info and Upload Button - ไม่แสดงใน completed mode */}
                {!isCompleted && !isReadOnly && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">
                      รองรับไฟล์นามสกุล .png หรือ .jpg ขนาดสูงสุด 10 MB
                    </p>

                    <input
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload-mobile-more"
                      disabled={uploading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document
                          .getElementById("image-upload-mobile-more")
                          ?.click()
                      }
                      className="pea-button-outline w-full"
                      disabled={uploading}
                    >
                      <FontAwesomeIcon icon={faCloudUpload} className="mr-2"/>
                      ถ่ายภาพ / อัปโหลดรูปภาพ
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </CardCollapse>
  );
};

export default AddImages;
