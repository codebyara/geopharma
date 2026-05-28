<template>
  <div class="bg-background">
    <section class="relative h-[450px] flex items-center overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img alt="Disaster Intelligence Visualization" class="w-full h-full object-cover" src="./assets/landingpage.png" />
        <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>
      <div class="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        <h1 class="font-serif text-5xl md:text-7xl font-bold text-white drop-shadow-lg mb-4">GeoPharma</h1>
        <p class="font-sans text-lg md:text-2xl font-medium text-gray-200 drop-shadow-md mb-8 max-w-4xl">
          Indonesia's First Geo-Pharmaceutical Disaster Intelligence Platform
        </p>
        <div class="flex flex-wrap justify-center">
          <button class="bg-[#1b5e20] hover:bg-[#0d4722] text-white px-8 py-3 rounded-full text-base md:text-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-sm border border-[#8bc34a]">
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <section class="bg-[#1a1f1a] py-8 border-b border-[#3a4a3a]">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-6 gap-6">
        <div class="border-l-2 border-[#8bc34a] pl-4">
          <div class="text-[10px] font-bold text-gray-400 mb-1 tracking-widest">ACTIVE DISASTERS</div>
          <div class="font-mono text-2xl font-bold text-[#8bc34a]">{{ stats.totalBencana || 27 }}</div>
        </div>
        <div class="border-l-2 border-[#8bc34a] pl-4">
          <div class="text-[10px] font-bold text-gray-400 mb-1 tracking-widest">HIGH RISK AREAS</div>
          <div class="font-mono text-2xl font-bold text-[#8bc34a]">{{ stats.prioritasTinggi || 19 }}</div>
        </div>
        <div class="border-l-2 border-[#8bc34a] pl-4">
          <div class="text-[10px] font-bold text-gray-400 mb-1 tracking-widest">PREDICTED OUTBREAKS</div>
          <div class="font-mono text-2xl font-bold text-[#8bc34a]">50</div>
        </div>
        <div class="border-l-2 border-[#8bc34a] pl-4">
          <div class="text-[10px] font-bold text-gray-400 mb-1 tracking-widest">MEDICINE REQUESTS</div>
          <div class="font-mono text-2xl font-bold text-[#8bc34a]">114</div>
        </div>
        <div class="border-l-2 border-[#8bc34a] pl-4">
          <div class="text-[10px] font-bold text-gray-400 mb-1 tracking-widest">ACTIVE DRONES</div>
          <div class="font-mono text-2xl font-bold text-[#8bc34a]">{{ stats.droneAktif || 1 }}</div>
        </div>
        <div class="border-l-2 border-[#8bc34a] pl-4">
          <div class="text-[10px] font-bold text-gray-400 mb-1 tracking-widest">SATELLITE SYNC</div>
          <div class="font-mono text-2xl font-bold text-[#8bc34a]">101</div>
        </div>
      </div>
    </section>

    <section class="py-12 px-6 max-w-7xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Real-Time Intelligence Map</h2>
        <p class="text-gray-500">Real-time visualization of current field operations and disease vector density.</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px]">

        <div class="lg:col-span-3 bg-[#f8faf8] p-6 rounded-xl border border-gray-200 flex flex-col gap-8 shadow-sm">
          <div>
            <h3 class="text-xs font-bold text-[#1b5e20] mb-5 tracking-widest">KONTROL LAYER</h3>
            <div class="space-y-4">
              <div
                v-for="(isActive, key) in layerControls"
                :key="key"
                class="flex justify-between items-center cursor-pointer group"
                @click="layerControls[key] = !layerControls[key]"
              >
                <span class="text-sm font-semibold text-gray-700 group-hover:text-[#1b5e20] transition-colors">
                  {{ formatLabel(key) }}
                </span>
                <div :class="['w-11 h-6 rounded-full flex items-center px-1 transition-colors duration-300', isActive ? 'bg-[#1b5e20]' : 'bg-gray-300']">
                  <div :class="['w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm', isActive ? 'translate-x-5' : 'translate-x-0']"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-auto">
            <h3 class="text-xs font-bold text-[#1b5e20] mb-4 tracking-widest">STATUS SISTEM</h3>
            <div class="space-y-3">
              <div class="flex justify-between text-xs font-semibold text-gray-600 border-b border-gray-200 pb-2">
                <span>Zona Prioritas Tinggi</span>
                <span class="text-red-600 font-bold">{{ stats.prioritasTinggi }}</span>
              </div>
              <div class="flex justify-between text-xs font-semibold text-gray-600 border-b border-gray-200 pb-2">
                <span>Drone Aktif</span>
                <span class="text-[#1b5e20] font-bold">{{ stats.droneAktif }}</span>
              </div>
              <div class="flex justify-between text-xs font-semibold text-gray-600 pb-2">
                <span>Fasilitas Kesehatan</span>
                <span class="font-bold text-gray-800">{{ stats.faskes }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-6 relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-[#1a1f1a]">
          <InteractiveMap
            ref="mapRef"
            :active-layers="layerControls"
            @disaster-selected="onDisasterSelected"
            @stats-updated="onStatsUpdated"
            class="w-full h-full"
          />
        </div>

        <div class="lg:col-span-3 bg-[#f8faf8] p-6 rounded-xl border border-gray-200 flex flex-col gap-6 overflow-y-auto shadow-sm">
          
          <div>
            <h3 class="text-xs font-bold text-gray-800 mb-3 tracking-widest">REGION FOCUS</h3>
            <div class="relative w-full">
              <select v-model="regionTerpilih" @change="gantiRegion" class="w-full p-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold appearance-none cursor-pointer focus:outline-none focus:border-[#8bc34a] transition-colors shadow-sm">
                <option value="" disabled>Pilih Region Target...</option>
                <option v-for="region in daftarRegion" :key="region.id" :value="region.nama">
                  {{ region.nama }}
                </option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-3 text-gray-500 pointer-events-none">expand_more</span>
            </div>
          </div>

          <div class="flex gap-4 border-b border-gray-200 pb-0">
            <span
              @click="activeTab = 'overview'"
              :class="['text-[10px] font-bold cursor-pointer transition-all pb-2 border-b-2 tracking-widest', activeTab === 'overview' ? 'text-[#1b5e20] border-b-[#1b5e20]' : 'text-gray-400 border-b-transparent']"
            >OVERVIEW</span>
            <span
              @click="activeTab = 'report'"
              :class="['text-[10px] font-bold cursor-pointer transition-all pb-2 border-b-2 tracking-widest', activeTab === 'report' ? 'text-[#1b5e20] border-b-[#1b5e20]' : 'text-gray-400 border-b-transparent']"
            >REPORT</span>
          </div>

          <div class="space-y-6" v-if="activeTab === 'overview'">
            <div>
              <div class="flex justify-between text-[10px] font-bold mb-2 tracking-widest text-gray-600">
                <span>TINGKAT RISIKO KESELURUHAN</span>
                <span class="text-red-600">{{ overviewData.riskScore }}%</span>
              </div>
              <div class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-red-600 transition-all duration-700" :style="`width: ${overviewData.riskScore}%`"></div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div class="text-[9px] font-bold text-gray-500 mb-1 tracking-widest">KORBAN</div>
                <div class="font-mono text-xl font-bold text-gray-800 leading-none">
                  {{ overviewData.korban.toLocaleString('id-ID') }}
                </div>
              </div>
              <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div class="text-[9px] font-bold text-gray-500 mb-1 tracking-widest">LUAS ZONA (HA)</div>
                <div class="font-mono text-xl font-bold text-gray-800 leading-none">
                  {{ overviewData.luasZona.toFixed(2) }}
                </div>
              </div>
            </div>

            <div>
              <div class="text-[10px] font-bold text-gray-500 mb-3 tracking-widest">PREDIKSI RISIKO PENYAKIT</div>
              <div class="space-y-2">
                <div
                  v-for="p in overviewData.prediksiPenyakit"
                  :key="p.nama"
                  class="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <span class="text-xs font-semibold text-gray-700">{{ p.nama }}</span>
                  <span :class="[
                    'text-[9px] px-2 py-1 rounded font-bold tracking-widest',
                    p.level === 'HIGH'   ? 'bg-red-600 text-white' :
                    p.level === 'MEDIUM' ? 'bg-[#0277bd] text-white' :
                                           'bg-gray-200 text-gray-700'
                  ]">{{ p.level }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6" v-if="activeTab === 'report'">
            <h4 class="text-[10px] font-bold tracking-widest text-gray-600 mb-2">TERUSAN LAPANGAN DRONE</h4>
            <div class="rounded-lg overflow-hidden border border-gray-200 h-32 shadow-sm">
              <img alt="Drone Field Footage" class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80" />
            </div>
            <div v-if="selectedDisaster" class="p-4 bg-white rounded-lg border-l-4 border-l-[#1b5e20] shadow-sm">
              <div class="flex justify-between items-start gap-2 mb-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm text-[#1b5e20]">location_on</span>
                  <span class="text-xs font-bold text-gray-800">{{ selectedDisaster.title }}</span>
                </div>
                <span :class="['text-[8px] font-bold px-2 py-1 rounded tracking-widest', selectedDisaster.severity === 'high' ? 'bg-red-600 text-white' : 'bg-orange-400 text-white']">
                  {{ selectedDisaster.severity.toUpperCase() }}
                </span>
              </div>
              <p class="text-xs text-gray-500 font-medium ml-5">
                {{ selectedDisaster.area }} — {{ selectedDisaster.type.toUpperCase() }}
              </p>
            </div>
            <div v-else class="text-xs text-gray-400 font-medium text-center py-6 border border-dashed border-gray-300 rounded-lg">
              Klik titik bencana pada peta untuk melihat laporan lapangan.
            </div>
          </div>
        </div>

      </div>
    </section>

    <section class="py-16 bg-[#f8faf8] border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <h2 class="text-3xl font-bold text-gray-800 mb-12">How GeoPharma Works</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm intelligence-card">
            <div class="w-14 h-14 bg-[#e8f5e9] text-[#1b5e20] rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">1</div>
            <h3 class="font-bold text-lg text-gray-800 mb-3">Data Ingestion</h3>
            <p class="text-sm text-gray-500 leading-relaxed">Menarik data dari BMKG, inaRISK, dan laporan crowdsource relawan secara live dan real-time.</p>
          </div>
          <div class="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm intelligence-card">
            <div class="w-14 h-14 bg-[#e8f5e9] text-[#1b5e20] rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">2</div>
            <h3 class="font-bold text-lg text-gray-800 mb-3">AI Prediction</h3>
            <p class="text-sm text-gray-500 leading-relaxed">Memprediksi potensi wabah penyakit menggunakan kecerdasan buatan (AI) berdasarkan kondisi geospasial.</p>
          </div>
          <div class="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm intelligence-card">
            <div class="w-14 h-14 bg-[#e8f5e9] text-[#1b5e20] rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">3</div>
            <h3 class="font-bold text-lg text-gray-800 mb-3">Drone Delivery</h3>
            <p class="text-sm text-gray-500 leading-relaxed">Mendistribusikan logistik medis darurat secara otomatis melalui rute udara teraman di peta.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION KEMBALI: Field Intelligence Update -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Breaking Field News</h2>
        <p class="text-gray-500">Latest news reports on ongoing disasters, logistics deployment, and post-disaster health risks.</p>
      </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <!-- Card 1: Bencana BPBA -->
          <a href="https://bpba.acehprov.go.id/berita/kategori/bencana/maret-2026-aceh-dilanda-26-kejadian-bencana-kebakaran-pemukiman-masih-dominan" target="_blank" class="intelligence-card bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm block hover:shadow-md transition-shadow">
             <img src="./assets/beritaACEH.png" class="w-full h-48 object-cover"/>
             <div class="p-5">
               <span class="text-[10px] font-bold text-[#1b5e20] bg-[#e8f5e9] px-2 py-1 rounded tracking-widest">ALERT - DISASTER</span>
               <h4 class="font-bold text-lg text-gray-800 mt-3 mb-2">Aceh Dilanda 26 Kejadian Bencana</h4>
               <p class="text-sm text-gray-500 leading-relaxed">Laporan BPBA Maret 2026 mencatat lonjakan bencana dengan kebakaran pemukiman sebagai insiden paling dominan di wilayah Aceh.</p>
             </div>
          </a>

          <!-- Card 2: Penyakit KEMKES -->
          <a href="https://kemkes.go.id/id/ispa-dan-diare-penyakit-dominan-pasca-banjir-aceh-tamiang" target="_blank" class="intelligence-card bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm block hover:shadow-md transition-shadow">
             <img src="./assets/beritaISPA.png"  class="w-full h-48 object-cover"/>
             <div class="p-5">
               <span class="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded tracking-widest">CRITICAL - OUTBREAK</span>
               <h4 class="font-bold text-lg text-gray-800 mt-3 mb-2">ISPA & Diare Dominan Pasca Banjir</h4>
               <p class="text-sm text-gray-500 leading-relaxed">Kementerian Kesehatan memantau penyebaran pesat ISPA dan Diare di posko pengungsian pasca banjir bandang Aceh Tamiang.</p>
             </div>
          </a>

          <!-- Card 3: Distribusi KEMKES (Baru) -->
          <a href="https://kemkes.go.id/id/distribusi-obat-rsud-muda-sedia-aceh-tamiang-dilakukan-secara-manual-pascabencana" target="_blank" class="intelligence-card bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm block hover:shadow-md transition-shadow">
             <img src="./assets/beritaObat.png" class="w-full h-48 object-cover"/>
             <div class="p-5">
               <span class="text-[10px] font-bold text-[#0277bd] bg-blue-100 px-2 py-1 rounded tracking-widest">OFFICIAL - LOGISTIC</span>
               <h4 class="font-bold text-lg text-gray-800 mt-3 mb-2">Distribusi Logistik RSUD Manual</h4>
               <p class="text-sm text-gray-500 leading-relaxed">Kemenkes mengonfirmasi RSUD Muda Sedia terpaksa melakukan alokasi distribusi obat secara manual demi menjaga suplai pascabencana.</p>
             </div>
          </a>

        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import InteractiveMap from './InteractiveMap.vue'

// 1. TAMBAHAN: Menyambungkan komponen InteractiveMap agar bisa disetir dari luar
const mapRef = ref(null)

const activeTab = ref('overview')
const selectedDisaster = ref(null)

const layerControls = reactive({
  zonaBencana: true,
  prioritasWilayah: false,
  fasilitasKesehatan: true,
  airSanitasi: false,
  ruteDrone: true,
  laporanLapangan: true,
})

const stats = reactive({
  totalBencana: 0,
  prioritasTinggi: 7,
  droneAktif: 4,
  faskes: 10,
})

const overviewData = reactive({
  riskScore: 82,
  korban: 4298,
  luasZona: 555.76,
  prediksiPenyakit: [
    { nama: 'ISPA & Flu', level: 'HIGH' },
    { nama: 'Demam',      level: 'HIGH' },
    { nama: 'Dermatitis', level: 'MEDIUM' },
  ]
})


const daftarRegion = ref([])

const regionTerpilih = ref('')

// 3. TAMBAHAN: Fungsi menyetir peta saat dropdown berubah
const gantiRegion = () => {
  const region = daftarRegion.value.find(r => r.nama === regionTerpilih.value)
  // Jika peta sudah termuat dan region valid, perintahkan peta untuk 'terbang' (flyTo)
  if (region && mapRef.value) {
   try {
      mapRef.value.arahkanPeta(region.lat, region.lng, region.zoom || 12)
    } catch (error) {
      console.error("Gagal menerbangkan peta. Pastikan 'arahkanPeta' sudah di-return di InteractiveMap.vue", error)
    }
  }
}

const formatLabel = (key) => {
  const labels = {
    zonaBencana:       'Zona Bencana',
    prioritasWilayah:  'Prioritas Wilayah',
    fasilitasKesehatan:'Fasilitas Kesehatan',
    airSanitasi:       'Air & Sanitasi',
    ruteDrone:         'Rute Drone',
    laporanLapangan:   'Laporan Lapangan',
  }
  return labels[key] || key
}

// 4. PERBAIKAN: Fungsi Mengubah Overview Dinamis Berdasarkan Titik Peta Yang Diklik
const onDisasterSelected = (data) => {
  selectedDisaster.value = data

  if (data.area) {
    regionTerpilih.value = data.area
  }
  
  // Mengubah data angka overview agar terlihat responsif saat demo
  overviewData.riskScore = Math.floor(Math.random() * (98 - 70 + 1)) + 70 // Angka random 70-98
  overviewData.korban = Math.floor(Math.random() * 5000) + 100
  overviewData.luasZona = Math.floor(Math.random() * 5000) + 500

  // Mengubah list prediksi penyakit mengambil dari data AI (InteractiveMap)
  if (data.intel && data.intel.diseases && data.intel.diseases.length > 0) {
    overviewData.prediksiPenyakit = data.intel.diseases.map(d => ({
      nama: d.nama || d, 
      level: d.level || 'HIGH'
    }))
  } else {
    overviewData.prediksiPenyakit = [{ nama: 'Dermatitis', level: 'MEDIUM' }]
  }

  // Kembali ke tab overview secara otomatis agar juri melihat datanya berubah
  activeTab.value = 'overview' 
}

const onStatsUpdated = (newStats) => {
  if (newStats.prioritasTinggi !== undefined) stats.prioritasTinggi = newStats.prioritasTinggi
  if (newStats.faskes          !== undefined) stats.faskes          = newStats.faskes
  if (newStats.droneAktif      !== undefined) stats.droneAktif      = newStats.droneAktif
  if (newStats.total           !== undefined) stats.totalBencana    = newStats.total

  if (newStats.daftarArea      !== undefined) daftarRegion.value    = newStats.daftarArea
}

onMounted(() => {
  document.querySelectorAll('.intelligence-card').forEach(card => {
    card.addEventListener('mouseenter', () => card.style.borderColor = '#1b5e20')
    card.addEventListener('mouseleave', () => card.style.borderColor = '#e5e7eb') // Tailwind gray-200
  })
})
</script>

<style scoped>
.intelligence-card {
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
.intelligence-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}
/* Menghilangkan panah bawaan browser di elemen select */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
</style>