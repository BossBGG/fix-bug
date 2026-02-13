import React from "react";
import Image from "next/image";
import ProfileImg from "@/assets/images/pea_profile1.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencil} from "@fortawesome/free-solid-svg-icons";

type PreviewProfileImage = {
  src: string | null,
  isEdit?: boolean,
  className?: string
}

const PreviewProfileImage: React.FC<PreviewProfileImage> = ({
                                                              src,
                                                              isEdit = true,
                                                              className = ""
                                                            }) => {
  return (
    <div className="relative flex items-center justify-center">
      <div className={`w-[160] h-[160] rounded-full relative cursor-pointer overflow-hidden ${className}`}>
        {
          src
            ? <div className="w-full h-full flex items-center justify-center">
              <img src={src} alt="profile image"
                   key={src}
                   className="object-cover w-full h-full"
              />
            </div>
            : <div>
              <Image src={ProfileImg} alt="profile image" className="object-cover w-full h-full"/>
            </div>
        }
      </div>

      {
        isEdit &&
        <div
          className="absolute right-[15] bottom-0 bg-[#D0BAE5] w-[32] h-[32] rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faPencil} color="#671FAB"/>
        </div>
      }
    </div>
  )
}

export default PreviewProfileImage;
