"use client";
import {Card, CardContent} from "@/components/ui/card";
import React from "react";
import {Options, ResponsiblePersonObj} from "@/types";
import {Selection} from "@/app/components/form/Selection";

interface ResponsiblePersonListContentProps {
  pageData: ResponsiblePersonObj[];
  assigneeOptions: Options[],
  onUpdateData: (value: string) => void,
  disabled?: boolean
}

const ResponsiblePersonListContent = ({
                                        pageData,
                                        assigneeOptions,
                                        onUpdateData,
                                        disabled = false
                                      }: ResponsiblePersonListContentProps) => {

  const handleChange = (value: string, item: ResponsiblePersonObj) => {
    onUpdateData(value)
  }

  return (
    <div>
      {pageData.length > 0 ? (
        pageData.map((item, index) => (
          <Card key={index} className="p-3 mb-3 shadow-none">
            <CardContent>
              <div className="font-medium text-lg mb-3">
                พนักงานรับผิดชอบเบิก/คืนวัสดุอุปกรณ์
              </div>

              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <Selection value={item.username as string}
                             options={assigneeOptions}
                             placeholder="พนักงาน"
                             onUpdate={handleChange}
                             disabled={disabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center text-gray p-4">ไม่มีผู้รับผิดชอบเบิก/คืนวัสดุอุปกรณ์</div>
      )}
    </div>
  );
};

export default ResponsiblePersonListContent;
