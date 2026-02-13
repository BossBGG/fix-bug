'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Smartphone, Monitor, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'
import type { Device } from '@/types/notification'
import {MOBILE_SCREEN, TABLET_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface DeviceLimitDialogProps {
  isOpen: boolean
  devices: Device[]
  onRemove: (deviceId: string) => void
  onCancel: () => void
}

export function DeviceLimitDialog({ isOpen, devices, onRemove, onCancel }: DeviceLimitDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ถึงขีดจำกัดอุปกรณ์</DialogTitle>
          <DialogDescription>
            คุณสามารถเชื่อมต่อได้สูงสุด 5 อุปกรณ์ กรุณาลบอุปกรณ์ที่ไม่ใช้งานเพื่อเพิ่มอุปกรณ์ใหม่
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {device.deviceType === MOBILE_SCREEN || device.deviceType === TABLET_SCREEN ? (
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{device.deviceName}</p>
                  <p className="text-sm text-muted-foreground">
                    ใช้งานล่าสุด: {formatDistanceToNow(new Date(device.subscribedAt), {
                      addSuffix: true,
                      locale: th
                    })}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemove(device.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ลบ
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
