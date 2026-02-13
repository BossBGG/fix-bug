import { ColumnDef, Table } from "@tanstack/react-table";
import { EditableSelectCell } from "@/app/components/editor-table/EditableSelectCell";
import { Options, ResponsiblePersonObj } from "@/types";
import {CustomTooltip} from "@/components/ui/custom-tooltip";

interface TableMeta {
  handleRemoveRow?: (index: number, id: number) => void;
  handleEditRow?: (
    index: number,
    isUpdate: boolean,
    isEdit: boolean,
    table: unknown
  ) => void;
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
}

type TypedTable = Table<ResponsiblePersonObj> & {
  options: {
    meta?: TableMeta;
  };
};

const asTypedTable = (table: Table<ResponsiblePersonObj>): TypedTable =>
  table as TypedTable;

export const getResponsiblePersonColumns = (
  assigneeOptions: Options[],
  onUpdate: (value: string | number, item: ResponsiblePersonObj) => void,
  disabled: boolean
): ColumnDef<ResponsiblePersonObj>[] => {
  return [
    {
      accessorKey: "no",
      header: "ลำดับ",
      cell: ({ row }) => {
        return <div className="text-center">{row.index + 1}</div>;
      },
      maxSize: 5,
    },
    {
      accessorKey: "username",
      header: "พนักงานรับผิดชอบเบิก/คืนวัสดุอุปกรณ์",
      cell: ({ row, table }) => {
        const assigneeName = assigneeOptions.find((option) => option.value === row.original.username)?.label
        if (row.original.isUpdate) {
          return (
            <CustomTooltip fieldValue={assigneeName} fieldLabel="พนักงานรับผิดชอบเบิก/คืนวัสดุอุปกรณ์" variant="table">
              <EditableSelectCell
                columnValue={(row.original.username as string) || ""}
                row={row}
                column={{ id: "username" }}
                table={asTypedTable(table)}
                options={assigneeOptions}
                placeholder={"พนักงาน"}
                onUpdate={onUpdate}
                disabled={disabled}
              />
            </CustomTooltip>
          );
        } else {
          return (
            <CustomTooltip fieldValue={assigneeName} fieldLabel="พนักงานรับผิดชอบเบิก/คืนวัสดุอุปกรณ์" variant="table">
              <div>{assigneeName || ""}</div>
            </CustomTooltip>
          );
        }
      },
    },
  ];
};
