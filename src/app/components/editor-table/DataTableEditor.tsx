"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState, Header
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {Button} from "@/components/ui/button";
import React, {useEffect, useState} from "react";
import {PaginationList} from "@/components/ui/pagination-list";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import {cn} from "@/lib/utils";
import {ChevronDown, ChevronsUpDown, ChevronUp} from "lucide-react";

interface CustomTableMeta<TData> {
  updateData: (rowIndex: number, columnId: string, value: any) => void;
  handleEditRow: (rowIndex: number, is_update: boolean, is_edit: boolean, table?: any) => void;
  handleRemoveRow?: (index: number, id: number) => void;
  handleEditModal?: (rowIndex: number, item: TData) => void;
  getDataCallback?: () => TData[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  rowItem?: TData,
  LabelAddRow?: string | undefined,
  onUpdateData: (data: TData[]) => void,
  realData: TData[],
  onRemoveData?: (id: number) => void,
  visibleDelete?: boolean,
  classActionRow?: string,
  classPagination?: string,
  hiddenColumn?: any
  meta?: Partial<CustomTableMeta<TData>>
}

export function DataTableEditor<TData, TValue>({
                                                 columns,
                                                 rowItem,
                                                 LabelAddRow,
                                                 onUpdateData,
                                                 realData,
                                                 onRemoveData,
                                                 visibleDelete = false,
                                                 classActionRow,
                                                 classPagination,
                                                 hiddenColumn,
                                                 meta: externalMeta
                                               }: DataTableProps<TData, TValue>) {
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [data, setData] = useState<TData[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState(hiddenColumn)

  useEffect(() => {
    const datas = realData.map((item, index) => ({...item, index: index + 1}))
    setData(datas)
    setTotalCount(datas.length)
  }, [realData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: Math.ceil(data.length / pageSize),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      get sorting() {
        return sorting
      },
      columnVisibility: hiddenColumn ?? {}
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    meta: {
      updateData: (rowIndex: number, columnId: string, value: TValue) => {
        const newData = data.map((row, index) => {
          return index === rowIndex ? {...row, [columnId]: value } : row
        })
        onUpdateData(newData)
      },
      handleEditRow: (rowIndex: number, is_update: boolean, is_edit: boolean) => {
        if (externalMeta?.handleEditRow) {
          externalMeta.handleEditRow(rowIndex, is_update, is_edit, table);
        } else {
          const newData = data.map((row, index) => {
            return index === rowIndex ? {...row, isUpdate: is_update, isEdited: is_edit} : row
          })
          onUpdateData(newData)
        }
      },
      handleRemoveRow: (rowIndex: number, id: number) => {
        setData((oldData) => {
          const newData = oldData.filter((_, index) => index !== rowIndex)

          const newPageCount = Math.ceil(newData.length / pageSize)
          if (pageIndex >= newPageCount && newPageCount > 0) {
            handleChangePage(newPageCount - 1)
          }

          setTotalCount(newData.length)
          onUpdateData(newData)
          onRemoveData?.(id)
          return newData
        })
      },

      handleEditModal: externalMeta?.handleEditModal,
      getDataCallback() {
        return data
      }
    },
  })

  const handleChangePage = (page: number) => {
    setPageIndex(page)
    table.setPageIndex(page)
  }

  const handleChangePageSize = (size: number) => {
    setPageSize(size)
    table.setPageSize(size)
    handleChangePage(0)
  }

  const handleSort = (header: Header<TData, unknown>) => {
    return header.column.getToggleSortingHandler()
  }

  const addRow = () => {
    if (rowItem) {
      const newData: TData[] = [...data, rowItem]
      handleUpdateData(newData)
    }
  }

  const handleUpdateData = (newData: TData[]) => {
    const newPageCount = Math.ceil(newData.length / pageSize)
    const lastPageIndex = newPageCount - 1
    setTotalCount(newData.length)
    handleChangePage(lastPageIndex)
    setData(newData)
    onUpdateData(newData)
  }

  return (
    <div className="mb-3">
      <div className="rounded-[20px] border">
        <Table className="rounded-tl-[8px] rounded-tr-[8px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <TableHead key={header.id}
                               className="bg-[#B05FF3] text-white first:rounded-tl-[8px] last:rounded-tr-[8px]"
                               style={{
                                 width: header.getSize(),
                                 maxWidth: header.column.columnDef.maxSize,
                                 minWidth: header.column.columnDef.minSize
                               }}
                    >
                      {
                        header.isPlaceholder
                          ? null
                          : <Button
                            variant="ghost"
                            onClick={canSort ? handleSort(header) : undefined}
                            className={cn("hover:bg-transparent hover:text-white p-0", canSort ? 'cursor-pointer' : 'cursor-default')}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {
                              canSort && (
                                <div>
                                  {header.column.getIsSorted() === "desc" && <ChevronDown/>}
                                  {header.column.getIsSorted() === "asc" && <ChevronUp/>}
                                  {!header.column.getIsSorted() && <ChevronsUpDown className="h-1 w-1"/>}
                                </div>
                              )
                            }
                          </Button>
                      }
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="even:bg-[#F2F2F2]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="first:rounded-bl-[8px] last:rounded-br-[8px]"
                               style={{
                                 width: cell.column.getSize(),
                                 minWidth: cell.column.columnDef.minSize,
                                 maxWidth: cell.column.columnDef.maxSize,
                               }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className={`flex items-center justify-end ${classActionRow || ''}`}>
        {
          LabelAddRow &&
          <Button className="my-3 pea-button !px-3 !py-4" onClick={() => addRow()}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/>
            {LabelAddRow}
          </Button>
        }

        {
          visibleDelete &&
          <Button className="my-3 mx-2 pea-button-outline !px-3 !py-4" onClick={() => handleUpdateData([])}>
            <FontAwesomeIcon icon={faTrashCan}/>
            ลบทั้งหมด
          </Button>
        }
      </div>
      {
        data.length > 0 &&
        <div className={`flex items-center space-x-2 py-4 justify-center lg:justify-end mt-3 ${classPagination || ''}`}>
          <PaginationList totalCount={totalCount}
                          pageSize={pageSize}
                          page={pageIndex}
                          changePage={(p) => handleChangePage(p)}
                          changePageSize={(size) => handleChangePageSize(size)}
                          pageSizeSelectOptions={{
                            pageSizeOptions: [10, 20, 30, 50, 100],
                          }}
          />
        </div>
      }

    </div>

  )
}
