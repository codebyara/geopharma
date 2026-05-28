<template>
  <div class="interactive-map-wrapper relative w-full h-full rounded-xl overflow-hidden border border-outline-variant">
    <div v-if="isLoading" class="absolute inset-0 z-[500] bg-on-surface/90 flex flex-col items-center justify-center gap-4">
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="font-label-caps text-[10px] text-surface-variant/70 tracking-widest">MEMPROSES DATA...</span>
    </div>

    <div ref="mapContainer" class="w-full h-full"></div>

    <div class="absolute top-4 right-4 z-[400] flex items-center gap-2 bg-on-surface/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-outline-variant">
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span>
      </span>
      <span class="font-label-caps text-[9px] text-surface-variant">LIVE · BMKG</span>
    </div>

    <div class="absolute top-14 right-4 z-[400]">
      <button @click="tarikDataKeSupabase" class="bg-[#1b5e20] hover:bg-[#0d4722] text-white font-bold text-[9px] px-3 py-2 rounded-lg shadow-lg transition-all flex items-center gap-2 border border-[#8bc34a]">
        🔄 SEDOT DATA PETA BENCANA
      </button>
    </div>

    <div class="absolute top-4 left-4 z-[400] flex gap-2">
      <div class="bg-on-surface/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-outline-variant">
        <span class="font-label-caps text-[9px] text-surface-variant">🔴 {{ quakeCount }} GEMPA</span>
      </div>
      <div class="bg-on-surface/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-outline-variant">
        <span class="font-label-caps text-[9px] text-surface-variant">📍 {{ sampleCount }} BENCANA LAIN</span>
      </div>
    </div>

    <div class="absolute bottom-4 left-4 z-[400] bg-on-surface/80 backdrop-blur-sm p-3 rounded-lg border border-outline-variant">
      <div class="font-label-caps text-[9px] text-surface-variant/70 mb-2">LEGENDA</div>
      <div v-for="type in disasterTypes" :key="type.key" class="flex items-center gap-2 mb-1">
        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: type.color }"></span>
        <span class="font-label-caps text-[9px] text-surface-variant">{{ type.label }}</span>
      </div>
      <div class="border-t border-outline-variant/40 mt-2 pt-2">
        <div class="font-label-caps text-[8px] text-surface-variant/50">Gempa: © BMKG</div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import { supabase } from './services/supabase.js'
import { getReports } from './services/petabencana.service.js' 

