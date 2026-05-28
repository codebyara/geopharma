# 🌍 GEO-PHARMA Interactive Website - Fitur Baru

## ✨ Fitur yang Telah Diimplementasikan

Website GeoPharma sekarang memiliki **4 dashboard interaktif** untuk manajemen bencana dengan data dummy yang siap digunakan.

### 1. 🏥 Smart Relief Allocation (Alokasi Relief Cerdas)
**Path:** `/smart-relief`

Fitur untuk mengelola distribusi supplies medis dan kebutuhan darurat.

**Komponen:**
- **Metrics Cards**: Total Supplies (12,930), Critical Items (2), Active Deliveries (8)
- **Supply Distribution Chart**: Visualisasi distribusi supplies (Medicine, Equipment, Food, Water, Tents)
- **Inventory Status Table**: 
  - Item name & stock levels
  - Demand tracking
  - Status indicators (Low/Safe/Charge)
  - Action buttons (Restock/Monitor)
- **Request Supplies Button**: Action untuk request supplies baru

---

### 2. 💧 Water & Sanitation (Air & Sanitasi)
**Path:** `/water-sanitation`

Monitoring real-time untuk infrastruktur air dan sanitasi di area bencana.

**Komponen:**
- **Layer Control Panel**: Toggle visibility untuk:
  - 🔺 Disaster Zone
  - 📍 Area Priority
  - ⚠️ Disease Spread
  - ✚ Health Facility
  - 💧 Water & Sanitation
  - 📋 Low Report
- **System Status**: Menampilkan 9 active zones, 7 high priority, dll
- **Water Quality Info**: pH Level, Turbidity, Bacteria detection
- **Interactive Map**: Visualisasi status zone dengan color coding
- **Disaster Zone Details**: 
  - Zone name & severity
  - Operational status
  - Capacity information
  - Last inspection date
- **Warning Alert**: Notifikasi penting tentang kontaminasi air

---

### 3. ⚠️ Early Warning Outbreak System (Sistem Peringatan Dini)
**Path:** `/early-warning`

Sistem monitoring penyakit menular dengan prediksi spread pattern.

**Komponen:**
- **Disease Spread Timeline Chart**: Area chart 6 minggu tracking:
  - 🔴 Dengue Fever
  - 🟠 Leptospirosis
  - 🔵 Diarrhea/Gastroenteritis
  - 🟡 Respiratory Infection
- **Case Count Cards**: KPI individual untuk setiap penyakit
  - Current cases count
  - Trend indicators (↑ up / ↓ down)
  - Color-coded status
- **Case Distribution Chart**: Stacked area chart untuk multiple diseases over time
- **Trend Analysis**: -3% to +4% percentage changes

---

### 4. 🚁 Drone Tracking System (Sistem Tracking Drone)
**Path:** `/drone-tracking`

Real-time monitoring untuk drone pengiriman supplies medis.

**Komponen:**
- **Fleet Metrics**:
  - Active Drones: 3
  - Total Fleet: 5
  - In Maintenance: 1
  - Missions Done: 24
- **Live Drone Feed**:
  - Video stream placeholder
  - Real-time overlay stats (REC, BAT%, GPS, ALT, ZOOM, SIG, Speed)
  - Timestamp & signal strength
- **Drone Info Panel**:
  - Battery status bar (87%)
  - Altitude meter
  - Destination info
  - Cargo details
  - ETA countdown
  - Distance & speed stats
- **All Drones Status Table**:
  - Drone name & ID
  - Status badge (Active/Charging/Idle/Maintenance)
  - Battery percentage dengan color gradient
  - Destination & cargo
  - ETA info
  - 5 drone units di list

---

## 🗺️ Navigasi

### Desktop Navigation Bar
Klik salah satu link di navbar:
- **Smart Relief** → Dashboard alokasi supplies
- **Water & Sanitation** → Monitor air & sanitasi
- **Early Warning** → Tracking penyakit menular
- **Drone Tracking** → Real-time drone fleet
- **Dashboard** → Dashboard utama (existing)

### Mobile Navigation
Tap hamburger menu (☰) untuk akses semua fitur di mobile view.

---

## 📊 Data Dummy yang Tersedia

Semua data dummy tersimpan di `src/assets/dummyData.js`:

