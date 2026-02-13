import { ColumnDef, Table } from "@tanstack/react-table";
import { EditableSelectCell } from "@/app/components/editor-table/EditableSelectCell";
import { EditableTextCell } from "@/app/components/editor-table/EditableTextCell";
import { Options, S305TransformerServiceData, Transformer } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faPencil,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import {
  handleSearchTransformerBrands,
  handleSearchTransformerPhase,
  handleSearchTransformerSize,
  handleSearchTransformerType,
  handleSearchTransformerVoltage,
} from "@/app/helpers/SearchTransformer.";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
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

type TypedTable = Table<S305TransformerServiceData> & {
  options: {
    meta?: TableMeta;
  };
};

interface CustomTable {
  options: {
    meta?: TableMeta;
  };
}

const asTypedTable = (table: Table<S305TransformerServiceData>): TypedTable =>
  table as TypedTable;
const deleteData = (index: number, table: CustomTable) => {
  table.options.meta?.handleRemoveRow?.(index, 0);
};

const updateData = (
  index: number,
  isUpdate: boolean,
  isEdited: boolean,
  table: CustomTable,
  rowData: S305TransformerServiceData
) => {
  if (!isUpdate) {
    if (
      !rowData.transformerBrandId ||
      !rowData.transformerPhaseId ||
      !rowData.transformerSerial ||
      !rowData.transformerSize ||
      !rowData.transformerTypeId ||
      !rowData.transformerVoltage
    ) {
      showError("กรุณากรอกข้อมูลรายละเอียดหม้อแปลงให้ครบถ้วน");
      return;
    }
  }

  const is_edit = isUpdate ? true : isEdited;
  table.options.meta?.handleEditRow?.(index, isUpdate, is_edit, table);
};

