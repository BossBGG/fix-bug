"use client";
import React, {useEffect, useState} from "react";
import {
  getResponsiblePersonColumns
} from "./ResponsiblePersonColumns";
import {DataTableEditor} from "@/app/components/editor-table/DataTableEditor";
import {useAppSelector} from "@/app/redux/hook";
import {ListDataEditor} from "@/app/components/editor-table/ListDataEditor";
import ResponsiblePersonListContent from "./ResponsiblePersonListContent";
import CardCollapse from "../CardCollapse";
import {Assignee, Options, ResponsiblePersonObj, WorkOrderObj} from "@/types";
import {DESKTOP_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface ResponsiblePersonComponentProps {
  onUpdateData: (d: WorkOrderObj) => void;
  data: WorkOrderObj,
  workerOptions: Options[],
  disabled?: boolean
}

const ResponsiblePersonComponent = ({
                                      onUpdateData,
                                      data,
                                      workerOptions,
                                      disabled = false
                                    }: ResponsiblePersonComponentProps) => {
  const [assigneeOptions, setAssigneeOptions] = useState<Options[]>([]);
  const [responsiblePerson, setResponsiblePerson] = useState<ResponsiblePersonObj[]>([]);

  useEffect(() => {
    if(data.assignees?.length > 0) {
      let options: Options[] = []
      let responsible: ResponsiblePersonObj = {} as ResponsiblePersonObj
      data.assignees.map((assignee: Assignee) => {
        options.push({
          value: assignee.username,
          label: getWorkerName(assignee.username)
        })

        if(assignee.isEquipmentResponsible) {
          responsible = {username: assignee.username} as ResponsiblePersonObj
        }
      })

      setAssigneeOptions(options)
      setResponsiblePerson([{...responsible, isUpdate: true}])
    }else {
      setResponsiblePerson([{isUpdate: true} as ResponsiblePersonObj]);
    }
  }, [data]);

  const getWorkerName = (username: string) => {
    const worker = workerOptions.find((wk) => wk.value === username);
    if(worker) {
      // PEA workers 
      if(worker.data?.firstName) {
        return `${worker.data.firstName} ${worker.data.lastName}`;
      }
      // VENDOR workers
      return worker.data?.employeeName ;
    }
    return ""
  }

  const screenSize = useAppSelector((state) => state.screen_size);

  const handleUpdateData = (data: ResponsiblePersonObj[]) => {
    console.log('handleUpdateData data >>>> ', data)
    onUpdateResponsible(data[0].username)
  };

  const onUpdateResponsible = (value: string) => {
    let assignees = data.assignees
    let newAssignees: Assignee[] = []
    assignees.map((assignee: Assignee) => {
      let isEquipmentResponsible = assignee.username === value;
      newAssignees.push({...assignee, isEquipmentResponsible});
    })
    let newData = data;
    newData = { ...newData, assignees: newAssignees };
    onUpdateData(newData);
  }


  const getFilteredColumns = () => {
    const columns = getResponsiblePersonColumns(
      assigneeOptions,
      (value, item) => onUpdateResponsible(value as string),
      disabled
    );
    return columns;
  }

  return (
    <div>
      <CardCollapse title={
        <>
          ผู้รับผิดชอบเบิก/คืนวัสดุอุปกรณ์
          <span className="text-red-500 ml-1">*</span>
        </>
      }>
        {screenSize === DESKTOP_SCREEN ? (
          <DataTableEditor
            columns={getFilteredColumns()}
            onUpdateData={handleUpdateData}
            realData={responsiblePerson}
          />
        ) : (
          <ListDataEditor
            onUpdateData={handleUpdateData}
            realData={responsiblePerson}
            hiddenPagination={true}
          >
            {(pageData: ResponsiblePersonObj[], page, pageSize) => (
              <div>
                <ResponsiblePersonListContent
                  pageData={pageData}
                  onUpdateData={onUpdateResponsible}
                  assigneeOptions={assigneeOptions}
                  disabled={disabled}
                />
              </div>
            )}
          </ListDataEditor>
        )}
      </CardCollapse>
    </div>
  );
};

export default ResponsiblePersonComponent;
