'use client';

import {type ReactNode, useCallback, MouseEvent} from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {usePathname, useSearchParams} from 'next/navigation';
import {cn} from '@/lib/utils';

export interface PaginationWithLinksProps {
  pageSizeSelectOptions?: {
    pageSizeSearchParam?: string;
    pageSizeOptions: number[];
  };
  totalCount: number;
  pageSize: number;
  page: number;
  pageSearchParam?: string;
  changePage: (page: number) => void;
  changePageSize?: (page: number) => void;
}

export function PaginationList({
                                      pageSizeSelectOptions,
                                      pageSize,
                                      totalCount,
                                      page,
                                      changePage,
                                      changePageSize
                                    }: PaginationWithLinksProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPageCount = Math.ceil(totalCount / pageSize);

  const handleChangePageSize = useCallback(
    (newPageSize: number) => {
      if(changePageSize) {
        changePageSize(newPageSize)
      }
    },
    [searchParams, pathname, changePageSize]
  );

  const handleChangePage = (event: MouseEvent<HTMLAnchorElement>, currentPage: number) => {
    event.preventDefault();
    changePage(currentPage);
  }

  const renderPageNumbers = () => {
    const items: ReactNode[] = [];
    const maxVisiblePages = 5;
    console.log('page >>>> ', page);

    if (totalPageCount < maxVisiblePages) {
      for (let i = 0; i < totalPageCount; i++) {
        items.push(
          <PaginationItem key={i} className="hover:bg-[#9538EA] hover:rounded-[5]">
            <PaginationLink href="#"
                            isActive={page === i}
                            onClick={(e) => handleChangePage(e, i)}
                            className={cn('hover:bg-[#9538EA] hover:text-white hover:rounded-[5]',
                              page === i ? 'bg-[#9538EA] rounded-[5] text-white' : '')}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1} className="hover:bg-[#9538EA] hover:rounded-[5]">
          <PaginationLink href="#"
                          isActive={page === 0}
                          onClick={(e) => handleChangePage(e, 0)}
                          className={cn('hover:bg-[#9538EA] hover:text-white hover:rounded-[5]',
                            page === 0 ? 'bg-[#9538EA] rounded-[5] text-white' : '')}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (page > 3) {
        items.push(
          <PaginationItem key='ellipsis-start'>
            <PaginationEllipsis/>
          </PaginationItem>
        );
      }

      const start = (Math.max(2, page - 1)) - 1;
      const end = Math.min(totalPageCount - 1, page + 1);

      for (let i = start; i < end; i++) {
        items.push(
          <PaginationItem key={i + 1} className="hover:bg-[#9538EA] hover:rounded-[5]">
            <PaginationLink href="#"
                            isActive={page === i}
                            onClick={(e) => handleChangePage(e, i)}
                            className={cn('hover:bg-[#9538EA] hover:text-white hover:rounded-[5]',
                              page === i ? 'bg-[#9538EA] rounded-[5] text-white' : '')}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (page < totalPageCount - 2) {
        items.push(
          <PaginationItem key='ellipsis-end'>
            <PaginationEllipsis/>
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPageCount} className="hover:bg-[#9538EA] hover:rounded-[5]">
          <PaginationLink
            href="#"
            isActive={page === totalPageCount - 1}
            onClick={(e) => handleChangePage(e, totalPageCount - 1)}
            className={cn('hover:bg-[#9538EA] hover:text-white hover:rounded-[5]',
              page === totalPageCount - 1 ? 'bg-[#9538EA] rounded-[5] text-white' : '')}
          >
            {totalPageCount}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className='flex flex-wrap md:flex-nowrap items-center justify-between gap-3 w-full'>
      {pageSizeSelectOptions && (
        <div className={cn('flex flex-col gap-4 flex-1', totalCount === 0 && 'hidden')}>
          <SelectRowsPerPage
            options={pageSizeSelectOptions.pageSizeOptions}
            setPageSize={handleChangePageSize}
            pageSize={pageSize}
          />
        </div>
      )}
      <Pagination className={cn({'md:justify-end': pageSizeSelectOptions})}>
        <PaginationContent className='max-sm:gap-0'>
          <PaginationItem
            className={cn(totalCount === 0 ? 'hidden' : page > 0 ? 'hover:bg-[#9538EA] hover:rounded-[5] hover:text-[white]' : undefined)}>
            <PaginationPrevious
              href="#"
              onClick={(e) => handleChangePage(e, Math.max(page - 1, 0))}
              aria-disabled={page === 0}
              tabIndex={page === 0 ? -1 : undefined}
              className={
                page === 0 ? 'pointer-events-none opacity-50' : 'hover:bg-[#9538EA] hover:rounded-[5] hover:text-[white]'
              }
            />
          </PaginationItem>
          {renderPageNumbers()}
          <PaginationItem
            className={totalCount === 0 ? 'hidden' : 'hover:bg-[#9538EA] hover:rounded-[5] hover:text-[white]'}>
            <PaginationNext
              href="#"
              onClick={(e) => handleChangePage(e, Math.min(page + 1, totalPageCount))}
              aria-disabled={page === totalPageCount - 1}
              tabIndex={page === totalPageCount - 1 ? -1 : undefined}
              className={
                cn('hover:bg-[#9538EA] hover:rounded-[5] hover:text-[white]',
                  page === totalPageCount - 1 && 'pointer-events-none opacity-50'
                )
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function SelectRowsPerPage({
                             options,
                             setPageSize,
                             pageSize,
                           }: {
  options: number[];
  setPageSize: (newSize: number) => void;
  pageSize: number;
}) {
  return (
    <div className='flex items-center gap-4'>
      {/*<span className='whitespace-nowrap text-sm'>Rows per page</span>*/}

      <Select
        value={String(pageSize)}
        onValueChange={(value) => setPageSize(Number(value))}
      >
        <SelectTrigger>
          <SelectValue placeholder='Select page size'>
            {String(pageSize)} / หน้า
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
