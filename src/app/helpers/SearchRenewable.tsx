import {getRenewableSource, getRenewableType} from "@/app/api/ServicesApi";
import {Options, RenewableSource} from "@/types";

export const handleSearchRenewableSource = async (search: string, reqCode: string) => {
  try {
    const res = await getRenewableSource(search, reqCode)
    if(res.status === 200 && res.data && res.data.data) {
      let options:Options[] = []
      res.data.data.map((d: RenewableSource) => (
        options.push({ value: d.id, label: d.option_title, data: d })
      ))
      return options;
    }
    return []
  } catch (error) {
    console.error(error);
    return [];
  }
}

export const handleSearchRenewableType = async (search: string, reqCode: string) => {
  try {
    const res = await getRenewableType(search, reqCode)
    if(res.status === 200 && res.data && res.data.data) {
      let options:Options[] = []
      res.data.data.map((d: RenewableSource) => (
        options.push({ value: d.id, label: d.option_title, data: d })
      ))
      return options;
    }
    return []
  } catch (error) {
    console.error(error);
    return [];
  }
}
