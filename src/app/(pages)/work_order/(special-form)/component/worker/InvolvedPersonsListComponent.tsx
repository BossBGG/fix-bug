"use client";
import React, {useEffect, useState} from "react";
import {getInvolvedPersonsColumns} from "./InvolvedPersonsColumns";
import {DataTableEditor} from "@/app/components/editor-table/DataTableEditor";
import {useAppSelector} from "@/app/redux/hook";
import {ListDataEditor} from "@/app/components/editor-table/ListDataEditor";
import InvolvedPersonsListContent from "./InvolvedPersonsListContent";
import CardCollapse from "../CardCollapse";
import {Assignee, Options, WorkOrderObj} from "@/types";
import {DESKTOP_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface InvolvedPersonsListComponentProps {
  onUpdateData: (d: WorkOrderObj) => void;
  data: WorkOrderObj;
  workerOptions: Options[];
  disabled?: boolean;
  setWorkerOptions: (options: Options[]) => void
}

const InvolvedPersonsListComponent = ({
                                        onUpdateData,
                                        data,
                                        workerOptions,
                                        disabled = false,
                                        setWorkerOptions
                                      }: InvolvedPersonsListComponentProps) => {
  const [involvedPersons, setInvolvedPersons] = useState<Assignee[]>([]);
  const screenSize = useAppSelector((state) => state.screen_size);

  const itemPerson: Assignee = {
    isUpdate: true,
    isEdited: false,
    username: "",
    userType: "peaUser",
    workCenterId: "",
    workUnit: "",
    workActivityTypeId: "",
    workHours: 0,
    name: "",
    isEquipmentResponsible: false,
  } as Assignee;

  useEffect(() => {
    let participants = data.participants as Assignee[];
    setInvolvedPersons(participants || []);
  }, []);

  const handleUpdateData = (updatedPersons: Assignee[]) => {
    // Enrich each participant with userType ตาม workerOptions
    const enriched = updatedPersons.map((person) => {
      if (person.username) {
        const option = workerOptions.find((w) => w.value === person.username);
        if (option) {
          return {
            ...person,
            userType: option.data?.workcenterCode ? 'vendorUser' : 'peaUser',
          };
        }
      }
      return person;
    });
    setInvolvedPersons(enriched);
    const newData = {
      ...data,
      participants: enriched
    };
    onUpdateData(newData);
  };

  const handleRemoveData = (id: number) => {
    console.log("Remove involved person with id:", id);
  };

  const onUpdatePerson = (value: string | number, item: Assignee) => {
    console.log("Update person:", value, item);
  };

  const getFilteredColumns = () => {
    const columns = getInvolvedPersonsColumns(
      workerOptions,
      onUpdatePerson,
      disabled,
      (d: Options[]) => setWorkerOptions(d)
    );
    return columns;
  };

  return (
    <div>
      <CardCollapse title={"รายชื่อผู้เกี่ยวข้อง"}>
        {screenSize === DESKTOP_SCREEN ? (
          <DataTableEditor
            columns={getFilteredColumns()}
            onUpdateData={handleUpdateData}
            realData={involvedPersons}
            onRemoveData={handleRemoveData}
            LabelAddRow={!disabled ? "เพิ่มผู้เกี่ยวข้อง" : undefined}
            rowItem={itemPerson}
            visibleDelete={!disabled}
            classPagination="mt-12"
          />
        ) : (
          <ListDataEditor
            onUpdateData={handleUpdateData}
            realData={involvedPersons}
            hiddenPagination={involvedPersons.length <= 10}
          >
            {(pageData: Assignee[], page, pageSize) => (
              <div>
                <InvolvedPersonsListContent
                  pageData={pageData}
                  realData={involvedPersons}
                  page={page}
                  pageSize={pageSize}
                  workerOptions={workerOptions}
                  onUpdateData={handleUpdateData}
                  onRemoveData={handleRemoveData}
                  disabled={disabled}
                />

                {!disabled && (
                  <div className="mt-3">
                    <button
                      className="pea-button-outline w-full py-2 px-4 rounded-full flex items-center justify-center"
                      onClick={() => {
                        const newPerson = {...itemPerson};
                        const newList = [...involvedPersons, newPerson];
                        handleUpdateData(newList);
                      }}
                    >
                      <span className="mr-2">+</span>
                      เพิ่มผู้เกี่ยวข้อง
                    </button>
                  </div>
                )}
              </div>
            )}
          </ListDataEditor>
        )}
      </CardCollapse>
    </div>
  );
};

export default InvolvedPersonsListComponent;
