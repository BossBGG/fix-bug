'use client'
import Image, {StaticImageData} from "next/image";
import Link from "next/link";
import WOMLogoText from '@/assets/images/logo_wom_with_text.png'

type Props = {
  srcImg: StaticImageData
  titleTH: string,
  titleEn: string,
  showBackBtn?: boolean
}

const TemplateMaintenance = ({srcImg, titleTH, titleEn, showBackBtn = true}: Props) => {
  return (
    <div className="flex-col justify-items-center w-dvw h-dvh fixed text-center bg-[#F4EEFF]">
      <div className="flex-col justify-items-center content-center h-[85%] w-[95%] sm:w-[95%] md:w-[96%] xl:w-[98%] mt-3 bg-white rounded-3xl m-auto overflow-x-hidden">
        <Image src={srcImg} className="w-4/6 sm:w-2/3 md:w-1/2 2xl:w-1/3 m-auto" alt="maintenance mode image" priority={true} />
        <div className="mt-4 font-bold text-[32px]">{titleEn}</div>
        <div className="text-[#E02424] text-[32px] mb-8 font-bold">{titleTH}</div>

        {
          showBackBtn && <Link href="/work_order" className="pea-button">
            กลับหน้าหลัก
          </Link>
        }
      </div>

      <div className="h-[15%] footer-maintenance flex items-center">
        <Image src={WOMLogoText} alt="maintenance mode image" className="m-auto"/>
      </div>
    </div>
  )
}

export default TemplateMaintenance;