export const getColumns = (
  brandsOptions: Options[],
  onUpdateBrandOptions: (opts: Options[]) => void,
  phaseOptions: Options[],
  onUpdatePhaseOptions: (opts: Options[]) => void,
  typeOptions: Options[],
  onUpdateTypeOptions: (opts: Options[]) => void,
  sizeOptions: Options[],
  onUpdateSizeOptions: (opts: Options[]) => void,
  voltageOptions: Options[],
  onUpdateVoltageOptions: (opts: Options[]) => void,
  reqCode: string
): ColumnDef<S305TransformerServiceData>[] => {
  return [
    {
      accessorKey: "no",
      header: "ลำดับที่",
      maxSize: 5,
      enableSorting: false,
      cell: ({ row }) => {
        return <div className="text-center">{row.index + 1}</div>;
      },
    },
    {
      accessorKey: "transformerBrandId",
      header: "ยื่ห้อ",
      maxSize: 50,
      cell: ({ row, table }) => {
        const brandName = brandsOptions.find(
          (brand) => brand.value == row.getValue("transformerBrandId")
        )?.label;
        if (row.original.isUpdate) {
          return (
            <CustomTooltip
              fieldValue={brandName}
              fieldLabel="ยื่ห้อ"
              variant="table"
            >
              <EditableSelectCell
                columnValue={row.original.transformerBrandId}
                row={row}
                column={{ id: "transformerBrandId" }}
                table={asTypedTable(table)}
                options={brandsOptions}
                placeholder={"ยื่ห้อ"}
                onSearch={(s) => handleSearchTransformerBrands(s, reqCode)}
                onUpdateOptions={onUpdateBrandOptions}
              />
            </CustomTooltip>
          );
        } else {
          return (
            <CustomTooltip
              fieldValue={brandName}
              fieldLabel="ยื่ห้อ"
              variant="table"
            >
              <div>{brandName || row.getValue("transformerBrandId")}</div>
            </CustomTooltip>
          );
        }
      },
    },
    {
      accessorKey: "transformerPhaseId",
      header: "เฟส",
      maxSize: 50,
      cell: ({ row, table }) => {
        const phaseName = phaseOptions.find(
          (item) => item.value == row.getValue("transformerPhaseId")
        )?.label;
        if (row.original.isUpdate) {
          return (
            <CustomTooltip
              fieldValue={phaseName}
              fieldLabel="เฟส"
              variant="table"
            >
              <EditableSelectCell
                columnValue={row.original.transformerPhaseId}
                row={row}
                column={{ id: "transformerPhaseId" }}
                table={asTypedTable(table)}
                options={phaseOptions}
                placeholder={"เฟส"}
                onSearch={(s) => handleSearchTransformerPhase(s, reqCode)}
                onUpdateOptions={onUpdatePhaseOptions}
              />
            </CustomTooltip>
          );
        } else {
          return (
            <CustomTooltip
              fieldValue={phaseName}
              fieldLabel="เฟส"
              variant="table"
            >
              <div>{phaseName || row.getValue("transformerPhaseId")}</div>
            </CustomTooltip>
          );
        }
      },
    },
    {
      accessorKey: "transformerTypeId",
      header: "ประเภท",
      maxSize: 50,
      cell: ({ row, table }) => {
        const typeName = typeOptions.find(
          (type) => type.value == row.getValue("transformerTypeId")
        )?.label;
        if (row.original.isUpdate) {
          return (
            <CustomTooltip
              fieldValue={typeName}
              fieldLabel="ประเภท"
              variant="table"
            >
              <EditableSelectCell
                columnValue={row.original.transformerTypeId}
                row={row}
                column={{ id: "transformerTypeId" }}
                table={asTypedTable(table)}
                options={typeOptions}
                placeholder={"ประเภท"}
                onSearch={(s) => handleSearchTransformerType(s, reqCode)}
                onUpdateOptions={onUpdateTypeOptions}
              />
            </CustomTooltip>
          );
        } else {
          return (
            <CustomTooltip
              fieldValue={typeName}
              fieldLabel="ประเภท"
              variant="table"
            >
              <div>{typeName || row.getValue("transformerTypeId")}</div>
            </CustomTooltip>
          );
        }
      },
    },
    {
      accessorKey: "transformerSerial",
      header: "Serial",
      maxSize: 50,
      cell: ({ row, table }) => {
        if (row.original.isUpdate) {
          return (
            <CustomTooltip
              fieldValue={row.getValue("transformerSerial")}
              fieldLabel="Serial"
              variant="table"
            >
              <EditableTextCell
                row={row}
                column={{ id: "transformerSerial" }}
                table={asTypedTable(table)}
                columnValue={row.getValue("transformerSerial") || ""}
              />
            </CustomTooltip>
          );
        } else {
          return (
            <CustomTooltip
              fieldValue={row.getValue("transformerSerial")}
              fieldLabel="Serial"
              variant="table"
            >
              <div>{row.getValue("transformerSerial")}</div>
            </CustomTooltip>
          );
        }
      },
    },
    {
      accessorKey: "transformerSize",
      header: "ขนาด",
      maxSize: 50,
      cell: ({ row, table }) => {
        const sizeName = sizeOptions.find(
          (size) => size.value == row.getValue("transformerSize")
        )?.label;
        if (row.original.isUpdate) {
          return (
            <CustomTooltip
              fieldValue={sizeName}
              fieldLabel="ขนาด"
              variant="table"
            >
              <EditableSelectCell
                columnValue={row.original.transformerSize as string}
                row={row}
                column={{ id: "transformerSize" }}
                table={asTypedTable(table)}
                options={sizeOptions}
                placeholder={"ขนาด"}
                onSearch={(s) => handleSearchTransformerSize(s, reqCode)}
                onUpdateOptions={onUpdateSizeOptions}
              />
            </CustomTooltip>
          );
        } else {
          return (
            <CustomTooltip
              fieldValue={sizeName}
              fieldLabel="ขนาด"
              variant="table"
            >
              <div>{sizeName || row.getValue("transformerSize")}</div>
            </CustomTooltip>
          );
        }
      },
    },
    {
      accessorKey: "transformerVoltage",
      header: "แรงดัน",
      maxSize: 50,
      cell: ({ row, table }) => {
        const voltageName = voltageOptions.find(
          (volt) => volt.value == row.getValue("transformerVoltage")
        )?.label;
        if (row.original.isUpdate) {
          return (
            <CustomTooltip
              fieldValue={voltageName}
              fieldLabel="แรงดัน"
              variant="table"
            >
              <EditableSelectCell
                columnValue={row.original.transformerVoltage as string}
                row={row}
                column={{ id: "transformerVoltage" }}
                table={asTypedTable(table)}
                options={voltageOptions}
                placeholder={"แรงดัน"}
                onSearch={(s) => handleSearchTransformerVoltage(s, reqCode)}
                onUpdateOptions={onUpdateVoltageOptions}
              />
            </CustomTooltip>
          );
        } else {
          return (
            <CustomTooltip
              fieldValue={voltageName}
              fieldLabel="แรงดัน"
              variant="table"
            >
              <div>{voltageName || row.getValue("transformerVoltage")}</div>
            </CustomTooltip>
          );
        }
      },
    },
    {
      id: "action",
      accessorKey: "action",
      header: "",
      enableSorting: false,
      maxSize: 5,
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
              onClick={() => deleteData(row.index, asTypedTable(table))}
            >
              <FontAwesomeIcon icon={faTrashCan} size={"sm"} color="#E02424" />
            </button>
          </div>
        );
      },
    },
  ];
};
