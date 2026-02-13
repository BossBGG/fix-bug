import {getBusinessType} from "@/app/api/WorkOrderApi";
import {BusinessTypeObj, Options} from "@/types";

const handleSearchBusinessType = async (search: string = "") => {
  try {
    const res = await getBusinessType(search)
    if(res.status === 200 && res.data && res.data.data) {
      let options:Options[] = []
      res.data.data.map((d: BusinessTypeObj) => (
        options.push({ value: d.id, label: d.name, data: d })
      ))
      return options;
    }
    return []
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default handleSearchBusinessType;
