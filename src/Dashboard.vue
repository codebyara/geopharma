<template>
  <div class="dashboard-page flex flex-col min-h-screen bg-gray-50">
    
    <section class="relative w-full h-[85vh] bg-gray-200 shadow-inner z-0">
      
      <InteractiveMap 
        ref="mapComponent"
        class="w-full h-full z-0"
        :active-layers="layerControls"
        theme="light"
        @stats-updated="onStatsUpdated"
      />

      <div class="absolute top-6 left-6 z-[1000] w-64 flex flex-col gap-4">
        <div class="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl p-5 border border-gray-100">
          <h3 class="font-bold text-gray-800 mb-4 border-b pb-2 text-xs tracking-widest uppercase">Kontrol Layer</h3>
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
      </div>

      <div class="absolute top-6 right-6 z-[1000] flex flex-col items-end gap-4">
        <button @click="showReportModal = true" class="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-xl shadow-xl flex items-center gap-2 transition-transform transform hover:scale-105 border-2 border-white">
          <span>📝</span> Submit Field Report
        </button>
      </div>
    </section>

   <section class="flex-grow container mx-auto px-4 py-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
        Live Monitoring & Statistics
      </h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- BAGIAN KIRI: 6 KARTU STATISTIK UTAMA (Ubah menjadi col-span-8 agar muat) -->
        <div class="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-blue-500 hover:shadow-md transition">
            <div>
              <p class="text-sm text-gray-500 font-medium">Total Insiden Aktif</p>
              <p class="text-3xl font-bold text-blue-600 mt-1">{{ stats.total }}</p>
            </div>
            <div class="p-3 bg-blue-50 rounded-full text-blue-500 text-xl">🚨</div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-red-500 hover:shadow-md transition">
            <div>
              <p class="text-sm text-gray-500 font-medium">Prioritas Tinggi</p>
              <p class="text-3xl font-bold text-red-600 mt-1">{{ stats.prioritasTinggi }}</p>
            </div>
            <div class="p-3 bg-red-50 rounded-full text-red-500 text-xl">⚠️</div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-green-500 hover:shadow-md transition">
            <div>
              <p class="text-sm text-gray-500 font-medium">Fasilitas Medis</p>
              <p class="text-3xl font-bold text-green-600 mt-1">{{ stats.faskes }}</p>
            </div>
            <div class="p-3 bg-green-50 rounded-full text-green-500 text-xl">🏥</div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-gray-700 hover:shadow-md transition">
            <div>
              <p class="text-sm text-gray-500 font-medium">Drone Mengudara</p>
              <p class="text-3xl font-bold text-gray-700 mt-1">{{ stats.droneAktif }}</p>
            </div>
            <div class="p-3 bg-gray-100 rounded-full text-gray-700 text-xl">🚁</div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-orange-500 hover:shadow-md transition">
            <div>
              <p class="text-sm text-gray-500 font-medium">Estimasi Korban</p>
              <p class="text-3xl font-bold text-orange-600 mt-1">{{ stats.korban }} <span class="text-sm font-normal text-gray-400">jiwa</span></p>
            </div>
            <div class="p-3 bg-orange-50 rounded-full text-orange-500 text-xl">🤕</div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-purple-500 hover:shadow-md transition">
            <div>
              <p class="text-sm text-gray-500 font-medium">Luas Terdampak</p>
              <p class="text-3xl font-bold text-purple-600 mt-1">{{ stats.luasZona }} <span class="text-sm font-normal text-gray-400">Ha</span></p>
            </div>
            <div class="p-3 bg-purple-50 rounded-full text-purple-500 text-xl">📏</div>
          </div>
        </div>

        <!-- BAGIAN KANAN: TABEL MINI WILAYAH TERDAMPAK -->
        <div class="col-span-12 lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          
          <div class="bg-gray-50 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 class="font-bold text-gray-700 text-sm">📍 Pemantauan Lokasi (Logistik Medis)</h3>
            <span class="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{{ stats.daftarArea.length }} Area</span>
          </div>
          
          <!-- Isi tabelnya sekarang masuk dengan benar ke dalam div tabel mini -->
          <!-- Area Tabel Mini (Scrollable) -->
          <div class="flex-grow p-0 overflow-y-auto max-h-[220px]">
            <table class="w-full text-left text-sm text-gray-600">
              <tbody class="divide-y divide-gray-100">
                
                <tr v-for="area in stats.daftarArea" :key="area.id" 
                    class="transition-all duration-300"
                    :class="lokasiAktif.lat === area.lat && lokasiAktif.lng === area.lng ? 'bg-green-100 border-l-4 border-green-500' : 'hover:bg-gray-50'">
                  
                  <td class="px-5 py-3 font-medium" 
                      :class="lokasiAktif.lat === area.lat && lokasiAktif.lng === area.lng ? 'text-green-800' : 'text-gray-800'">
                    {{ area.nama }}
                  </td>
                  
                  <td class="px-5 py-3 text-right">
                    <button @click="terbangKeLokasi(area.lat, area.lng)" 
                            class="text-xs font-bold px-3 py-1 rounded-full transition-transform hover:scale-105 active:scale-95"
                            :class="lokasiAktif.lat === area.lat && lokasiAktif.lng === area.lng ? 'bg-green-600 text-white shadow-md' : 'text-green-600 bg-green-100 hover:text-green-800'">
                      {{ lokasiAktif.lat === area.lat && lokasiAktif.lng === area.lng ? '📍 Sedang Ditinjau' : 'Tinjau Area' }}
                    </button>
                  </td>
                  
                </tr>

                <tr v-if="stats.daftarArea.length === 0">
                  <td colspan="2" class="px-5 py-6 text-center text-gray-400 text-xs">Belum ada data wilayah terdampak.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="stats.daftarArea.length > 5" class="bg-gray-50 px-5 py-2 border-t border-gray-100 text-center">
            <span class="text-xs text-gray-500 cursor-pointer hover:text-green-600 font-medium">+ {{ stats.daftarArea.length - 5 }} area lainnya</span>
          </div>

        </div> <!-- Akhir dari pembungkus Tabel Mini -->

      </div>
    </section>

    <div v-if="showReportModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex justify-center items-center p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div class="bg-green-700 p-4 flex justify-between items-center text-white shrink-0">
          <h3 class="font-bold text-lg">Submit Field Report</h3>
          <button @click="showReportModal = false" class="text-white hover:text-gray-200 text-2xl leading-none">×</button>
        </div>
        
        <div class="p-6 overflow-y-auto">
          <div class="space-y-4">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="mb-4">
                <label class="text-xs font-semibold text-gray-600 mb-1 block">Foto Bukti Lapangan</label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition relative">
                  <div v-if="imagePreview" class="relative w-full h-32 mb-2 rounded overflow-hidden">
                    <img :src="imagePreview" class="w-full h-full object-cover" />
                    <button @click.prevent="hapusGambar" class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">✕</button>
                  </div>
                  
                  <div v-else>
                    <div class="text-3xl mb-2">📸</div>
                    <p class="text-xs text-gray-500 mb-2">Klik untuk memilih foto (Max 5MB)</p>
                  </div>
                  
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    @change="handleFileUpload" 
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    :disabled="imagePreview !== null"
                  />
                </div>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-600 mb-1 block">Judul Laporan (Title)</label>
                <input v-model="form.title" placeholder="Cth: Banjir Bandang Sektor 4" class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-600 mb-1 block">Jenis Bencana (Disaster Type)</label>
                <select v-model="form.disaster_type" class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="flood">Banjir (Flood)</option>
                  <option value="earthquake">Gempa (Earthquake)</option>
                  <option value="landslide">Longsor (Landslide)</option>
                  <option value="fire">Kebakaran (Fire)</option>
                  <option value="wind">Angin Kencang (Wind)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-gray-600 mb-1 block">Nama Wilayah (Area Name)</label>
                <input v-model="form.area_name" placeholder="Cth: Kec. Jebres, Surakarta" class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div class="flex gap-2">
                <div class="w-1/2">
                  <label class="text-xs font-semibold text-gray-600 mb-1 block">Latitude</label>
                  <input v-model="form.latitude" type="number" step="any" placeholder="-7.556" class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div class="w-1/2">
                  <label class="text-xs font-semibold text-gray-600 mb-1 block">Longitude</label>
                  <input v-model="form.longitude" type="number" step="any" placeholder="110.831" class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="text-xs font-semibold text-gray-600 mb-1 block">Keparahan (Severity)</label>
                <select v-model="form.severity" class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-600 mb-1 block">Korban (Casualties)</label>
                <input v-model="form.casualties" type="number" placeholder="0" class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-600 mb-1 block">Luas (Area HA)</label>
                <input v-model="form.affected_area" type="number" placeholder="0.0" class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
            </div>

            <div>
              <label class="text-xs font-semibold text-gray-600 mb-1 block">Kebutuhan Medis Darurat (Medical Needs - JSON format info)</label>
              <textarea v-model="form.medical_needs_text" placeholder="Format: Nama Obat - Jumlah - Satuan (Baris Baru)&#10;Contoh:&#10;Paracetamol - 100 - Strip&#10;Masker N95 - 50 - Box" class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" rows="3"></textarea>
            </div>
            
          </div>
        </div>

        <div class="p-4 border-t shrink-0">
          <button @click="submitReport" class="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2">
            Kirim Laporan ke Database
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import InteractiveMap from './InteractiveMap.vue'
// Pastikan kamu mengimport Supabase klien jika ingin memproses form ini
import { supabase } from './services/supabase.js'