export default defineComponent({
  name: 'InteractiveMap',
  props: {
    activeLayers: { type: Object, default: () => ({}) }
  },
  emits: ['disaster-selected', 'stats-updated'],
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const isLoading = ref(true)
    const quakeCount = ref(0)
    const sampleCount = ref(0)
    let mapInstance = null
    let refreshInterval = null

    const layerGroups = {
      zonaBencana: null, prioritasWilayah: null,
      fasilitasKesehatan: null, airSanitasi: null, ruteDrone: null, laporanLapangan: null,
    }

    const disasterTypes = [
      { key: 'earthquake', label: 'GEMPA (realtime BMKG)', color: '#FF5722' },
      { key: 'tsunami',    label: 'POTENSI TSUNAMI',       color: '#F44336' },
      { key: 'flood',      label: 'BANJIR',                color: '#2196F3' },
      { key: 'fire',       label: 'KEBAKARAN',             color: '#FF9800' },
      { key: 'volcano',    label: 'GUNUNG BERAPI',         color: '#9C27B0' },
      { key: 'wind',       label: 'ANGIN KENCANG',         color: '#00BCD4' },
      { key: 'haze',       label: 'KABUT ASAP',            color: '#9E9E9E' },
    ]

    const typeColorMap = Object.fromEntries(disasterTypes.map(t => [t.key, t.color]))
    const getColor = (type) => typeColorMap[type] || '#607D8B'
    const typeIcon = (type) => ({ flood:'🌊', earthquake:'🔴', tsunami:'🌊', fire:'🔥', haze:'🌫️', wind:'💨', volcano:'🌋' }[type] || '⚠️')
    const typeToLayerKey = {
      earthquake: 'zonaBencana', tsunami: 'zonaBencana', flood: 'zonaBencana',
      fire: 'zonaBencana', volcano: 'zonaBencana', wind: 'zonaBencana', haze: 'zonaBencana',
    }

    watch(() => props.activeLayers, (newLayers) => {
      if (!mapInstance) return
      Object.entries(newLayers).forEach(([key, isActive]) => {
        const lg = layerGroups[key]
        if (!lg) return
        isActive && !mapInstance.hasLayer(lg) ? mapInstance.addLayer(lg) : 
        !isActive && mapInstance.hasLayer(lg) ? mapInstance.removeLayer(lg) : null
      })
    }, { deep: true })

    function loadInaRiskBanjir() {
        if (!mapInstance || !window.L.esri) return;
        layerGroups.prioritasWilayah.clearLayers();
        const inaRiskLayer = window.L.esri.dynamicMapLayer({
            url: 'https://gis.bnpb.go.id/server/rest/services/inarisk/layer_bahaya_banjir_bandang_30/MapServer',
            opacity: 0.8,
        });
        inaRiskLayer.addTo(layerGroups.prioritasWilayah);
    }

    function createMarkerIcon(type, magnitude) {
      const color = getColor(type)
      const size = (type === 'earthquake' || type === 'tsunami') ? (magnitude >= 6.0 ? 22 : magnitude >= 5.0 ? 16 : 12) : 13
      const pulse = type === 'tsunami' || (type === 'earthquake' && magnitude >= 5.0) || type !== 'earthquake'
      return window.L.divIcon({
        className: '',
        html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:${size+12}px;height:${size+12}px;">
            ${pulse ? `<span style="position:absolute;width:${size+8}px;height:${size+8}px;border-radius:50%;background:${color};opacity:0.35;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>` : ''}
            <span style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.85);display:flex;align-items:center;justify-content:center;">${type === 'tsunami' ? '<span style="font-size:7px;">🌊</span>' : ''}</span>
          </div>`,
        iconSize: [size+12, size+12], iconAnchor: [(size+12)/2, (size+12)/2],
      })
    }

    // Fungsi agar peta bisa "diterbangkan" dari luar (oleh dropdown sidebar)
    function arahkanPeta(lat, lng, zoomLevel = 12) {
      if (!mapInstance) return;
      
      // 1. Terbangkan peta ke lokasi tujuan
      mapInstance.flyTo([lat, lng], zoomLevel, {
        duration: 1.5 // Animasi terbang selama 1.5 detik
      });

      // 2. Tunggu sampai animasi terbang selesai, lalu buka titiknya otomatis!
      setTimeout(() => {
        let titikDitemukan = false;
        
        // Memindai semua titik (marker) yang ada di peta saat ini
        mapInstance.eachLayer((layer) => {
          // Pastikan yang dipindai adalah sebuah titik/marker yang punya koordinat
          if (layer instanceof window.L.Marker && layer.getLatLng) {
            const posisiTitik = layer.getLatLng();
            
            // Cek apakah koordinat titik ini sama dengan koordinat kota yang dipilih
            // (Kita beri toleransi selisih 0.05 derajat agar tetap terdeteksi meski lokasinya tidak persis di tengah kota)
            if (Math.abs(posisiTitik.lat - lat) < 0.05 && Math.abs(posisiTitik.lng - lng) < 0.05) {
              if (!titikDitemukan) {
                layer.openPopup();   // Otomatis membuka kotak popup (Seperti gambar 2)
                layer.fire('click'); // Memicu klik gaib agar Sidebar Kanan ikut ter-update!
                titikDitemukan = true;
              }
            }
          }
        });
      }, 1500); // 1500 milidetik = 1.5 detik (menunggu durasi flyTo selesai)
    }

    async function fetchBMKGGempa() {
      const urls = ['/bmkg/DataMKG/TEWS/autogempa.json', '/bmkg/DataMKG/TEWS/gempaterkini.json']
      const results = await Promise.allSettled(urls.map(u => fetch(u).then(r => r.json())))
      const markers = []
      if (results[0].status === 'fulfilled' && results[0].value?.Infogempa?.gempa) {
        const g = results[0].value.Infogempa.gempa
        markers.push({
          lat: parseFloat(g.Lintang.replace(' LS','').replace(' LU','')) * (g.Lintang.includes('LS') ? -1 : 1), 
          lng: parseFloat(g.Bujur), type: (g.Potensi||'').toLowerCase().includes('tsunami') ? 'tsunami' : 'earthquake',
          magnitude: parseFloat(g.Magnitude), wilayah: g.Wilayah, tanggal: g.Tanggal, jam: g.Jam
        })
      }
      return markers
    }

    function addGempaMarker(data) {
      if (!mapInstance || isNaN(data.lat) || isNaN(data.lng)) return
      const marker = window.L.marker([data.lat, data.lng], { icon: createMarkerIcon(data.type, data.magnitude) })
      marker.bindPopup(`<div style="font-family:monospace;min-width:210px;padding:4px;"><div style="font-size:9px;font-weight:700;color:${getColor(data.type)};margin-bottom:6px;">🔴 GEMPA TERKINI</div><div style="font-size:13px;font-weight:700;">M ${data.magnitude}</div><div style="font-size:10px;color:#ccc;">📍 ${data.wilayah}</div></div>`)
      marker.addTo(layerGroups.zonaBencana)
    }

    function addSupabaseDisasterMarker(dbRow) {
      if (!mapInstance || !dbRow.latitude || !dbRow.longitude) return
      const type = dbRow.disaster_type || 'flood'
      const diseases = dbRow.disease_predictions || []
      const medicines = dbRow.medical_needs || []
      
      const marker = window.L.marker([dbRow.latitude, dbRow.longitude], { icon: createMarkerIcon(type, 0) })
      
      marker.bindPopup(`
        <div style="font-family:inherit;min-width:240px;color:#e8f0e8;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
            <span style="font-size:16px;">${typeIcon(type)}</span>
            <div>
              <div style="font-size:12px;font-weight:700;color:${getColor(type)};text-transform:uppercase;">${dbRow.title || type}</div>
              <div style="font-size:9px;color:#aaa;">📍 ${dbRow.area_name || 'Lokasi'}</div>
            </div>
          </div>
          <div style="background:rgba(139, 195, 74, 0.1); border: 1px solid #8bc34a; padding:6px; border-radius:6px; margin-bottom:10px;">
            <div style="font-size:9px;color:#8bc34a;font-weight:bold;margin-bottom:4px;">🤖 PREDIKSI PENYAKIT (AI)</div>
            <div style="font-size:11px;font-weight:600;display:flex;flex-wrap:wrap;gap:4px;">
              ${diseases.map(d => `<span style="background:#2a362a;padding:2px 6px;border-radius:4px;">${d.nama || d}</span>`).join('')}
            </div>
          </div>
          <div style="font-size:10px;font-weight:bold;margin-bottom:4px;">Permintaan kebutuhan medis:</div>
          <div style="max-height:90px;overflow-y:auto;background:#1a1f1a;border:1px solid #3a4a3a;border-radius:6px;margin-bottom:10px;">
            ${medicines.map(m => `
              <div style="display:flex;justify-content:space-between;padding:6px 8px;border-bottom:1px solid #2a362a;">
                <span style="font-size:10px;color:#aaa;width:40%;">${m.qty} ${m.unit}</span>
                <span style="font-size:10px;font-weight:600;width:60%;text-align:right;">${m.name}</span>
              </div>`).join('')}
          </div>
          <div style="text-align:center;">
            <div style="font-size:9px;color:#aaa;margin-bottom:4px;">Logistik Farmasi Terpenuhi: <strong style="color:#fff;">${dbRow.fulfillment_pct || 0}%</strong></div>
            <div style="width:100%;background:#2a362a;border-radius:10px;height:8px;overflow:hidden;">
              <div style="width:${dbRow.fulfillment_pct || 0}%;background:#8bc34a;height:100%;"></div>
            </div>
          </div>
        </div>`, { maxWidth: 280 })

      marker.on('click', () => emit('disaster-selected', {
        type, severity: dbRow.severity || 'medium', area: dbRow.area_name, title: dbRow.title, 
        intel: { diseases: diseases.map(d => d.nama || d), medicines, fulfillment: dbRow.fulfillment_pct }
      }))
      marker.addTo(layerGroups[typeToLayerKey[type]] || layerGroups.zonaBencana)
    }

    function addFaskesMarker(dbRow) {
      if (!mapInstance || !dbRow.latitude || !dbRow.longitude) return;
      const color = dbRow.status === 'overcrowded' ? '#FF9800' : '#4CAF50';
      const faskesIcon = window.L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;background:${color};border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.5);font-size:12px;">🏥</div>`,
        iconSize: [24, 24], iconAnchor: [12, 12]
      });

      const marker = window.L.marker([dbRow.latitude, dbRow.longitude], { icon: faskesIcon });
      const namaFaskes = dbRow.name || dbRow.nama || dbRow.Name || 'Fasilitas Medis';
      
      marker.bindPopup(`
        <div style="font-family:inherit;min-width:200px;color:#e8f0e8;">
          <div style="font-size:12px;font-weight:700;color:${color};">${namaFaskes}</div>
          <div style="font-size:10px;color:#aaa;margin-bottom:8px;text-transform:capitalize;">📍 Tipe: ${dbRow.type}</div>
          <div style="font-size:10px;background:#1a1f1a;padding:6px;border-radius:4px;border:1px solid #3a4a3a;">
            Status: <strong style="color:${color};text-transform:capitalize;">${dbRow.status}</strong><br>
            Stok Obat: <strong style="color:#fff;">${dbRow.medicine_stock_pct}%</strong>
          </div>
        </div>
      `);
      marker.addTo(layerGroups.fasilitasKesehatan);
    }

    function addDroneMarker(dbRow) {
      if (!mapInstance || !dbRow.latitude || !dbRow.longitude) return;
      const isEnRoute = dbRow.status === 'en_route';
      const color = isEnRoute ? '#2196F3' : '#9E9E9E';

      const popupContent = `
        <div style="font-family:inherit;min-width:180px;color:#e8f0e8;">
          <div style="font-size:12px;font-weight:700;color:${color};">Drone Logistik: ${dbRow.drone_code}</div>
          <div style="font-size:10px;color:#aaa;margin-bottom:6px;text-transform:capitalize;">Status: ${dbRow.status.replace('_', ' ')}</div>
          <div style="font-size:10px;background:#1a1f1a;padding:6px;border-radius:4px;border:1px solid #3a4a3a;">
            <strong>Muatan (Payload):</strong><br><span style="color:#fff;">${dbRow.payload}</span>
          </div>
        </div>
      `;

      if (isEnRoute && dbRow.target_latitude && dbRow.target_longitude) {
        const routeLine = window.L.polyline([
          [dbRow.latitude, dbRow.longitude], 
          [dbRow.target_latitude, dbRow.target_longitude]
        ], {
          color: '#2196F3', weight: 4, dashArray: '8, 6', opacity: 0.8
        });

        routeLine.bindPopup(popupContent);
        routeLine.addTo(layerGroups.ruteDrone);
      }
    }

    function addWaterSanitationMarker(dbRow) {
      if (!mapInstance || !dbRow.latitude || !dbRow.longitude) return;
      
      let iconSymbol = '💧';
      let color = '#2196F3'; // Biru (Normal/Aman)
      
      if (dbRow.status === 'contaminated') { 
        color = '#F44336'; // Merah
        iconSymbol = '☣️'; 
      } 
      
      // Jika statusnya kekeringan, ubah ikon menjadi padang pasir/kering dan warna oranye
      if (dbRow.is_drought || dbRow.status === 'empty') { 
        color = '#FF9800'; // Oranye
        iconSymbol = '🏜️'; 
      }

      const wsIcon = window.L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;background:${color};border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.5);font-size:12px;">${iconSymbol}</div>`,
        iconSize: [24, 24], iconAnchor: [12, 12]
      });

      const marker = window.L.marker([dbRow.latitude, dbRow.longitude], { icon: wsIcon });
      
      // Logika untuk menampilkan label Kekeringan
      const droughtLabel = dbRow.is_drought 
        ? '<span style="color:#FF9800;font-weight:bold;">⚠️ STATUS: DARURAT KEKERINGAN</span>' 
        : '<span style="color:#4CAF50;">✅ Tidak Ada Kekeringan (Krisis Sanitasi)</span>';

      marker.bindPopup(`
        <div style="font-family:inherit;min-width:230px;color:#e8f0e8;">
          <div style="font-size:12px;font-weight:700;color:${color};text-transform:uppercase;">${dbRow.name}</div>
          <div style="font-size:9px;color:#aaa;margin-bottom:8px;text-transform:capitalize;">Tipe Pemantauan: ${dbRow.facility_type.replace('_', ' ')}</div>
          
          <div style="font-size:10px;background:#1a1f1a;padding:8px;border-radius:6px;border:1px solid #3a4a3a;margin-bottom:8px;">
            <div style="margin-bottom:6px;border-bottom:1px solid #2a362a;padding-bottom:4px;">
              ${droughtLabel}
            </div>
            <div style="color:#ccc;">
              <strong style="color:#8bc34a;">Analisis Kondisi Sanitasi:</strong><br>
              <span style="font-style:italic;line-height:1.4;">"${dbRow.sanitation_condition || 'Data pemantauan belum tersedia.'}"</span>
            </div>
          </div>
          
          <div style="text-align:center;">
            <div style="font-size:9px;color:#aaa;margin-bottom:4px;">Ketersediaan Air Bersih: <strong style="color:#fff;">${dbRow.capacity_pct}%</strong></div>
            <div style="width:100%;background:#2a362a;border-radius:10px;height:6px;overflow:hidden;">
              <div style="width:${dbRow.capacity_pct}%;background:${color};height:100%;"></div>
            </div>
          </div>
        </div>
      `);
      marker.addTo(layerGroups.airSanitasi);
    }

    function getGeoPharmaIntel(disasterType) {
      const intel = { diseases: [], medicines: [], fulfillment: Math.floor(Math.random() * (100 - 20 + 1)) + 20 }
      switch (disasterType) {
        case 'flood':
          intel.diseases = ['Diare', 'Leptospirosis', 'Dermatitis', 'ISPA'];
          intel.medicines = [ { qty: 250, unit: 'Strip', name: 'Paracetamol' }, { qty: 150, unit: 'Kotak', name: 'Oralit' } ];
          break;
        case 'earthquake':
        case 'tsunami':
          intel.diseases = ['Trauma Fisik', 'Infeksi Luka', 'Tetanus'];
          intel.medicines = [ { qty: 300, unit: 'Roll', name: 'Perban' }, { qty: 200, unit: 'Botol', name: 'Antiseptik' } ];
          break;
        case 'volcano':
        case 'wind':
        case 'haze':
          intel.diseases = ['ISPA Akut', 'Iritasi Mata', 'Asma'];
          intel.medicines = [ { qty: 500, unit: 'Box', name: 'Masker N95' }, { qty: 200, unit: 'Botol', name: 'Obat Tetes Mata' } ];
          break;
        default:
          intel.diseases = ['Demam', 'Flu', 'Kelelahan'];
          intel.medicines = [ { qty: 100, unit: 'Strip', name: 'Multivitamin' } ];
      }
      return intel;
    }

    async function tarikDataKeSupabase() {
      if (!confirm("Ambil 3 data bencana yang sudah terjadi?")) return;
      
      isLoading.value = true;
      try {
        const bankDataBencana = [
          { type: 'flood', lat: 5.5483, lng: 95.3238, area: 'Banda Aceh', title: 'Banjir Genangan Kota' },
          { type: 'flood', lat: 3.5952, lng: 98.6722, area: 'Medan, Sumut', title: 'Banjir Luapan Sungai Deli' },
          { type: 'wind', lat: 1.3005, lng: 97.6453, area: 'Nias, Sumut', title: 'Angin Puting Beliung' },
          { type: 'flood', lat: -0.4719, lng: 100.3758, area: 'Tanah Datar, Sumbar', title: 'Banjir Bandang Sumbar' },
          { type: 'volcano', lat: -0.3817, lng: 100.4736, area: 'Agam, Sumbar', title: 'Erupsi Gunung Marapi' },
          { type: 'haze', lat: 0.5071, lng: 101.4478, area: 'Pekanbaru, Riau', title: 'Kabut Asap Riau' },
          { type: 'haze', lat: -1.6101, lng: 103.6131, area: 'Jambi', title: 'Kabut Asap Karhutla Jambi' },
          { type: 'flood', lat: -3.7928, lng: 102.2608, area: 'Bengkulu', title: 'Banjir Pesisir Bengkulu' },
          { type: 'haze', lat: -2.9760, lng: 104.7754, area: 'Palembang, Sumsel', title: 'Kabut Asap Karhutla Sumsel' },
          { type: 'wind', lat: -5.4500, lng: 105.2667, area: 'Bandar Lampung', title: 'Angin Kencang Lampung' },
          { type: 'flood', lat: -6.1214, lng: 106.1465, area: 'Serang, Banten', title: 'Banjir Luapan Cibanten' },
          { type: 'flood', lat: -6.2088, lng: 106.8456, area: 'Jakarta Pusat', title: 'Banjir Genangan DKI' },
          { type: 'flood', lat: -6.2415, lng: 106.9924, area: 'Bekasi, Jabar', title: 'Banjir Perumahan Bekasi' },
          { type: 'wind', lat: -6.5971, lng: 106.7915, area: 'Bogor, Jabar', title: 'Puting Beliung Bogor' },
          { type: 'wind', lat: -6.9634, lng: 107.7554, area: 'Rancaekek, Jabar', title: 'Puting Beliung Rancaekek' },
          { type: 'flood', lat: -7.2278, lng: 107.9087, area: 'Garut, Jabar', title: 'Banjir Bandang Cimanuk' },
          { type: 'flood', lat: -6.7320, lng: 108.5523, area: 'Cirebon, Jabar', title: 'Banjir Rob Pantura' },
          { type: 'flood', lat: -6.8944, lng: 110.6388, area: 'Kab. Demak, Jateng', title: 'Banjir Luapan Sungai Wulan' },
          { type: 'flood', lat: -6.9932, lng: 110.4203, area: 'Semarang, Jateng', title: 'Banjir Rob Semarang' },
          { type: 'flood', lat: -7.0868, lng: 110.9158, area: 'Grobogan, Jateng', title: 'Banjir Bandang Grobogan' },
          { type: 'wind', lat: -7.5666, lng: 110.8250, area: 'Surakarta, Jateng', title: 'Angin Kencang Solo Raya' },
          { type: 'wind', lat: -7.7956, lng: 110.3695, area: 'Yogyakarta', title: 'Angin Puting Beliung DIY' },
          { type: 'flood', lat: -8.1990, lng: 111.1116, area: 'Pacitan, Jatim', title: 'Banjir Pesisir Pacitan' },
          { type: 'fire', lat: -7.9424, lng: 112.9530, area: 'TNBTS, Jatim', title: 'Kebakaran Lahan Bromo' },
          { type: 'wind', lat: -7.4478, lng: 112.7183, area: 'Sidoarjo, Jatim', title: 'Angin Kencang Sidoarjo' },
          { type: 'flood', lat: -8.1333, lng: 113.2150, area: 'Lumajang, Jatim', title: 'Banjir Lahar Dingin Semeru' },
          { type: 'fire', lat: -8.2192, lng: 114.3692, area: 'Banyuwangi, Jatim', title: 'Kebakaran Hutan Ijen' },
          { type: 'fire', lat: -8.7185, lng: 115.2150, area: 'Denpasar, Bali', title: 'Kebakaran TPA Suwung' },
          { type: 'wind', lat: -8.1120, lng: 115.0882, area: 'Singaraja, Bali', title: 'Angin Kencang Buleleng' },
          { type: 'flood', lat: -8.5833, lng: 116.1167, area: 'Mataram, NTB', title: 'Banjir Genangan Kota' },
          { type: 'flood', lat: -8.4556, lng: 118.7275, area: 'Bima, NTB', title: 'Banjir Bandang Bima' },
          { type: 'volcano', lat: -8.5389, lng: 122.7667, area: 'Flores Timur, NTT', title: 'Erupsi Lewotobi' },
          { type: 'wind', lat: -10.1583, lng: 123.5750, area: 'Kupang, NTT', title: 'Badai Angin Tropis' },
          { type: 'haze', lat: -0.0270, lng: 109.3333, area: 'Pontianak, Kalbar', title: 'Kabut Asap Gambut' },
          { type: 'flood', lat: 0.8145, lng: 112.9224, area: 'Kapuas Hulu, Kalbar', title: 'Banjir Kapuas Hulu' },
          { type: 'haze', lat: -2.2030, lng: 113.9213, area: 'Palangkaraya, Kalteng', title: 'Kabut Asap Karhutla Kalteng' },
          { type: 'flood', lat: -2.5310, lng: 112.9500, area: 'Sampit, Kalteng', title: 'Banjir DAS Mentaya' },
          { type: 'haze', lat: -3.3166, lng: 114.5901, area: 'Banjarmasin, Kalsel', title: 'Kabut Asap Kalsel' },
          { type: 'flood', lat: -1.2654, lng: 116.8312, area: 'Balikpapan, Kaltim', title: 'Banjir Hujan Deras' },
          { type: 'fire', lat: -0.5022, lng: 117.1536, area: 'Samarinda, Kaltim', title: 'Kebakaran Lahan Gambut' },
          { type: 'flood', lat: 3.3036, lng: 117.6322, area: 'Tarakan, Kaltara', title: 'Banjir Genangan Tarakan' },
          { type: 'flood', lat: -5.1477, lng: 119.4327, area: 'Makassar, Sulsel', title: 'Banjir Genangan Makassar' },
          { type: 'wind', lat: -3.0135, lng: 119.9806, area: 'Toraja, Sulsel', title: 'Puting Beliung Toraja' },
          { type: 'flood', lat: -3.9985, lng: 122.5127, area: 'Kendari, Sultra', title: 'Banjir Kota Kendari' },
          { type: 'wind', lat: -0.8917, lng: 119.8707, area: 'Palu, Sulteng', title: 'Angin Kencang Palu' },
          { type: 'flood', lat: 0.5435, lng: 123.0567, area: 'Gorontalo', title: 'Banjir Bandang Gorontalo' },
          { type: 'volcano', lat: 2.3040, lng: 125.3710, area: 'Sitaro, Sulut', title: 'Erupsi Gunung Ruang' },
          { type: 'flood', lat: -3.6947, lng: 128.1813, area: 'Ambon, Maluku', title: 'Banjir Longsor Ambon' },
          { type: 'flood', lat: -0.8615, lng: 131.2520, area: 'Sorong, Papua Barat', title: 'Banjir Genangan Sorong' },
          { type: 'flood', lat: -2.5337, lng: 140.7181, area: 'Jayapura, Papua', title: 'Banjir Bandang Jayapura' }
        ];

        const diacak = bankDataBencana.sort(() => 0.5 - Math.random());
        const dataTerpilih = diacak.slice(0, 3); 
        const dataUntukDisimpan = [];

        for (const b of dataTerpilih) {
          const intel = getGeoPharmaIntel(b.type);
          dataUntukDisimpan.push({
            created_at: new Date().toISOString(),
            disaster_type: b.type,
            title: b.title,
            area_name: b.area,
            severity: 'high',
            latitude: b.lat,
            longitude: b.lng,
            risk_score: Math.floor(Math.random() * 20) + 80, 
            casualties: Math.floor(Math.random() * 1000) + 50,
            affected_area: Math.floor(Math.random() * 500) + 100,
            fulfillment_pct: intel.fulfillment, 
            disease_predictions: intel.diseases.map(d => ({ nama: d, level: 'HIGH' })),
            medical_needs: intel.medicines
          });
        }

        const { error } = await supabase.from('disasters').insert(dataUntukDisimpan);
        if (error) throw error;
        
        alert(`BERHASIL! 3 Laporan Bencana Baru telah masuk ke sistem.`);
        loadData(); 

      } catch (err) {
        console.error("Gagal sinkronisasi:", err);
        alert("Gagal masuk ke Supabase: " + err.message);
      } finally {
        isLoading.value = false;
      }
    }

    async function loadData() {
      isLoading.value = true;
      try {
        Object.values(layerGroups).forEach(lg => lg && lg.clearLayers())

        let gempaList = await fetchBMKGGempa().catch(() => [])
        quakeCount.value = gempaList.length
        gempaList.forEach(g => addGempaMarker(g))

        let liveBencanaList = [];
        try {
          const liveData = await getReports(); 
          if (liveData && liveData.length > 0) {
            liveData.forEach(feature => {
              if (feature.properties?.disaster_type !== 'earthquake') {
                 const props = feature.properties;
                 const type = props.disaster_type || 'flood';
                 const coords = feature.geometry?.coordinates || [0, 0];
                 const intel = getGeoPharmaIntel(type);
                 
                 liveBencanaList.push({
                   disaster_type: type,
                   title: `[LIVE] ${props.title || type.toUpperCase()}`,
                   area_name: props.area_name || props.tags?.district_name || 'Lokasi Terlapor',
                   severity: 'high',
                   latitude: coords[1],
                   longitude: coords[0],
                   risk_score: 95, 
                   casualties: 0,
                   affected_area: 50,
                   fulfillment_pct: intel.fulfillment,
                   disease_predictions: intel.diseases.map(d => ({ nama: d, level: 'HIGH' })),
                   medical_needs: intel.medicines
                 });
              }
            });
          }
        } catch (e) {
          console.warn("Info: Tidak ada laporan live dari PetaBencana saat ini.", e);
        }

        const { data: dbDisasters } = await supabase.from('disasters').select('*')
        const { data: dbFaskes } = await supabase.from('health_facilities').select('*')
        if (dbFaskes) dbFaskes.forEach(f => addFaskesMarker(f))

        const { data: dbDrones } = await supabase.from('drones').select('*')
        if (dbDrones) dbDrones.forEach(d => addDroneMarker(d))

        const { data: dbWater } = await supabase.from('water_sanitation').select('*')
        if (dbWater) dbWater.forEach(w => addWaterSanitationMarker(w))

        const semuaBencanaLain = [...liveBencanaList, ...(dbDisasters || [])];

        if (semuaBencanaLain.length > 0) {
          semuaBencanaLain.forEach(d => addSupabaseDisasterMarker(d))
          sampleCount.value = semuaBencanaLain.length
        } else {
          sampleCount.value = 0
        }

        emit('stats-updated', {
          total: gempaList.length + sampleCount.value,
          prioritasTinggi: semuaBencanaLain.filter(d => d.risk_score > 70).length,
          faskes: dbFaskes ? dbFaskes.length : 0,
          droneAktif: dbDrones ? dbDrones.filter(d => d.status === 'en_route').length : 0,
          korban: semuaBencanaLain.reduce((sum, d) => sum + (d.casualties || 0), 0),
          luasZona: semuaBencanaLain.reduce((sum, d) => sum + (d.affected_area || 0), 0),

          daftarArea: semuaBencanaLain.map((d, index) => ({
            id: index,
            nama: d.area_name,
            lat: d.latitude,
            lng: d.longitude,
            zoom: 12
          }))
        })

        loadInaRiskBanjir();

      } finally {
        isLoading.value = false;
      }
    }

    async function initMap() {
      if (!window.L) {
        await new Promise((resolve) => {
          const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link)
          const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload = resolve; document.head.appendChild(script)
        })

        await new Promise((resolve) => {
        const esriScript = document.createElement('script'); 
        esriScript.src = 'https://unpkg.com/esri-leaflet@3.0.10/dist/esri-leaflet.js'; 
        esriScript.onload = resolve; 
        document.head.appendChild(esriScript);
        })

        const style = document.createElement('style')
        style.textContent = `@keyframes ping { 75%,100% { transform:scale(2.2);opacity:0; } } .leaflet-popup-content-wrapper { background:#1a1f1a !important; color:#e8f0e8 !important; border:1px solid #3a4a3a !important; border-radius:8px !important; box-shadow:0 4px 24px rgba(0,0,0,0.6) !important; } .leaflet-popup-tip { background:#1a1f1a !important; } .leaflet-popup-close-button { color:#e8f0e8 !important; }`
        document.head.appendChild(style)
      }

      mapInstance = window.L.map(mapContainer.value, { center: [-2.5, 118.0], zoom: 5, zoomControl: false, attributionControl: false })
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 18 }).addTo(mapInstance)
      window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstance)

      Object.keys(layerGroups).forEach(key => {
        layerGroups[key] = window.L.layerGroup()
        if (props.activeLayers[key] !== false) layerGroups[key].addTo(mapInstance)
      })

      await loadData()
    }

    onMounted(() => { initMap(); refreshInterval = setInterval(loadData, 5 * 60 * 1000) })
    onUnmounted(() => { if (refreshInterval) clearInterval(refreshInterval); if (mapInstance) mapInstance.remove() })

    return { mapContainer, isLoading, quakeCount, sampleCount, disasterTypes, tarikDataKeSupabase, arahkanPeta }
  }
})
</script>

<style scoped>
.interactive-map-wrapper :deep(.leaflet-popup-content::-webkit-scrollbar) { width: 4px; }
.interactive-map-wrapper :deep(.leaflet-popup-content::-webkit-scrollbar-track) { background: #1a1f1a; }
.interactive-map-wrapper :deep(.leaflet-popup-content::-webkit-scrollbar-thumb) { background: #3a4a3a; border-radius: 4px; }
</style>