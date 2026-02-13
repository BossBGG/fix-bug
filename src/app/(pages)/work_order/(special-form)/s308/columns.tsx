import { ColumnDef, Table } from "@tanstack/react-table";
import { EditableSelectCell } from "@/app/components/editor-table/EditableSelectCell";
import { EditableTextCell } from "@/app/components/editor-table/EditableTextCell";
import { Transformer } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faPencil,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import {CustomTooltip} from "@/components/ui/custom-tooltip";
import { showError } from "@/app/helpers/Alert";

interface TableMeta {
  handleRemoveRow?: (index: number, id: number) => void;
  handleEditRow?: (
    index: number,
    isUpdate: boolean,
    isEdited: boolean,
    table: unknown
  ) => void;
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
}

type TypedTable = Table<Transformer> & {
  options: {
    meta?: TableMeta;
  };
};

interface CustomTable {
  options: {
    meta?: TableMeta;
  };
}

const equipmentNameOptions = [
  {
    label: "หม้อแปลง3P5000KVA(รายปี)",
    value: "Transformer 3P5000KVA(annual)",
  },
];

const asTypedTable = (table: Table<Transformer>): TypedTable =>
  table as TypedTable;
const deleteData = (index: number, id: number, table: CustomTable) => {
  table.options.meta?.handleRemoveRow?.(index, id);
};

const updateData = (
  index: number,
  isUpdate: boolean,
  isEdited: boolean,
  table: CustomTable,
  rowData: Transformer
) => {

  if(!isUpdate) {
    if(!rowData.title || !rowData.phase || !rowData.serial || !rowData.size || !rowData.type || !rowData.voltage){
      showError("กรุณากรอกข้อมูลรายละเอียดหม้อแปลงให้ครบถ้วน");
      return;
    }
  }

  const is_edit = isUpdate ? true : isEdited;
  table.options.meta?.handleEditRow?.(index, isUpdate, is_edit, table);
};

