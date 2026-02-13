import {faSignature, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ChangeEvent, useRef, useState} from "react";
import {showConfirm} from "@/app/helpers/Alert";

interface SignatureUploadProps {
  onUpload: (file: File | string ) => Promise<any>,
  value: string | null,
  onRemoveSign: () => Promise<any>,
}

const SignatureUpload = ({
                           onUpload,
                           onRemoveSign,
                           value
                         }: SignatureUploadProps ) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if(!file.type.startsWith("image/")) {
      setPreview(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
     await onUpload(file)
    }catch(err) {
      console.error('upload sign failed', err);
    }finally {
      setPreview(null);
    }

    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const deleteSignature = () => {
    showConfirm('ต้องการลบลายเซ็นอิเล็กทรอนิกส์นี้ใช่หรือไม่ ?').then(async (isConfirm) => {
      if(isConfirm) {
        if(fileInputRef.current) {
          fileInputRef.current.value = ""
          setPreview(null)
        }

        try {
          await onRemoveSign()
        }catch(error) {
          console.error('remove sign failed', error)
        }finally {
          setPreview(null);
        }
      }
    })
  }

  const src = preview ?? value ?? null

  return (
    <div className="relative">
      <label htmlFor="upload-signature"
             className="cursor-pointer border-1 z-1 border-[#D0BAE5] rounded-[20px] p-[30px] flex flex-col items-center justify-center relative">
        {
          src ?
            <div className="relative top-0 left-0 cursor-pointer w-[100%] h-[400]">
              <img src={src} alt="Preview"
                   key={src}
                   className="w-full h-full z-0 object-cover"
              />
            </div>
            :
            <div className="flex flex-col items-center justify-center">
              <div className="w-[100] h-[100] bg-[#F4EEFF] rounded-[20px] flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faSignature} color="#671FAB" size="4x"/>
              </div>

              <div className="font-semibold mb-1">อัปโหลดลายเซ็นอิเล็กทรอนิกส์</div>
              <div className="text-[#4A4A4A] mb-1">รองรับสกุลไฟล์ .png หรือ .jpg ขนาดสูงสุด 10 MB</div>
              <div className="text-[#4A4A4A] font-semibold underline">อัปโหลดที่นี่</div>
            </div>
        }

        <input type="file" className="hidden absolute top-0 w-full h-full cursor-pointer"
               onChange={handleUpload}
               id="upload-signature"
               accept="image/png, image/jpeg"
               ref={fileInputRef}
        />
      </label>

      {
        src &&
        <div className="right-[2.5rem] bottom-[1rem] cursor-pointer absolute z-10 w-[44] h-[44] bg-[#FFD4D4] rounded-[10] flex items-center justify-center"
             onClick={() => deleteSignature()}
        >
          <FontAwesomeIcon icon={faTrashCan} color={'#E02424'}/>
        </div>
      }
    </div>

  )
}

export default SignatureUpload;
