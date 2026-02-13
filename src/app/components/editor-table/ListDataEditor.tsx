import {useEffect, useState} from "react";
import {PaginationList} from "@/components/ui/pagination-list";
import * as React from "react";

interface ListDataProps<T> {
  children: (pageData: T[], page: number, pageSize: number) => React.ReactNode;
  visibleSizeSelection?: boolean;
  onUpdateData?: (data: T[]) => void;
  layoutClass?: string
  layoutStyle?: {[key: string]: string};
  realData: T[];
  hiddenPagination?: boolean;
}

export function ListDataEditor<T>({
                    children,
                    visibleSizeSelection,
                    layoutClass,
                    layoutStyle,
                    realData,
                                    hiddenPagination = false
                  }: ListDataProps<T>) {

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const pageSizeSelectOptions = {
    pageSizeOptions: [10, 20, 30, 50, 100],
  }
  const [data, setData] = useState<T[]>([])

  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const pageData = data.slice(startIndex, endIndex);

  useEffect(() => {
    setData(realData)
  }, [realData]);

  return (
    <div className={layoutClass || ''} style={layoutStyle || undefined}>

      {children(pageData, page, pageSize)}

      {
        !hiddenPagination &&
        <footer className="flex justify-center lg:justify-end px-3 py-2">
          <PaginationList totalCount={data.length}
                          pageSize={pageSize}
                          page={page}
                          changePage={(p) => setPage(p)}
                          changePageSize={(limit) => setPageSize(limit)}
                          pageSizeSelectOptions={visibleSizeSelection ? pageSizeSelectOptions : undefined}
          />
        </footer>
      }
    </div>
  )
}
