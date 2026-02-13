import React from "react";
import Link from "next/link";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {cn} from "@/lib/utils";

interface BreadcrumbItemsProps {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItemsProps[],
  title: string;
  goBackUrl?: string;
}
const Breadcrumb: React.FC<BreadcrumbProps> = ({items, title, goBackUrl}: BreadcrumbProps) => {
  return (
    <div>
      {items.map((item, index) => {
        return <span key={`${item.label}_${index}`}>
          <Link id={`${item.label}_${index}`} href={item.href}>{item.label}</Link>
          <span className={index === items.length - 1 ? 'hidden' : 'mx-1'}>/</span>
        </span>
      })}
      <div className="flex items-center mt-2 w-full">
        {
          goBackUrl &&
          <Link href={goBackUrl} className="cursor-pointer bg-[#671FAB] text-white rounded-full flex items-center justify-center px-4 py-3">
            <FontAwesomeIcon icon={faChevronLeft} />
          </Link>
        }
        <div className={cn('font-bold text-[24px]', goBackUrl && 'mx-2')}>{title}</div>
      </div>
    </div>
  )
}

export default Breadcrumb;
