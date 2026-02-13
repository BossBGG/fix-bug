"use client";

import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faPencil,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { MaterialEquipmentObj, MaterialOptionObj, Options } from "@/types";
import { EditableTextCell } from "@/app/components/editor-table/EditableTextCell";
import { EditableSelectCell } from "@/app/components/editor-table/EditableSelectCell";
import { EditableSwitchCell } from "@/app/components/editor-table/EditableSwitchCell";
import { handleSearchMaterial } from "@/app/helpers/SearchMaterial";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
interface TableMeta {
  handleRemoveRow: (index: number, id: number) => void;
  handleEditRow: (
    index: number,
    isUpdate: boolean,
    isEdited: boolean,
    table: Table<MaterialEquipmentObj>
  ) => void;
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
}

type TypedTable = Table<MaterialEquipmentObj> & {
  options: {
    meta?: TableMeta;
  };
};
const asTypedTable = (table: Table<MaterialEquipmentObj>): TypedTable =>
  table as TypedTable;
const deleteData = (index: number, id: number, table: TypedTable) => {
  table.options.meta?.handleRemoveRow(index, id);
};

const updateData = (
  index: number,
  isUpdate: boolean,
  isEdited: boolean,
  table: TypedTable
) => {
  const is_edit = isUpdate ? true : isEdited;
  table.options.meta?.handleEditRow(index, isUpdate, is_edit, table);
};

