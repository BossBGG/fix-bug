import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import { useAppSelector } from "@/app/redux/hook";
import { DataTableEditor } from "@/app/components/editor-table/DataTableEditor";
import { getColumns } from "@/app/(pages)/work_order/(special-form)/component/worker/columns";
import { Options, Assignee, WorkOrderObj } from "@/types";
import React, { useEffect, useState } from "react";
import InputDateButton from "@/app/components/form/InputDateButton";
import { ListDataEditor } from "@/app/components/editor-table/ListDataEditor";
import WorkerListContent from "@/app/(pages)/work_order/(special-form)/component/worker/WorkerListContent";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AddWorker from "@/app/(pages)/work_order/(special-form)/component/worker/AddWorker";
import InputDateTimePicker from "@/app/components/form/InputDateTimePicker";
import { DESKTOP_SCREEN } from "@/app/redux/slices/ScreenSizeSlice";
import { syncWorkersToExecution } from "@/app/(pages)/work_order/(special-form)/component/WorkDateSyncHelper";
import { Switch } from "@/components/ui/switch";
import { handleActive } from "@/app/(pages)/material_equipment/columns";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

interface WorkerListOptions {
  isReadOnly?: boolean;
  showAddButton?: boolean;
  showDeleteAllButton?: boolean;
  showActionColumn?: boolean;
  showAppointmentSection?: boolean;
}

interface WorkerListProps {
  data: WorkOrderObj;
  options?: WorkerListOptions;
  updateData: (data: WorkOrderObj) => void;
  eventOptions: Options[];
  workCenterOptions: Options[];
  workerOptions: Options[];
  setEventOptions: (options: Options[]) => void;
  setMainWorkCenterOptions: (options: Options[]) => void;
  setWorkerOptions: (options: Options[]) => void;
  appointment_date: Date | undefined;
  updateAppointment: (d: Date | undefined) => void;
}

const SwitchSettingSMS = ({
  isSms,
  data,
  updateData,
}: {
  isSms: boolean;
  data: WorkOrderObj;
  updateData: (data: WorkOrderObj) => void;
}) => {
  const handleSettingSMS = () => {
    let newData = data;
    newData = {
      ...newData,
      isSms: !isSms,
    };
    updateData(newData);
  };

  return (
    <div className="flex items-center mr-2">
      <Switch
        checked={isSms}
        onCheckedChange={() => handleSettingSMS()}
        className="data-[state=checked]:bg-[#9538EA] data-[state=unchecked]:bg-[#57595B] cursor-pointer"
      />
      <span className="text-[#4A4A4A] ml-1 hidden md:block font-bold">
        ส่ง SMS
      </span>
    </div>
  );
};

