import React, {useEffect, useState} from "react";
import ImageUploadCard from "@/app/components/form/UploadImage";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import {Survey} from "@/types";
import {uploadWorkOrderSurveyImage} from "@/app/api/WorkOrderSurveyApi";
import {showError, showWarning} from "@/app/helpers/Alert";
import {useOfflineSurveyImageUpload, isOfflineImageId} from "@/components/offline/OfflineSurveyImageUpload";

type surveyImageProps = {
  data: Survey,
  updateData: (d: Survey) => void,
  surveyId: string
}

interface ImageState {
  file: File | null;
  preview: string | null;
  id: number | string | null;
  isOffline?: boolean;
}

const SurveyImages = ({
                        data,
                        updateData,
                        surveyId
                      }: surveyImageProps) => {
  const [images, setImages] = useState<ImageState[]>([
    {file: null, preview: null, id: null},
    {file: null, preview: null, id: null},
    {file: null, preview: null, id: null},
  ]);
  const { uploadImage, deleteOfflineImage, isOnline } = useOfflineSurveyImageUpload(surveyId);

  useEffect(() => {
    const newImages: ImageState[] = [
      {file: null, preview: null, id: null},
      {file: null, preview: null, id: null},
      {file: null, preview: null, id: null}
    ];

    if(data.surveyData?.images?.length > 0) {
      data.surveyData.images.forEach((image: any, index: number) => {
        if(index < 3) {
          newImages[index] = {
            file: null,
            preview: image.url,
            id: parseInt(image.file_id)
          };
        }
      });
    }

    setImages(newImages);
  }, [data.surveyData?.images]);

  const handleImageChange = (index: number) => async (file: File | null) => {
    let newImages = [...images];
    if (file) {
      const result = await uploadImage(file);

      if (!result.success) {
        showError(result.error || 'อัปโหลดไม่สำเร็จ');
        return;
      }

      newImages[index] = {
        file,
        preview: result.preview,
        id: result.id,
        isOffline: result.isOffline
      };
      setImages([...newImages]);
      updateSurveyData(newImages);

      if (result.isOffline) {
        showWarning('รูปภาพถูกบันทึกในโหมดออฟไลน์ จะถูกอัปโหลดเมื่อเชื่อมต่ออินเทอร์เน็ต');
      }
    } else {
      const currentImage = newImages[index];
      if (currentImage.id && isOfflineImageId(currentImage.id)) {
        await deleteOfflineImage(currentImage.id as string);
      }
      newImages[index] = {file: null, preview: null, id: null};
      console.log('newImage >>>> ', newImages)
      setImages([...newImages]);
      updateSurveyData(newImages)
    }
  };

  const updateSurveyData = (newImages: ImageState[]) => {
    console.log('newImages >>> ', newImages)
    const newSurveyData = {
      ...data,
      images: newImages.filter((image) => image.id !== null).map((image) => image.id)
    } as Survey

    updateData(newSurveyData)
  }

  return (
    <CardCollapse title="รูปแนบเพิ่มเติม">
      <div className="w-full">
        <div className="flex flex-wrap">
          {images.map((image, index) => (
            <div key={index} className="md:w-1/3 w-full px-3">
              <ImageUploadCard
                value={image.preview}
                onChange={handleImageChange(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </CardCollapse>
  )
}

export default SurveyImages;
