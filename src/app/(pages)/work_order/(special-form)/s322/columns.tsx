import { ColumnDef } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

// Types for Package Features
interface PackageFeature {
  id: number;
  name: string;
  package1: boolean;
  package2: boolean;
  package3: boolean;
  package4: boolean;
}

// Package Feature Columns
export const packageColumns: ColumnDef<PackageFeature>[] = [
  {
    accessorKey: "id",
    header: "ลำดับที่",
    cell: ({ row }) => {
      return <div className="text-center font-medium">{row.getValue("id")}</div>
    },
  },
  {
    accessorKey: "name",
    header: "กิจกรรม",
    cell: ({ row }) => {
      return <div className="text-left">{row.getValue("name")}</div>
    }
  },
  {
    accessorKey: "package1",
    header: "Package 1",
    cell: ({ row }) => {
      const isIncluded = row.getValue("package1") as boolean;
      return (
        <div className="flex justify-center">
          {isIncluded ? (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
            </div>
          ) : (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faTimes} className="text-white text-sm" />
            </div>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "package2",
    header: "Package 2",
    cell: ({ row }) => {
      const isIncluded = row.getValue("package2") as boolean;
      return (
        <div className="flex justify-center">
          {isIncluded ? (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
            </div>
          ) : (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faTimes} className="text-white text-sm" />
            </div>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "package3",
    header: "Package 3",
    cell: ({ row }) => {
      const isIncluded = row.getValue("package3") as boolean;
      return (
        <div className="flex justify-center">
          {isIncluded ? (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
            </div>
          ) : (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faTimes} className="text-white text-sm" />
            </div>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "package4",
    header: "Package 4",
    cell: ({ row }) => {
      const isIncluded = row.getValue("package4") as boolean;
      return (
        <div className="flex justify-center">
          {isIncluded ? (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
            </div>
          ) : (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faTimes} className="text-white text-sm" />
            </div>
          )}
        </div>
      );
    }
  }
];


export type { PackageFeature };