import {getVendorOptions, getWorkerOptions} from "@/app/api/WorkOrderApi";
import {Options, VendorOptionObj} from "@/types";

const sortAndLimitOptions = (options: Options[]) => {
  return options
    .sort((a, b) => (a.label as string).localeCompare(b.label as string, 'th'))
    .slice(0, 20);
};

export const getWorkerListOptions = async (search: string = "") => {
  try {
    const res = await getWorkerOptions(search)
    if(res.status === 200 && res.data.data) {
      let options: Options[] = []
      res.data.data.map((item) => {
        options.push({ value: item.username, label: `${item.username} - ${item.firstName} ${item.lastName}`, data: item })
      })
      return options;
    }
    return []
  }catch (error) {
    console.error(error)
    return []
  }
}

export const getVendorWorkerOptions = async (search: string = "") => {
  try {
    const res = await getVendorOptions(search)
    if(res.status === 200 && res.data.data) {
      const options: Options[] = [];
      const seenUsernames = new Set<string>();
      
      res.data.data.forEach((vendor: VendorOptionObj) => {
        // ใช้ vendor.username (6 หลัก) เป็น value — ไม่ใช่ workcenterCode (8 หลัก)
        const vendorUsername = vendor.username;
        if (seenUsernames.has(vendorUsername)) return; // dedup
        seenUsernames.add(vendorUsername);
        
        const firstWc = vendor.workcenters?.[0];
        const displayName = firstWc?.workcenterName || vendor.employeeName || vendorUsername;
        
        options.push({
          value: vendorUsername,
          label: `${vendorUsername} - ${displayName}`,
          data: {
            username: vendorUsername,
            employeeName: displayName,
            workcenterCode: firstWc?.workcenterCode || '',
            vendorData: vendor
          }
        });
      });
      
      // Sort และตัด 20 ตัวแรก
      return sortAndLimitOptions(options);
    }
    return []
  } catch (error) {
    console.error('Error in getVendorWorkerOptions:', error)
    return []
  }
}

// รวมรายชื่อ PEA + Vendor เข้าด้วยกัน (สำหรับ ผู้เกี่ยวข้อง ที่ไม่แยกประเภท)
export const getAllWorkerOptions = async (search: string = ""): Promise<Options[]> => {
  try {
    const [peaOptions, vendorOptions] = await Promise.all([
      getWorkerListOptions(search),
      getVendorWorkerOptions(search)
    ]);

    // Merge + dedup by value
    const mergedMap = new Map<string, Options>();
    peaOptions.forEach(o => mergedMap.set(o.value as string, o));
    vendorOptions.forEach(o => {
      if (!mergedMap.has(o.value as string)) {
        mergedMap.set(o.value as string, o);
      }
    });

    return sortAndLimitOptions(Array.from(mergedMap.values()));
  } catch (error) {
    console.error('Error in getAllWorkerOptions:', error);
    return [];
  }
}