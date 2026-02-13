import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUpload, faVideo, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";
import { useAppSelector } from "@/app/redux/hook";
import CardCollapse from '../component/CardCollapse';
import {MOBILE_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface UploadedVideo {
  id: string;
  name: string;
  size: number;
  url: string;
  file: File;
  uploadDate: Date;
}

interface AddVideoProps {
  onVideosChange?: (videos: UploadedVideo[]) => void;
}

const AddVideo: React.FC<AddVideoProps> = ({ onVideosChange }) => {
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [uploading, setUploading] = useState(false);
  const screenSize = useAppSelector(state => state.screen_size);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for videos
  const ALLOWED_TYPES = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv'];

  // Define categories for videos
  const videoCategories = [
    {
      id: 'video_air_conditioner_ac',
      title: 'คลิปการทำงานของเครื่องปรับอากาศยังสามารถทำงานโดยที่',
      subtitle: 'Off เบรกเกอร์ AC ที่รับไฟจากการไฟฟ้า'
    },
    {
      id: 'video_air_conditioner_dc',
      title: 'คลิปการทำงานของเครื่องปรับอากาศยังสามารถทำงานโดยที่',
      subtitle: 'Off เบรกเกอร์ DC ที่รับไฟจากแผง'
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
    }) + ', ' + date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    }) + ' น.';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, categoryId: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(`ไฟล์ ${file.name} ไม่ใช่วิดีโอที่รองรับ (MP4, AVI, MOV, WMV, MKV)`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert(`ไฟล์ ${file.name} มีขนาดเกิน 50MB`);
      return;
    }

    setUploading(true);

    // Create video preview URL
    const videoUrl = URL.createObjectURL(file);

    const newVideo: UploadedVideo = {
      id: categoryId,
      name: file.name,
      size: file.size,
      url: videoUrl,
      file: file,
      uploadDate: new Date()
    };

    setUploadedVideos(prev => {
      // Replace existing video for this category or add new one
      const filtered = prev.filter(video => video.id !== categoryId);
      const updated = [...filtered, newVideo];
      onVideosChange?.(updated);
      return updated;
    });
    setUploading(false);

    // Reset input
    event.target.value = '';
  };

  const removeVideo = (categoryId: string) => {
    setUploadedVideos(prev => {
      // Revoke object URL to free memory
      const videoToRemove = prev.find(video => video.id === categoryId);
      if (videoToRemove) {
        URL.revokeObjectURL(videoToRemove.url);
      }

      const updated = prev.filter(video => video.id !== categoryId);
      onVideosChange?.(updated);
      return updated;
    });
  };

  const saveVideo = (categoryId: string) => {
    console.log('Saving video:', categoryId);
    alert('บันทึกวิดีโอเรียบร้อยแล้ว');
  };

  const getVideoForCategory = (categoryId: string) => {
    return uploadedVideos.find(video => video.id === categoryId);
  };

  // Mobile Layout
  if (screenSize === MOBILE_SCREEN) {
    return (
      <CardCollapse title="คลิปวิดีโอ">
        <div className="p-4 space-y-4">
          {videoCategories.map((category) => {
            const video = getVideoForCategory(category.id);

            return (
              <div key={category.id} className="bg-white border border-[#E1D2FF] rounded-lg p-4">
                <div className="bg-[#E1D2FF] rounded-lg p-3 mb-3 text-center">
                  <div className="font-medium text-gray-700">
                    {category.title}
                  </div>
                  <div className="text-red-500 font-medium mt-1">
                    {category.subtitle}
                  </div>
                </div>

                {video ? (
                  <div className="space-y-3">
                    {/* Video thumbnail and details */}
                    <div className="flex items-center space-x-3 bg-white rounded-lg p-3 border border-gray-200">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <FontAwesomeIcon icon={faVideo} className="text-gray-500 text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {video.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(video.size)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveVideo(video.id)}
                          className="w-8 h-8 bg-purple-100 hover:bg-purple-200 rounded-lg flex items-center justify-center"
                          title="บันทึก"
                        >
                          <FontAwesomeIcon icon={faSave} className="text-purple-600 text-sm" />
                        </button>
                        <button
                          onClick={() => removeVideo(video.id)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center"
                          title="ลบ"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-red-600 text-sm" />
                        </button>
                      </div>
                    </div>

                    {/* Video status info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 px-3">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                        <span>เสร็จสิ้น</span>
                      </div>
                      <span>{formatDate(video.uploadDate)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center border border-[#E1D2FF] rounded-lg p-4">
                    <label htmlFor={`upload-${category.id}`}>
                      <Button
                        type="button"
                        variant="outline"
                        className="pea-button-outline w-full"
                        disabled={uploading}
                      >
                        <FontAwesomeIcon icon={faCloudUpload} className="mr-2" />
                        {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดวิดีโอ'}
                      </Button>
                    </label>
                    <input
                      id={`upload-${category.id}`}
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, category.id)}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      สามารถอัพโหลด 1 วิดีโอ ขนาดสูงสุด 50 MB
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
    <CardCollapse title="คลิปวิดีโอ">
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {videoCategories.map((category) => {
            const video = getVideoForCategory(category.id);

            return (
              <div key={category.id} className="bg-white border border-[#E1D2FF] rounded-lg p-4">
                {/* Title Bar */}
                <div className="bg-[#E1D2FF] rounded-lg p-3 mb-4 text-center">
                  <div className="font-medium text-gray-700">
                    {category.title}
                  </div>
                  <div className="text-red-500 font-medium mt-1">
                    {category.subtitle}
                  </div>
                </div>

                {video ? (
                  /* Video Details in Row Layout */
                  <div className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-gray-200">
                    {/* Video Icon */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <FontAwesomeIcon icon={faVideo} className="text-gray-500 text-2xl" />
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate mb-1">
                        {video.name}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {formatFileSize(video.size)}
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="inline-flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                          <span className="text-gray-600">เสร็จสิ้น</span>
                        </span>
                        <span className="text-gray-500">
                          {formatDate(video.uploadDate)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => saveVideo(video.id)}
                        className="w-10 h-10 bg-purple-100 hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors"
                        title="บันทึก"
                      >
                        <FontAwesomeIcon icon={faSave} className="text-purple-600" />
                      </button>
                      <button
                        onClick={() => removeVideo(video.id)}
                        className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors"
                        title="ลบ"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload Section */
                  <div className="flex flex-row justify-center gap-4 text-center py-8 border border-[#E1D2FF] rounded-lg">
                    <label htmlFor={`upload-${category.id}`}>
                      <Button
                        type="button"
                        variant="outline"
                        className="pea-button-outline"
                        disabled={uploading}
                      >
                        <FontAwesomeIcon icon={faCloudUpload} className="mr-2" />
                        {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดวิดีโอ'}
                      </Button>
                    </label>
                    <input
                      id={`upload-${category.id}`}
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, category.id)}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="text-sm text-gray-500 mt-2">
                      สามารถอัพโหลด 1 วิดีโอ ขนาดสูงสุด 50 MB
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

export default AddVideo;
