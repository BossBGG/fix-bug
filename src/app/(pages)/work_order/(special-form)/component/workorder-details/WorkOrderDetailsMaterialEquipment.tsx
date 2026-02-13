import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/app/redux/hook";
import CardCollapse from "../CardCollapse";
import {MOBILE_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface MaterialEquipment {
  id: number;
  code: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface ResponsiblePerson {
  id: number;
  employeeId: string;
  name: string;
}

const WorkOrderDetailsMaterialEquipment: React.FC = () => {
  const screenSize = useAppSelector((state) => state.screen_size);

  // Mock data - ในระบบจริงจะได้จาก material_equipment_checklist.tsx
  const materialEquipment: MaterialEquipment[] = [
    {
      id: 1,
      code: "S-3H-044",
      name: "หม้อแปลง 3P5000KVA(รายปี)",
      quantity: 1,
      unit: "ชิ้น",
      price: 122,
    },
    {
      id: 2,
      code: "S-3H-044",
      name: "หม้อแปลง 3P2500KVA(รายปี)",
      quantity: 2,
      unit: "ชิ้น",
      price: 89,
    },
    {
      id: 3,
      code: "S-3H-044",
      name: "หม้อแปลง 3P5000KVA(รายปี)",
      quantity: 3,
      unit: "ชิ้น",
      price: 45,
    },
  ];

  const responsiblePersons: ResponsiblePerson[] = [
    {
      id: 1,
      employeeId: "4828375",
      name: "นายจำนงค์ องอาจ",
    },
  ];

  // Mobile Layout
  if (screenSize === MOBILE_SCREEN) {
    return (
      <div className="space-y-4">
        {/* วัสดุอุปกรณ์ปฏิบัติงาน */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              วัสดุอุปกรณ์ปฏิบัติงาน
            </h3>
            {materialEquipment.length > 0 ? (
              <div className="space-y-3">
                {materialEquipment.map((item, index) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {index + 1}. {item.code} - {item.name}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        <span>จำนวน: </span>
                        <span className="font-medium">{item.quantity}</span>
                      </div>
                      <div>
                        <span>หน่วย: </span>
                        <span className="font-medium">{item.unit}</span>
                      </div>
                      <div>
                        <span>ราคา: </span>
                        <span className="font-medium">{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                ไม่มีรายการวัสดุอุปกรณ์
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="space-y-6">
      {/* วัสดุอุปกรณ์ปฏิบัติงาน */}
      <CardCollapse title={"รายการวัสดุ / อุปกรณ์ไฟฟ้า "}>

            {materialEquipment.length > 0 ? (
              <div className="overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        ลำดับที่
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        รหัสวัสดุ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        ชื่อวัสดุอุปกรณ์
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        จำนวนหน่วย
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        จำนวนคงเหลือ
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        หน่วย
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {materialEquipment.map((item, index) => (
                      <tr
                        key={item.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {item.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">ไม่มีรายการวัสดุอุปกรณ์</p>
              </div>
            )}

      </CardCollapse>
    </div>
  );
};

export default WorkOrderDetailsMaterialEquipment;
