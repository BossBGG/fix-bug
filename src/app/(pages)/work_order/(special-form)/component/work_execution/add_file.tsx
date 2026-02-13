import React, {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faCloudUpload,
  faFilePdf,
  faTrash,
  faSave,
  faCircleCheck,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import CardCollapse from "../CardCollapse";
import {useAppSelector} from "@/app/redux/hook";
import {uploadWorkOrderExecutionAttachment} from "@/app/api/WorkOrderApi";
import {Survey, UploadedFile, WorkOrderObj} from "@/types";
import {showError} from "@/app/helpers/Alert";
import {DESKTOP_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";
import {useOfflineExecutionAttachmentUpload, isOfflineExecutionAttachmentId} from "@/components/offline/OfflineExecutionAttachmentUpload";

interface AddFileOptions {
  isCompleted?: boolean;
  isReadOnly?: boolean;
  showOnlySave?: boolean;
}

interface AddFileProps {
  data: WorkOrderObj,
  setData: (data: any) => void,
  options?: AddFileOptions;
}

const AddFile: React.FC<AddFileProps> = ({
                                           data,
                                           setData,
                                           options = {}
                                         }) => {
  const {
    isCompleted = false,
    isReadOnly = false,
    showOnlySave = false,
  } = options;

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const screenSize = useAppSelector((state) => state.screen_size);
  const workOrderId = data?.workOrderNo || data?.id || '';
  const { uploadAttachment: uploadAttachmentOffline, isOnline } = useOfflineExecutionAttachmentUpload(workOrderId);

  useEffect(() => {
    if(data.execution?.attachments?.length > 0) {
      let ids: (number | string)[] = [];
      data.execution.attachments.map((attach: UploadedFile) => {
        const tempFile: UploadedFile = {
          id: attach.id,
          name: attach.originalName || attach.name || attach.fileName || "",
          size: attach.size || attach.fileSize || 0,
          url: attach.url,
          file: attach.file,
          isOffline: isOfflineExecutionAttachmentId(attach.id),
        }

        setUploadedFiles((prev) => [...prev, tempFile]);
        ids.push(attach.id)
      })
      setData({...data, attachments: ids});
    }
  }, [data.execution?.attachments])

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["application/pdf"];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly || isCompleted) return;

    const files = event.target.files;
    if (!files) return;

    setUploading(true);

    // Filter valid files first
    const validFiles = Array.from(files).filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`ไฟล์ ${file.name} ไม่ใช่ไฟล์ PDF`);
        return false;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`ไฟล์ ${file.name} มีขนาดเกิน 10MB`);
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

    // Add files with loading state first
    const tempFiles: UploadedFile[] = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file: file,
      url: "",
      isUploading: true,
    }));

    setUploadedFiles((prev) => {
      return [...prev, ...tempFiles];
    });

    // Upload files to minio or save offline
    validFiles.forEach(async (file, index) => {
      try {
        const result = await uploadAttachmentOffline(file);

        if (!result.success) {
          showError(result.error || 'อัปโหลดไม่สำเร็จ');
          setUploadedFiles((prev) => prev.filter((f) => f.id !== tempFiles[index].id));
          processedCount++;
          if (processedCount === validFiles.length) {
            setUploading(false);
          }
          return;
        }

        const uploadedFile: UploadedFile = {
          ...tempFiles[index],
          uploadDate: new Date(),
          isUploading: false,
          id: result.id,
          isOffline: result.isOffline,
        };

        setUploadedFiles(prev => {
          const updated = prev.map(f =>
            f.id === tempFiles[index].id ? uploadedFile : f
          );

          const ids = updated.map(f => f.id);
          setData({...data, attachments: ids});

          return updated;
        });
        processedCount++;
      } catch (error) {
        console.error('Upload failed:', error);
        showError(`การอัปโหลด ${file.name} ล้มเหลว: ${error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'}`);
        processedCount++;
        setUploadedFiles((prev) => {
          return prev.filter((f) => f.id !== tempFiles[index].id)
        });
      }

      // Set uploading to false when all files are processed
      if (processedCount === validFiles.length) {
        setUploading(false);
      }
    });

    // Reset input
    event.target.value = "";
  };

  const removeFile = (id: number | string) => {
    if (isReadOnly || showOnlySave) return;

    setUploadedFiles((prev) => {
      const updated = prev.filter((file) => file.id !== id);
      let newData = {...data, attachments: updated.map((attach) => attach.id)}
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

  const getUploadStatus = (file: UploadedFile) => {
    if (file.isUploading) {
      return "อัพโหลดกำลังดำเนินการ";
    }
    return "อัพโหลดเสร็จสิ้น";
  };

  // Desktop Layout
  if (screenSize === DESKTOP_SCREEN) {
    return (
      <CardCollapse title="ไฟล์แนบเพิ่มเติม">
        <div className="px-4 -mt-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Uploaded Files List */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">
                ไฟล์แนบเพิ่มเติม ({uploadedFiles.length})
              </h4>

              {uploadedFiles.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto ">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white "
                    >
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {file.isUploading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        ) : (
                          <FontAwesomeIcon
                            icon={faFilePdf}
                            className="text-red-500 text-lg"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>

                        {/* Upload Progress/Status */}
                        <div className="flex flex-row mt-1">
                          {file.isUploading ? (
                            <div className="w-full bg-gray-200 rounded-full h-1 ">
                              <div className="bg-purple-600 h-1 rounded-full w-full animate-pulse"></div>
                            </div>
                          ) : (
                            <span className="mr-2 text-xs text-gray-500 ">
                              {formatFileSize(file.size)}{" "}
                              <span className="ml-2">•</span>
                            </span>
                          )}

                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <div className="text-xs text-green-600 mr-2">
                              <FontAwesomeIcon icon={faCircleCheck}/>{" "}
                              {getUploadStatus(file)}
                            </div>

                            {file.uploadDate && (
                              <>
                                <div className="mr-2">
                                  <FontAwesomeIcon
                                    icon={faCalendarDays}
                                    className="text-[#9538EA]"
                                  />
                                </div>
                                <span className="mr-2">
                                  {formatUploadTime(file.uploadDate)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-[#9538EA] hover:text-[#9538EA] p-1 cursor-pointer"
                          disabled={file.isUploading}
                        >
                          <FontAwesomeIcon icon={faSave}/>
                        </Button>

                        {!showOnlySave && !isReadOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-[#E02424] hover:text-[#E02424] p-1 cursor-pointer"
                            disabled={file.isUploading}
                          >
                            <FontAwesomeIcon icon={faTrash}/>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    className="text-4xl text-gray-300 mb-2"
                  />
                  <p>ไม่มีไฟล์แนบเพิ่มเติม</p>
                </div>
              )}
            </div>

            {/* Right Column - Upload Area */}
            {!isCompleted && !isReadOnly && (
              <div className="flex flex-col justify-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faFilePdf}
                        className="text-red-500 text-2xl"
                      />
                    </div>

                    <div>
                      <p className="text-gray-600 mb-2">
                        รองรับไฟล์นามสกุล .pdf
                      </p>
                      <p className="text-sm text-gray-500">ขนาดสูงสุด 10 MB</p>
                    </div>

                    <div>
                      <input
                        type="file"
                        multiple
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        disabled={uploading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                        className="pea-button-outline my-2 w-[50%]"
                        disabled={uploading}
                      >
                        <FontAwesomeIcon
                          icon={faCloudUpload}
                          className="mr-2"
                        />
                        {uploading ? "กำลังอัพโหลด..." : "อัปโหลดไฟล์"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardCollapse>
    );
  }

  // Mobile/Tablet Layout
  return (
    <CardCollapse title="ไฟล์แนบเพิ่มเติม">
      <div className="p-4">
        {/* Show Upload Area only when no files uploaded */}
        {uploadedFiles.length === 0 && !isCompleted && !isReadOnly && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faFilePdf}
                  className="text-red-500 text-xl"
                />
              </div>

              <div>
                <p className="text-gray-600 mb-2">รองรับไฟล์นามสกุล .pdf</p>
                <p className="text-sm text-gray-500">ขนาดสูงสุด 10 MB</p>
              </div>

              <div>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-mobile"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("file-upload-mobile")?.click()
                  }
                  className="pea-button-outline my-2 w-full"
                  disabled={uploading}
                >
                  <FontAwesomeIcon icon={faCloudUpload} className="mr-2"/>
                  {uploading ? "กำลังอัพโหลด..." : "อัปโหลดเอกสาร"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show Files List and Upload Button when files exist */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4 -mt-5">
            <h4 className="font-medium text-gray-700">
              อัพโหลดเอกสารแล้ว (
              {uploadedFiles.filter((file) => !file.isUploading).length}/
              {uploadedFiles.length})
            </h4>

            {/* Uploaded Files List */}
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {file.isUploading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    ) : (
                      <FontAwesomeIcon
                        icon={faFilePdf}
                        className="text-red-500 text-lg"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <div className="flex space-x-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[#9538EA]"
                      disabled={file.isUploading}
                    >
                      <FontAwesomeIcon icon={faSave}/>
                    </Button>

                    {!showOnlySave && !isReadOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-[#E02424]"
                        disabled={file.isUploading}
                      >
                        <FontAwesomeIcon icon={faTrash}/>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer info and Upload Button */}
            {!isCompleted && !isReadOnly && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  รองรับไฟล์นามสกุล .pdf ขนาดสูงสุด 10 MB
                </p>

                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-mobile-more"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("file-upload-mobile-more")?.click()
                  }
                  className="pea-button-outline w-full"
                  disabled={uploading}
                >
                  <FontAwesomeIcon icon={faCloudUpload} className="mr-2"/>
                  อัปโหลดเอกสาร
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </CardCollapse>
  );
};

export default AddFile;
