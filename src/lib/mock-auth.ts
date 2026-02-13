/**
 * Mock Authentication for Development/Testing
 * ใช้สำหรับทดสอบโดยไม่ต้อง login
 *
 * วิธีใช้:
 * 1. Login ที่ dev server (https://wom-y3-dev.pea.co.th)
 * 2. เปิด DevTools Console
 * 3. รัน: localStorage.getItem('token') และ localStorage.getItem('user')
 * 4. Copy ค่ามาใส่ใน MOCK_TOKEN และ MOCK_USER ด้านล่าง
 */

// ✅ Token จริงจาก dev server
export const MOCK_TOKEN = process.env.NEXT_PUBLIC_MOCK_AUTH_TOKEN || "";

// ✅ User object จริงจาก dev server
export const MOCK_USER = {
  uuid: '4525ecbc-bb9e-4ae0-8620-c7290e715da5',
  username: '510706',
  firstName: 'พิชามญชุ์',
  lastName: 'บุนนาค',
  type: 'WOM_USER',
  phoneNumber: null,
  email: 'pichamon.bun@pea.co.th',
  businessArea: 'Z000',
  position: 'นวธ.5',
  department: 'กองออกแบบและพัฒนาระบบดิจิทัล 2',
  profileImageUrl: 'https://minio-api-kolpos.pea.co.th/wom-y3/profile-images/55f3bff4-a027-43ba-86a3-3fe6fcc64a7e.jpeg',
  signatureType: 'signature',
  signatureImageUrl: 'https://minio-api-kolpos.pea.co.th/wom-y3/announcements/png-clipart-signature-graphy-signature-miscellaneous-angle_1762872931_YEKK.png',
  peaOffice: 'Z000',
  selectedPeaOffice: 'Z000',
  selectedPeaCode: 'Z00000',
  prefix: 'นางสาว'
}

/**
 * Enable mock auth in development
 * เปิดใช้งาน mock auth ใน development
 */
export const enableMockAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_auth_enabled', 'true')
    localStorage.setItem('user', JSON.stringify(MOCK_USER))
    localStorage.setItem('token', MOCK_TOKEN)
    console.log('✅ Mock auth enabled. Reload page to apply.')
    console.log('Token:', MOCK_TOKEN.substring(0, 50) + '...')
    console.log('User:', MOCK_USER)
  }
}

/**
 * Disable mock auth
 * ปิดใช้งาน mock auth
 */
export const disableMockAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mock_auth_enabled')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    console.log('❌ Mock auth disabled. Reload page to apply.')
  }
}

/**
 * Check if mock auth is enabled
 * ตรวจสอบว่าเปิดใช้งาน mock auth หรือไม่
 */
export const isMockAuthEnabled = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mock_auth_enabled') === 'true'
  }
  return false
}

/**
 * Set mock auth with real data from dev server
 * ตั้งค่า mock auth ด้วยข้อมูลจริงจาก dev server
 *
 * วิธีใช้:
 * 1. Login ที่ https://wom-y3-dev.pea.co.th
 * 2. เปิด Console รัน:
 *    setMockAuthFromDevServer(
 *      localStorage.getItem('token'),
 *      JSON.parse(localStorage.getItem('user'))
 *    )
 */
export const setMockAuthFromDevServer = (token: string, user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_auth_enabled', 'true')
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    console.log('✅ Mock auth set with real data from dev server')
    console.log('Token:', typeof token === 'string' ? token.substring(0, 50) + '...' : token)
    console.log('User:', user)
    console.log('🔄 Reload page to apply')
  }
}
