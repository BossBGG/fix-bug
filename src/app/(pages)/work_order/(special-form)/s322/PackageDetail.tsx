import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useAppSelector } from "@/app/redux/hook";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {MOBILE_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

// Types
interface PackageFeature {
  id: number;
  name: string;
  package1: boolean;
  package2: boolean;
  package3: boolean;
  package4: boolean;
}

interface PackageData {
  id: string;
  name: string;
  price: number;
  features: PackageFeature[];
}

interface PackageDetailProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage?: PackageData;
}

// Mock data for packages
const packageFeatures: PackageFeature[] = [
  {
    id: 1,
    name: "ตรวจสอบจุดสัมผัสทางไฟฟ้าและจุดต่อด้วยกล้อง Thermal Viewer",
    package1: true,
    package2: true,
    package3: true,
    package4: false,
  },
  {
    id: 2,
    name: "บำรุงรักษาอุปกรณ์แรงสูงและแก้ไขจุดร้อน",
    package1: true,
    package2: true,
    package3: true,
    package4: true,
  },
  {
    id: 3,
    name: "ตรวจสอบและแก้ไขค่ากราวด์",
    package1: true,
    package2: true,
    package3: true,
    package4: true,
  },
  {
    id: 4,
    name: "บำรุงรักษาหม้อแปลง",
    package1: true,
    package2: true,
    package3: true,
    package4: true,
  },
  {
    id: 5,
    name: "บำรุงรักษาตู้ MOB",
    package1: true,
    package2: true,
    package3: true,
    package4: true,
  },
  {
    id: 6,
    name: "ตัดกิ่งไม้ใกล้แนวสายไฟ",
    package1: true,
    package2: true,
    package3: true,
    package4: true,
  },
  {
    id: 7,
    name: "ตรวจจุดต่อและขันแน่น",
    package1: true,
    package2: true,
    package3: true,
    package4: true,
  },
  {
    id: 8,
    name: "ตรวจสอบข้อมูลการใช้โหลด (Load Profile)",
    package1: true,
    package2: false,
    package3: false,
    package4: false,
  },
  {
    id: 9,
    name: "ให้คำแนะนำการอนุรักษ์พลังงาน และความปลอดภัย",
    package1: true,
    package2: true,
    package3: true,
    package4: true,
  },
  {
    id: 10,
    name: "จัดทำรายงานผลการตรวจสอบและตรวจวัดทางวิศวกรรม",
    package1: true,
    package2: true,
    package3: true,
    package4: true,
  },
  {
    id: 11,
    name: "ตรวจสอบจุดร้อนที่ทำการแก้ไขด้วย ไมโครโอห์มมิเตอร์",
    package1: true,
    package2: true,
    package3: true,
    package4: false,
  },
];

const packages: PackageData[] = [
  {
    id: "package1",
    name: "Package 1",
    price: 35000,
    features: packageFeatures,
  },
  {
    id: "package2",
    name: "Package 2",
    price: 25000,
    features: packageFeatures,
  },
  {
    id: "package3",
    name: "Package 3",
    price: 20000,
    features: packageFeatures,
  },
  {
    id: "package4",
    name: "Package 4",
    price: 10000,
    features: packageFeatures,
  },
];

// Extended PackageFeature interface for table data
interface ExtendedPackageFeature extends PackageFeature {
  type: "feature" | "price";
}

// Create data with price row at the end - moved inside component
const createTableData = (): ExtendedPackageFeature[] => {
  const featuresData: ExtendedPackageFeature[] = packageFeatures.map(
    (feature) => ({
      ...feature,
      type: "feature" as const,
    })
  );

  // Add price row
  const priceRow: ExtendedPackageFeature = {
    id: 999,
    name: "ราคา",
    package1: true,
    package2: true,
    package3: true,
    package4: true,
    type: "price" as const,
  };

  return [...featuresData, priceRow];
};