const showReportModal = ref(false)
const mapComponent = ref(null)

const imageFile = ref(null)
const imagePreview = ref(null)

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file) // Membuat link preview sementara
  }
}

// Fungsi Menghapus Gambar dari Preview
const hapusGambar = () => {
  imageFile.value = null
  imagePreview.value = null
}
// State Layer sama persis dengan di InteractiveMap dan Landing.vue
const layerControls = reactive({
  zonaBencana: true,
  prioritasWilayah: false,
  fasilitasKesehatan: true,
  airSanitasi: false,
  ruteDrone: true,
  laporanLapangan: true,
})

// State untuk menampung lemparan data statistik dari InteractiveMap
const stats = reactive({
  total: 0,
  prioritasTinggi: 0,
  faskes: 0,
  droneAktif: 0,

  korban: 0,
  luasZona: 0,
  daftarArea: []
})

// Form State sesuai schema database
const form = reactive({
  title: '',
  disaster_type: 'flood',
  area_name: '',
  latitude: null,
  longitude: null,
  severity: 'medium',
  casualties: 0,
  affected_area: 0,
  medical_needs_text: '' // Akan diparsing jadi JSON sebelum dikirim
})

// Label Helper
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

// Fungsi menangkap update dari InteractiveMap (Otomatis)
const onStatsUpdated = (newStats) => {
  stats.total = newStats.total || 0
  stats.prioritasTinggi = newStats.prioritasTinggi || 0
  stats.faskes = newStats.faskes || 0
  stats.droneAktif = newStats.droneAktif || 0

  stats.korban = newStats.korban || 0
  stats.luasZona = newStats.luasZona || 0
  stats.daftarArea = newStats.daftarArea || []
}

