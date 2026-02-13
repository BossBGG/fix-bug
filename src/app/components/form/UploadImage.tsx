'use client';

import React, { useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';

interface ImageUploadCardProps {
  onChange: (file: File | null) => void;
  value: string | null;
}

const ImageUploadCard: React.FC<ImageUploadCardProps> = ({ onChange, value }) => {
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

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(file);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative group">
      <div
        onClick={handleClick}
        className="aspect-square w-full border-2 border-purple-200 rounded-2xl cursor-pointer transition-all hover:border-purple-300 h-[312px]"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
        />

        {value ? (
          // State B: Image Selected (Preview Mode)
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {/* Remove button*/}
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          // State A: Empty (Upload Mode)
          <div className="flex flex-col items-center justify-center h-full p-6 space-y-4">
            <Image size={48} className="text-purple-300" />

            <div className="text-center space-y-1">
              <p className="text-sm text-gray-500">รองรับสกุลไฟล์ .png หรือ .jpg</p>
              <p className="text-sm text-gray-500">ขนาดสูงสุด 10 MB</p>
            </div>

            <button className="flex items-center space-x-2 px-4 py-2 border border-purple-600 text-purple-600 rounded-full hover:bg-purple-50 transition-colors">
              <Upload size={16} />
              <span className="text-sm font-medium">อัพโหลดรูปภาพ</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadCard;