const baseColumns: ColumnDef<Transformer>[] = [
  {
    accessorKey: "no",
    header: "ลำดับที่",
    cell: ({ row }) => {
      return <div className="text-center">{row.index + 1}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "ยื่ห้อ",
    cell: ({ row, table }) => {
      if (row.original.isUpdate) {
        return (
          <CustomTooltip fieldValue={row.getValue("name")} fieldLabel="ยื่ห้อ" variant="table">
            <EditableTextCell
              row={row}
              column={{ id: "name" }}
              table={asTypedTable(table)}
              columnValue={row.getValue("name") || ""}
            />
          </CustomTooltip>
        );
      } else {
        return <CustomTooltip fieldValue={row.getValue("name")} fieldLabel="ยื่ห้อ" variant="table">
          <div>{row.getValue("name")}</div>
        </CustomTooltip>
      }
    },
  },
  {
    accessorKey: "phase",
    header: "เฟส",
    cell: ({ row, table }) => {
      const phaseName = equipmentNameOptions.filter((item) => item.value === row.getValue("phase"))[0]?.label
      if (row.original.isUpdate) {
        return (
          <CustomTooltip fieldValue={phaseName} fieldLabel="เฟส" variant="table">
            <EditableSelectCell
              columnValue={row.original.phase}
              row={row}
              column={{ id: "phase" }}
              table={asTypedTable(table)}
              options={equipmentNameOptions}
              placeholder={"เฟส"}
            />
          </CustomTooltip>
        );
      } else {
        return <CustomTooltip fieldValue={phaseName} fieldLabel="เฟส" variant="table">
          <div>{phaseName}</div>
        </CustomTooltip>
      }
    },
  },
  {
    accessorKey: "type",
    header: "ประเภท",
    cell: ({ row, table }) => {
      if (row.original.isUpdate) {
        return (
          <CustomTooltip fieldValue={row.getValue("type")} fieldLabel="ประเภท" variant="table">
            <EditableTextCell
              row={row}
              column={{ id: "type" }}
              table={asTypedTable(table)}
              columnValue={row.getValue("type") || ""}
              numberOnly={true}
            />
          </CustomTooltip>
        );
      } else {
        return <CustomTooltip fieldValue={row.getValue("type")} fieldLabel="ประเภท" variant="table">
          <div>{row.getValue("type")}</div>
        </CustomTooltip>
      }
    },
  },
  {
    accessorKey: "serial",
    header: "Serial",
    cell: ({ row, table }) => {
      if (row.original.isUpdate) {
        return (
          <CustomTooltip fieldValue={row.getValue("serial")} fieldLabel="Serial" variant="table">
            <EditableTextCell
              row={row}
              column={{ id: "serial" }}
              table={asTypedTable(table)}
              columnValue={row.getValue("serial") || ""}
            />
          </CustomTooltip>
        );
      } else {
        return <CustomTooltip fieldValue={row.getValue("serial")} fieldLabel="Serial" variant="table">
          <div>{row.getValue("serial")}</div>
        </CustomTooltip>
      }
    },
  },
  {
    accessorKey: "size",
    header: "ขนาด",
    cell: ({ row, table }) => {
      if (row.original.isUpdate) {
        return (
          <CustomTooltip fieldValue={row.getValue("size")} fieldLabel="ขนาด" variant="table">
            <EditableTextCell
              row={row}
              column={{ id: "size" }}
              table={asTypedTable(table)}
              columnValue={row.getValue("size") || ""}
            />
          </CustomTooltip>
        );
      } else {
        return <CustomTooltip fieldValue={row.getValue("size")} fieldLabel="ขนาด" variant="table">
          <div>{row.getValue("size")}</div>
        </CustomTooltip>
      }
    },
  },
  {
    accessorKey: "pressure",
    header: "แรงดัน",
    cell: ({ row, table }) => {
      if (row.original.isUpdate) {
        return (
          <CustomTooltip fieldValue={row.getValue("pressure")} fieldLabel="แรงดัน" variant="table">
            <EditableTextCell
              row={row}
              column={{ id: "pressure" }}
              table={asTypedTable(table)}
              columnValue={row.getValue("pressure") || ""}
            />
          </CustomTooltip>
        );
      } else {
        return <CustomTooltip fieldValue={row.getValue("pressure")} fieldLabel="แรงดัน" variant="table">
          <div>{row.getValue("pressure")}</div>
        </CustomTooltip>
      }
    },
  },
];

const actionColumn: ColumnDef<Transformer> = {
  id: "action",
  accessorKey: "action",
  header: "",
  enableSorting: false,

  cell: ({ row, table }) => {
    return (
      <div className="flex justify-center">
        {row.original.isUpdate ? (
          <button
            className="bg-[#C8F9E9] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
            onClick={() =>
              updateData(
                row.index,
                false,
                row.original.isEdited || false,
                asTypedTable(table),
                row.original
              )
            }
          >
            <FontAwesomeIcon icon={faCheckCircle} size={"sm"} color="#31C48D" />
          </button>
        ) : (
          <button
            className="bg-[#FDE5B6] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
            onClick={() =>
              updateData(
                row.index,
                true,
                row.original.isEdited || false,
                asTypedTable(table),
                row.original
              )
            }
          >
            <FontAwesomeIcon icon={faPencil} size={"sm"} color="#F9AC12" />
          </button>
        )}

        <button
          className="bg-[#FFD4D4] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
          onClick={() =>
            deleteData(row.index, row.original.id || 0, asTypedTable(table))
          }
        >
          <FontAwesomeIcon icon={faTrashCan} size={"sm"} color="#E02424" />
        </button>
      </div>
    );
  },
};

// Full columns with action
export const columns: ColumnDef<Transformer>[] = [...baseColumns, actionColumn];

// Columns without action (for read-only views)
export const columnsWithoutAction: ColumnDef<Transformer>[] = baseColumns;