```javascript
// Smart Relief Data
- Total supplies: 12,930 units
- 6 inventory items dengan status tracking
- 5 supply categories

// Water & Sanitation Data
- 9 active disaster zones
- Water quality parameters (pH, Turbidity, Bacteria)
- System status metrics

// Early Warning Data
- 6 minggu disease spread timeline
- 4 jenis penyakit utama
- Case count distribution

// Drone Tracking Data
- 5 drone fleet units
- Real-time position data
- Battery & cargo information
```

---

## 🚀 Cara Menjalankan

### 1. Install Dependencies
```bash
cd d:\kulyeah\lomba\geopharma\my-project
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Akses Website
Buka browser ke: `http://localhost:5173` (atau port yang ditunjukkan)

### 4. Navigasi ke Fitur
- Smart Relief: `http://localhost:5173/smart-relief`
- Water & Sanitation: `http://localhost:5173/water-sanitation`
- Early Warning: `http://localhost:5173/early-warning`
- Drone Tracking: `http://localhost:5173/drone-tracking`

---

## 📁 File Structure

```
src/
├── assets/
│   └── dummyData.js              # Dummy database untuk semua fitur
├── SmartReliefAllocation.vue      # Dashboard alokasi relief
├── WaterSanitation.vue           # Dashboard air & sanitasi
├── EarlyWarningSystem.vue        # Dashboard peringatan dini
├── DroneTracking.vue             # Dashboard tracking drone
├── Header.vue                    # (Updated) Navbar dengan links baru
├── router.js                     # (Updated) Routes untuk 4 fitur baru
├── Landing.vue                   # (Existing) Landing page
├── Dashboard.vue                 # (Existing) Main dashboard
└── Report.vue                    # (Existing) Report page
```

---

## 🎨 Design Features

✅ **Responsive Design**: Semua halaman mobile-friendly
✅ **Color-Coded Status**: Indikator visual untuk status items
✅ **Interactive Charts**: Custom canvas-based charts
✅ **Data Tables**: Searchable & sortable tables
✅ **Real-time Visualization**: Maps & tracking feeds
✅ **Alert Notifications**: Warning & status alerts
✅ **Progress Indicators**: Battery & stock level bars

---

## 💡 Contoh Data Interaktif

### Smart Relief - Inventory Status
| Item | In Stock | Demand | Status | Action |
|------|----------|--------|--------|--------|
| Antibiotics | 450 units | 380 units | Low | Restock |
| First Aid Kit | 890 units | 650 units | Safe | Monitor |
| Bandages | 1200 units | 980 units | Safe | Monitor |

### Drone Tracking - Fleet Status
| Drone | Status | Battery | Destination | ETA |
|-------|--------|---------|-------------|-----|
| DRONE-001 | Active | 87% | Jakarta Raya | 15 min |
| DRONE-002 | Charging | 45% | Bandung Utara | 30 min |
| DRONE-003 | Idle | 92% | Base Station | 5 min |

---

## 🔧 Customization

Untuk mengubah data dummy, edit file `src/assets/dummyData.js`:

```javascript
// Contoh: Menambah drone baru
export const droneTrackingData = {
  fleetStatus: [
    {
      id: 'DRONE-006',
      name: 'Medical Drone Zeta',
      status: 'Active',
      battery: 95,
      destination: 'Surabaya',
      cargo: 'Vaccines',
      eta: '20 min'
    }
    // ... lebih banyak drones
  ]
}
```

---

## 📈 Next Steps (Opsional)

1. **Integrasi Real Database**: Hubungkan ke backend API
2. **Real-time Updates**: Implementasi WebSocket untuk live data
3. **Map Integration**: Gunakan Leaflet untuk peta interaktif
4. **Advanced Charts**: Integrasikan Chart.js library
5. **User Authentication**: Tambah login & role-based access
6. **Export Data**: Fitur download reports (CSV/PDF)

---

## ✅ Testing Checklist

- [x] Navbar menampilkan 4 links fitur baru
- [x] Setiap fitur punya halaman dedicated dengan URL unik
- [x] Data dummy terintegrasi dengan benar
- [x] Charts & tables menampilkan data
- [x] Mobile responsive untuk semua halaman
- [x] Navigation antar halaman berfungsi
- [x] Status indicators & badges tampil dengan benar
- [x] All components render without errors

---

**Website siap untuk digunakan! 🎉**
Semua 4 dashboard interaktif sudah tersedia dengan data dummy lengkap.
