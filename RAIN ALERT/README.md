# Sone River Flood Alert (सोन नदी बाढ़ चेतावनी प्रणाली)

A production-quality, mobile-first web application designed to protect residents, commuters, and emergency personnel living or traveling near the **Sone (Son) River basin** across Madhya Pradesh, Uttar Pradesh, and Bihar.

The interface and information hierarchy are directly modeled after the **Google Flood Alert / Google Flood Hub** design, featuring dark-mode emergency cards, hydrological past/forecast hydrographs, high-contrast risk badges, interactive Leaflet GIS mapping, orthogonal river proximity calculations, and browser push notifications.

---

## 🌟 Key Features

### 1. Google Flood Alert-Inspired UI
- Recreates the exact visual experience of Google Flood Alerts:
  - `[Flood alert]` status badge with flood iconography
  - Dynamic river condition headline: *"River level is above Danger"*, *"River level is near Warning"*, *"Normal"*
  - Official attribution: *"From CWC, Open-Meteo and others · Learn more · Last updated 1 min ago"*
  - "Share" pill with Web Share API and one-click clipboard copying

### 2. Google Flood Hub Water Level Chart
- Smooth SVG Bézier hydrograph with:
  - **Danger threshold line** (with pink marker dot and numerical datum)
  - **Warning threshold line** (with amber marker dot and numerical datum)
  - **Past river levels** (solid blue area curve with subtle gradient fill)
  - **Forecast river levels** (dashed blue curve for projected 24–48 hours)
  - Floating badge: `Now — Above danger level`
  - Info chip: `ⓘ Highest river level recently: 326.15 m (31/08 04:00 AM)`
  - Direct safety advisory: *"Continue to use caution if going near the riverfront."*
  - Expandable *"See more in Flood Hub"* button

### 3. Comprehensive GIS & Sone River Geometry
- **Continuous Sone River Polyline (~784 km)**: Follows the true river path from Amarkantak (origin in MP) through Bansagar Dam, Sihawal, Chopan (UP), Indrapuri Barrage (Bihar), Dehri-on-Sone, Daudnagar, Arwal, Koelwar, and the Ganga confluence near Maner/Patna.
- **Orthogonal Point-to-Segment Calculation**: Calculates exact minimum perpendicular distance from user to river line segments (not just a single static coordinate).
- **Proximity Safety Tiers**:
  - `> 10 km`: Safe distance advisory
  - `<= 10 km`: ⚠️ Near river basin awareness
  - `<= 5 km`: ⚠️ Very close caution
  - `<= 2 km`: 🚨 Flood danger zone (riverfront floodplains)

### 4. Interactive Leaflet GIS Map
- High-contrast CartoDB Dark Matter tiles
- Glowing neon cyan polyline representing the Sone River course
- Pulsing user location radar pin with accuracy circle
- Color-coded monitoring stations (🔴 Above Danger, 🟡 Above Warning, 🟢 Normal)
- Historical inundation and discharge buffer zones (Rewa, Chopan, Indrapuri/Dehri, Koelwar/Maner)
- Quick controls: *Fit River*, *Center on Me*, *Toggle Stations*, *Toggle Flood Zones*

### 5. Multi-Tier Risk Calculation Engine (`alertEngine.ts`)
Strict adherence to official hydrological standards across 5 risk levels:
- 🟢 **SAFE**: User far from river and water level in normal range
- 🟡 **WARNING**: User near river OR water approaching warning mark
- 🟠 **HIGH RISK**: User very close to river AND water above warning, or rising >0.15 m/hr
- 🔴 **DANGER**: Water level above official Danger mark OR riverfront zone with active flood
- 🟣 **CRITICAL / EXTREME**: Water level breaches all-time High Flood Level (HFL) or official emergency evacuation order active

### 6. Data Provider Architecture & Transparency
- **`IRiverDataProvider` Interface**:
  - `OpenFloodProvider`: Queries real-time Open-Meteo Global Flood API for river discharge and stage calculations.
  - `FallbackProvider`: Official Central Water Commission (CWC) last-known verified bulletin readings.
  - `DemoProvider`: Developer simulator for testing all 5 risk scenarios and locations.
