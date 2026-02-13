'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { NotificationSortField, SortOrder } from '@/types/notification'

interface SortControlsProps {
  sortBy: NotificationSortField
  sortOrder: SortOrder
  onSortChange: (sortBy: NotificationSortField, sortOrder: SortOrder) => void
}

export function SortControls({
  sortBy,
  sortOrder,
  onSortChange,
}: SortControlsProps) {
  return (
    <div className="flex gap-4 items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">เรียงตาม:</label>
        <Select
          value={sortBy}
          onValueChange={(value) =>
            onSortChange(value as NotificationSortField, sortOrder)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sentAt">วันที่</SelectItem>
            <SelectItem value="notificationType">ประเภท</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">ลำดับ:</label>
        <Select
          value={sortOrder}
          onValueChange={(value) =>
            onSortChange(sortBy, value as SortOrder)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">ล่าสุดก่อน</SelectItem>
            <SelectItem value="asc">เก่าสุดก่อน</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
