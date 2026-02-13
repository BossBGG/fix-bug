'use client'
import PageNotFoundImg from "@/assets/images/page_not_found.png"
import TemplateMaintenance from "@/app/components/template/TemplateMaintenance";

const PageIneligible = () => {
  return (
    <TemplateMaintenance srcImg={PageNotFoundImg}
                         titleEn="You do not have permission to access this content"
                         titleTH="คุณไม่ได้รับสิทธิ์ในการเข้าถึงเนื้อหานี้"
    />
  )
}

export default PageIneligible