const WorkerList = ({
  data,
  options = {},
  updateData,
  eventOptions,
  workCenterOptions,
  workerOptions,
  setEventOptions,
  setMainWorkCenterOptions,
  setWorkerOptions,
  appointment_date,
  updateAppointment,
}: WorkerListProps) => {
  const {
    isReadOnly = false,
    showAddButton = true,
    showDeleteAllButton = true,
    showActionColumn = true,
    showAppointmentSection = true,
  } = options;
  const screenSize = useAppSelector((state) => state.screen_size);
  const [workers, setWorkers] = useState<Assignee[]>([]);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(
    appointment_date
  );
  const [openModal, setOpenModal] = useState(false);
  const [updateIndex, setUpdateIndex] = useState(-1);
  const [editData, setEditData] = useState<Assignee | null>(null);

  useEffect(() => {
    const assignees = data.assignees as Assignee[];
    setWorkers(assignees || []);
  }, []);

  useEffect(() => {
    setAppointmentDate(appointment_date);
  }, [appointment_date]);

  const itemWorker: Assignee = {
    isUpdate: true,
  } as Assignee;

  const handleDateChange = (date: Date | undefined) => {
    if (!isReadOnly) {
      setAppointmentDate(date);
      updateAppointment(date);
      console.log("Appointment date selected:", date);
    }
  };

  const handleUpdateData = (assignees: Assignee[]) => {
    if (!isReadOnly) {
      setWorkers(assignees);
      let newData = data;
      newData = {
        ...newData,
        assignees,
      };
      updateData(newData);
      // ซิงค์วันที่และเวลาจาก workers ไป execution
      syncWorkersToExecution(assignees, newData, updateData);
    }
  };

  const onRemoveData = (id: number) => {
    if (!isReadOnly) {
      console.log("Remove worker with id:", id);
    }
  };

  const handleAddWorker = (newWorker: Assignee) => {
    if (!isReadOnly) {
      const existing = workers.find((wk) => wk.username === newWorker.username);
      if (existing) {
        handleUpdateWorker(newWorker);
      } else {
        const workerData = [...workers, newWorker];
        setWorkers(workerData);
        handleUpdateData(workerData);
      }
    }
  };

  const handleUpdateWorker = (item: Assignee) => {
    const newData = workers.map((wk, index) => {
      return index === updateIndex ? item : wk;
    });
    handleUpdateData(newData);
  };

  useEffect(() => {
    console.log("workers >>>> ", workers);
  }, [workers]);

  const getFilteredColumns = () => {
    const columns = getColumns(
      workerOptions,
      eventOptions,
      workCenterOptions,
      (d: Options[]) => setEventOptions(d),
      (d: Options[]) => setMainWorkCenterOptions(d),
      (d: Options[]) => setWorkerOptions(d)
    );
    if (!showActionColumn || isReadOnly) {
      return columns.filter((column) => column.id !== "action");
    }
    return columns;
  };

  return (
    <div>
      <CardCollapse title={"รายชื่อผู้ปฏิบัติงาน"} isRequired={true}>
        {screenSize === DESKTOP_SCREEN ? (
          <div className={workers.length === 0 ? "mb-12" : "mb-0"}>
            <DataTableEditor
              columns={getFilteredColumns()}
              onUpdateData={handleUpdateData}
              realData={workers}
              onRemoveData={onRemoveData}
              LabelAddRow={
                showAddButton && !isReadOnly ? "เพิ่มผู้ปฏิบัติงาน" : undefined
              }
              rowItem={itemWorker}
              visibleDelete={showDeleteAllButton && !isReadOnly}
              classActionRow={`absolute ${
                workers.length > 0 ? "bottom-19" : "bottom-0"
              } right-2`}
              classPagination="mt-12"
            />
          </div>
        ) : (
          <ListDataEditor onUpdateData={handleUpdateData} realData={workers}>
            {(pageData: Assignee[], page, pageSize) => (
              <div>
                <WorkerListContent
                  pageData={pageData}
                  realData={workers}
                  page={page}
                  pageSize={pageSize}
                  onUpdateData={handleUpdateData}
                  workerOptions={workerOptions}
                  workCenterOptions={workCenterOptions}
                  eventOptions={eventOptions}
                  onRemoveData={onRemoveData}
                  setUpdateIndex={(index) => {
                    setEditData(workers[index]);
                    setUpdateIndex(index);
                    setOpenModal(true);
                  }}
                  showActionButtons={showActionColumn && !isReadOnly}
                  isReadOnly={isReadOnly}
                />

                {showAddButton && !isReadOnly && (
                  <Button
                    className="pea-button-outline my-2 w-full"
                    onClick={() => {
                      setOpenModal(true);
                      setEditData(null);
                      setUpdateIndex(-1);
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    เพิ่มผู้ปฏิบัติงาน
                  </Button>
                )}
              </div>
            )}
          </ListDataEditor>
        )}
      </CardCollapse>

      {showAppointmentSection && (
        <CardCollapse
          title={"วันที่นัดหมายปฏิบัติงาน"}
          cardCollapseAddons={
            <SwitchSettingSMS
              isSms={data.isSms}
              updateData={updateData}
              data={data}
            />
          }
        >
          <div className="px-2 -mt-3 w-full lg:w-[25%] xl:w-[20%]">
            <CustomTooltip 
              fieldValue={appointmentDate ? new Date(appointmentDate).toLocaleString('th-TH') : ''}
              fieldLabel="วันที่นัดหมายปฏิบัติงาน"
            >
              <InputDateTimePicker
                label={"วันที่นัดหมายปฏิบัติงาน"}
                value={appointmentDate as Date}
                onChange={handleDateChange}
                placeholder={"วันที่นัดหมายปฏิบัติงาน"}
                disabled={!showActionColumn}
                showClearButton={true}
              />
            </CustomTooltip>
          </div>
        </CardCollapse>
      )}

      {/* Add Or Update Worker Modal */}
      {!isReadOnly && (
        <AddWorker
          open={openModal}
          onClose={() => setOpenModal(false)}
          onAddWorker={handleAddWorker}
          onUpdateWorker={handleUpdateWorker}
          workerOptions={workerOptions}
          eventOptions={eventOptions}
          workCenterOptions={workCenterOptions}
          onUpdateWorkerOptions={setWorkerOptions}
          onUpdateEventOptions={setEventOptions}
          onUpdateWorkCenterOptions={setMainWorkCenterOptions}
          editData={editData}
        />
      )}
    </div>
  );
};

export default WorkerList;
