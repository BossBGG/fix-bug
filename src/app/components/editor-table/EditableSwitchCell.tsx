import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

interface EditableSwitchCellProps {
  columnValue: boolean;
  row: {
    index: number;
    isUpdate: boolean;
  };
  column: {
    id: string;
  };
  table: {
    options: {
      meta?: {
        updateData: (
          rowIndex: number,
          columnId: string,
          value: unknown
        ) => void;
      };
    };
  };
}

export const EditableSwitchCell = ({
  columnValue,
  row,
  column,
  table,
}: EditableSwitchCellProps) => {
  const initialValue = columnValue;
  const [value, setValue] = useState(initialValue);

  function handleChange() {
    const newValue = !value;
    setValue(newValue);
    table.options.meta?.updateData(row.index, column.id, newValue);
  }

  useEffect(() => setValue(initialValue), [initialValue]);

  return (
    <Switch
      checked={value}
      onCheckedChange={handleChange}
      className="data-[state=checked]:bg-[#9538EA] data-[state=unchecked]:bg-[#57595B] cursor-pointer"
      disabled={!row.isUpdate}
    />
  );
};
