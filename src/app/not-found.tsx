'use client'
import PageNotFoundImg from "@/assets/images/page_not_found.png"
import TemplateMaintenance from "@/app/components/template/TemplateMaintenance";

const PageNotFound = () => {
  return (
    <TemplateMaintenance srcImg={PageNotFoundImg}
                         titleEn="Page Not Found"
                         titleTH="“ไม่พบหน้านี้”"
    />
  )
}

export default PageNotFound;
