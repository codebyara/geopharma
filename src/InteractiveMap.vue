<template>
  <div class="interactive-map-wrapper relative w-full h-full" :class="theme === 'light' ? 'bg-gray-200' : 'bg-[#1a1f1a] rounded-xl overflow-hidden border border-outline-variant'">
    
    <div v-if="isLoading" class="absolute inset-0 z-[500] flex flex-col items-center justify-center gap-4" :class="theme === 'light' ? 'bg-white/90' : 'bg-on-surface/90'">
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="font-label-caps text-[10px] tracking-widest" :class="theme === 'light' ? 'text-gray-500' : 'text-surface-variant/70'">MEMPROSES DATA...</span>
    </div>

    <div ref="mapContainer" class="absolute inset-0 w-full h-full z-0"></div>

    <div class="absolute bottom-24 right-4 z-[400]">
      <button @click="resetPeta" class="bg-white/95 backdrop-blur-sm hover:bg-white text-indigo-700 p-3 rounded-full shadow-lg border border-gray-200 transition-all hover:scale-110 flex items-center justify-center group" title="Reset Zoom (Tampilkan Seluruh Indonesia)">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:-rotate-45 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>

    <template v-if="theme === 'dark'">
      
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

    </template>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import { supabase } from './services/supabase.js'
import { getReports } from './services/petabencana.service.js' 

