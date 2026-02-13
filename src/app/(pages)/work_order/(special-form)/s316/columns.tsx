import { ColumnDef, Table } from "@tanstack/react-table";
import { EditableSelectCell } from "@/app/components/editor-table/EditableSelectCell";
import { EditableTextCell } from "@/app/components/editor-table/EditableTextCell";
import { Electrical } from "@/types";
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
  handleEditRow?: (index: number, isUpdate: boolean, isEdited: boolean, table: unknown) => void;
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
}

type TypedTable = Table<Electrical> & {
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
    label: "ขนาด A",
    value: "ขนาด A",
  },
  {
    label: "ขนาด B",
    value: "ขนาด B",
  },
  {
    label: "ขนาด C",
    value: "ขนาด C",
  },
];

const asTypedTable = (table: Table<Electrical>): TypedTable => 
    table as TypedTable;
const deleteData = (index: number, id: number, table: CustomTable) => {
  table.options.meta?.handleRemoveRow?.(index, id);
};

const updateData = (
  index: number,
  isUpdate: boolean,
  isEdited: boolean,
  table: CustomTable,
  rowData: Electrical
) => {

  if(!isUpdate){
    if(!rowData.name || !rowData.size || !rowData.quantity){
      showError("กรุณากรอกข้อมูลเครื่องกำเนิดไฟฟ้าให้ครบถ้วน");
      return;
    }
  }

  const is_edit = isUpdate ? true : isEdited;
  table.options.meta?.handleEditRow?.(index, isUpdate, is_edit, table);
};

const baseColumns: ColumnDef<Electrical>[] = [
  {
    accessorKey: "no",
    header: "ลำดับที่",
    cell: ({ row }) => {
      return <div className="text-center">{row.index + 1}</div>;
    },
  },
  {
      accessorKey: "name",
      header: "การไฟฟ้าเจ้าของเครื่อง",
      cell: ({ row, table }) => {
        if (row.original.isUpdate) {
          return (
            <CustomTooltip fieldValue={row.getValue("name")} fieldLabel="การไฟฟ้าเจ้าของเครื่อง" variant="table">
              <EditableTextCell
                row={row}
                column={{ id: "name" }}
                table={asTypedTable(table)}
                columnValue={row.getValue("name") || ''}
              />
            </CustomTooltip>
          );
        } else {
          return <CustomTooltip fieldValue={row.getValue("name")} fieldLabel="การไฟฟ้าเจ้าของเครื่อง" variant="table">
            <div>{row.getValue("name")}</div>
          </CustomTooltip>
        }
      },
    },
  {
    accessorKey: "size",
    header: "ขนาดหม้อแปลง",
    cell: ({ row, table }) => {
      const sizeName = equipmentNameOptions.filter((item) => item.value === row.getValue("size"))[0]?.label
      if (row.original.isUpdate) {
        return (
          <CustomTooltip fieldValue={sizeName} fieldLabel="ขนาดหม้อแปลง" variant="table">
            <EditableSelectCell
              columnValue={row.original.name}
              row={row}
              column={{ id: "size" }}
              table={asTypedTable(table)}
              options={equipmentNameOptions}
              placeholder={"ขนาดหม้อแปลง"}
            />
          </CustomTooltip>
        );
      } else {
        return <CustomTooltip fieldValue={sizeName} fieldLabel="ขนาดหม้อแปลง" variant="table">
          <div>{sizeName}</div>
        </CustomTooltip>
      }
    },
  },
  {
    accessorKey: "quantity",
    header: "จำนวน",
    cell: ({row, table}) => {
      if (row.original.isUpdate) {
        return <CustomTooltip fieldValue={row.original.quantity?.toString()} fieldLabel="จำนวน" variant="table">
          <EditableTextCell 
            row={row}
            column={{id: 'quantity'}}
            table={asTypedTable(table)}
            columnValue={row.original.quantity}
            numberOnly={true}
          />
        </CustomTooltip>
      } else {
        return <CustomTooltip fieldValue={row.getValue('quantity')?.toString()} fieldLabel="จำนวน" variant="table">
          <div>{row.getValue('quantity')}</div>
        </CustomTooltip>
      }
    }
  },
];

const actionColumn: ColumnDef<Electrical> = {
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
            onClick={() => updateData(row.index, false, row.original.isEdited , asTypedTable(table), row.original)}
          >
            <FontAwesomeIcon icon={faCheckCircle} size={"sm"} color="#31C48D"/>
          </button>
          :
          <button
            className="bg-[#FDE5B6] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
            onClick={() => updateData(row.index, true, row.original.isEdited, asTypedTable(table), row.original)}
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
};

// Full columns with action
export const columns: ColumnDef<Electrical>[] = [...baseColumns, actionColumn];

// Columns without action (for read-only views)
export const columnsWithoutAction: ColumnDef<Electrical>[] = baseColumns;
