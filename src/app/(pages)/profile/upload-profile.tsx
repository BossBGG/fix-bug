import {useState} from "react";
import ModalUploadProfile from "@/app/(pages)/profile/modal-upload-profile";
import PreviewProfileImage from "@/app/(pages)/profile/preview-profile-image";

interface UploadProfileProps {
  onUpload: (file: File) => Promise<any>,
  value: string | null,
  fetchData: () => Promise<any>,
}
const UploadProfile = ({
                         onUpload,
                         value,
                         fetchData
                       }: UploadProfileProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [showUpdate, setShowUpdate] = useState<boolean>(false);

  const src = preview ?? value ?? null;

  return (
    <div>
      <div onClick={() => {setShowUpdate(true)}}>
        <PreviewProfileImage src={src} className="border-6 border-[#D0BAE5]"/>
      </div>

      <ModalUploadProfile open={showUpdate}
                          handleOpen={(isOpen: boolean) => setShowUpdate(isOpen)}
                          onUpload={onUpload}
                          updatePreview={setPreview}
                          fetchData={fetchData}
      />
    </div>

  )
}

export default UploadProfile;