// Tambahkan variabel ini untuk mengingat titik mana yang sedang diklik
const lokasiAktif = ref({ lat: null, lng: null });

const terbangKeLokasi = (lat, lng) => {
  // Simpan koordinat ke variabel aktif
  lokasiAktif.value = { lat, lng };

  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (mapComponent.value) {
    mapComponent.value.arahkanPeta(lat, lng, 12); 
  }
}

// Fungsi Submit
const submitReport = async () => {
  // Simulasi parsing text area menjadi JSON array (Bisa disesuaikan dengan logikamu)
  let parsedMedicalNeeds = []
  if (form.medical_needs_text) {
    const lines = form.medical_needs_text.split('\n')
    lines.forEach(line => {
      const parts = line.split('-')
      if(parts.length === 3) {
        parsedMedicalNeeds.push({
          name: parts[0].trim(),
          qty: parseInt(parts[1].trim()) || 0,
          unit: parts[2].trim()
        })
      }
    })
  }

  let finalImageUrl = null;

  // 2. PROSES UPLOAD GAMBAR KE SUPABASE STORAGE (Jika ada)
  if (imageFile.value) {
    const fileExt = imageFile.value.name.split('.').pop()
    const fileName = `disaster_${Date.now()}.${fileExt}` // Membuat nama unik

    // Upload ke bucket 'disaster-images'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('disasters_images')
      .upload(fileName, imageFile.value)

    if (uploadError) {
      alert("Gagal mengunggah gambar: " + uploadError.message)
      return; // Hentikan proses jika gambar gagal diunggah
    }

    // Mengambil URL Publik dari gambar yang baru diunggah
    const { data: { publicUrl } } = supabase.storage
      .from('disasters_images')
      .getPublicUrl(fileName)
      
    finalImageUrl = publicUrl;
  }

  const getGeoPharmaIntel = (disasterType) => {
    const intel = { diseases: [] }
    switch (disasterType) {
      case 'flood':
        intel.diseases = ['Diare', 'Leptospirosis', 'Dermatitis', 'ISPA'];
        break;
      case 'earthquake':
      case 'tsunami':
      case 'landslide': // Termasuk dari form
        intel.diseases = ['Trauma Fisik', 'Infeksi Luka', 'Tetanus'];
        break;
      case 'volcano':
      case 'wind':
      case 'fire':      // Termasuk dari form
      case 'haze':
        intel.diseases = ['ISPA Akut', 'Iritasi Mata', 'Asma'];
        break;
      default:
        intel.diseases = ['Demam', 'Flu', 'Kelelahan'];
    }
    return intel;
  }

  // Panggil fungsi intel tersebut
  const intelData = getGeoPharmaIntel(form.disaster_type);

  const dataToSubmit = {
    created_at: new Date().toISOString(),
    title: form.title,
    disaster_type: form.disaster_type,
    area_name: form.area_name,
    latitude: parseFloat(form.latitude),
    longitude: parseFloat(form.longitude),
    severity: form.severity,
    casualties: parseInt(form.casualties),
    affected_area: parseFloat(form.affected_area),
    medical_needs: parsedMedicalNeeds,
    // Field di bawah digenerate backend/sistem:
    risk_score: 85, 
    fulfillment_pct: 0,
    disease_predictions: intelData.diseases.map(d => ({ nama: d, level: 'HIGH' })),
    image_url: finalImageUrl
  }

  // 4. KIRIM KE TABEL DISASTERS
  const { error } = await supabase.from('disasters').insert([dataToSubmit])
  
  if (error) {
    alert("Gagal mengirim laporan: " + error.message)
  } else {
    alert('Laporan & Foto berhasil dikirim ke sistem!')
    showReportModal.value = false 
    
    // Reset Form & Gambar
    form.title = ''
    form.area_name = ''
    form.medical_needs_text = ''
    hapusGambar()
    
    // Refresh Peta Otomatis
    if (mapComponent.value) {
      mapComponent.value.loadData()
    }
  }
}
</script>

<style scoped>
/* Reset Z-Index khusus untuk InteractiveMap di halaman ini */
:deep(.interactive-map-wrapper) {
  border-radius: 0 !important;
  border: none !important;
}
</style>