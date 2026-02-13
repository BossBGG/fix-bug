export interface NotificationPayload {
  title: string
  body: string
  data?: Record<string, any>
}

export interface NotificationStrategy {
  initialize(): Promise<void>
  subscribe(onMessageCallback: (payload: any) => void): Promise<string | null>
  unsubscribe(): Promise<void>
  onMessage(callback: (payload: NotificationPayload) => void): void
  isSupported(): boolean
  getType(): string
}