export default defineComponent({
  name: 'InteractiveMap',
  props: {
    activeLayers: { type: Object, default: () => ({}) },
    theme: { type: String, default: 'dark'}
  },
  emits: ['disaster-selected', 'stats-updated'],
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const isLoading = ref(true)
    const quakeCount = ref(0)
    const sampleCount = ref(0)
    let mapInstance = null
    let refreshInterval = null
    let rawDisasters = []
    let rawGempa = []
    let rawFaskes = []
    let rawDrones = []
    
    // VARIABEL MEMORI DRONE REALTIME
    let droneMarkers = {} 
    let droneSubscription = null;

    function resetPeta() {
      if (!mapInstance) return;
      mapInstance.closePopup(); 
      mapInstance.flyTo([-2.5, 118.0], 5, { duration: 1.5 }); 
    }

    function hitungStatistikLayar() {
      if (!mapInstance) return;

      const bounds = mapInstance.getBounds();
      const diDalamLayar = (lat, lng) => lat && lng && bounds.contains([lat, lng]);

      const gempaTerlihat = rawGempa.filter(g => diDalamLayar(g.lat, g.lng));
      const bencanaTerlihat = rawDisasters.filter(d => diDalamLayar(d.latitude, d.longitude));
      const faskesTerlihat = rawFaskes.filter(f => diDalamLayar(f.latitude, f.longitude));
      const droneTerlihat = rawDrones.filter(d => diDalamLayar(d.latitude, d.longitude));
      
      quakeCount.value = gempaTerlihat.length;
      sampleCount.value = bencanaTerlihat.length;

      emit('stats-updated', {
        total: gempaTerlihat.length + bencanaTerlihat.length,
        prioritasTinggi: bencanaTerlihat.filter(d => d.risk_score > 70).length,
        faskes: faskesTerlihat.length,
        droneAktif: droneTerlihat.filter(d => d.status === 'en_route').length,
        korban: bencanaTerlihat.reduce((sum, d) => sum + (d.casualties || 0), 0),
        luasZona: bencanaTerlihat.reduce((sum, d) => sum + (d.affected_area || 0), 0),
        daftarArea: rawDisasters.map((d, index) => ({
          id: d.id || index,
          nama: d.area_name || 'Lokasi Terlapor',
          lat: d.latitude,
          lng: d.longitude
        }))
      });
    }

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
            opacity: props.theme === 'light' ? 1.0 : 0.8,
        });
        inaRiskLayer.addTo(layerGroups.prioritasWilayah);
    }

    function createMarkerIcon(type, magnitude, riskScore = 0, isFieldReport = false) {
      const color = getColor(type)
      const size = (type === 'earthquake' || type === 'tsunami') ? (magnitude >= 6.0 ? 22 : magnitude >= 5.0 ? 16 : 12) : 13
      const pulse = type === 'tsunami' || (type === 'earthquake' && magnitude >= 5.0) || type !== 'earthquake'
      
      const isHighPriority = riskScore > 70;
      const pulseColor = isHighPriority ? '#ef4444' : color; 
      const pulseAnim = isHighPriority ? 'animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;' : 'animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;';
      
      const priorityBadge = isHighPriority ? `<div style="position:absolute; top:-6px; right:-6px; background:#ef4444; color:white; border-radius:50%; width:16px; height:16px; font-size:11px; font-weight:bold; display:flex; align-items:center; justify-content:center; border:2px solid white; z-index:10; box-shadow: 0 2px 4px rgba(0,0,0,0.4);">!</div>` : '';

      if (isFieldReport) {
        return window.L.divIcon({
          className: '',
          html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;">
              ${pulse ? `<span style="position:absolute;width:40px;height:40px;border-radius:50%;background:${pulseColor};opacity:${isHighPriority ? 0.6 : 0.35};${pulseAnim}"></span>` : ''}
              <span style="position:relative;width:28px;height:28px;border-radius:50%;background:white;border:2px solid #cbd5e1;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px;">📝</span>
              ${priorityBadge}
            </div>`,
          iconSize: [32, 32], iconAnchor: [16, 16],
        })
      }

      return window.L.divIcon({
        className: '',
        html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:${size+12}px;height:${size+12}px;">
            ${pulse ? `<span style="position:absolute;width:${size+8}px;height:${size+8}px;border-radius:50%;background:${pulseColor};opacity:${isHighPriority ? 0.6 : 0.35};${pulseAnim}"></span>` : ''}
            <span style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.3);">${type === 'tsunami' ? '<span style="font-size:7px;">🌊</span>' : ''}</span>
            ${priorityBadge}
          </div>`,
        iconSize: [size+12, size+12], iconAnchor: [(size+12)/2, (size+12)/2],
      })
    }

    function arahkanPeta(lat, lng, zoomLevel = 12) {
      if (!mapInstance) return;
      mapInstance.flyTo([lat, lng], zoomLevel, { duration: 1.5 });
      setTimeout(() => {
        let titikDitemukan = false;
        mapInstance.eachLayer((layer) => {
          if (layer instanceof window.L.Marker && layer.getLatLng) {
            const posisiTitik = layer.getLatLng();
            if (Math.abs(posisiTitik.lat - lat) < 0.05 && Math.abs(posisiTitik.lng - lng) < 0.05) {
              if (!titikDitemukan) {
                layer.openPopup();   
                layer.fire('click'); 
                titikDitemukan = true;
              }
            }
          }
        });
      }, 1500); 
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

    function addSupabaseDisasterMarker(dbRow, targetLayer, isFieldReport = false) {
      if (!mapInstance || !dbRow.latitude || !dbRow.longitude) return
      const type = dbRow.disaster_type || 'flood'
      const diseases = dbRow.disease_predictions || []
      const medicines = dbRow.medical_needs || []
      
      const marker = window.L.marker([dbRow.latitude, dbRow.longitude], { icon: createMarkerIcon(type, 0, dbRow.risk_score, isFieldReport) })      
      
      const imageHtml = dbRow.image_url 
        ? `<div style="width: 100%; height: 130px; border-radius: 8px; overflow: hidden; margin-bottom: 12px; border: 1px solid #d1d5db; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
             <img src="${dbRow.image_url}" style="width: 100%; height: 100%; object-fit: cover;" alt="Foto Lapangan" />
           </div>` 
        : '';

      const isHighPriority = dbRow.risk_score > 70;
      const priorityBadge = isHighPriority ? `<span style="background:#ef4444;color:white;padding:2px 6px;border-radius:4px;font-size:8px;font-weight:bold;margin-left:6px;box-shadow:0 1px 2px rgba(0,0,0,0.2);letter-spacing:0.5px;">PRIORITAS TINGGI</span>` : '';

      const isLight = props.theme === 'light';
      const textColor = isLight ? '#111827' : '#e8f0e8';
      const mutedColor = isLight ? '#4b5563' : '#aaaaaa';
      const boxColor = isLight ? '#f3f4f6' : '#1a1f1a';
      const borderColor = isLight ? '#d1d5db' : '#3a4a3a';
      const highlightColor = isLight ? '#e5e7eb' : '#2a362a';

      const aiButtonHtml = isLight ? `
        <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed ${borderColor};">
          <button onclick="window.location.href='/smart-relief?id=${dbRow.id}'" style="width: 100%; background: #4f46e5; color: white; border: none; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 6px -1px rgba(79,70,229,0.3); transition: background 0.3s;">
            <span style="font-size: 16px;">🤖</span> LAKUKAN ANALISIS AI
          </button>
        </div>
      ` : '';

      marker.bindPopup(`
        <div style="font-family:inherit;min-width:240px;color:${textColor};">
          ${imageHtml}
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
            <span style="font-size:18px;">${typeIcon(type)}</span>
            <div>
              <div style="font-size:12px;font-weight:700;color:${getColor(type)};text-transform:uppercase;display:flex;align-items:center;">
                ${dbRow.title || type} ${priorityBadge}
              </div>
              <div style="font-size:9px;color:${mutedColor};">📍 ${dbRow.area_name || 'Lokasi'}</div>
            </div>
          </div>
          
          <div style="background:rgba(139, 195, 74, 0.1); border: 1px solid #8bc34a; padding:8px; border-radius:6px; margin-bottom:10px;">
            <div style="font-size:9px;color:#7cb342;font-weight:bold;margin-bottom:6px;">🦠 PREDIKSI PENYAKIT (AI)</div>
            <div style="font-size:11px;font-weight:600;display:flex;flex-wrap:wrap;gap:4px;">
              ${diseases.map(d => `<span style="background:${highlightColor};border:1px solid ${borderColor};padding:2px 6px;border-radius:4px;color:${textColor};">${d.nama || d}</span>`).join('')}
            </div>
          </div>
          
          <div style="font-size:10px;font-weight:bold;margin-bottom:4px;color:${textColor};">Permintaan Kebutuhan Medis:</div>
          
          <div style="max-height:90px;overflow-y:auto;background:${boxColor};border:1px solid ${borderColor};border-radius:6px;margin-bottom:10px;">
            ${medicines.map(m => `
              <div style="display:flex;justify-content:space-between;padding:6px 8px;border-bottom:1px solid ${borderColor};">
                <span style="font-size:10px;color:${mutedColor};width:40%;">${m.qty} ${m.unit}</span>
                <span style="font-size:10px;font-weight:600;width:60%;text-align:right;color:${textColor};">${m.name}</span>
              </div>`).join('')}
          </div>
          
          <div style="text-align:center;">
            <div style="font-size:9px;color:${mutedColor};margin-bottom:4px;">Logistik Terpenuhi: <strong style="color:${textColor};">${dbRow.fulfillment_pct || 0}%</strong></div>
            <div style="width:100%;background:${borderColor};border-radius:10px;height:8px;overflow:hidden;">
              <div style="width:${dbRow.fulfillment_pct || 0}%;background:#8bc34a;height:100%;"></div>
            </div>
          </div>
          
          ${aiButtonHtml}
        </div>`, { maxWidth: 280 })

      marker.on('click', () => emit('disaster-selected', { type, severity: dbRow.severity || 'medium', area: dbRow.area_name, title: dbRow.title, intel: { diseases: diseases.map(d => d.nama || d), medicines, fulfillment: dbRow.fulfillment_pct } }))
      marker.addTo(targetLayer)
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

    function addWaterSanitationMarker(dbRow) {
      if (!mapInstance || !dbRow.latitude || !dbRow.longitude) return;
      let iconSymbol = '💧';
      let color = '#2196F3'; 
      if (dbRow.status === 'contaminated') { color = '#F44336'; iconSymbol = '☣️'; } 
      if (dbRow.is_drought || dbRow.status === 'empty') { color = '#FF9800'; iconSymbol = '🏜️'; }

      const wsIcon = window.L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;background:${color};border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.5);font-size:12px;">${iconSymbol}</div>`,
        iconSize: [24, 24], iconAnchor: [12, 12]
      });

      const marker = window.L.marker([dbRow.latitude, dbRow.longitude], { icon: wsIcon });
      const droughtLabel = dbRow.is_drought 
        ? '<span style="color:#FF9800;font-weight:bold;">⚠️ STATUS: DARURAT KEKERINGAN</span>' 
        : '<span style="color:#4CAF50;">✅ Tidak Ada Kekeringan (Krisis Sanitasi)</span>';

      marker.bindPopup(`
        <div style="font-family:inherit;min-width:230px;color:#e8f0e8;">
          <div style="font-size:12px;font-weight:700;color:${color};text-transform:uppercase;">${dbRow.name}</div>
          <div style="font-size:9px;color:#aaa;margin-bottom:8px;text-transform:capitalize;">Tipe Pemantauan: ${dbRow.facility_type.replace('_', ' ')}</div>
          
          <div style="font-size:10px;background:#1a1f1a;padding:8px;border-radius:6px;border:1px solid #3a4a3a;margin-bottom:8px;">
            <div style="margin-bottom:6px;border-bottom:1px solid #2a362a;padding-bottom:4px;">${droughtLabel}</div>
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
          { type: 'flood', lat: -0.4719, lng: 100.3758, area: 'Tanah Datar, Sumbar', title: 'Banjir Bandang Sumbar' }
        ];

        const diacak = bankDataBencana.sort(() => 0.5 - Math.random());
        const dataTerpilih = diacak.slice(0, 3); 
        const dataUntukDisimpan = [];

        for (const b of dataTerpilih) {
          const intel = getGeoPharmaIntel(b.type);
          dataUntukDisimpan.push({
            created_at: new Date().toISOString(),
            disaster_type: b.type,
            title: "[SIMULASI]" + b.title,
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

    // ==========================================
    // FUNGSI BARU UNTUK KORIDOR & ANIMASI DRONE
    // ==========================================
    function setupDroneRealtime() {
      droneSubscription = supabase.channel('map-drone-movement')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'drones' }, payload => {
           const updatedDrone = payload.new;
           
           if (droneMarkers[updatedDrone.id]) {
             droneMarkers[updatedDrone.id].setLatLng([
               updatedDrone.current_latitude || updatedDrone.latitude || -5.1345, 
               updatedDrone.current_longitude || updatedDrone.longitude || 119.4908
             ]);
           }
        }).subscribe();
    }

    function drawFlightCorridors() {
      rawDisasters.forEach(bencana => {
        if (bencana.latitude && bencana.longitude) {
          const routeLine = window.L.polyline([
            [-5.1345, 119.4908], // Titik Markas Makassar
            [bencana.latitude, bencana.longitude]
          ], { color: '#3b82f6', weight: 2, dashArray: '6, 8', opacity: 0.4 });
          routeLine.addTo(layerGroups.ruteDrone);
        }
      });
    }

    function addDroneMarker(dbRow) {
      if (!mapInstance || !dbRow.latitude || !dbRow.longitude) return;
      
      // JANGAN GAMBAR DRONE JIKA TIDAK SEDANG TERBANG
      if (dbRow.status !== 'en_route') return; 

      const popupContent = `
        <div style="font-family:inherit;min-width:180px;color:#e8f0e8;">
          <div style="font-size:12px;font-weight:700;color:#2196F3;">Drone Logistik: ${dbRow.drone_code}</div>
          <div style="font-size:10px;color:#aaa;margin-bottom:6px;text-transform:capitalize;">Status: MENGUDARA</div>
        </div>
      `;

      const droneIcon = window.L.divIcon({
        className: 'drone-bergerak', // Mengaktifkan transisi mulus
        html: `<div style="font-size:24px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">🛩️</div>`,
        iconSize: [30, 30], 
        iconAnchor: [15, 15]
      });

      const lat = dbRow.current_latitude || -5.1345;
      const lng = dbRow.current_longitude || 119.4908;
      
      const marker = window.L.marker([lat, lng], { icon: droneIcon });
      marker.bindPopup(popupContent);
      marker.addTo(layerGroups.ruteDrone);
      
      // Simpan ke memori agar bisa digeser oleh Emulator
      droneMarkers[dbRow.id] = marker; 
    }
    // ==========================================


    async function loadData() {
      isLoading.value = true;
      try {
        // RESET MEMORI DRONE SETIAP KALI LOAD
        droneMarkers = {}; 
        Object.values(layerGroups).forEach(lg => lg && lg.clearLayers())

        rawGempa = await fetchBMKGGempa().catch(() => [])
        rawGempa.forEach(g => addGempaMarker(g))

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
        } catch (e) {}

        const { data: dbDisasters } = await supabase.from('disasters').select('*')
        rawDisasters = [...liveBencanaList, ...(dbDisasters || [])];

        if (liveBencanaList.length > 0) {
          liveBencanaList.forEach(d => addSupabaseDisasterMarker(d, layerGroups.zonaBencana, false));
        }

        if (dbDisasters && dbDisasters.length > 0) {
          dbDisasters.forEach(d => {
            if (d.title && d.title.includes('[SIMULASI]')) {
              addSupabaseDisasterMarker(d, layerGroups.zonaBencana, false);
            } else {
              addSupabaseDisasterMarker(d, layerGroups.laporanLapangan, true);
            }
          });
        }

        const { data: dbFaskes } = await supabase.from('health_facilities').select('*')
        rawFaskes = dbFaskes || [];
        rawFaskes.forEach(f => addFaskesMarker(f))

        const { data: dbDrones } = await supabase.from('drones').select('*')
        rawDrones = dbDrones || [];
        
        // MEMANGGIL KORIDOR UDARA DAN DRONE TERBANG
        drawFlightCorridors();
        rawDrones.forEach(d => addDroneMarker(d))

        const { data: dbWater } = await supabase.from('water_sanitation').select('*')
        if (dbWater) dbWater.forEach(w => addWaterSanitationMarker(w))
        
        loadInaRiskBanjir();
        hitungStatistikLayar();

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
        if (props.theme === 'light') {
          style.textContent = `@keyframes ping { 75%,100% { transform:scale(2.2);opacity:0; } } .leaflet-popup-content-wrapper { background: white !important; color: #1f2937 !important; border-radius: 0.75rem !important; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1) !important; border-top: 4px solid #ef4444 !important; } .leaflet-popup-tip { background: white !important; } .leaflet-popup-content { margin: 16px !important; } .leaflet-popup-content p { margin: 0 !important; }`
        } else {
          style.textContent = `@keyframes ping { 75%,100% { transform:scale(2.2);opacity:0; } } .leaflet-popup-content-wrapper { background:#1a1f1a !important; color:#e8f0e8 !important; border:1px solid #3a4a3a !important; border-radius:8px !important; box-shadow:0 4px 24px rgba(0,0,0,0.6) !important; } .leaflet-popup-tip { background:#1a1f1a !important; } .leaflet-popup-close-button { color:#e8f0e8 !important; }`
        }
        document.head.appendChild(style)
      }

      mapInstance = window.L.map(mapContainer.value, { center: [-2.5, 118.0], zoom: 5, zoomControl: false, attributionControl: false })
      const tileUrl = props.theme === 'light' 
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      window.L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(mapInstance)
      window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstance)

      Object.keys(layerGroups).forEach(key => {
        layerGroups[key] = window.L.layerGroup()
        if (props.activeLayers[key] !== false) layerGroups[key].addTo(mapInstance)
      })

      await loadData()

      mapInstance.on('moveend', hitungStatistikLayar);
      mapInstance.on('zoomend', hitungStatistikLayar);
    }

    onMounted(() => { 
      initMap(); 
      setupDroneRealtime(); // NYALAKAN RADAR!
      refreshInterval = setInterval(loadData, 5 * 60 * 1000);
    })
    
    onUnmounted(() => { 
      if (refreshInterval) clearInterval(refreshInterval); 
      if (mapInstance) mapInstance.remove(); 
      if (droneSubscription) supabase.removeChannel(droneSubscription); // MATIKAN RADAR
    })

    return { mapContainer, isLoading, quakeCount, sampleCount, disasterTypes, tarikDataKeSupabase, arahkanPeta, loadData, resetPeta } 
  }
})
</script>

<style scoped>
.interactive-map-wrapper :deep(.leaflet-popup-content::-webkit-scrollbar) { width: 4px; }
.interactive-map-wrapper :deep(.leaflet-popup-content::-webkit-scrollbar-track) { background: transparent; }
.interactive-map-wrapper :deep(.leaflet-popup-content::-webkit-scrollbar-thumb) { background: #cbd5e1; border-radius: 4px; }

/* CSS UNTUK ANIMASI DRONE MELUNCUR HALUS */
.interactive-map-wrapper :deep(.drone-bergerak) {
  transition: transform 1.5s linear !important; 
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>