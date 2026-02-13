import React from "react";
import { WorkOrderObj } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/app/redux/hook";
import CardCollapse from "../CardCollapse";
import {MOBILE_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface WorkOrderDetailsInfoProps {
  data: WorkOrderObj;
}

const WorkOrderDetailsInfo: React.FC<WorkOrderDetailsInfoProps> = ({
  data,
}) => {
  const screenSize = useAppSelector((state) => state.screen_size);

  // Mock electrical equipment data - ในระบบจริงจะได้จาก step 0 ของ s301/page.tsx
  const electricalEquipment = [
    {
      id: 1,
      name: "อุปกรณ์ไฟฟ้า A",
      quantity: 2,
    },
    {
      id: 2,
      name: "อุปกรณ์ไฟฟ้า B",
      quantity: 1,
    },
    {
      id: 3,
      name: "อุปกรณ์ไฟฟ้า C",
      quantity: 3,
    },
  ];

  // Mobile Layout
  if (screenSize === MOBILE_SCREEN) {
    return (
      <CardCollapse title={"ข้อมูลคำร้อง"}>
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              รายการอุปกรณ์ไฟฟ้า
            </h3>

            {electricalEquipment.length > 0 ? (
              <div className="space-y-3">
                {electricalEquipment.map((equipment, index) => (
                  <div key={equipment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {index + 1}. {equipment.name}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm text-gray-600">จำนวน</p>
                        <p className="font-medium">{equipment.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                ไม่มีรายการอุปกรณ์ไฟฟ้า
              </p>
            )}
          </CardContent>
        </Card>
      </CardCollapse>
    );
  }

  // Desktop Layout
  return (
    <CardCollapse title={"ข้อมูลคำร้อง"}>
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            รายการอุปกรณ์ไฟฟ้า
          </h3>

          {electricalEquipment.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">
                      ลำดับที่
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      ชื่ออุปกรณ์
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">
                      จำนวนที่เบิก
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {electricalEquipment.map((equipment, index) => (
                    <tr
                      key={equipment.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {equipment.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {equipment.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">ไม่มีรายการอุปกรณ์ไฟฟ้า</p>
            </div>
          )}
        </CardContent>
      </Card>
    </CardCollapse>
  );
};

export default WorkOrderDetailsInfo;
