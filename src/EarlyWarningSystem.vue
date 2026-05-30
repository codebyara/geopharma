<template>
  <div class="bg-gray-50 min-h-screen py-8 font-sans">
    <div class="container mx-auto px-4 max-w-7xl">
      
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Early Warning Outbreak System</h1>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div v-for="disease in liveCaseCounts" :key="disease.id" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div class="absolute right-0 top-0 w-16 h-16 bg-gradient-to-bl opacity-10 rounded-bl-full" :style="`background-color: ${disease.color}`"></div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-3xl">{{ disease.icon }}</span>
              <span class="font-bold flex items-center gap-1" :class="disease.currentCases > 0 ? 'text-red-600' : 'text-green-600'">
                <svg v-if="disease.currentCases > 0" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"></path></svg>
                {{ disease.currentCases > 0 ? 'Aktif' : 'Aman' }}
              </span>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">{{ disease.disease }}</h3>
            <div class="text-3xl font-bold text-gray-900 mb-1">{{ disease.currentCases }}</div>
            <p class="text-xs text-gray-500">Total estimasi kasus berisiko</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-6 mb-4 bg-white py-3 px-6 rounded-xl shadow-sm border border-gray-100">
          <span class="text-sm font-bold text-gray-500 uppercase tracking-wider mr-2">Indikator Penyakit:</span>
          <div v-for="disease in liveCaseCounts" :key="'legend-'+disease.id" class="flex items-center gap-2">
            <span class="w-3.5 h-3.5 rounded-full" :style="`background-color: ${disease.color}`"></span>
            <span class="text-sm font-semibold text-gray-700">{{ disease.disease }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 mb-4">📈 Timeline Pertumbuhan Kasus</h2>
            <div class="relative h-80 w-full"><canvas ref="diseaseChartCanvas"></canvas></div>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 mb-4">📍 Distribusi Kasus per Wilayah</h2>
            <div class="relative h-80 w-full"><canvas ref="spatialChartCanvas"></canvas></div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="text-xl">🔬</span> Environmental Analysis Engine
              </h2>
            </div>
            <div class="p-5">
              <div v-if="environmentalAlerts.length === 0" class="text-center py-8 text-gray-500">
                Lingkungan stabil. Tidak ada korelasi wabah pasca-bencana terdeteksi.
              </div>
              <div class="space-y-4">
                <div v-for="(alert, index) in environmentalAlerts" :key="index" class="p-4 rounded-lg border flex gap-4 items-start bg-red-50 border-red-200">
                  <div class="text-3xl mt-1">{{ alert.icon }}</div>
                  <div class="flex-1">
                    <div class="flex justify-between items-start mb-1">
                      <h3 class="font-bold text-red-800">{{ alert.title }}</h3>
                      <span class="text-xs font-bold px-2 py-1 rounded uppercase bg-red-200 text-red-900">CRITICAL OUTBREAK</span>
                    </div>
                    <p class="text-sm mb-2 text-red-700">{{ alert.description }}</p>
                    <div class="text-xs font-semibold px-2 py-1 bg-white/60 rounded inline-block text-red-800">
                      📍 Lokasi Pemicu: {{ alert.location }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div class="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="text-xl">📡</span> Intervention Alerts
              </h2>
            </div>
            <div class="p-5 flex-1 flex flex-col">
              <p class="text-sm text-gray-600 mb-4">Sistem otomatis mengirimkan data spasial ke otoritas kesehatan untuk intervensi dini.</p>
              <div class="space-y-3 mb-6 flex-1 overflow-y-auto max-h-40">
                <div v-if="alertLogs.length === 0" class="text-xs text-gray-400 text-center italic mt-4">Belum ada peringatan yang dikirim.</div>
                <div v-for="log in alertLogs" :key="log.id" class="flex items-center gap-3 text-sm border-l-2 pl-3 py-1 border-green-500">
                  <div class="w-2 h-2 rounded-full bg-green-500"></div>
                  <div class="flex-1">
                    <div class="font-semibold text-gray-800">{{ log.authority }}</div>
                    <div class="text-[10px] text-gray-500">{{ log.time }} - {{ log.topic }}</div>
                  </div>
                </div>
              </div>
              <button @click="broadcastAlerts" :disabled="isBroadcasting || environmentalAlerts.length === 0 || hasSentAlerts"
                      class="w-full py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      :class="(environmentalAlerts.length === 0 || hasSentAlerts) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'">
                <template v-if="hasSentAlerts"><svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Terkirim</template>
                <template v-else-if="!isBroadcasting">Kirim Peringatan Dini</template>
                <template v-else><div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Mengirim Data...</template>
              </button>
            </div>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { supabase } from './services/supabase.js'

export default defineComponent({
  name: 'EarlyWarningSystem',
  data() {
    return {
      isLoading: true, isBroadcasting: false, hasSentAlerts: false,
      rawDisasters: [], rawSanitation: [], liveCaseCounts: [],
      trendData: [], spatialData: [], environmentalAlerts: [], alertLogs: [],
      chartColors: { dengue: '#ef4444', leptospirosis: '#f97316', gastroenteritis: '#06b6d4', respiratoryInfection: '#eab308' }
    }
  },
  async mounted() {
    await this.fetchData();
    this.processData();
    this.analyzeEnvironment();
    this.$nextTick(() => { 
      setTimeout(() => {
        this.drawDiseaseChart(); 
        this.drawSpatialBarChart(); 
      }, 100); // Memberi jeda kecil agar DOM selesai merender dimensi
    });
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.drawDiseaseChart();
      this.drawSpatialBarChart();
    },

    async fetchData() {
      this.isLoading = true;
      try {
        const { data: disasters } = await supabase.from('disasters').select('*').order('created_at', { ascending: true });
        this.rawDisasters = disasters || [];
        const { data: sanitation } = await supabase.from('water_sanitation').select('*');
        this.rawSanitation = sanitation || [];
      } catch (error) {
        console.error("Gagal menarik data:", error);
      } finally {
        this.isLoading = false;
      }
    },

    processData() {
      const dateGroups = {};
      const locationGroups = {};
      let totalCounts = { dengue: 0, leptospirosis: 0, gastroenteritis: 0, respiratoryInfection: 0 };

      this.rawDisasters.forEach(d => {
        const dateStr = new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (!dateGroups[dateStr]) dateGroups[dateStr] = { ...totalCounts };

        // Agregasi Spasial (Ambil Provinsi saja)
        let fullLoc = d.area_name || 'Zona Bencana';
        let regionName = fullLoc.includes(',') ? fullLoc.split(',').pop().trim() : (fullLoc.length > 15 ? fullLoc.substring(0, 15) + '..' : fullLoc);
        
        if (!locationGroups[regionName]) {
          locationGroups[regionName] = { location: regionName, dengue: 0, leptospirosis: 0, gastroenteritis: 0, respiratoryInfection: 0 };
        }

        const victims = d.casualties || 10;
        d.disease_predictions?.forEach(dp => {
          const name = dp.nama.toLowerCase();
          let addDengue = 0, addLepto = 0, addGastro = 0, addResp = 0;
          if (name.includes('diare') || name.includes('kolera')) addGastro = Math.floor(victims * 1.5);
          if (name.includes('lepto')) addLepto = Math.floor(victims * 0.8);
          if (name.includes('ispa') || name.includes('asma')) addResp = Math.floor(victims * 2);
          if (name.includes('kulit') || name.includes('dbd') || name.includes('dermatitis')) addDengue = Math.floor(victims * 1.2);

          totalCounts.gastroenteritis += addGastro; totalCounts.leptospirosis += addLepto; totalCounts.respiratoryInfection += addResp; totalCounts.dengue += addDengue;
          dateGroups[dateStr].gastroenteritis += addGastro; dateGroups[dateStr].leptospirosis += addLepto; dateGroups[dateStr].respiratoryInfection += addResp; dateGroups[dateStr].dengue += addDengue;
          locationGroups[regionName].gastroenteritis += addGastro; locationGroups[regionName].leptospirosis += addLepto; locationGroups[regionName].respiratoryInfection += addResp; locationGroups[regionName].dengue += addDengue;
        });
      });

      this.liveCaseCounts = [
        { id: 'dengue', disease: 'Dengue Fever / Kulit', icon: '🔴', currentCases: totalCounts.dengue, color: this.chartColors.dengue },
        { id: 'leptospirosis', disease: 'Leptospirosis', icon: '🟠', currentCases: totalCounts.leptospirosis, color: this.chartColors.leptospirosis },
        { id: 'gastroenteritis', disease: 'Diarrhea / Cholera', icon: '🔵', currentCases: totalCounts.gastroenteritis, color: this.chartColors.gastroenteritis },
        { id: 'respiratoryInfection', disease: 'Respiratory Infection', icon: '🟡', currentCases: totalCounts.respiratoryInfection, color: this.chartColors.respiratoryInfection }
      ];

      const dates = Object.keys(dateGroups);
      if (dates.length === 0) this.trendData = []; 
      else if (dates.length === 1) this.trendData = [{ week: 'Sebelumnya', dengue: 0, leptospirosis: 0, gastroenteritis: 0, respiratoryInfection: 0 }, { week: dates[0], ...dateGroups[dates[0]] }];
      else this.trendData = dates.map(d => ({ week: d, ...dateGroups[d] }));

      this.spatialData = Object.values(locationGroups);
    },

    analyzeEnvironment() {
      const alerts = [];
      const floods = this.rawDisasters.filter(d => ['flood', 'tsunami'].includes(d.disaster_type));
      const badSanitation = this.rawSanitation.filter(s => s.status === 'contaminated' || s.is_drought);
      if (floods.length > 0 && badSanitation.length > 0) {
        alerts.push({ icon: '☣️', title: 'Gastroenteritis Outbreak Predicted', description: `Banjir berkepanjangan terdeteksi bersamaan dengan fasilitas sanitasi yang tercemar. Analisis spasial mengindikasikan potensi tinggi wabah diare/kolera. Intervensi logistik medis segera diperlukan.`, location: floods[0].area_name || 'Zona Bencana' });
      }
      this.environmentalAlerts = alerts;
    },

    broadcastAlerts() {
      this.isBroadcasting = true;
      setTimeout(() => {
        const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        this.environmentalAlerts.forEach((alert, index) => {
          this.alertLogs.unshift({ id: Date.now() + index, authority: 'Dinas Kesehatan Prov. / BPBD', topic: `Alert Wabah: ${alert.location}`, time: timeString, status: 'Sent' });
        });
        this.isBroadcasting = false; this.hasSentAlerts = true; 
      }, 1500);
    },

    drawDiseaseChart() {
      const canvas = this.$refs.diseaseChartCanvas;
      if (!canvas || this.trendData.length === 0) return;

      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width === 0) return; // Mencegah error jika div belum muncul sempurna

      const dpr = window.devicePixelRatio || 1; 
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const width = rect.width, height = rect.height;
      const paddingLeft = 40, paddingRight = 20, paddingTop = 20, paddingBottom = 40;
      
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);

      // PENCEGAHAN BUG INFINITY:
      const maxVal = this.trendData.length > 0 ? Math.max(...this.trendData.map(d => Math.max(d.dengue, d.leptospirosis, d.gastroenteritis, d.respiratoryInfection))) : 0;
      const maxValue = maxVal > 0 ? maxVal * 1.2 : 100;

      ctx.fillStyle = '#9ca3af'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = paddingTop + (height - paddingBottom - paddingTop) * (1 - i / 5);
        ctx.fillText(Math.round(maxValue * (i / 5)), paddingLeft - 8, y);
        ctx.strokeStyle = '#f3f4f6'; ctx.beginPath(); ctx.moveTo(paddingLeft, y); ctx.lineTo(width - paddingRight, y); ctx.stroke();
      }

      const diseases = ['dengue', 'leptospirosis', 'gastroenteritis', 'respiratoryInfection'];
      diseases.forEach(disease => {
        ctx.strokeStyle = this.chartColors[disease]; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath();
        this.trendData.forEach((point, index) => {
          const x = paddingLeft + (width - paddingLeft - paddingRight) * (index / (this.trendData.length - 1));
          const y = height - paddingBottom - (point[disease] / maxValue) * (height - paddingBottom - paddingTop);
          if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });

      ctx.fillStyle = '#6b7280'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
      this.trendData.forEach((point, index) => {
        const x = paddingLeft + (width - paddingLeft - paddingRight) * (index / (this.trendData.length - 1));
        ctx.fillText(point.week, x, height - 10);
      });
    },

    drawSpatialBarChart() {
      const canvas = this.$refs.spatialChartCanvas;
      if (!canvas || this.spatialData.length === 0) return;

      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width === 0) return;

      const dpr = window.devicePixelRatio || 1; 
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const width = rect.width, height = rect.height;
      const paddingLeft = 40, paddingRight = 20, paddingTop = 20, paddingBottom = 70; // Ruang 70px untuk teks miring

      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);

      // PENCEGAHAN BUG INFINITY:
      const maxVal = this.spatialData.length > 0 ? Math.max(...this.spatialData.map(d => d.dengue + d.leptospirosis + d.gastroenteritis + d.respiratoryInfection)) : 0;
      const maxTotal = maxVal > 0 ? maxVal * 1.2 : 100;

      ctx.fillStyle = '#9ca3af'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = paddingTop + (height - paddingBottom - paddingTop) * (1 - i / 5);
        ctx.fillText(Math.round(maxTotal * (i / 5)), paddingLeft - 8, y);
        ctx.strokeStyle = '#f3f4f6'; ctx.beginPath(); ctx.moveTo(paddingLeft, y); ctx.lineTo(width - paddingRight, y); ctx.stroke();
      }

      const diseases = ['dengue', 'leptospirosis', 'gastroenteritis', 'respiratoryInfection'];
      const numBars = this.spatialData.length;
      const step = (width - paddingLeft - paddingRight) / numBars;
      const barWidth = Math.min(step * 0.6, 40); 

      this.spatialData.forEach((point, index) => {
        const centerX = paddingLeft + (index + 0.5) * step;
        const x = centerX - barWidth / 2;
        let currentY = height - paddingBottom;

        diseases.forEach(disease => {
          const val = point[disease];
          if (val > 0) {
            const barHeight = (val / maxTotal) * (height - paddingBottom - paddingTop);
            ctx.fillStyle = this.chartColors[disease];
            ctx.fillRect(x, currentY - barHeight, barWidth, barHeight);
            currentY -= barHeight; 
          }
        });

        // TULISAN MIRING 45 DERAJAT
        ctx.save();
        ctx.translate(centerX, height - paddingBottom + 12);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#6b7280'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText(point.location, 0, 0);
        ctx.restore();
      });
    }
  }
})
</script>

<style scoped>
canvas { display: block; }
</style>