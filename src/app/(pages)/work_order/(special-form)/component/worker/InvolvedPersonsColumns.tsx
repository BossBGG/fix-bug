import { ColumnDef, Table } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EditableSelectCell } from "@/app/components/editor-table/EditableSelectCell";
import { Options, Assignee } from "@/types";
import {
  faCheckCircle,
  faPencil,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { getAllWorkerOptions } from "@/app/helpers/WorkerOptions";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { showError } from "@/app/helpers/Alert";

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

const asTypedTable = (table: Table<Assignee>): TypedTable =>
  table as TypedTable;

export const getInvolvedPersonsColumns = (
  workerOptions: Options[],
  onUpdate: (value: string | number, item: Assignee) => void,
  disabled: boolean,
  onUpdateWorkerOptions: (d: Options[]) => void
): ColumnDef<Assignee>[] => {
  return [
    {
      accessorKey: "username",
      header: "ผู้เกี่ยวข้อง",
      cell: ({ row, table }) => {
        const workerName = workerOptions.find(
          (option) => option.value === row.original.username
        )?.label;
        if (row.original.isUpdate) {
          return (
            <CustomTooltip
              fieldValue={workerName}
              fieldLabel="ผู้เกี่ยวข้อง"
              variant="table"
            >
              <EditableSelectCell
                columnValue={(row.original.username as string) || ""}
                row={row}
                column={{ id: "username" }}
                table={asTypedTable(table)}
                options={workerOptions}
                placeholder={"เลือกผู้ปฏิบัติงาน"}
                onUpdate={onUpdate}
                disabled={disabled}
                onUpdateOptions={onUpdateWorkerOptions}
                onSearch={getAllWorkerOptions}
              />
            </CustomTooltip>
          );
        } else {
          return (
            <CustomTooltip
              fieldValue={workerName || row.original.username}
              fieldLabel="ผู้เกี่ยวข้อง"
              variant="table"
            >
              <div>{workerName || row.original.username || ""}</div>
            </CustomTooltip>
          );
        }
      },
      size: 90,
      minSize: 400,
    },
    {
      id: "action",
      header: "",
      enableSorting: false,
      size: 10,
      maxSize: 50,
      cell: ({ row, table }) => {
        const customTable = table as CustomTable;

        if (!disabled) {
          return (
            <div className="flex justify-center">
              {row.original.isUpdate ? (
                <button
                  className="bg-[#C8F9E9] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    if (!row.original.username) {
                      showError("กรุณากรอกข้อมูลผู้เกี่ยวข้องให้ครบถ้วน");
                      return;
                    }
                    customTable.options.meta?.handleEditRow?.(
                      row.index,
                      false,
                      true,
                      table
                    );
                  }}
                  disabled={disabled}
                >
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    size={"sm"}
                    color="#31C48D"
                  />
                </button>
              ) : (
                <button
                  className="bg-[#FDE5B6] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
                  onClick={() =>
                    customTable.options.meta?.handleEditRow?.(
                      row.index,
                      true,
                      row.original.isUpdate || false,
                      table
                    )
                  }
                >
                  <FontAwesomeIcon
                    icon={faPencil}
                    size={"sm"}
                    color="#F9AC12"
                  />
                </button>
              )}

              <button
                className="bg-[#FFD4D4] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
                onClick={() =>
                  customTable.options.meta?.handleRemoveRow?.(
                    row.index,
                    row.original.id || 0
                  )
                }
              >
                <FontAwesomeIcon
                  icon={faTrashCan}
                  size={"sm"}
                  color="#E02424"
                />
              </button>
            </div>
          );
        }

        return <div></div>;
      },
    },
  ];
};
