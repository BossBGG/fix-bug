import {
  getTransformerBrands,
  getTransformerPhase,
  getTransformerSize,
  getTransformerType, getTransformerVoltage
} from "@/app/api/ServicesApi";
import {Options, TransformerOptions} from "@/types";

export const handleSearchTransformerBrands = async (search: string = "", reqCode: string) => {
  try {
    const res = await getTransformerBrands(search, reqCode)
    if (res.status === 200 && res.data.data) {
      const options = mapOptions(res.data.data)
      return options
    }
    return []
  }catch (error) {
    console.error(error);
    return []
  }
}

export const handleSearchTransformerPhase = async (search: string = "", reqCode: string) => {
  try {
    const res = await getTransformerPhase(search, reqCode)
    if (res.status === 200 && res.data.data) {
      return mapOptions(res.data.data)
    }
    return []
  }catch (error) {
    console.error(error);
    return []
  }
}

export const handleSearchTransformerType = async (search: string = "", reqCode: string) => {
  try {
    const res = await getTransformerType(search, reqCode)
    if (res.status === 200 && res.data.data) {
      return mapOptions(res.data.data)
    }
    return []
  }catch (error) {
    console.error(error);
    return []
  }
}

export const handleSearchTransformerSize = async (search: string = "", reqCode: string) => {
  try {
    const res = await getTransformerSize(search, reqCode)
    if (res.status === 200 && res.data.data) {
      return mapOptions(res.data.data)
    }
    return []
  }catch (error) {
    console.error(error);
    return []
  }
}

export const handleSearchTransformerVoltage = async (search: string = "", reqCode: string) => {
  try {
    const res = await getTransformerVoltage(search, reqCode)
    if (res.status === 200 && res.data.data) {
      return mapOptions(res.data.data)
    }
    return []
  }catch (error) {
    console.error(error);
    return []
  }
}

const mapOptions = (data: TransformerOptions[]) => {
  let options: Options[] = []
  data?.map((d) => {
    options.push({value: d.id, label: d.option_title, data: d})
  })

  return options
}
