import {getMaterialOptions} from "@/app/api/MaterialEquipmentApi";
import {MaterialOptionObj, Options} from "@/types";

export const handleSearchMaterial = async (
  search: string,
  key: "code" | "name",
  keyOfVal: "id" | "code" | "name" = "id"
) => {
  try {
    const resp = await getMaterialOptions(search);
    if(resp.data?.status_code === 200) {
      const material_original_data: MaterialOptionObj[] =
        resp.data.data || [];

      const options: Options[] = material_original_data.map((item: MaterialOptionObj) => ({
        value: item[keyOfVal],
        label: item[key],
        data: item
      }));
      return options
    }

    return []
  } catch (err) {
    console.error(err);
    return [];
  }
}
