# NammaPros Customer Mobile App (React Native / Expo)

The official customer mobile app for **NammaPros**, built with React Native and Expo, styled with the exact premium brand aesthetics and design language of the NammaPros customer website.

## 🚀 Live Backend Integration

The mobile app connects directly to the live Google Cloud Run production backend:

- **Primary Cloud Run API**: `https://nammapros-api-production-177323361322.asia-southeast1.run.app`
- **Secondary Cloud Run API**: `https://nammapros-api-production-xlexcj72qa-as.a.run.app`

You can toggle between both backends, enter custom URLs, or test live latency directly inside the **Account > Live Cloud Run Backend** screen.

---

## 🎨 Design & Feature Highlights

1. **Brand Aesthetics Matching Customer Web Site**:
   - **Color Palette**: NammaPros Signature Burgundy (`#800020`), Deep Burgundy (`#5e0017`), Blush Rose Soft Tint (`#f5ebe8`), Ink Charcoal (`#1C1917`), Warm Canvas (`#FBF8F5`), and Gold Highlights (`#C8A35B`).
   - Clean, high-density typography with bold headers and soft rounded cards (`8px` / `12px` border radius).

2. **Core Navigation (4 Tabs)**:
   - 🏠 **Home**:
     - Split Hero with verified technician badge, upfront pricing pledge, and rating badge.
     - 3-Column Category Grid matching web: Deep Cleaning, Handyman, Appliance Services (taps to open appliance sheet), Water Tank Cleaning, Mosquito Net, Sofa Repair.
     - Horizontal Spotlight Promo Banners for seasonal campaigns.
     - Most Booked Services with direct cart steppers.
     - Real customer reviews from verified visits.
   - 🛠️ **Services**:
     - Instant search input bar across all service titles, descriptions, and categories.
     - Horizontal category filter pills (All, AC, Washing Machine, Refrigerator, TV, Geyser, Water Purifier, Tank Cleaning, etc.).
     - Live service availability counter and quick reset.
   - 📅 **Bookings**:
     - Upcoming & Past visits toggle.
     - Real-time status badges: `SCHEDULED`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
     - Scheduled slot date & time display.
     - Start OTP Code (share with technician upon arrival).
     - Assigned Technician profile card with photo, rating, completed jobs, and direct Call button.
     - Cancel visit and review actions.
   - 👤 **Account**:
     - Profile card with phone and verification status.
     - Live Cloud Run backend switcher with live ping test in milliseconds.
     - City & Zone switcher (Chennai, Bengaluru, Coimbatore, Madurai, Hyderabad).
     - Notification preference switches (WhatsApp & SMS).
     - Referral program: Share code `NAMP200` to earn ₹200 credits.
     - Customer support helpline and email shortcuts.

3. **Booking & Slot-First Checkout**:
   - Floating cart bar showing item count, total price, and "View Cart".
   - Slot Picker with day tabs (Today, Tomorrow, Day after) and time intervals (Morning 9-12, Afternoon 1-4, Evening 5-8).
   - Address picker and inline editor.
   - Coupon discount code validation (`WELCOME50`, `ACSUMMER`).
   - Bill breakdown (Item total, GST taxes, coupon discounts, net payable).
   - Pay on Visit (Cash / UPI / Card) or Online pre-payment choices.
   - Instant booking confirmation with reference code and direct transition to Bookings tracking tab.

---

## 💻 Running the App

### Prerequisites
- Node.js 18+ (tested on Node v22)
- npm 10+
- Expo CLI

### 1. Install Dependencies
```bash
cd mobile/nmpro-customer
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```

- Press **`w`** to open in web browser.
- Press **`a`** to open on connected Android device / emulator.
- Press **`i`** to open on iOS simulator.
- Scan the QR code with **Expo Go** on your physical iPhone or Android device!

### 3. Build Production Native Apps
```bash
# Android APK / AAB
npx eas build --platform android

# iOS IPA
npx eas build --platform ios
```
