<template>
  <div class="bg-gray-50 min-h-screen py-8 font-sans relative">
    <div class="container mx-auto px-4 max-w-7xl">
      
      <div class="mb-8 flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Manajemen Aset & Armada</h1>
          <p class="text-gray-600">Pusat kendali inventaris logistik dan status operasional Zipline</p>
        </div>
      </div>

      <div class="flex space-x-4 mb-6 border-b border-gray-200">
        <button 
          @click="activeTab = 'inventory'"
          :class="activeTab === 'inventory' ? 'border-b-2 border-green-700 text-green-700 font-bold' : 'text-gray-500 hover:text-gray-700 font-medium'"
          class="pb-3 px-4 transition-colors">
          📦 Gudang Logistik
        </button>
        <button 
          @click="activeTab = 'fleet'"
          :class="activeTab === 'fleet' ? 'border-b-2 border-green-700 text-green-700 font-bold' : 'text-gray-500 hover:text-gray-700 font-medium'"
          class="pb-3 px-4 transition-colors">
          🚁 Hanggar Armada
        </button>
      </div>

      <div v-if="activeTab === 'inventory'" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 class="text-lg font-bold text-gray-900">Daftar Stok Logistik</h2>
          <button @click="openModal('addInventory')" class="px-4 py-2 bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-green-800 transition">
            + Tambah Item Baru
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nama Item</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Kategori</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Jumlah Stok</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in inventories" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 font-semibold text-gray-900">{{ item.item_name }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ item.category }}</td>
                <td class="px-6 py-4 font-bold text-blue-600">{{ item.stock_quantity.toLocaleString() }}</td>
                <td class="px-6 py-4 text-right space-x-2">
                  <button @click="openModal('editStock', item)" class="text-xs font-bold text-orange-600 hover:text-orange-800 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded transition">Update Stok</button>
                  <button @click="deleteInventory(item.id)" class="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 border border-red-200 px-3 py-1.5 rounded transition">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'fleet'" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 class="text-lg font-bold text-gray-900">Daftar Unit Zipline</h2>
          <button @click="openModal('addDrone')" class="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition">
            + Tambah Unit Drone
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Kode Drone</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status Operasional</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="drone in drones" :key="drone.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 font-bold text-indigo-700">{{ drone.drone_code }}</td>
                <td class="px-6 py-4">
                  <span :class="getStatusClass(drone.status)" class="px-3 py-1.5 rounded-md text-xs font-bold shadow-sm">
                    {{ drone.status === 'maintenance' ? '🔧 Rusak / Perbaikan' : drone.status.toUpperCase() }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                  <button v-if="drone.status !== 'maintenance'" @click="setDroneStatus(drone.id, 'maintenance')" class="text-xs font-bold text-orange-600 hover:text-orange-800 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded transition">Tandai Rusak</button>
                  <button v-if="drone.status === 'maintenance'" @click="setDroneStatus(drone.id, 'idle')" class="text-xs font-bold text-green-600 hover:text-green-800 bg-green-50 border border-green-200 px-3 py-1.5 rounded transition">Perbaikan Selesai</button>
                  <button @click="deleteDrone(drone.id)" class="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 border border-red-200 px-3 py-1.5 rounded transition">Hapus Unit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900">{{ modalTitle }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-6 space-y-4">
          
          <template v-if="modalType === 'addInventory'">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Nama Item</label>
              <input v-model="formData.itemName" type="text" placeholder="Contoh: Salep Luka Bakar" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
              <select v-model="formData.category" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition">
                <option value="Obat">Obat-obatan</option>
                <option value="Air & Sanitasi">Air & Sanitasi</option>
                <option value="Makanan">Makanan</option>
                <option value="Peralatan / Tempat Berlindung">Peralatan & Tenda</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Stok Awal</label>
              <input v-model.number="formData.stock" type="number" min="0" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
            </div>
          </template>

          <template v-if="modalType === 'editStock'">
            <div class="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
              <p class="text-sm text-blue-800">Menyesuaikan stok untuk <strong>{{ selectedItem?.item_name }}</strong></p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Jumlah Stok Saat Ini</label>
              <input v-model.number="formData.stock" type="number" min="0" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-lg font-bold text-gray-900" />
            </div>
          </template>

          <template v-if="modalType === 'addDrone'">
            <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-4 flex gap-3 items-center">
              <span class="text-2xl">🚁</span>
              <p class="text-sm text-indigo-800">Unit baru akan otomatis ditempatkan di Hanggar Utama (Status: Standby).</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Kode Identitas Drone</label>
              <input v-model="formData.droneCode" type="text" placeholder="Contoh: ZIP-06 (Echo)" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-mono" />
            </div>
          </template>

        </div>

        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button @click="closeModal" class="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Batal
          </button>
          <button @click="submitModal" class="px-4 py-2 text-sm font-bold text-white rounded-lg transition shadow-sm" :class="submitButtonColor">
            Simpan Data
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { supabase } from './services/supabase.js' // Sesuaikan path jika berbeda

export default defineComponent({
  name: 'AssetManagement',
  data() {
    return {
      activeTab: 'inventory',
      inventories: [],
      drones: [],
      
      // State untuk Modal Custom
      isModalOpen: false,
      modalType: '', // 'addInventory', 'editStock', 'addDrone'
      selectedItem: null,
      formData: {
        itemName: '',
        category: 'Obat',
        stock: 0,
        droneCode: ''
      }
    }
  },
  computed: {
    modalTitle() {
      if (this.modalType === 'addInventory') return 'Tambah Logistik Baru';
      if (this.modalType === 'editStock') return 'Update Stok Barang';
      if (this.modalType === 'addDrone') return 'Registrasi Armada Baru';
      return '';
    },
    submitButtonColor() {
      if (this.modalType === 'addDrone') return 'bg-indigo-600 hover:bg-indigo-700';
      if (this.modalType === 'editStock') return 'bg-orange-600 hover:bg-orange-700';
      return 'bg-green-700 hover:bg-green-800'; // Default untuk Add Inventory
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      const { data: invData } = await supabase.from('inventories').select('*').order('created_at', { ascending: false });
      this.inventories = invData || [];

      const { data: droneData } = await supabase.from('drones').select('*').order('drone_code', { ascending: true });
      this.drones = droneData || [];
    },

    // --- MANAJEMEN MODAL ---
    openModal(type, item = null) {
      this.modalType = type;
      this.selectedItem = item;
      
      // Reset & Siapkan Form Data
      if (type === 'addInventory') {
        this.formData = { itemName: '', category: 'Obat', stock: 1000, droneCode: '' };
      } else if (type === 'editStock' && item) {
        this.formData.stock = item.stock_quantity;
      } else if (type === 'addDrone') {
        this.formData.droneCode = '';
      }
      
      this.isModalOpen = true;
    },
    
    closeModal() {
      this.isModalOpen = false;
      this.selectedItem = null;
    },

    async submitModal() {
      try {
        if (this.modalType === 'addInventory') {
          if (!this.formData.itemName) return alert('Nama item harus diisi!');
          await supabase.from('inventories').insert([{ 
            item_name: this.formData.itemName, 
            category: this.formData.category, 
            stock_quantity: this.formData.stock 
          }]);
        } 
        else if (this.modalType === 'editStock') {
          await supabase.from('inventories').update({ 
            stock_quantity: this.formData.stock 
          }).eq('id', this.selectedItem.id);
        } 
        else if (this.modalType === 'addDrone') {
          if (!this.formData.droneCode) return alert('Kode drone harus diisi!');
          await supabase.from('drones').insert([{ 
            drone_code: this.formData.droneCode, 
            status: 'idle', 
            current_battery: 100,
            current_latitude: -6.9932,
            current_longitude: 110.4203 
          }]);
        }
        
        this.closeModal();
        this.fetchData(); // Refresh tabel setelah sukses
      } catch (error) {
        console.error("Terjadi kesalahan:", error.message);
        alert("Gagal menyimpan data ke database.");
      }
    },

    // --- FUNGSI HAPUS & STATUS (Tetap Pakai Confirm Default untuk Keamanan) ---
    async deleteInventory(id) {
      if (confirm("⚠️ PERINGATAN! Apakah Anda yakin ingin menghapus barang ini secara permanen dari gudang?")) {
        await supabase.from('inventories').delete().eq('id', id);
        this.fetchData();
      }
    },

    async setDroneStatus(id, newStatus) {
      const message = newStatus === 'maintenance' 
        ? "Tandai drone ini sedang rusak? Drone tidak akan bisa dikirim oleh AI." 
        : "Tandai perbaikan selesai? Drone akan kembali standby.";
        
      if (confirm(message)) {
        await supabase.from('drones').update({ status: newStatus }).eq('id', id);
        this.fetchData();
      }
    },

    async deleteDrone(id) {
      if (confirm("⚠️ PERINGATAN! Yakin menghapus unit armada ini dari sistem?")) {
        await supabase.from('drones').delete().eq('id', id);
        this.fetchData();
      }
    },

    getStatusClass(status) {
      const classes = {
        'idle': 'bg-green-100 text-green-800 border border-green-200',
        'en_route': 'bg-blue-100 text-blue-800 border border-blue-200',
        'maintenance': 'bg-red-100 text-red-800 border border-red-200'
      };
      return classes[status] || 'bg-gray-100 text-gray-800';
    }
  }
})
</script>