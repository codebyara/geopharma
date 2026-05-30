<template>
  <div class="bg-gray-50 min-h-screen py-8 font-sans">
    <div class="container mx-auto px-4 max-w-7xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Drone Tracking System</h1>
        <p class="text-gray-600">Pemantauan real-time armada pengiriman logistik medis Zipline</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <div class="text-sm text-gray-600 font-semibold mb-1 uppercase tracking-wider">Sedang Terbang</div>
          <div class="text-3xl font-bold text-blue-600">{{ metrics.active }}</div>
          <div class="text-xs text-gray-500 mt-1 flex items-center gap-1"><span class="animate-pulse">🟢</span> Active Missions</div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-gray-700">
          <div class="text-sm text-gray-600 font-semibold mb-1 uppercase tracking-wider">Total Armada</div>
          <div class="text-3xl font-bold text-gray-700">{{ metrics.total }}</div>
          <div class="text-xs text-gray-500 mt-1">Zipline Units di Hub</div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
          <div class="text-sm text-gray-600 font-semibold mb-1 uppercase tracking-wider">Maintenance</div>
          <div class="text-3xl font-bold text-orange-600">{{ metrics.maintenance }}</div>
          <div class="text-xs text-gray-500 mt-1">Dalam Perawatan</div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <div class="text-sm text-gray-600 font-semibold mb-1 uppercase tracking-wider">Standby / Siap</div>
          <div class="text-3xl font-bold text-green-600">{{ metrics.idle }}</div>
          <div class="text-xs text-gray-500 mt-1">Siap Menerima Misi</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold text-gray-900 mb-4 flex justify-between items-center">
            <span>Live Feed Kargo Darat/Udara</span>
            <span v-if="activeDrone?.status === 'en_route'" class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold animate-pulse">LIVE RECORDING</span>
            <span v-else class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold">STANDBY</span>
          </h2>
          
          <div class="relative bg-[#0a110a] rounded-lg h-96 flex items-center justify-center overflow-hidden border border-gray-300 shadow-inner transition-colors duration-500">
            
            <template v-if="activeDrone?.status === 'en_route'">
              <div class="absolute inset-0 bg-gradient-to-br from-[#0d1f0d] to-black flex items-center justify-center">
                <div class="text-center opacity-80">
                  <div class="text-6xl mb-4 animate-bounce">🛩️</div>
                  <p class="text-green-500 font-mono text-xl tracking-widest">{{ activeDrone.drone_code }}</p>
                  <p class="text-green-600/70 font-mono text-sm mt-2">EN ROUTE TO TARGET</p>
                </div>
                
                <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwTTEwIDB2NDAiIHN0cm9rZT0icmdiYSgwLCAyNTUsIDAsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-30"></div>
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div class="w-16 h-16 border border-green-500 rounded-full relative">
                     <div class="absolute top-1/2 -left-4 w-4 h-[1px] bg-green-500"></div>
                     <div class="absolute top-1/2 -right-4 w-4 h-[1px] bg-green-500"></div>
                     <div class="absolute -top-4 left-1/2 w-[1px] h-4 bg-green-500"></div>
                     <div class="absolute -bottom-4 left-1/2 w-[1px] h-4 bg-green-500"></div>
                  </div>
                </div>
              </div>
              
              <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10 pointer-events-none">
                <div class="bg-black/80 backdrop-blur text-green-400 px-4 py-3 rounded border border-green-900/50 font-mono text-sm space-y-1">
                  <div>REC 🔴 BAT {{ activeDrone.current_battery || 0 }}% GPS AKTIF</div>
                  <div>ALT {{ activeDrone.current_altitude || 0 }}m • SPEED {{ activeDrone.current_speed || 0 }} km/h</div>
                </div>
                <div class="bg-black/80 backdrop-blur text-green-400 px-4 py-3 rounded border border-green-900/50 font-mono text-sm text-right">
                  <div>POS: {{ activeDrone.current_latitude?.toFixed(4) || 'N/A' }}, {{ activeDrone.current_longitude?.toFixed(4) || 'N/A' }}</div>
                  <div>TGT: {{ activeDrone.target_latitude?.toFixed(4) || 'N/A' }}, {{ activeDrone.target_longitude?.toFixed(4) || 'N/A' }}</div>
                  <div class="mt-1 text-xs text-green-600">{{ feedTime }}</div>
                </div>
              </div>
            </template>

            <template v-else-if="activeDrone">
               <div class="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div class="text-center opacity-60">
                  <div class="text-6xl mb-4">🏢</div>
                  <p class="text-gray-400 font-mono text-xl tracking-widest">{{ activeDrone.drone_code }}</p>
                  <p class="text-gray-500 font-mono text-sm mt-2 uppercase">PARKED AT HUB • {{ activeDrone.status }}</p>
                  <p class="text-gray-600 font-mono text-xs mt-4 uppercase">BATTERY: {{ activeDrone.current_battery || 100 }}%</p>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-[#111]">
                <div class="text-5xl mb-4 opacity-50">📡</div>
                <p class="font-mono text-lg tracking-widest">SISTEM OFFLINE</p>
              </div>
            </template>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="font-bold text-gray-900 mb-4 border-b pb-2">Telemetri Utama</h3>
          
          <template v-if="activeDrone">
            <div class="space-y-5">
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Identitas</label>
                <p class="text-lg font-bold text-indigo-700">{{ activeDrone.drone_code }}</p>
              </div>

              <div>
                <div class="flex justify-between items-end mb-1">
                  <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kapasitas Baterai</label>
                  <span class="text-sm font-bold text-gray-700">{{ activeDrone.current_battery || 100 }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div :class="getBatteryClass(activeDrone.current_battery || 100)" class="h-2.5 rounded-full transition-all duration-1000" :style="{ width: (activeDrone.current_battery || 100) + '%' }"></div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ketinggian</label>
                  <p class="text-lg font-bold text-gray-900">{{ activeDrone.status === 'en_route' ? (activeDrone.current_altitude || 0) : 0 }} <span class="text-sm font-normal text-gray-500">mdpl</span></p>
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kecepatan</label>
                  <p class="text-lg font-bold text-gray-900">{{ activeDrone.status === 'en_route' ? (activeDrone.current_speed || 0) : 0 }} <span class="text-sm font-normal text-gray-500">km/j</span></p>
                </div>
              </div>

              <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                <label class="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">Muatan Logistik (Cargo)</label>
                <p class="text-sm font-bold text-indigo-900">{{ activeDrone.payload || 'Kosong' }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 class="text-lg font-bold text-gray-900">Status Hanggar & Seluruh Armada</h2>
          <span class="text-xs text-gray-500 font-medium">*Klik baris tabel untuk menyorot kamera ke drone tertentu.</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kode Drone</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status Misi</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Posisi Saat Ini</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Baterai</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="drone in drones" :key="drone.id" 
                  @click="selectDrone(drone.id)"
                  class="transition cursor-pointer"
                  :class="selectedDroneId === drone.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'">
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-bold text-gray-900 flex items-center gap-2">
                    {{ drone.drone_code }}
                    <span v-if="selectedDroneId === drone.id" class="text-indigo-500 text-xs text-bold">(Kamera Aktif)</span>
                  </div>
                  <div class="text-xs text-gray-500">Zipline Fixed-Wing</div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(drone.status)" class="px-3 py-1.5 rounded-md text-xs font-bold shadow-sm inline-flex items-center gap-1.5">
                    <span class="text-[10px]">{{ drone.status === 'en_route' ? '🟢' : (drone.status === 'maintenance' ? '🔧' : '⚪') }}</span>
                    {{ formatStatusText(drone.status) }}
                  </span>
                </td>
                
                <td class="px-6 py-4">
                  <div v-if="drone.status === 'en_route'" class="text-sm font-semibold text-blue-600">
                    Menuju: {{ drone.target_latitude?.toFixed(3) || '-' }}, {{ drone.target_longitude?.toFixed(3) || '-' }}
                  </div>
                  <div v-else class="text-sm text-gray-500 flex items-center gap-1">
                    <span>🏢</span> Hub Regional Semarang
                  </div>
                </td>
                
                <td class="px-6 py-4">
                   <div class="flex items-center gap-2">
                     <div class="w-16 bg-gray-200 rounded-full h-1.5">
                        <div :class="getBatteryClass(drone.current_battery || 100)" class="h-1.5 rounded-full" :style="{ width: (drone.current_battery || 100) + '%' }"></div>
                     </div>
                     <span class="text-xs font-bold text-gray-700">{{ drone.current_battery || 100 }}%</span>
                   </div>
                </td>
                
                <td class="px-6 py-4 text-right">
                  <button 
                    v-if="drone.status === 'en_route'"
                    @click.stop="completeMission(drone)"
                    class="px-4 py-2 bg-white border border-green-500 text-green-700 hover:bg-green-50 rounded shadow-sm text-xs font-bold transition flex items-center justify-end gap-1 ml-auto">
                    <span>↩️</span> Selesai (Tarik Pulang)
                  </button>
                  <span v-else class="text-xs text-gray-400 italic">Standby</span>
                </td>

              </tr>
              <tr v-if="drones.length === 0">
                 <td colspan="5" class="px-6 py-8 text-center text-gray-500">Mengambil data armada dari satelit...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { supabase } from './services/supabase.js'

export default defineComponent({
  name: 'DroneTracking',
  data() {
    return {
      drones: [],
      selectedDroneId: null, 
      feedTime: new Date().toLocaleTimeString('id-ID'),
      clockInterval: null,
      realtimeSubscription: null
    }
  },
  computed: {
    metrics() {
      const total = this.drones.length;
      const active = this.drones.filter(d => d.status === 'en_route').length;
      const maintenance = this.drones.filter(d => d.status === 'maintenance').length;
      const idle = this.drones.filter(d => d.status === 'idle').length;
      return { total, active, maintenance, idle };
    },
    
    activeDrone() {
      if (this.selectedDroneId) {
         const selected = this.drones.find(d => d.id === this.selectedDroneId);
         if (selected) return selected;
      }
      
      const flyingDrone = this.drones.find(d => d.status === 'en_route');
      if (flyingDrone) {
         this.selectedDroneId = flyingDrone.id; 
         return flyingDrone;
      }
      
      return this.drones.length > 0 ? this.drones[0] : null;
    }
  },
  async mounted() {
    await this.fetchDrones();
    this.setupRealtimeSubscription();
    // Interval ini HANYA untuk mengupdate jam live feed saja
    this.clockInterval = setInterval(this.updateClock, 1000);
  },
  beforeUnmount() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.realtimeSubscription) supabase.removeChannel(this.realtimeSubscription);
  },
  methods: {
    async fetchDrones() {
      try {
        const { data, error } = await supabase
          .from('drones')
          .select('*')
          .order('drone_code', { ascending: true });
          
        if (error) throw error;
        this.drones = data || [];
      } catch (err) {
        console.error("Gagal menarik data drone:", err.message);
      }
    },

    setupRealtimeSubscription() {
      // Fitur ini otomatis me-refresh tabel saat ada update dari drone sungguhan/emulator
      this.realtimeSubscription = supabase
        .channel('public:drones')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'drones' }, payload => {
          this.fetchDrones(); 
        })
        .subscribe();
    },

    selectDrone(droneId) {
        this.selectedDroneId = droneId;
    },

    async completeMission(drone) {
        try {
            await supabase.from('drones').update({
                status: 'idle',
                target_latitude: null,
                target_longitude: null,
                current_speed: 0,
                current_altitude: 0,
                current_battery: 100,
                payload: 'Kosong'
            }).eq('id', drone.id);
            
            alert(`Misi Selesai! Armada ${drone.drone_code} telah kembali ke Hub Regional.`);
            
        } catch (error) {
            console.error("Gagal menyelesaikan misi:", error.message);
        }
    },

    updateClock() {
      this.feedTime = new Date().toLocaleTimeString('id-ID');
      this.fetchDrones();
    },

    formatStatusText(status) {
      const texts = {
        'idle': 'Standby (Di Hub)',
        'en_route': 'Misi Aktif (Udara)',
        'maintenance': 'Dalam Perawatan'
      }
      return texts[status] || status;
    },

    getStatusBadgeClass(status) {
      const classes = {
        'en_route': 'bg-blue-50 text-blue-700 border border-blue-200',
        'idle': 'bg-green-50 text-green-700 border border-green-200',
        'maintenance': 'bg-orange-50 text-orange-700 border border-orange-200'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    },

    getBatteryClass(battery) {
      if (battery >= 60) return 'bg-green-500'
      if (battery >= 30) return 'bg-yellow-500'
      return 'bg-red-500'
    }
  }
})
</script>

<style scoped>
.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>