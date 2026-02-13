import {ColumnDef, Table} from "@tanstack/react-table";
import {Options, Event, Assignee, MainWorkCenter} from "@/types";
import {EditableSelectCell} from "@/app/components/editor-table/EditableSelectCell";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faPencil, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import {EditableTextCell} from "@/app/components/editor-table/EditableTextCell";
import handleSearchEvent from "@/app/helpers/SearchEvent";
import handleSearchMainWorkCenter from "@/app/helpers/SearchMainWorkCenter";
import {getWorkerListOptions, getVendorWorkerOptions} from "@/app/helpers/WorkerOptions";
import {groupWorkerOptions} from "@/app/api/WorkOrderApi";
import InputDateTimePicker from "@/app/components/form/InputDateTimePicker";
import React from "react";
import {formatJSDateTH} from "@/app/helpers/DatetimeHelper";
import {CustomTooltip} from "@/components/ui/custom-tooltip";
import {RequiredLabel} from "@/app/helpers/RequiredFieldHelper";
import { showError } from "@/app/helpers/Alert";
import { validateDateTimeRange } from "@/app/helpers/DateValidation";

interface TableMeta {
  handleRemoveRow?: (index: number, id: number) => void;
  handleEditRow?: (index: number, isUpdate: boolean, isEdit: boolean, table: unknown) => void;
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  getDataCallback: () => void;
}

type TypedTable = Table<Assignee> & {
  options: {
    meta?: TableMeta;
  };
};

interface CustomTable {
  options: {
    meta?: TableMeta;
  };
}

