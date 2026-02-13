import '@testing-library/jest-dom'

// Suppress console warnings/errors from infrastructure components
const originalError = console.error
const originalLog = console.log
const originalWarn = console.warn

beforeAll(() => {
  console.error = jest.fn((...args) => {
    const message = args[0]?.toString() || ''
    if (message.includes('inside a test was not wrapped in act')) return
    if (message.includes('Not implemented: window.scrollTo')) return
    if (message.includes('ReferenceError')) return
    if (message.includes('Cannot access')) return
    originalError.call(console, ...args)
  })
  
  console.log = jest.fn((...args) => {
    const message = args[0]?.toString() || ''
    if (message.includes('page >>>')) return
    originalLog.call(console, ...args)
  })
  
  console.warn = jest.fn((...args) => {
    const message = args[0]?.toString() || ''
    if (message.includes('watchman')) return
    originalWarn.call(console, ...args)
  })
})

afterAll(() => {
  console.error = originalError
  console.log = originalLog
  console.warn = originalWarn
})

// Mock window.scrollTo
global.scrollTo = jest.fn()