// Table Columns Definition
const packageColumns: ColumnDef<ExtendedPackageFeature>[] = [
  {
    accessorKey: "id",
    header: "ลำดับที่",
    cell: ({ row }) => {
      if (row.original.type === "price") {
        return <div className="text-center font-bold"></div>;
      }
      return (
        <div className="text-center font-medium">{row.getValue("id")}</div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "กิจกรรม",
    cell: ({ row }) => {
      if (row.original.type === "price") {
        return (
          <div className="text-left font-bold ">{row.getValue("name")}</div>
        );
      }
      return <div className="text-left">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "package1",
    header: "Package 1",
    cell: ({ row }) => {
      if (row.original.type === "price") {
        const package1Price =
          packages.find((p) => p.id === "package1")?.price || 0;
        return (
          <div className="flex justify-center">
            <div className="px-3 py-1 rounded-full font-bold">
              {package1Price.toLocaleString()}
            </div>
          </div>
        );
      }

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
    },
  },
  {
    accessorKey: "package2",
    header: "Package 2",
    cell: ({ row }) => {
      if (row.original.type === "price") {
        const package2Price =
          packages.find((p) => p.id === "package2")?.price || 0;
        return (
          <div className="flex justify-center">
            <div className="px-3 py-1 rounded-full font-bold">
              {package2Price.toLocaleString()}
            </div>
          </div>
        );
      }

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
    },
  },
  {
    accessorKey: "package3",
    header: "Package 3",
    cell: ({ row }) => {
      if (row.original.type === "price") {
        const package3Price =
          packages.find((p) => p.id === "package3")?.price || 0;
        return (
          <div className="flex justify-center">
            <div className="px-3 py-1  rounded-full font-bold">
              {package3Price.toLocaleString()}
            </div>
          </div>
        );
      }

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
    },
  },
  {
    accessorKey: "package4",
    header: "Package 4",
    cell: ({ row }) => {
      if (row.original.type === "price") {
        const package4Price =
          packages.find((p) => p.id === "package4")?.price || 0;
        return (
          <div className="flex justify-center">
            <div className="px-3 py-1 rounded-full font-bold">
              {package4Price.toLocaleString()}
            </div>
          </div>
        );
      }

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
    },
  },
];

// Package Detail Component with Table
const PackageDetailWithTable: React.FC<PackageDetailProps> = ({
  isOpen,
  onClose,
}) => {
  const screenSize = useAppSelector((state) => state.screen_size);
  const [activeTab, setActiveTab] = useState("package1");
  const [isTableReady, setIsTableReady] = useState(false);

  // Table setup with extended data - memoized inside component
  const tableData = React.useMemo(() => createTableData(), []);
  const memoizedColumns = React.useMemo(() => packageColumns, []);

  const table = useReactTable({
    data: tableData,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Initialize table when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      // Small delay to prevent blocking
      const timer = setTimeout(() => {
        setIsTableReady(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsTableReady(false);
    }
  }, [isOpen]);

  const getFeatureStatus = (feature: PackageFeature, packageId: string) => {
    switch (packageId) {
      case "package1":
        return feature.package1;
      case "package2":
        return feature.package2;
      case "package3":
        return feature.package3;
      case "package4":
        return feature.package4;
      default:
        return false;
    }
  };

  // Mobile Layout
  if (screenSize === MOBILE_SCREEN) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-4 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                รายละเอียด Package
              </DialogTitle>

            </div>
          </DialogHeader>

          {/* Package Tabs */}
          <div className="flex gap-1 px-4 mb-4 flex-shrink-0">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setActiveTab(pkg.id)}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === pkg.id
                    ? "bg-purple-200 text-purple-800"
                    : "bg-white text-black"
                }`}
              >
                {pkg.name}
              </button>
            ))}
          </div>

          {/* Content - Table-like layout for mobile */}
          <div className="flex-1 overflow-y-auto px-4 min-h-0">
            {packages
              .filter((pkg) => pkg.id === activeTab)
              .map((pkg) => (
                <div key={pkg.id} className="space-y-2 pb-4">
                  {/* Features list */}
                  {packageFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center py-3 border-b border-gray-100 last:border-b-0"
                    >
                      {/* ลำดับ */}
                      <div className="w-8 text-center text-sm font-medium text-gray-600 flex-shrink-0">
                        {feature.id}
                      </div>

                      {/* ชื่อ Package */}
                      <div className="flex-1 px-3 text-sm text-gray-800 leading-relaxed">
                        {feature.name}
                      </div>

                      {/* Icon */}
                      <div className="w-8 flex justify-center flex-shrink-0">
                        {getFeatureStatus(feature, pkg.id) ? (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-white text-xs"
                            />
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="text-white text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Price Row - ตรงกับ design */}
                  <div className="flex items-center py-3 bg-[#F2F2F2] rounded-lg mt-4">
                    {/* ลำดับ (ว่าง) */}
                    <div className="w-8 flex-shrink-0"></div>

                    {/* ชื่อ "ราคา" */}
                    <div className="flex-1 px-3 text-sm font-bold text-black">
                      ราคา
                    </div>

                    {/* ตัวเลขราคา */}
                    <div className="w-auto flex justify-center flex-shrink-0 pr-3">
                      <div className="text-sm font-bold text-black">
                        {pkg.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Footer Button */}
          <div className="p-4 border-t flex-shrink-0">
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full"
              onClick={() => {
                onClose();
              }}
            >
              ปิด
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop Layout - Table format with inline pricing
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="p-0 w-[80%] md:w-[70%] xl:w-[65%] overflow-auto"
        style={{
          maxWidth: "none",
          // width: "60%",
          maxHeight: "90vh",
          // minWidth: "1200px",
        }}
      >
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              รายละเอียด Package
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 pt-0">
          {/* Table using react-table with scroll */}
          <div className="rounded-lg border overflow-hidden">
            {/* Loading State */}
            {!isTableReady ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
              </div>
            ) : (
              /* Table Container with Scroll */
              <div className="max-h-96 overflow-y-auto">
                <Table
                  className="w-full table-auto"
                  style={{ minWidth: "1100px" }}
                >
                  <TableHeader className="sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow
                        key={headerGroup.id}
                        className="bg-purple-600 hover:bg-purple-600"
                      >
                        {headerGroup.headers.map((header, index) => (
                          <TableHead
                            key={header.id}
                            className="text-white font-medium text-center border-r border-purple-500 last:border-r-0 px-4 py-3"
                            style={{
                              width:
                                index === 0
                                  ? "80px"
                                  : index === 1
                                  ? "400px"
                                  : "140px",
                              minWidth:
                                index === 0
                                  ? "80px"
                                  : index === 1
                                  ? "400px"
                                  : "140px",
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row, index) => (
                        <TableRow
                          key={row.id}
                          className={`${
                            row.original.type === "price"
                              ? "bg-[#F2F2F2] border-t-2 border-purple-200"
                              : index % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50"
                          } hover:bg-gray-100`}
                        >
                          {row.getVisibleCells().map((cell, cellIndex) => (
                            <TableCell
                              key={cell.id}
                              className="border-r border-gray-200 last:border-r-0 px-4 py-3"
                              style={{
                                width:
                                  cellIndex === 0
                                    ? "80px"
                                    : cellIndex === 1
                                    ? "400px"
                                    : "140px",
                                minWidth:
                                  cellIndex === 0
                                    ? "80px"
                                    : cellIndex === 1
                                    ? "400px"
                                    : "140px",
                                textAlign:
                                  cellIndex === 0 || cellIndex > 1
                                    ? "center"
                                    : "left",
                              }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={packageColumns.length}
                          className="h-24 text-center"
                        >
                          ไม่มีข้อมูล
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Footer Button */}
          <div className="mt-6 text-end">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-full"
              onClick={onClose}
            >
              ปิด
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackageDetailWithTable;
