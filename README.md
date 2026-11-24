# NammaPros Mobile Applications (`NMmobile`)

Central repository for NammaPros mobile applications:
- **Customer App** (`customer/`): On-demand home services booking app for customers across Chennai & Coimbatore.
- **Partner App** (`partner/`): Job dispatcher, earnings tracker, and fulfillment app for service professionals and technicians.

---

## 📁 Repository Structure

```
NMmobile/
├── customer/                 # NammaPros Customer Mobile Application
│   ├── assets/               # Branding, category icons, banner graphics
│   ├── src/
│   │   ├── components/       # Header, BottomNav, CategoryGrid, ServiceCard
│   │   ├── screens/          # Home, Services, Bookings, Account, Cart, OtpModal
│   │   ├── services/         # Firebase Authentication client
│   │   ├── state/            # AppContext (cart, auth state, active location)
│   │   ├── api.ts            # Production Cloud Run backend client + CSRF handshake
│   │   ├── assets.ts         # Asset resolver
│   │   ├── theme.ts          # Color palette, spacing, typography
│   │   └── types.ts          # Data contracts & models
│   ├── app.json              # Expo application manifest + Android package configuration
│   ├── google-services.json  # Firebase Android configuration
│   ├── package.json
│   └── README.md
│
├── partner/                  # NammaPros Partner / Technician Mobile Application
│   ├── assets/               # Splash, icons, alert sounds
│   ├── src/
│   │   ├── screens/          # Auth, Home, JobDetail, Join, Status
│   │   ├── alerts.ts         # Sound & notification triggers for new jobs
│   │   ├── api.ts            # Partner API client
│   │   ├── i18n.tsx          # Multi-language support (English, Tamil, Hindi, Kannada)
│   │   └── ui.tsx            # Partner UI system
│   ├── app.json              # Partner app configuration
│   ├── package.json
│   └── README.md
│
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npx expo`)
- Expo Go app on iOS/Android or an Android Emulator / iOS Simulator

### 2. Running Customer App
```bash
cd customer
npm install
npx expo start
```
- Press `a` to run on Android.
- Press `i` to run on iOS simulator.
- Scan the QR code using the Expo Go mobile app.

### 3. Running Partner App
```bash
cd partner
npm install
npx expo start
```

---

## 🌐 Production Backend
Both mobile apps connect to the deployed Google Cloud Run production backend:
```
https://nammapros-api-production-177323361322.asia-southeast1.run.app
```

Environment variable in `.env`:
```env
EXPO_PUBLIC_API_BASE_URL=https://nammapros-api-production-177323361322.asia-southeast1.run.app
```

---

## 🔐 Firebase Phone Authentication (Customer App)

The customer app features Google Identity Toolkit Firebase Phone OTP authentication:
- Project ID: `nammapro-api`
- Android Package: `com.nammapros.customer`
- SHA-1 Fingerprint: `3F:1F:BA:9E:59:DF:FC:96:45:8B:2B:69:25:44:35:0F:4A:37:F9:D0`
- SHA-256 Fingerprint: `64:79:A7:16:94:77:54:04:72:EB:3A:3D:74:84:E9:3F:7E:54:8A:DB:08:D2:A7:93:BF:01:EE:B4:B4:07:12:B8`
- Firebase Token exchange endpoint: `POST /api/v1/auth/firebase/` (with automatic CSRF protection handshake).

---

## 📦 Building Standalone APK / AAB (EAS Build)

To build standalone Android APK/AAB or iOS IPA:
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```
