import {Options} from "@/types";
import {getMeterEquipmentOptions} from "@/app/api/MaterialEquipmentApi";

export const searchMeterEquipmentOptions = async (search: string, requestCode: string): Promise<Options[]> => {
  try {
    const res = await getMeterEquipmentOptions(search, requestCode);
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
};