- **Data Transparency Badges**: Clearly displays `LIVE DATA`, `DELAYED DATA`, `LAST KNOWN DATA`, or `DEMO MODE`. **Simulated data is never disguised as live data.**
- "About this data" modal explaining CWC gauge datums (Mean Sea Level elevation), warning levels, danger levels, and public safety disclaimers.

### 7. Emergency Safety Panel & Helplines
- Direct action guidelines: *"Move away from riverfront"*, *"Never drive through flooded roads"*, *"Follow DDMA orders"*
- Instant phone dialers for official Indian emergency agencies:
  - **NDRF Toll-Free**: `1078`
  - **State Disaster Management Authority (SDMA)**: `1070`
  - **National Emergency Response**: `112`
  - **Ambulance**: `108`
- Directory of designated high-ground flood shelters, civil hospitals, and relief camps along Rewa, Dehri, Chopan, and Bhojpur.

### 8. Browser Push Notifications & Throttling
- Browser `Notification` API with user toggle
- Debounced and throttled: Immediate notification on risk escalation (e.g. Warning -> Danger), with a 30-minute cooldown on steady high-risk states to prevent notification spam.

### 9. PWA Ready & Offline Resilience
- `manifest.json` and service worker (`sw.js`)
- Automatic offline detection with amber banner: *"Offline — displaying last available river data from local storage."*

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### Installation
```bash
# 1. Clone or navigate to the directory
cd "RAIN ALERT"

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### Running the Test Suite
Run the automated Vitest test suite covering geospatial math, risk thresholds, and notification debouncing:
```bash
npm test
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 🔧 Developer Demo Mode

To test all flood conditions and locations without waiting for monsoon weather events:
1. Click the **Demo** button in the top navigation bar.
2. Select any risk tier:
   - `🟢 Safe`
   - `🟡 Warning`
   - `🟠 High Risk`
   - `🔴 Danger` (matches the provided screenshot with Rewa Division gauge above danger)
   - `🟣 Extreme / HFL`
3. Click location simulation buttons:
   - `Rewa (2.8km)`: Recreates screenshot position
   - `Dehri (1.2km)`: Immediate riverfront barrage zone
   - `Patna (32km)`: Distant metropolitan safe zone
4. Notice that whenever Demo Mode is active, a persistent purple banner appears and all cards display `DEMO MODE`, ensuring complete data transparency.

---

## 📡 Official Monitored CWC Gauges

| Station Name | Division / State | Warning Level | Danger Level | Record HFL | CWC Code |
|---|---|---|---|---|---|
| **Rewa Division** | Rewa, MP | 323.50 m | 325.00 m | 327.40 m | `CWC-SON-REW` |
| **Dehri-on-Sone** | Rohtas, Bihar | 103.00 m | 104.50 m | 105.82 m | `CWC-SON-DHR` |
| **Indrapuri Barrage** | Rohtas, Bihar | 107.50 m | 109.00 m | 110.45 m | `CWC-SON-IND` |
| **Koelwar Bridge** | Bhojpur, Bihar | 52.50 m | 53.30 m | 55.45 m | `CWC-SON-KLW` |
| **Chopan** | Sonbhadra, UP | 165.50 m | 167.00 m | 169.50 m | `CWC-SON-CPN` |
| **Bansagar Dam** | Shahdol, MP | 340.50 m | 341.64 m | 342.90 m | `CWC-SON-BSG` |
| **Daudnagar** | Aurangabad, Bihar | 75.20 m | 76.50 m | 78.10 m | `CWC-SON-DNR` |
| **Maner Confluence** | Patna, Bihar | 51.00 m | 52.00 m | 53.85 m | `CWC-SON-MNR` |

---

## 🔐 Privacy Guarantee
User coordinates are processed strictly **on-device** using client-side JavaScript. No exact GPS coordinates are stored in server logs or shared with third parties.
