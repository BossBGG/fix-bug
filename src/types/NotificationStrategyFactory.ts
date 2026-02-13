import type { NotificationStrategy } from './NotificationStrategy'

export interface NotificationStrategyFactory {
  createStrategy(): NotificationStrategy
}
