import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import {DataTable} from "@/app/components/list/DataTable";
import {ColumnDef} from "@tanstack/react-table";
import {SurveyHistoryObj} from "@/types";
import {formatJSDateTH} from "@/app/helpers/DatetimeHelper";
import {workOrderSurveyHistoryList} from "@/app/api/WorkOrderSurveyApi";

const SurveyHistory = ({id}: {id: string}) => {

  const columns: ColumnDef<SurveyHistoryObj>[] = [
    {
      accessorKey: "id",
      header: "ลำดับที่",
      cell: ({row, table}) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return <div className="text-center">{(pageIndex * pageSize) + row.index + 1}</div>
      },
      maxSize: 20,
      minSize: 20,
      enableSorting: false
    },
    {
      accessorKey: "surveyByName",
      header: "ผู้สำรวจ",
      cell: ({row}) => {
        return <div className="text-wrap">{row.original.surveyByName || "-"}</div>
      }
    },
    {
      accessorKey: "updated_date",
      header: "วันที่สำรวจ",
      cell: ({row}) => {
        return <div className="text-wrap">{
          row.original.updated_date
            ? formatJSDateTH(new Date(row.original.updated_date), 'dd MMM yyyy')
            : "-"
        }</div>
      }
    },
    {
      accessorKey: "status",
      header: "ผลสำรวจ",
      cell: ({row}) => {
        return <div className="text-wrap">
          {
            row.original.status === "I"
              ? "รอผลสำรวจ"
              : row.original.status === 'S'
                ? "ผ่าน" : "ไม่ผ่าน"
          }
        </div>
      }
    },
    {
      accessorKey: "detail",
      header: "รายละเอียด",
      cell: ({row}) => {
        return <div className="text-wrap">{row.original.detail || "-"}</div>
      }
    },
  ]

  return (
    <CardCollapse title={"ประวัติการสำรวจ"}>
      <DataTable columns={columns}
                 tableApi={workOrderSurveyHistoryList(id)}
                 showLoading={false}
                 emptyData={<div className="text-center text-gray-500 p-4">ไม่พบข้อมูลประวัติการสำรวจ</div>}
      />
    </CardCollapse>
  )
}

export default SurveyHistory;
