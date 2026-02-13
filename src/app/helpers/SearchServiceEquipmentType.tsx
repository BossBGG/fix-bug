import {getServiceEquipmentTypeOptions} from "@/app/api/ServicesApi";
import {Options} from "@/types";

const handleSearchServiceEquipmentType = async (s: string = "", requestCode: string) => {
  try {
    const res = await getServiceEquipmentTypeOptions(s, requestCode)
    if(res.status === 200 && res.data.data) {
      let options: Options[] = []
      res.data.data.map(d => {
        options.push({ value: d.id, label: d.option_title, data: d })
      })
      return options;
    }

    return []
  }catch (err) {
    console.error(err)
    return []
  }
}

export default handleSearchServiceEquipmentType;
