import { ColumnDef, Table } from "@tanstack/react-table";
import { EditableSelectCell } from "@/app/components/editor-table/EditableSelectCell";
import { EditableTextCell } from "@/app/components/editor-table/EditableTextCell";
import {Options, S318EquipmentServiceData} from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faPencil,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import {searchMeterEquipmentOptions} from "@/app/helpers/SearchMeterEquipment";
import {CustomTooltip} from "@/components/ui/custom-tooltip";
import { showError } from "@/app/helpers/Alert";

interface TableMeta {
  handleRemoveRow?: (index: number, id: number | string) => void;
  handleEditRow?: (
    index: number,
    isUpdate: boolean,
    isEdited: boolean,
    table?: unknown
  ) => void;
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
}

type TypedTable = Table<S318EquipmentServiceData> & {
  options: {
    meta?: TableMeta;
  };
};

interface CustomTable {
  options: {
    meta?: TableMeta;
  };
}

const asTypedTable = (table: Table<S318EquipmentServiceData>): TypedTable =>
    table as TypedTable;

const deleteData = (index: number, id: number | string, table: CustomTable) => {
  table.options.meta?.handleRemoveRow?.(index, id);
};

const updateData = (
  index: number,
  isUpdate: boolean,
  isEdited: boolean,
  table: CustomTable,
  rowData: S318EquipmentServiceData
) => {
  setTimeout(() => {

    if(!isUpdate){
      if(!rowData.equipmentId || !rowData.capacity || !rowData.amount || !rowData.price) {
        showError("กรุณากรอกข้อมูลมิเตอร์/อุปกรณ์ไฟฟ้าให้ครบถ้วน");
        return;
      }
    }

    const is_edit = isUpdate ? true : isEdited;
    table.options.meta?.handleEditRow?.(index, isUpdate, is_edit, table);
  }, 10);
};

export const getColumns = (
  meterEquipmentOptions: Options[],
  onUpdateOptions: (options: Options[]) => void,
 ): ColumnDef<S318EquipmentServiceData>[] => {
  return [
    {
      accessorKey: "no",
      header: "ลำดับที่",
      minSize: 35,
      maxSize: 35,
      cell: ({ row }) => {
        return <div className="text-center">{row.index + 1}</div>;
      },
    },
    {
      accessorKey: "equipmentId",
      header: "มิเตอร์/อุปกรณ์ไฟฟ้า",
      cell: ({ row, table }) => {
        const equipmentName = meterEquipmentOptions.find((item) => item.value == row.original.equipmentId)?.label
        if (row.original.isUpdate) {
          return (
            <CustomTooltip fieldValue={equipmentName} fieldLabel="มิเตอร์/อุปกรณ์ไฟฟ้า" variant="table">
              <EditableSelectCell
                columnValue={row.original.equipmentId || ''}
                row={row}
                column={{ id: 'equipmentId' }}
                table={asTypedTable(table)}
                options={meterEquipmentOptions}
                placeholder={'เลือกมิเตอร์/อุปกรณ์ไฟฟ้า'}
                onSearch={(s) => searchMeterEquipmentOptions(s, "s318")}
                onUpdateOptions={onUpdateOptions}
                onUpdate={(value, item) => {
                  if (item?.data) {
                    const typedTable = asTypedTable(table);
                    const meta = typedTable.options.meta;
                    if (meta && meta.updateData) {
                      meta.updateData(row.index, "equipmentId", value);
                    }
                  }
                }}
              />
            </CustomTooltip>
          );
        } else {
          return <CustomTooltip fieldValue={equipmentName} fieldLabel="มิเตอร์/อุปกรณ์ไฟฟ้า" variant="table">
            <div>{equipmentName || row.original.equipmentId}</div>
          </CustomTooltip>
        }
      },
    },
    {
      accessorKey: "capacity",
      header: "ขนาด",
      cell: ({ row, table }) => {
        if (row.original.isUpdate) {
          return (
            <CustomTooltip fieldValue={row.getValue('capacity')} fieldLabel="ขนาด" variant="table">
              <EditableTextCell
                row={row}
                column={{ id: 'capacity' }}
                table={asTypedTable(table)}
                columnValue={row.getValue('capacity') || ''}
                numberOnly={false}
                placeholder="ขนาด"
              />
            </CustomTooltip>
          );
        } else {
          return <CustomTooltip fieldValue={row.getValue('capacity')} fieldLabel="ขนาด" variant="table">
            <div>{row.getValue('capacity') || ''}</div>
          </CustomTooltip>
        }
      },
    },
    {
      accessorKey: "amount",
      header: "จำนวน",
      cell: ({ row, table }) => {
        if (row.original.isUpdate) {
          return (
            <CustomTooltip fieldValue={row.getValue('amount')?.toString()} fieldLabel="จำนวน" variant="table">
              <EditableTextCell
                row={row}
                column={{ id: 'amount' }}
                table={asTypedTable(table)}
                columnValue={row.getValue('amount') || 0}
                numberOnly={true}
              />
            </CustomTooltip>
          );
        } else {
          return <CustomTooltip fieldValue={row.getValue('amount')?.toString()} fieldLabel="จำนวน" variant="table">
            <div>{row.getValue('amount') || 0}</div>
          </CustomTooltip>
        }
      },
    },
    {
      accessorKey: "price",
      header: "ราคา",
      maxSize: 300,
      cell: ({ row, table }) => {
        const price = row.getValue('price') as number;
        const priceDisplay = price ? `${price.toLocaleString()}` : '0'
        if (row.original.isUpdate) {
          return (
            <CustomTooltip fieldValue={priceDisplay} fieldLabel="ราคา" variant="table">
              <EditableTextCell
                row={row}
                column={{ id: 'price' }}
                table={asTypedTable(table)}
                columnValue={row.getValue('price') || 0}
                numberOnly={true}
              />
            </CustomTooltip>
          );
        } else {
          return <CustomTooltip fieldValue={priceDisplay} fieldLabel="ราคา" variant="table">
            <div>{priceDisplay}</div>
          </CustomTooltip>
        }
      },
    },
    {
      id: "action",
      accessorKey: "action",
      header: "",
      maxSize: 45,
      enableSorting: false,
      cell: ({row, table}) => {
        return <div className="flex justify-center">
          {
            row.original.isUpdate ?
              <button
                className="bg-[#C8F9E9] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
                onClick={() => updateData(row.index, false, row.original.isEdited , asTypedTable(table) , row.original)}
              >
                <FontAwesomeIcon icon={faCheckCircle} size={"sm"} color="#31C48D"/>
              </button>
              :
              <button
                className="bg-[#FDE5B6] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
                onClick={() => updateData(row.index, true, row.original.isEdited, asTypedTable(table) , row.original)}
              >
                <FontAwesomeIcon icon={faPencil} size={"sm"} color="#F9AC12"/>
              </button>
          }

          <button
            className="bg-[#FFD4D4] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
            onClick={() => deleteData(row.index, 0, asTypedTable(table))}>
            <FontAwesomeIcon icon={faTrashCan} size={"sm"} color="#E02424"/>
          </button>
        </div>
      }
    }
  ];
}


