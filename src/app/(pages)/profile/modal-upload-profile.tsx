import Modal from "@/app/layout/Modal";
import PreviewProfileImage from "@/app/(pages)/profile/preview-profile-image";
import React, {ChangeEvent, useRef, useState} from "react";
import {faArrowUpFromBracket, faImage} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button} from "@/components/ui/button";
import {resetProfileImage} from "@/app/api/ProfileApi";
import {useAppSelector} from "@/app/redux/hook";
import {dismissAlert, showConfirm, showError, showProgress, showSuccess} from "@/app/helpers/Alert";

interface ModalUploadProfileProps {
  open: boolean;
  handleOpen: (isOpen: boolean) => void;
  onUpload: (file: File) => Promise<any>,
  updatePreview: (preview: string | null) => void;
  fetchData: () => Promise<any>;
}

const ModalUploadProfile = ({
                              open,
                              handleOpen,
                              onUpload,
                              updatePreview,
                              fetchData
                            }: ModalUploadProfileProps) => {

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [useDefaultImg, setUseDefaultImg] = useState<boolean>(false);
  const user = useAppSelector(state => state.user);

  const handleUploadProfile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      updatePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updatePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      await onUpload(file).then(() => {
        handleOpen(false);
      })
    }catch {
      console.log('error uploading file', file);
    } finally {
      updatePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleResetProfileImg = () => {
    setUseDefaultImg(true)
    handleOpen(false)
    showConfirm('ยืนยันการทำรายการหรือไม่ ?').then(async (isConfirm) => {
      if (isConfirm) {
        showProgress()
        const res = await resetProfileImage(user.uuid);
        if(res.status === 200) {
          dismissAlert()
          updatePreview(null);
          showSuccess('ทำรายการสำเร็จ').then(() => {
            handleOpen(false)
            fetchData()
          })
        }else {
          showError(res.data.message || '')
        }
      }else {
        handleOpen(true)
      }
    })
  }

  return (
    <Modal title=""
           open={open}
           onClose={() => handleOpen(false)}
           classContent="w-[80%] xl:w-[60%] 2xl:w-[35%] !max-w-[80%]"
    >
      <div className="w-full flex flex-wrap items-center cursor-pointer">
        <div className="text-center w-full md:w-[50%] md:mb-0 mb-3" onClick={() => handleResetProfileImg()}>
          <PreviewProfileImage src={null} isEdit={false}
                               className={`hover:border-6 hover:border-[#D0BAE5] ${useDefaultImg ? 'border-6 border-[#D0BAE5]' : ''}`}
          />
          <div className="my-2 text-[#671FAB] font-semibold">ใช้รูปต้นฉบับ</div>
        </div>

        <label htmlFor="upload-profile"
               className="w-full md:w-[50%] border-[1px] rounded-md border-[#E1D2FF] text-center p-4 cursor-pointer">
          <FontAwesomeIcon icon={faImage} color="#D0BAE5" style={{fontSize: 40}} />

          <div className="my-4">
            <div>รองรับสกุลไฟล์ .png หรือ .jpg</div>
            <div>ขนาดสูงสุด 10 MB</div>
          </div>

          <Button className="pea-button-outline color-[#671FAB] border-[#671FAB] font-semibold w-full"
                  onClick={() => fileInputRef.current?.click()}>
            <FontAwesomeIcon
              icon={faArrowUpFromBracket}
              className="mr-2"
            />
            อัพโหลดรูปภาพ
          </Button>

          <input type="file" accept="image/png, image/jpeg"
                 className="hidden absolute top-0 left-0 z-1"
                 onChange={handleUploadProfile}
                 ref={fileInputRef}
                 id="upload-profile"/>
        </label>
      </div>
    </Modal>
  )
}

export default ModalUploadProfile;
