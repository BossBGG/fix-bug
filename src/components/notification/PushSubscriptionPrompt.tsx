'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Bell, Smartphone } from 'lucide-react'

interface PushSubscriptionPromptProps {
  isOpen: boolean
  onEnable: () => void
  onDismiss: () => void
}

export function PushSubscriptionPrompt({ isOpen, onEnable, onDismiss }: PushSubscriptionPromptProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onDismiss}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เปิดใช้งานการแจ้งเตือน</DialogTitle>
          <DialogDescription>
            รับการแจ้งเตือนแบบ real-time เมื่อมีการอัพเดทใบสั่งงาน
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="font-medium">แจ้งเตือนทันที</p>
              <p className="text-sm text-muted-foreground">
                ไม่พลาดการอัพเดทสำคัญของใบสั่งงาน
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="font-medium">รองรับหลายอุปกรณ์</p>
              <p className="text-sm text-muted-foreground">
                รับการแจ้งเตือนบนทุกอุปกรณ์ที่คุณใช้งาน
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>
            ภายหลัง
          </Button>
          <Button onClick={onEnable}>
            เปิดใช้งาน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
