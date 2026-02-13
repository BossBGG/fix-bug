import {getEventOptions} from "@/app/api/WorkOrderApi";
import {Options} from "@/types";

const handleSearchEvent = async (
  search: string = ""
) => {
  try {
    const res = await getEventOptions(search)
    if(res.status === 200 && res.data.data) {
      let options: Options[] = []
      res.data.data.map((d) => {
        options.push({ value: d.id, label: `${d.lstar} - ${d.ktext}`, data: d})
      })
      return options
    }
    return []
  }catch (error) {
    console.error(error)
    return []
  }
}

export default handleSearchEvent;
