"use client";
import {Card, CardContent} from "@/components/ui/card";
import React from "react";
import {Options, Assignee} from "@/types";
import {Selection} from "@/app/components/form/Selection";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faPencil, faTrashCan} from "@fortawesome/free-solid-svg-icons";

interface InvolvedPersonsListContentProps {
  pageData: Assignee[];
  realData: Assignee[];
  page: number;
  pageSize: number;
  workerOptions: Options[];
  onUpdateData: (data: Assignee[]) => void;
  onRemoveData: (id: number) => void;
  disabled?: boolean;
}

const InvolvedPersonsListContent = ({
                                      pageData,
                                      realData,
                                      page,
                                      pageSize,
                                      workerOptions,
                                      onUpdateData,
                                      onRemoveData,
                                      disabled = false
                                    }: InvolvedPersonsListContentProps) => {

  const handleChange = (value: string, index: number) => {
    const adjustedIndex = page * pageSize + index;
    // ตรวจสอบว่า option ที่เลือกเป็น vendor หรือ PEA
    const selectedOption = workerOptions.find((w) => w.value === value);
    const userType = selectedOption?.data?.workcenterCode ? 'vendorUser' : 'peaUser';
    const newData = realData.map((item: Assignee, idx) => {
      if (idx === adjustedIndex) {
        return {...item, username: value, userType, isEdited: true};
      }
      return item;
    });
    onUpdateData(newData);
  }

  const handleUpdateData = (key: string, value: string | number | boolean | undefined, index: number) => {
    const adjustedIndex = page * pageSize + index;
    const newData = realData.map((item: Assignee, idx) => {
      if (idx === adjustedIndex) {
        let isEdited = item.isEdited;
        
        if (key === "isUpdate" && value === false) {
          isEdited = true;
        }
        
        return {...item, [key]: value, isEdited};
      }
      return item;
    });
    onUpdateData(newData);
  };

  const deleteData = (id: number, index: number) => {
    if (disabled) return;

    const adjustedIndex = page * pageSize + index;
    const newData = realData.filter((_, idx) => adjustedIndex !== idx);
    onUpdateData(newData);
    onRemoveData(id);
  };

  const getWorkerName = (username: string) => {
    const worker = workerOptions.find((w) => w.value === username);
    return worker ? worker.label : username;
  };

  return (
    <div>
      {pageData.length > 0 ? (
        pageData.map((item, index) => (
          <Card key={index} className="p-3 mb-3 shadow-none">
            <CardContent>
              <div className="font-medium text-lg mb-3">
                ผู้เกี่ยวข้อง
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-center md:gap-2 ">
                <div className="flex-1">
                  {item.isUpdate ? (
                    <Selection 
                      value={item.username as string || ''}
                      options={workerOptions}
                      placeholder="เลือกผู้ปฏิบัติงาน"
                      onUpdate={(value) => handleChange(value, index)}
                      disabled={disabled}
                    />
                  ) : (
                    <div className="text-sm bg-gray-100 p-3 rounded-md">
                      {getWorkerName(item.username || "-")}
                    </div>
                  )}
                </div>

                {!disabled && (
                  <div className="flex justify-end gap-2 mt-2 md:justify-center md:items-center md:space-x-2 md:gap-0 md:mt-0">
                    {item.isUpdate ? (
                      <button
                        className="bg-[#C8F9E9] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
                        onClick={() => handleUpdateData("isUpdate", false, index)}
                      >
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          size={"sm"}
                          color="#31C48D"
                        />
                      </button>
                    ) : (
                      <button
                        className="bg-[#FDE5B6] rounded-[8px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
                        onClick={() => handleUpdateData("isUpdate", true, index)}
                      >
                        <FontAwesomeIcon
                          icon={faPencil}
                          size={"sm"}
                          color="#F9AC12"
                        />
                      </button>
                    )}

                    <button
                      className="bg-[#FFD4D4] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
                      onClick={() => deleteData(item.id || 0, index)}
                    >
                      <FontAwesomeIcon
                        icon={faTrashCan}
                        size={"sm"}
                        color="#E02424"
                      />
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center text-gray p-4">ไม่มีผู้ปฏิบัติงาน</div>
      )}
    </div>
  );
};

export default InvolvedPersonsListContent;