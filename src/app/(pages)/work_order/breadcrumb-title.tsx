export const renderWorkOrderBreadcrumbTitle = (reqCode: string) => {
  switch (reqCode) {
    case 's301':
      return 'ขอซ่อมแซมอุปกรณ์ไฟฟ้า'
    case 's302':
      return 'ขอตรวจสอบและบำรุงรักษาสวิตซ์เกียร์'
    case 's303':
      return 'ขอตรวจสอบและบำรุงรักษาเคเบิล'
    case 's304':
      return 'ขอตรวจสอบและบำรุงรักษารีเลย์'
    case 's305':
      return 'ขอบำรุงรักษาหม้อแปลงไฟฟ้า'
    case 's306':
      return 'ขอแก้ไขและบำรุงรักษาระบบจำหน่าย'
    case 's307':
      return 'ขอแก้ไขและบำรุงรักษาระบบจำหน่ายโดย Hotline'
    case 's308':
      return 'ขอตรวจสอบระบบไฟฟ้าพร้อมออกใบรับรอง'
    case 's309':
      return 'ขอตรวจหาจุดร้อน/จุดสัมผัสทางไฟฟ้า'
    case 's310':
      return 'ขอปรึกษาด้านวิศวกรรมไฟฟ้า/ตรวจรับรองระบบ'
    case 's311':
      return 'ขอปรึกษาด้านวิศวกรรมและก่อสร้าง'
    case 's312':
      return 'ขอทดสอบอุปกรณ์ไฟฟ้า'
    case 's314':
      return 'ขอเช่าฉนวนครอบสายไฟฟ้า'
    case 's315':
      return 'ขอเช่าหม้อแปลง'
    case 's316':
      return 'ขอเช่าเครื่องกำเนิดไฟฟ้า'
    case 's317':
      return 'ขอติดตั้งมิเตอร์เปรียบเทียบ'
    case 's318':
      return 'ขอซื้อมิเตอร์/อุปกรณ์ไฟฟ้า'
    case 's319':
      return 'ขอซื้อข้อมูล Load Profile'
    case 's320':
      return 'ขอติดตั้งมิเตอร์เปรียบเทียบ กรณีผิดปกติ'
    case 's322':
      return 'ขอตรวจสอบและบำรุงรักษาระบบไฟฟ้า แบบครบวงจร (Package)'
    case 's323':
      return 'ขอทดสอบผลิตภัณฑ์คอนกรีต'
    case 's329':
      return 'ขอซื้อขายใบรับรองการผลิตพลังงานหมุนเวียน'
    case 's399':
      return 'ขอบริการอื่นๆ'
    case 's332-solar-battery':
      return 'Solar Battery'
    case 's332-solar-air-condition':
      return 'Solar Air Conditioner'
    default:
      return ''
  }
}
