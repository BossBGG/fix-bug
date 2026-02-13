import {ColumnDef, Table} from "@tanstack/react-table";
import {EditableSelectCell} from "@/app/components/editor-table/EditableSelectCell";
import {EditableTextCell} from "@/app/components/editor-table/EditableTextCell";
import {Options, S301EquipmentServiceData} from "@/types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faPencil, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import handleSearchServiceEquipmentType from "@/app/helpers/SearchServiceEquipmentType";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { showError } from "@/app/helpers/Alert";

interface TableMeta {
  handleRemoveRow?: (index: number, id: number | string) => void;
  handleEditRow?: (index: number, isUpdate: boolean, isEdited: boolean, table: unknown) => void;
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  getDataCallback: () => void;
  requestCode: string
}

type TypedTable = Table<S301EquipmentServiceData> & {
  options: {
    meta?: TableMeta;
  };
};

interface CustomTable {
  options: {
    meta?: TableMeta;
  };
}

const asTypedTable = (table: Table<S301EquipmentServiceData>): TypedTable =>
  table as TypedTable;

const deleteData = (index: number, id: string | number, table: CustomTable) => {
  table.options.meta?.handleRemoveRow?.(index, id)
}

const updateData = (index: number, isUpdate: boolean, isEdited: boolean, table: CustomTable, rowData: S301EquipmentServiceData) => {
  
  if (!isUpdate) {
    if (!rowData.equipmentTypeId || !rowData.amount) {
      showError("กรุณากรอกข้อมูลประเภทอุปกรณ์ไฟฟ้าให้ครบถ้วน");
      return;
    }
  }
  
  const is_edit = isUpdate ? true : isEdited
  table.options.meta?.handleEditRow?.(index, isUpdate, is_edit, table);
}

export const getColumnElectricalEditor = (
  serviceEquipmentOptions: Options[],
  onUpdateOptions: (d: Options[]) => void,
  requestCode: string
): ColumnDef<S301EquipmentServiceData>[] => {
  return [
    {
      id: "no",
      accessorKey: "no",
      header: "ลำดับที่",
      maxSize: 50,
      minSize: 50,
      cell: ({row}) => {
        return <div className="text-center">{row.index + 1}</div>
      },
      enableSorting: false
    },
    {
      id: "equipmentTypeId",
      accessorKey: "equipmentTypeId",
      header: "ประเภท",
      maxSize: 700,
      minSize: 700,
      cell: ({row, table}) => {
        const equipmentName = serviceEquipmentOptions.find((opt) => opt.value == row.original.equipmentTypeId)?.label
        if (row.original.isUpdate) {
          return <CustomTooltip fieldValue={equipmentName} fieldLabel="ชื่ออุปกรณ์" variant="table">
                <EditableSelectCell columnValue={row.original.equipmentTypeId}
                                       row={row}
                                       column={{id: 'equipmentTypeId'}}
                                       table={asTypedTable(table)}
                                       options={serviceEquipmentOptions}
                                       placeholder={'ชื่ออุปกรณ์'}
                                       onSearch={(s: string) => handleSearchServiceEquipmentType(s, requestCode)}
                                       onUpdateOptions={onUpdateOptions}
                                       keyOfLabel="name"
                />
              </CustomTooltip>
        } else {
          return equipmentName || row.original.equipmentTypeId
        }
      }
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: "จำนวนที่เบิก",
      maxSize: 300,
      cell: ({row, table}) => {
        if (row.original.isUpdate) {
          return <CustomTooltip fieldValue={row.original.amount?.toString()} fieldLabel="จำนวนที่เบิก" variant="table">
            <EditableTextCell row={row}
                                 column={{id: 'amount'}}
                                 table={asTypedTable(table)}
                                 columnValue={row.original.amount || ""}
                                 numberOnly={true}
            />
          </CustomTooltip>
        } else {
          return <CustomTooltip fieldValue={row.getValue('amount')?.toString()} fieldLabel="จำนวนที่เบิก" variant="table">
            <div>{row.getValue('amount')}</div>
          </CustomTooltip>
        }
      }
    },
    {
      id: "action",
      accessorKey: "action",
      header: "",
      enableSorting: false,
      cell: ({row, table}) => {
        return <div className="flex justify-center">
          {
            row.original.isUpdate ?
              <button
                className="bg-[#C8F9E9] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
                onClick={() => updateData(row.index, false, row.original.isEdited || false, asTypedTable(table), row.original)}
              >
                <FontAwesomeIcon icon={faCheckCircle} size={"sm"} color="#31C48D"/>
              </button>
              :
              <button
                className="bg-[#FDE5B6] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
                onClick={() => updateData(row.index, true, row.original.isEdited || false, asTypedTable(table), row.original)}
              >
                <FontAwesomeIcon icon={faPencil} size={"sm"} color="#F9AC12"/>
              </button>
          }

          <button
            className="bg-[#FFD4D4] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
            onClick={() => deleteData(row.index, row.original.equipmentTypeId || '', asTypedTable(table))}>
            <FontAwesomeIcon icon={faTrashCan} size={"sm"} color="#E02424"/>
          </button>
        </div>
      }
    }
  ]
}
