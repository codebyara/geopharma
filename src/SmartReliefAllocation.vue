<template>
  <div class="bg-gray-50 min-h-screen py-8 font-sans">
    <div class="container mx-auto px-4 max-w-7xl">
      
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-1">Smart Relief Allocation System</h1>
          <p class="text-gray-500">Sistem respons darurat dan distribusi bantuan otomatis berbasis AI</p>
        </div>
        <button 
          @click="approveAllRecommendations"
          :disabled="isProcessing"
          class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clip-rule="evenodd" />
          </svg>
          {{ isProcessing ? 'Memproses...' : 'Setujui & Distribusikan Semua' }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <h2 class="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wide">
            <span class="text-indigo-600 text-lg">👁️</span> Vision AI Analysis
          </h2>
          
          <div class="relative w-full h-40 bg-gray-900 rounded-lg overflow-hidden mb-4 border border-gray-200">
            <img v-if="activeDisaster?.image_url" :src="activeDisaster.image_url" class="w-full h-full object-cover opacity-90" alt="Foto Lapangan" />
            <div v-else class="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
              <span class="text-2xl mb-1">📷</span>
              <span>Menunggu Data Visual...</span>
            </div>
            
            <div class="absolute inset-0 bg-indigo-500/10 border-t-2 border-indigo-400 animate-scan"></div>
          </div>
          
          <div :class="isInfrastructureBroken ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'" class="p-3 rounded-lg border text-xs font-bold flex items-start gap-2 mt-auto">
            <span class="text-lg leading-none mt-0.5">{{ isInfrastructureBroken ? '🚨' : '✅' }}</span>
            <div>
              <div class="uppercase tracking-wider mb-1">{{ isInfrastructureBroken ? 'Akses Darat Terputus' : 'Akses Jalan Terbuka' }}</div>
              <div class="font-normal opacity-90">{{ isInfrastructureBroken ? 'Infrastruktur rusak. Prioritas medis dialihkan ke armada Zipline.' : 'Jalur darat aman dilalui armada truk logistik.' }}</div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
            <div class="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Tingkat Keparahan</div>
            <div class="text-2xl font-bold text-gray-900 capitalize">{{ activeDisaster?.severity || '-' }}</div>
            <div class="text-sm text-gray-500 mt-1 truncate">{{ activeDisaster?.title }} - {{ activeDisaster?.area_name }}</div>
          </div>
          <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-orange-500">
            <div class="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Korban Terdampak</div>
            <div class="text-2xl font-bold text-gray-900">{{ activeDisaster?.casualties?.toLocaleString() || 0 }}</div>
            <div class="text-sm text-gray-500 mt-1">Area Terdampak: {{ activeDisaster?.affected_area || 0 }} km²</div>
          </div>
          <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-purple-500 overflow-y-auto">
            <div class="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Prediksi Risiko Penyakit</div>
            <div class="flex flex-wrap gap-2 mt-2">
              <span v-for="(disease, index) in activeDisaster?.disease_predictions" :key="index" 
                      class="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-md">
                  {{ disease.nama }}: {{ disease.level }}
                </span>
            </div>
          </div>
          <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
            <div class="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Kesiapan Alokasi</div>
            <div class="text-2xl font-bold text-gray-900">{{ activeDisaster?.fulfillment_pct || 0 }}%</div>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" :style="`width: ${activeDisaster?.fulfillment_pct || 0}%`"></div>
            </div>
          </div>
        </div>

      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div class="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Rekomendasi Distribusi AI</h2>
            <p class="text-sm text-gray-500 mt-1">Dihitung otomatis berdasarkan kondisi lingkungan, penyakit, dan armada yang tersedia di Hub.</p>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Prioritas</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item Bantuan</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Metode Armada</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rekomendasi</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in aiRecommendations" :key="item.id" class="hover:bg-blue-50/30 transition">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getPriorityClass(item.priority)" class="px-2 py-1 rounded text-xs font-bold">
                    {{ item.priority }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="font-semibold text-gray-900">{{ item.item_name }}</div>
                  <div class="text-xs text-gray-500">{{ item.category }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div :class="item.armada.includes('Zipline') ? 'bg-blue-50 text-blue-700 border-blue-200' : (item.armada.includes('Menunggu') ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-700 border-gray-200')" class="px-3 py-1.5 rounded-md text-xs font-bold border inline-flex items-center gap-1.5 shadow-sm">
                    <span class="text-sm">{{ item.armada.includes('Zipline') ? '🚁' : (item.armada.includes('Menunggu') ? '⏳' : '🚚') }}</span>
                    {{ item.armada }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="font-bold text-gray-900 mb-1">{{ item.recommended_qty.toLocaleString() }} unit</div>
                  <div class="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                    <span class="font-semibold text-indigo-600">AI:</span> {{ item.justification }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button 
                    v-if="item.status === 'Menunggu Persetujuan'"
                    @click="approveSingleItem(item.id)"
                    class="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded shadow-sm text-sm font-medium hover:bg-indigo-50 transition">
                    Setujui & Kirim
                  </button>
                  <span v-else-if="item.status === 'Stok Kurang'" class="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-md flex items-center gap-1 w-max border border-red-200 shadow-sm">
                    ⚠️ Stok Tidak Cukup
                  </span>
                  <span v-else class="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full flex items-center gap-1 w-max">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    Dikirim
                  </span>
                </td>
              </tr>
              <tr v-if="aiRecommendations.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">Belum ada rekomendasi analisis untuk wilayah ini.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100" v-if="computedDistribution.length > 0">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Rencana Distribusi Bantuan</h2>
        <div class="space-y-5">
          <div v-for="dist in computedDistribution" :key="dist.name" class="relative">
            <div class="flex justify-between text-sm mb-1">
              <span class="font-semibold text-gray-700">{{ dist.name }}</span>
              <span class="font-bold text-gray-900">{{ dist.value.toLocaleString() }} unit</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-3">
              <div :class="`h-3 rounded-full ${dist.color}`" :style="`width: ${dist.percentage}%`"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { supabase } from './services/supabase.js'

export default defineComponent({
  name: 'SmartReliefAllocation',
  data() {
    return {
      isLoading: true,
      isProcessing: false,
      activeDisaster: null,
      aiRecommendations: [],
      availableDrones: [], 
      realtimeSubscription: null,
      inventorySubscription: null // Memori untuk radar inventaris
    }
  },
  computed: {
    isInfrastructureBroken() {
      if (!this.activeDisaster) return false;
      const type = (this.activeDisaster.disaster_type || '').toLowerCase();
      const sev = (this.activeDisaster.severity || '').toLowerCase();
      return (['flood', 'landslide', 'earthquake', 'tsunami'].includes(type) && ['high', 'critical'].includes(sev));
    },

    computedDistribution() {
      if (!this.aiRecommendations.length) return [];
      const colors = {
        "Air & Sanitasi": "bg-blue-500",
        "Obat-obatan": "bg-red-500",
        "Makanan": "bg-green-500",
        "Peralatan / Tempat Berlindung": "bg-purple-500"
      };

      let totalItems = 0;
      const grouped = this.aiRecommendations.reduce((acc, item) => {
        const category = item.category || "Lainnya";
        if (!acc[category]) acc[category] = 0;
        acc[category] += item.recommended_qty;
        totalItems += item.recommended_qty;
        return acc;
      }, {});

      return Object.keys(grouped).map(key => ({
        name: key,
        value: grouped[key],
        percentage: totalItems > 0 ? (grouped[key] / totalItems) * 100 : 0,
        color: colors[key] || "bg-gray-500"
      })).sort((a, b) => b.value - a.value); 
    }
  },
  async mounted() {
    await this.fetchLatestDisasterAndRecommendations();
    this.setupRealtimeSubscription();
    this.setupInventoryRealtime(); // Nyalakan Radar Stok
  },
  beforeUnmount() {
    if (this.realtimeSubscription) supabase.removeChannel(this.realtimeSubscription);
    if (this.inventorySubscription) supabase.removeChannel(this.inventorySubscription); // Matikan Radar Stok
  },
  methods: {
    async fetchLatestDisasterAndRecommendations() {
      this.isLoading = true;
      try {
        const { data: drones } = await supabase.from('drones').select('*').eq('status', 'idle');
        this.availableDrones = drones || [];

        const queryId = this.$route.query.id; 
        let query = supabase.from('disasters').select('*');
        
        if (queryId) {
          query = query.eq('id', queryId).single();
        } else {
          query = query.order('created_at', { ascending: false }).limit(1);
        }

        const { data, error } = await query;
        if (error) throw error;

        const disasterData = queryId ? data : (data && data.length > 0 ? data[0] : null);

        if (disasterData) {
          this.activeDisaster = disasterData;
          await this.fetchRecommendations(this.activeDisaster.id);
        } else {
          this.activeDisaster = null;
        }
      } catch (error) {
        console.error("Gagal memuat data:", error.message);
        this.activeDisaster = null;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchRecommendations(disasterId) {
      try {
        const { data, error } = await supabase
          .from('relief_recommendations')
          // UPDATE KUNCI: Tarik juga stock_quantity terbaru dari gudang
          .select(`id, inventory_id, recommended_qty, priority, justification, status, inventories (item_name, category, stock_quantity)`)
          .eq('disaster_id', disasterId);

        if (error) throw error;

        if (data.length === 0) {
          await this.generateSimulatedAIRecommendations(disasterId);
        } else {
          // CEK & KOREKSI STATUS OTOMATIS BERDASARKAN STOK TERBARU GUDANG
          const updatedData = await Promise.all(data.map(async (item) => {
            let currentStatus = item.status;
            let currentStock = item.inventories.stock_quantity;

            // Jika awalnya kurang tapi stok sudah di-update menjadi cukup
            if (currentStatus === 'Stok Kurang' && currentStock >= item.recommended_qty) {
                currentStatus = 'Menunggu Persetujuan';
                await supabase.from('relief_recommendations').update({ status: currentStatus }).eq('id', item.id);
            } 
            // Jika awalnya cukup tapi stok tiba-tiba berkurang
            else if (currentStatus === 'Menunggu Persetujuan' && currentStock < item.recommended_qty) {
                currentStatus = 'Stok Kurang';
                await supabase.from('relief_recommendations').update({ status: currentStatus }).eq('id', item.id);
            }

            return { ...item, status: currentStatus };
          }));

          this.aiRecommendations = updatedData.map(item => {
            const armadaInfo = this.determineArmada(item.priority, item.inventories.category);
            
            return {
              id: item.id,
              inventory_id: item.inventory_id,
              item_name: item.inventories.item_name,
              category: item.inventories.category,
              recommended_qty: item.recommended_qty,
              priority: item.priority,
              justification: item.justification,
              status: item.status, // Status yang sudah dikoreksi Real-time
              armada: armadaInfo.text,
              assigned_drone: armadaInfo.drone 
            }
          });
        }
      } catch (error) {
        console.error("Gagal mengambil rekomendasi:", error.message);
      }
    },

    determineArmada(priority, category) {
        const isMedical = category.toLowerCase().includes('obat');
        
        if (this.isInfrastructureBroken && isMedical) {
            if (this.availableDrones.length > 0) {
                const selectedDrone = this.availableDrones.shift(); 
                return { 
                  text: `Zipline (${selectedDrone.drone_code})`, 
                  drone: selectedDrone 
                };
            } else {
                return { text: 'Menunggu Drone Available', drone: null };
            }
        }
        
        if (this.isInfrastructureBroken && !isMedical) {
            return { text: 'Truk Off-Road / Heli BNPB', drone: null };
        }

        return { text: 'Truk Logistik Darat', drone: null };
    },
    
    setupRealtimeSubscription() {
      this.realtimeSubscription = supabase
        .channel('public:disasters')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'disasters' }, payload => {
          if (!this.$route.query.id) { 
             this.activeDisaster = payload.new;
             this.generateSimulatedAIRecommendations(payload.new.id);
          }
        })
        .subscribe();
    },

    // FUNGSI BARU: RADAR INVENTARIS REAL-TIME
    setupInventoryRealtime() {
      this.inventorySubscription = supabase
        .channel('public:inventories-tracker')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'inventories' }, payload => {
           console.log("Stok Inventaris Berubah! Mengevaluasi ulang ketersediaan AI...");
           if (this.activeDisaster) {
               this.fetchRecommendations(this.activeDisaster.id);
           }
        })
        .subscribe();
    },

    async generateSimulatedAIRecommendations(disasterId) {
      const { data: invData } = await supabase.from('inventories').select('*');
      if (!invData || invData.length === 0) return;

      const newRecommendations = [];
      const type = this.activeDisaster.disaster_type?.toLowerCase() || 'unknown';
      const casualties = this.activeDisaster.casualties || 0;
      const diseases = this.activeDisaster.disease_predictions || [];

      const specificNeeds = this.activeDisaster.medical_needs || [];

      if (specificNeeds.length > 0) {
        specificNeeds.forEach(need => {
          const invItem = invData.find(i => i.item_name.toLowerCase().includes(need.name.toLowerCase()));
          
          if (invItem) {
             let qty = need.qty; 
             let justifikasi = `Sesuai permintaan spesifik dari lapangan (${need.qty} ${need.unit}).`;
             
             const hasOutbreakRisk = diseases.some(d => ['Diare', 'Kolera', 'Infeksi Kulit', 'Leptospirosis'].includes(d.nama));
             if (hasOutbreakRisk) {
                qty += 500; 
                justifikasi = `Potensi wabah terdeteksi! Kebutuhan spesifik (${need.qty}) ditambah ekstra 500 unit oleh AI.`;
             }
             newRecommendations.push(this.createRecObject(disasterId, invItem, qty, 'KRITIS', justifikasi));
          }
        });
      }

      const getInv = (categoryStr) => invData.find(i => i.category && i.category.toLowerCase().includes(categoryStr));
      
      const waterInv = getInv('air'); 
      const foodInv = getInv('makanan'); 
      const shelterInv = getInv('peralatan');

      if (specificNeeds.length === 0) {
        const medInv = getInv('obat'); 
        if (medInv) {
          let medQty = casualties * 2; 
          let justifikasi = `Berdasarkan estimasi ${casualties} korban (Standar WHO).`;
          const hasOutbreakRisk = diseases.some(d => ['Diare', 'Kolera', 'Infeksi Kulit', 'Leptospirosis'].includes(d.nama));
          if (hasOutbreakRisk) {
             medQty += 1000; 
             justifikasi = `Potensi wabah terdeteksi! Sistem otomatis menambah kuota ekstra 1.000 unit.`;
          }
          newRecommendations.push(this.createRecObject(disasterId, medInv, medQty, 'KRITIS', justifikasi));
        }
      }

      if (waterInv) {
         let priority = type.includes('flood') ? 'KRITIS' : 'TINGGI';
         let waterQty = casualties * 5; 
         let justifikasi = `Air bersih darurat (Rasio 5 unit/korban).`;
         newRecommendations.push(this.createRecObject(disasterId, waterInv, waterQty, priority, justifikasi));
      }

      if (shelterInv) {
         let priority = type.includes('earthquake') ? 'KRITIS' : 'SEDANG';
         let shelterQty = Math.ceil(casualties / 4); 
         let justifikasi = `Penyediaan tempat berlindung (1 Tenda untuk 4 orang).`;
         newRecommendations.push(this.createRecObject(disasterId, shelterInv, shelterQty, priority, justifikasi));
      }

      if (foodInv) {
         let foodQty = casualties * 3; 
         let justifikasi = `Standar logistik pangan dasar (3 ransum per korban).`;
         newRecommendations.push(this.createRecObject(disasterId, foodInv, foodQty, 'TINGGI', justifikasi));
      }

      if (newRecommendations.length > 0) {
        await supabase.from('relief_recommendations').insert(newRecommendations);
        await this.fetchRecommendations(disasterId);
      }
    },

    createRecObject(disasterId, inventory, calculatedQty, priority, justification) {
      let status = 'Menunggu Persetujuan';
      let finalJustification = justification;

      if (inventory.stock_quantity < calculatedQty) {
         status = 'Stok Kurang';
         finalJustification += ` ⚠️ PERINGATAN: Stok di Hub tinggal ${inventory.stock_quantity.toLocaleString()}. Ajukan bantuan ke pusat!`;
      }

      return {
        disaster_id: disasterId,
        inventory_id: inventory.id,
        recommended_qty: calculatedQty,
        priority: priority,
        justification: finalJustification,
        status: status
      };
    },
          
    getPriorityClass(priority) {
      const classes = {
        'KRITIS': 'bg-red-100 text-red-800 border border-red-200',
        'TINGGI': 'bg-orange-100 text-orange-800 border border-orange-200',
        'SEDANG': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        'RENDAH': 'bg-green-100 text-green-800 border border-green-200'
      }
      return classes[priority] || 'bg-gray-100 text-gray-800'
    },
    
    async approveSingleItem(id) {
        const itemIndex = this.aiRecommendations.findIndex(r => r.id === id);
        if (itemIndex > -1) {
            const item = this.aiRecommendations[itemIndex];

            await supabase.from('relief_recommendations').update({ status: 'Sedang Dikirim' }).eq('id', id);

            if (item.assigned_drone) {
                await supabase.from('drones').update({
                    status: 'en_route',
                    target_latitude: this.activeDisaster.latitude,
                    target_longitude: this.activeDisaster.longitude,
                    payload: `${item.recommended_qty.toLocaleString()} unit ${item.item_name}` 
                }).eq('id', item.assigned_drone.id);
            }

            const { data: invData } = await supabase.from('inventories')
              .select('stock_quantity')
              .eq('id', item.inventory_id)
              .single();
              
            if (invData) {
                const sisaStok = invData.stock_quantity - item.recommended_qty;
                await supabase.from('inventories')
                  .update({ stock_quantity: sisaStok })
                  .eq('id', item.inventory_id);
            }

            this.aiRecommendations[itemIndex].status = 'Sedang Dikirim';
            this.updateFulfillmentPercentage();
        }
    },

    async approveAllRecommendations() {
      this.isProcessing = true;
      try {
        const pendingItems = this.aiRecommendations.filter(item => item.status === 'Menunggu Persetujuan');

        for (const item of pendingItems) {
            if (item.assigned_drone) {
                await supabase.from('drones').update({
                    status: 'en_route',
                    target_latitude: this.activeDisaster.latitude,
                    target_longitude: this.activeDisaster.longitude,
                    payload: `${item.recommended_qty.toLocaleString()} unit ${item.item_name}`
                }).eq('id', item.assigned_drone.id);
            }
            const { data: invData } = await supabase.from('inventories')
              .select('stock_quantity')
              .eq('id', item.inventory_id)
              .single();
              
            if (invData) {
                const sisaStok = invData.stock_quantity - item.recommended_qty;
                await supabase.from('inventories')
                  .update({ stock_quantity: sisaStok })
                  .eq('id', item.inventory_id);
            }
        }

        await supabase.from('relief_recommendations')
        .update({ status: 'Sedang Dikirim' })
        .eq('disaster_id', this.activeDisaster.id)
        .eq('status', 'Menunggu Persetujuan'); 
        
        this.aiRecommendations.forEach(item => {
          if (item.status === 'Menunggu Persetujuan') item.status = 'Sedang Dikirim';
        });
        
        this.updateFulfillmentPercentage();
      } finally {
        this.isProcessing = false;
      }
    },

    updateFulfillmentPercentage() {
      const approvedCount = this.aiRecommendations.filter(r => r.status === 'Sedang Dikirim').length;
      const totalCount = this.aiRecommendations.length;
      this.activeDisaster.fulfillment_pct = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
    }
  }
})
</script>

<style scoped>
@keyframes scan {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
.animate-scan {
  animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  box-shadow: 0 0 15px 5px rgba(99, 102, 241, 0.3);
}
</style>