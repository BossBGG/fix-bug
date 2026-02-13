import {getRequestService} from "@/app/api/ServicesApi";
import {OptionApi, Options} from "@/types";

export const handleSearchRequestService = async (search: string, reqCode: string) => {
  try {
    const res = await getRequestService(search, reqCode)
    if(res.status === 200 && res.data && res.data.data) {
      let options:Options[] = []
      res.data.data.map((d: OptionApi) => (
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