export const getColumns = (
  workerOptions: Options[],
  eventOptions: Options[],
  mainWorkCenterOptions: Options[],
  onUpdateEventOptions: (d: Options[]) => void,
  onUpdateWorkCenterOptions: (d: Options[]) => void,
  onUpdateWorkerOptions: (d: Options[]) => void,
): ColumnDef<Assignee>[] => {

  const asTypedTable = (table: Table<Assignee>): TypedTable =>
    table as TypedTable;
  const deleteData = (index: number, id: number, table: CustomTable) => {
    table.options.meta?.handleRemoveRow?.(index, id)
  }

  const updateData = (index: number, isUpdate: boolean, isEdited: boolean, table: CustomTable, rowData: Assignee) => {

    if(!isUpdate){
      if(!rowData.userType || !rowData.username || !rowData.workCenterId || !rowData.username || !rowData.startDatetime || !rowData.endDatetime || !rowData.workHours) {
        showError("กรุณากรอกข้อมูลรายชื่อผู้ปฏิบัติงานให้ครบถ้วน");
        return;
      }
    }

    const is_edit = isUpdate ? true : isEdited
    table.options.meta?.handleEditRow?.(index, isUpdate, is_edit, table);
  }

  const handleUpdateUserType = async (v: string | number, table: CustomTable, index: number) => {
    setTimeout(() => {
      let value = v === 'peaUser' ? 'H' : 'Z05'
      table.options.meta?.updateData(index, 'workUnit', value)
    }, 500)
    
    const type = v === 'peaUser' ? 'pea' : 'vendor';

    // Fetch work center options สำหรับ type ใหม่ และ tag ด้วย _sourceType
    const newWcOptions = await handleSearchMainWorkCenter('', type);
    const taggedWcOptions = newWcOptions.map(o => ({
      ...o,
      data: { ...o.data, _sourceType: type }
    }));

    console.log(`[handleUpdateUserType] type=${type}, fetched=${taggedWcOptions.length} wc options`);

    // Re-tag: ถ้า option เดิมไม่มี _sourceType (untagged) และตรงกับ fetched → ใส่ tag ใหม่
    // ถ้า option เดิมมี tag อื่นอยู่แล้ว → คงเดิมไว้ (สำหรับ row อื่น)
    const newWcValueSet = new Set(taggedWcOptions.map(o => o.value));
    const updatedExisting = mainWorkCenterOptions.map(existing => {
      if (newWcValueSet.has(existing.value) && !existing.data?._sourceType) {
        // Re-tag untagged → tagged
        const tagged = taggedWcOptions.find(t => t.value === existing.value);
        return tagged || existing;
      }
      return existing;
    });
    // เพิ่ม options ใหม่ที่ยังไม่มีใน array เลย
    const existingWcValues = new Set(mainWorkCenterOptions.map(o => o.value));
    const trulyNewWc = taggedWcOptions.filter(o => !existingWcValues.has(o.value));
    const finalWcOptions = [...updatedExisting, ...trulyNewWc];

    console.log(`[handleUpdateUserType] final wc options: total=${finalWcOptions.length}, pea=${finalWcOptions.filter(o => o.data?._sourceType === 'pea').length}, vendor=${finalWcOptions.filter(o => o.data?._sourceType === 'vendor').length}, untagged=${finalWcOptions.filter(o => !o.data?._sourceType).length}`);
    onUpdateWorkCenterOptions(finalWcOptions);

    // Fetch worker options สำหรับ type ใหม่
    const searchWorkerFn = v === 'vendorUser' ? getVendorWorkerOptions : getWorkerListOptions;
    const newWorkerOpts = await searchWorkerFn('');
    const existingWorkerValues = new Set(workerOptions.map(o => o.value));
    const uniqueNewWorkers = newWorkerOpts.filter(o => !existingWorkerValues.has(o.value));
    onUpdateWorkerOptions([...workerOptions, ...uniqueNewWorkers]);
    
    // Clear workCenterId เมื่อเปลี่ยนกลุ่มผู้ปฏิบัติงาน
    setTimeout(() => {
      table.options.meta?.updateData(index, 'workCenterId', '')
    }, 600)

    // Clear username เมื่อเปลี่ยนกลุ่มผู้ปฏิบัติงาน (เฉพาะ row นี้ ไม่กระทบ row อื่น)
    setTimeout(() => {
      table.options.meta?.updateData(index, 'username', '')
    }, 700)
  }

  const handleDateChange = (key: "startDatetime" | "endDatetime", value: Date | undefined, index: number, table: CustomTable, rowData: Assignee) => {
    const startDate = key === "startDatetime" ? value : rowData.startDatetime;
    const endDate = key === "endDatetime" ? value : rowData.endDatetime;

    if (!validateDateTimeRange(startDate, endDate)) {
      return;
    }

    table.options.meta?.updateData(index, key, value)
  }

  const getDateValue = (dateValue: Date | string | undefined): Date | undefined => {
    if (!dateValue) return undefined;
    if (dateValue instanceof Date) return dateValue;
    return new Date(dateValue);
  };

  const renderTextRequired = (title:string) => {
    return (
      <RequiredLabel required={true}>
        <div>{title}</div>
      </RequiredLabel>
    )
  }

  return [
    {
      id: "userType",
      accessorKey: "userType",
      header: renderTextRequired("กลุ่มผู้ปฏิบัติงาน") as any,
      maxSize: 150,
      cell: ({row, table}) => {
        const selectedOption = groupWorkerOptions.find(item => item.value == row.original.userType);
        if (row.original.isUpdate) {
          return <CustomTooltip fieldValue={selectedOption?.label} fieldLabel="กลุ่มผู้ปฏิบัติงาน" variant="table">
            <EditableSelectCell columnValue={row.original.userType}
                                   row={row}
                                   column={{id: 'userType'}}
                                   table={asTypedTable(table)}
                                   options={groupWorkerOptions}
                                   onUpdate={(v: string | number, item: Options) => handleUpdateUserType(v, table as CustomTable, row.index)}
                                   placeholder={'กลุ่มผู้ปฏิบัติงาน'}/>
          </CustomTooltip>
        } else {
          return <CustomTooltip fieldValue={selectedOption?.label} fieldLabel="กลุ่มผู้ปฏิบัติงาน" variant="table">
            <div>{selectedOption ? selectedOption.label : (row.original.userType || '-')}</div>
          </CustomTooltip>
        }
      }
    },
    {
      id: "username",
      accessorKey: "username",
      header: renderTextRequired("ผู้ปฏิบัติงาน") as any,
      minSize: 200,
      maxSize: 200,
      cell: ({row, table}) => {
        const selectedOption = workerOptions.find(item => item.value == row.original.username);
        const searchFn = row.original.userType === 'vendorUser' ? getVendorWorkerOptions : getWorkerListOptions;
        // Filter options ตาม userType: vendor มี data.workcenterCode, PEA ไม่มี
        const filteredWorkerOptions = row.original.userType === 'vendorUser'
          ? workerOptions.filter(o => o.data?.workcenterCode)
          : workerOptions.filter(o => !o.data?.workcenterCode);
        if (row.original.isUpdate) {
          return <CustomTooltip fieldValue={selectedOption?.label} fieldLabel="ผู้ปฏิบัติงาน" variant="table">
            <EditableSelectCell key={`worker-${row.index}-${row.original.userType}`}
                                   columnValue={row.original.username || ''}
                                   row={row}
                                   column={{id: 'username'}}
                                   table={asTypedTable(table)}
                                   options={filteredWorkerOptions}
                                   onUpdateOptions={(updatedOptions) => {
                                     // Merge: เก็บ options ของประเภทอื่นไว้ + แทนที่ options ประเภทเดียวกัน
                                     const otherTypeOptions = row.original.userType === 'vendorUser'
                                       ? workerOptions.filter(o => !o.data?.workcenterCode)  // เก็บ PEA
                                       : workerOptions.filter(o => !!o.data?.workcenterCode); // เก็บ Vendor
                                     onUpdateWorkerOptions([...otherTypeOptions, ...updatedOptions]);
                                   }}
                                   onSearch={searchFn}
                                   placeholder={'ผู้ปฏิบัติงาน'}/>
          </CustomTooltip>
        } else {
          return <CustomTooltip fieldValue={selectedOption?.label} fieldLabel="ผู้ปฏิบัติงาน" variant="table">
            <div className="text-wrap">{selectedOption ? selectedOption.label : (row.original.username || '-')}</div>
          </CustomTooltip>
        }
      }
    },
    {
      id: "workCenterId",
      accessorKey: "workCenterId",
      header: renderTextRequired("ศูนย์งานหลัก") as any,
      minSize: 250,
      maxSize: 250,
      cell: ({row, table}) => {
        const workCenterName = mainWorkCenterOptions.find((opt) => opt.value == row.original.workCenterId)?.label
        // Filter options ตาม userType: vendor เห็นเฉพาะ tagged vendor, PEA เห็น tagged pea + untagged (initial load)
        const filteredWcOptions = row.original.userType === 'vendorUser'
          ? mainWorkCenterOptions.filter(o => o.data?._sourceType === 'vendor')
          : mainWorkCenterOptions.filter(o => !o.data?._sourceType || o.data._sourceType === 'pea');
        if (row.original.isUpdate) {
          return <CustomTooltip fieldValue={workCenterName} fieldLabel="ศูนย์งานหลัก" variant="table">
            <EditableSelectCell key={`wc-${row.index}-${row.original.userType}`}
                                   columnValue={row.original.workCenterId || ''}
                                   row={row}
                                   column={{id: 'workCenterId'}}
                                   table={asTypedTable(table)}
                                   options={filteredWcOptions}
                                   onSearch={(s: string) => {
                                     const type = row.original.userType === 'peaUser' ? 'pea' : row.original.userType === 'vendorUser' ? 'vendor' : undefined;
                                     return handleSearchMainWorkCenter(s, type);
                                   }}
                                   placeholder={'ศูนย์งานหลัก'}
                                   onUpdateOptions={(updatedOptions) => {
                                     // Merge: เก็บ options ของประเภทอื่นไว้
                                     const otherTypeWcOptions = row.original.userType === 'vendorUser'
                                       ? mainWorkCenterOptions.filter(o => o.data?._sourceType !== 'vendor')
                                       : mainWorkCenterOptions.filter(o => o.data?._sourceType === 'vendor');
                                     onUpdateWorkCenterOptions([...otherTypeWcOptions, ...updatedOptions]);
                                   }}
            />
          </CustomTooltip>
        } else {
          return <CustomTooltip fieldValue={workCenterName} fieldLabel="ศูนย์งานหลัก" variant="table">
            <div className="text-wrap">{workCenterName || ''}</div>
          </CustomTooltip>
        }
      }
    },
    {
      id: "workActivityTypeId",
      accessorKey: "workActivityTypeId",
      header: renderTextRequired("กิจกรรม") as any,
      minSize: 250,
      maxSize: 250,
      cell: ({row, table}) => {
        const selectedOption = eventOptions.find(item => item.value == row.original.workActivityTypeId);
        if (row.original.isUpdate) {
          return <CustomTooltip fieldValue={selectedOption?.label} fieldLabel="กิจกรรม" variant="table">
            <EditableSelectCell columnValue={row.original.workActivityTypeId || ''}
                                   row={row}
                                   column={{id: 'workActivityTypeId'}}
                                   table={asTypedTable(table)}
                                   options={eventOptions}
                                   placeholder={'กิจกรรม'}
                                   onSearch={(s: string) => handleSearchEvent(s)}
                                   onUpdateOptions={onUpdateEventOptions}
            />
          </CustomTooltip>
        } else {
          return <CustomTooltip fieldValue={selectedOption?.label} fieldLabel="กิจกรรม" variant="table">
            <div className="text-wrap">{selectedOption ? selectedOption.label : (row.original.workActivityTypeId || '-')}</div>
          </CustomTooltip>
        }
      }
    },
    {
      id: "startDatetime",
      accessorKey: "startDatetime",
      header: "วันที่และเวลาเริ่มต้น",
      cell: ({row, table}) => {
        const startDateDisplay = row.original.startDatetime ? formatJSDateTH(new Date(row.original.startDatetime), 'dd MMMM yyyy, HH:mm น.') : "-"
        if (row.original.isUpdate) {
          return (
            <CustomTooltip fieldValue={startDateDisplay !== "-" ? startDateDisplay : ""} fieldLabel="วันที่และเวลาเริ่มต้น" variant="table">
              <InputDateTimePicker value={getDateValue(row.original.startDatetime)}
                                   onChange={(v) => handleDateChange("startDatetime", v, row.index, table as CustomTable, row.original)}
                                   placeholder={"วันที่และเวลาเริ่มต้น"}
                                   showConfirmButton={true}
              />
            </CustomTooltip>
          )
        } else {
          return <CustomTooltip fieldValue={startDateDisplay !== "-" ? startDateDisplay : ""} fieldLabel="วันที่และเวลาเริ่มต้น" variant="table">
            <div>{startDateDisplay}</div>
          </CustomTooltip>
        }
      }
    },
    {
      id: "endDatetime",
      accessorKey: "endDatetime",
      header: "วันที่และเวลาสิ้นสุด",
      cell: ({row, table}) => {
        const endDateDisplay = row.original.endDatetime ? formatJSDateTH(new Date(row.original.endDatetime), 'dd MMMM yyyy, HH:mm น.') : "-"
        if (row.original.isUpdate) {
          return (
            <CustomTooltip fieldValue={endDateDisplay !== "-" ? endDateDisplay : ""} fieldLabel="วันที่และเวลาสิ้นสุด" variant="table">
              <InputDateTimePicker value={getDateValue(row.original.endDatetime)}
                                   onChange={(v) => handleDateChange("endDatetime", v, row.index, table as CustomTable, row.original)}
                                   placeholder={"วันที่และเวลาสิ้นสุด"}
                                   showConfirmButton={true}
              />
            </CustomTooltip>
          )
        } else {
          return <CustomTooltip fieldValue={endDateDisplay !== "-" ? endDateDisplay : ""} fieldLabel="วันที่และเวลาสิ้นสุด" variant="table">
            <div>{endDateDisplay}</div>
          </CustomTooltip>
        }
      }
    },
    {
      id: "workHours",
      accessorKey: "workHours",
      header: renderTextRequired("ชั่วโมง/งาน") as any,
      minSize: 105,
      maxSize: 105,
      cell: ({row, table}) => {
        if (row.original.isUpdate) {
          return <CustomTooltip fieldValue={row.original.workHours?.toString()} fieldLabel="ชั่วโมง/งาน" variant="table">
            <EditableTextCell row={row}
                                 column={{id: 'workHours'}}
                                 table={asTypedTable(table)}
                                 columnValue={row.original.workHours || ''}
                                 numberOnly={true}/>
          </CustomTooltip>
        } else {
          return <CustomTooltip fieldValue={row.getValue('workHours')?.toString()} fieldLabel="ชั่วโมง/งาน" variant="table">
            <div>{row.getValue('workHours')}</div>
          </CustomTooltip>
        }
      }
    },
    {
      id: "workUnit",
      accessorKey: "workUnit",
      header: "หน่วย",
      minSize: 60,
      maxSize: 60
    },
    {
      id: "action",
      header: "",
      enableSorting: false,
      maxSize: 70,
      cell: ({row, table}) => {
        return <div className="flex justify-end">
          {
            row.original.isUpdate ?
              <button
                className="bg-[#C8F9E9] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
                onClick={() => updateData(row.index, false, row.original.isEdited || false, asTypedTable(table) , row.original)}
              >
                <FontAwesomeIcon icon={faCheckCircle} size={"sm"} color="#31C48D"/>
              </button>
              :
              <button
                className="bg-[#FDE5B6] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
                onClick={() => updateData(row.index, true, row.original.isEdited || false, asTypedTable(table) , row.original)}
              >
                <FontAwesomeIcon icon={faPencil} size={"sm"} color="#F9AC12"/>
              </button>
          }

          <button
            className="bg-[#FFD4D4] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
            onClick={() => deleteData(row.index, row.original.id || 0, asTypedTable(table))}>
            <FontAwesomeIcon icon={faTrashCan} size={"sm"} color="#E02424"/>
          </button>
        </div>
      }
    },
  ]
}
