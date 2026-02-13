import {Options} from "@/types";

export const loadMissingOptions = async (
  value: string,
  options: Options[],
  fetchOptions: (s: string) => any
) => {
  let inOption = options.find((worker) => worker.value === value);
  if (!inOption) {
    let newOptions = await fetchOptions(value);
    if (newOptions) {
      return newOptions;
    }
  }
  return [];
}
