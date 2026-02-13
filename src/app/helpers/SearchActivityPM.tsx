import {getActivityPMOptions} from "@/app/api/WorkOrderApi";
import {Options} from "@/types";

const handleSearchActivityPM = async (search: string = "")=> {
  try {
    const res = await getActivityPMOptions(search)
    if(res.status === 200 && res.data.data) {
      let options: Options[] = []
      res.data.data.map(d => {
        options.push({ value: d.ilart, label: `${d.ilart} - ${d.ilatx}`, data: d })
      })
      return options;
    }
    return []
  }catch (e) {
    console.error(e)
    return []
  }
}

export default handleSearchActivityPM;
