"use client"

import {ColumnDef} from "@tanstack/react-table"

export interface SystemLogDetailColumnProps {
  attributeName: string
  fromValue: string
  toValue: string
}

export const columns: ColumnDef<SystemLogDetailColumnProps>[] = [
  {
    accessorKey: "no",
    header: "ลำดับที่",
    cell: ({row}) => {
      return <div className="text-center">{row.index + 1}</div>
    },
    maxSize: 28,
    size: 28,
    enableSorting: false
  },
  {
    accessorKey: "attributeName",
    header: "ชื่อฟิลด์",
    size: 100,
    cell: ({row}) => {
      return (<div className="text-wrap">{row.getValue('attributeName')}</div>)
    }
  },
  {
    accessorKey: "fromValue",
    header: "รายละเอียดเพิ่มเติม (ข้อมูลเดิม)",
    cell: ({row}) => (
      <div className="text-wrap">{row.getValue('fromValue') || '-'}</div>
    ),
    size: 150
  },
  {
    accessorKey: "toValue",
    header: "รายละเอียดเพิ่มเติม (ข้อมูลใหม่)",
    cell: ({row}) => (
      <div className="text-wrap">{row.getValue('toValue') || '-'}</div>
    ),
    size: 150
  }
]