export const getColumns = (
  materialCodeOptions: Options[],
  materialNameOptions: Options[],
  materialOriginalOptions: MaterialOptionObj[]
): ColumnDef<MaterialEquipmentObj>[] => {
  const onUpdateMaterial = (
    column_id_update: "code" | "name",
    value: string | number,
    table: TypedTable,
    row: Row<MaterialEquipmentObj>,
    option: MaterialOptionObj
  ) => {
    const inOption = materialOriginalOptions.some(
      (mat) => mat[column_id_update] === value
    );
    if (!inOption) {
      materialOriginalOptions.push(option);
      materialCodeOptions.push({
        label: option.code,
        value: option.code,
        data: option,
      });
      materialNameOptions.push({
        label: option.name,
        value: option.name,
        data: option,
      });
    }

    const material = materialOriginalOptions.find((item) => {
      return column_id_update === "code"
        ? item.code === value
        : item.name === value;
    });

    if (material) {
      const realValue =
        column_id_update === "code" ? material.code : material.name;
      const reverseKey = column_id_update === "code" ? "name" : "code";
      setTimeout(() => {
        table.options.meta?.updateData(row.index, column_id_update, realValue);
      }, 300);

      setTimeout(() => {
        const val = column_id_update === "name" ? material.code : material.name;
        table.options.meta?.updateData(row.index, reverseKey, val);
      }, 500);

      setTimeout(() => {
        table.options.meta?.updateData(row.index, "unit", material.unit);
      }, 800);
    }
  };

  const materialCodeMap = new Map(
    materialCodeOptions.map((item) => [item.value, item.label])
  );
  const materialNameMap = new Map(
    materialNameOptions.map((item) => [item.value, item.label])
  );
  const materialUnitMap = new Map(
    materialOriginalOptions.map((item) => [item.code, item.unit])
  );

  return [
    {
      accessorKey: "index",
      header: "ลำดับที่",
      cell: ({ row }) => (
        <div className="text-center break-words">{row.index + 1}</div>
      ),
      maxSize: 3,
      minSize: 3,
      enableSorting: false,
    },
    {
      accessorKey: "code",
      header: "รหัสวัสดุ",
      cell: ({ row, table }) => {
        return row.original.isUpdate ? (
          <CustomTooltip 
            fieldValue={row.original.code}
            fieldLabel="รหัสวัสดุ"
            variant="table"
          >
            <EditableSelectCell
              options={materialCodeOptions}
              row={row}
              column={{ id: "code" }}
              table={asTypedTable(table)}
              placeholder="ค้นหารหัสวัสดุ"
              columnValue={row.original.code}
              onUpdate={(value: string | number, item: MaterialOptionObj) =>
                onUpdateMaterial(
                  "code",
                  value,
                  table as TypedTable,
                  row,
                  item
                )
              }
              onSearch={(s: string) =>
                handleSearchMaterial(s, "code", "code")
              }
            />
          </CustomTooltip>
        ) : (
          materialCodeMap.get(row.getValue("code")) || ""
        );
      },
      maxSize: 70,
    },
    {
      accessorKey: "name",
      header: "ชื่ออุปกรณ์",
      maxSize: 180,
      minSize: 180,
      cell: ({ row, table }) => {
        return row.original.isUpdate ? (
          <CustomTooltip 
            fieldValue={row.original.name}
            fieldLabel="ชื่ออุปกรณ์"
            variant="table"
          >
            <EditableSelectCell
              columnValue={row.original.name}
              row={row}
              column={{ id: "name" }}
              table={asTypedTable(table)}
              options={materialNameOptions}
              onUpdate={(value: string | number, item: MaterialOptionObj) =>
                onUpdateMaterial(
                  "name",
                  value,
                  table as TypedTable,
                  row,
                  item
                )
              }
              placeholder="ชื่ออุปกรณ์"
              onSearch={(s: string) =>
                handleSearchMaterial(s, "name", "name")
              }
            />
          </CustomTooltip>
        ) : (
          <div className="text-wrap">
            {materialNameMap.get(row.getValue("name")) || ""}
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "จำนวน",
      maxSize: 40,
      cell: ({ row, table }) => {
        return row.original.isUpdate ? (
          <CustomTooltip 
            fieldValue={row.original.quantity?.toString()}
            fieldLabel="จำนวน"
            variant="table"
          >
            <EditableTextCell
              row={row}
              column={{ id: "quantity" }}
              table={asTypedTable(table)}
              columnValue={row.original.quantity}
              numberOnly
            />
          </CustomTooltip>
        ) : (
          row.getValue("quantity")
        );
      },
    },
    {
      accessorKey: "unit",
      header: "หน่วย",
      maxSize: 20,
      cell: ({ row }) => {
        return (
          <div className="text-center">
            {materialUnitMap.get(row.getValue("code")) || "-"}
          </div>
        );
      },
    },
    /*{
      accessorKey: "isActive",
      header: "เปิด/ปิดการใช้งาน",
      maxSize: 35,
      cell: ({ row, table }) => (
        <div className="text-center">
          <EditableSwitchCell
            row={{ index: row.index, isUpdate: row.original.isUpdate }}
            column={{ id: 'isActive' }}
            columnValue={row.original.isActive}
            table={asTypedTable(table)}
          />
        </div>
      )
    },*/
    {
      accessorKey: "action",
      header: "",
      enableSorting: false,
      maxSize: 15,
      cell: ({ row, table }) => (
        <div className="flex justify-center">
          {row.original.isUpdate ? (
            <button
              className="bg-[#C8F9E9] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
              onClick={() =>
                updateData(
                  row.index,
                  false,
                  row.original.isEdited,
                  table as TypedTable
                )
              }
            >
              <FontAwesomeIcon icon={faCheckCircle} size="sm" color="#31C48D" />
            </button>
          ) : (
            <button
              className="bg-[#FDE5B6] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
              onClick={() =>
                updateData(
                  row.index,
                  true,
                  row.original.isEdited,
                  table as TypedTable
                )
              }
            >
              <FontAwesomeIcon icon={faPencil} size="sm" color="#F9AC12" />
            </button>
          )}
          <button
            className="bg-[#FFD4D4] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
            onClick={() =>
              deleteData(row.index, row.original.id || 0, table as TypedTable)
            }
          >
            <FontAwesomeIcon icon={faTrashCan} size="sm" color="#E02424" />
          </button>
        </div>
      ),
    },
  ];
};
