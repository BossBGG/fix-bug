'use client'

export default function OfflinePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        maxWidth: '400px',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
          ไม่มีการเชื่อมต่ออินเทอร์เน็ต
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          ลองอีกครั้ง
        </button>
      </div>
    </div>
  )
}
