# Service Worker & Manifest Fix - Deployment Guide

## ปัญหาที่แก้ไข
1. ✅ `firebase-messaging-sw.js` 404 Error
2. ✅ `manifest.json` 404 Error  
3. ✅ Firebase config missing projectId
4. ✅ Manifest ถูกเรียกซ้ำหลายครั้ง

## ไฟล์ที่แก้ไข

### 1. Dockerfile
- ใช้ standalone output
- Copy static files อย่างถูกต้อง
- เปลี่ยน CMD เป็น `node server.js`

### 2. public/firebase-messaging-sw.js
- เพิ่มการอ่าน config จาก env-config.js
- Fallback ไปใช้ hardcoded config

### 3. scripts/generate-env.js
- เพิ่ม `self.__ENV__` สำหรับ service worker

### 4. package.json
- เพิ่ม `generate-env.js` ใน build script

### 5. next.config.ts
- เพิ่ม headers สำหรับ Service Worker

### 6. src/app/layout.tsx
- เพิ่ม metadata สำหรับ PWA
- ลบ duplicate tags

### 7. .dockerignore (ใหม่)
- ป้องกัน copy ไฟล์ที่ไม่จำเป็น

## วิธี Deploy

```bash
# 1. Build
npm run build

# 2. Build Docker image
docker build -t wom-fe:latest .

# 3. Run (local test)
docker run -p 3000:3000 wom-fe:latest

# 4. ตรวจสอบไฟล์ accessible
curl https://wom-y3-dev.pea.co.th/manifest.json
curl https://wom-y3-dev.pea.co.th/firebase-messaging-sw.js
curl https://wom-y3-dev.pea.co.th/env-config.js
```

## ตรวจสอบหลัง Deploy

### 1. เปิด Browser Console
ไม่ควรเห็น error:
- ❌ `404 firebase-messaging-sw.js`
- ❌ `404 manifest.json`
- ❌ `Missing projectId`

### 2. ตรวจสอบ Service Worker
```javascript
// ใน Console
navigator.serviceWorker.getRegistrations().then(regs => console.log(regs))
```

### 3. ตรวจสอบ Firebase
```javascript
// ใน Console
console.log(firebase.apps[0].options)
```

## CI/CD Integration

### ✅ ทำงานกับ GitLab CI/CD อัตโนมัติ

เมื่อ commit code เข้า `main` branch:
1. CI/CD จะรัน `npm run build` (รวม `generate-env.js` อัตโนมัติ)
2. Build Docker image ด้วย Dockerfile ที่แก้ไขแล้ว
3. Deploy ไปยัง environment ตามที่กำหนด

**ไม่ต้องแก้ `.gitlab-ci.yml`** - ใช้งานได้เลย!

### ⚠️ ต้องตรวจสอบ CI/CD Variables

ใน GitLab Project → Settings → CI/CD → Variables ต้องมี:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_APP_BASE_URL (มีอยู่แล้ว)
```

### 📝 ขั้นตอน Deploy

```bash
# 1. Commit & Push
git add .
git commit -m "fix: service worker and manifest 404 errors"
git push origin main

# 2. CI/CD จะทำงานอัตโนมัติ:
# - build-base (ถ้าจำเป็น)
# - build (รัน npm run build + Docker build)
# - sqa (security scan)
# - artifact (save image)
# - update-deployment-dev (deploy to dev)

# 3. ตรวจสอบ Pipeline
# GitLab → CI/CD → Pipelines
```

## PWA Features / ฟีเจอร์ PWA

### ✅ มีอยู่แล้วในระบบ:

1. **Offline Mode** 🌐
   - มีหน้า `/offline` สำหรับแสดงเมื่อไม่มีอินเทอร์เน็ต
   - Service Worker cache static assets อัตโนมัติ
   - ใช้งานได้แม้ไม่มีเน็ต (บางส่วน)

2. **Install as App** 📱
   - มี `manifest.json` สำหรับติดตั้งเป็น app
   - รองรับ iOS และ Android
   - มี icons ครบทุกขนาด (192x192, 512x512)

3. **Push Notifications** 🔔
   - Firebase Cloud Messaging (FCM)
   - รับ notification แม้ปิดแอป
   - Background message handling

4. **Caching Strategy** 💾
   - **NetworkFirst**: API calls, pages
   - **CacheFirst**: Static JS, fonts, audio, video
   - **StaleWhileRevalidate**: Images, CSS, data
   - Auto cleanup outdated caches

### ทดสอบ PWA:

```javascript
// 1. ตรวจสอบ Service Worker
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log('SW registered:', regs.length))

// 2. ตรวจสอบ Cache
caches.keys().then(keys => console.log('Caches:', keys))

// 3. ทดสอบ Offline
// - เปิด DevTools → Network → Offline
// - Reload page → ควรเห็นหน้า offline
```

### Install PWA:

**Desktop:**
- Chrome: ดูที่ address bar → คลิก "Install" icon
- Edge: เหมือน Chrome

**Mobile:**
- iOS Safari: Share → Add to Home Screen
- Android Chrome: Menu → Add to Home Screen

## หมายเหตุ

### ปัญหาที่ไม่เกี่ยวกับ manifest:
- `pictureapi.pea.co.th timeout` - ปัญหา network/CORS ของ API ภายนอก (ไม่ได้แก้ในครั้งนี้)
