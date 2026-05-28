<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4">
      <!-- Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Drone Tracking System</h1>
        <p class="text-gray-600">Real-time monitoring of medical supply delivery drones</p>
      </div>

      <!-- Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-600 mb-1">Active Drones</div>
          <div class="text-3xl font-bold text-blue-600">{{ droneTrackingData.metrics.activeDrones }}</div>
          <div class="text-xs text-gray-500 mt-1">🟢 Active</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-600 mb-1">Total Fleet</div>
          <div class="text-3xl font-bold text-gray-700">{{ droneTrackingData.metrics.totalFleet }}</div>
          <div class="text-xs text-gray-500 mt-1">Units</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-600 mb-1">In Maintenance</div>
          <div class="text-3xl font-bold text-orange-600">{{ droneTrackingData.metrics.inMaintenance }}</div>
          <div class="text-xs text-gray-500 mt-1">Units</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-600 mb-1">Missions Done</div>
          <div class="text-3xl font-bold text-green-600">{{ droneTrackingData.metrics.missionsDone }}</div>
          <div class="text-xs text-gray-500 mt-1">Total</div>
        </div>
      </div>

      <!-- Live Drone Feed -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Video Feed -->
        <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Live Feed • {{ droneTrackingData.liveTrackingFeed.droneName }}</h2>
          <div class="relative bg-gray-900 rounded-lg h-96 flex items-center justify-center overflow-hidden">
            <!-- Mock video feed with overlay -->
            <div class="absolute inset-0 bg-gradient-to-br from-green-900 to-gray-900 flex items-center justify-center">
              <div class="text-center">
                <div class="text-6xl mb-4">🎥</div>
                <p class="text-green-400 font-mono text-lg">LIVE FEED • DRN-03</p>
              </div>
            </div>
            
            <!-- Video overlay stats -->
            <div class="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-3 rounded font-mono text-sm space-y-1 z-10">
              <div>REC 🔴 BAT {{ alphaBattery }}% GPS 3.582 N</div>
              <div>ALT {{ droneTrackingData.liveTrackingFeed.altitude }}m • ZOOM 3x SIG Strong</div>
              <div class="text-right">{{ droneTrackingData.liveTrackingFeed.speed }} km/h • {{ feedTime }}</div>
            </div>
          </div>
        </div>

        <!-- Drone Info -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">{{ droneTrackingData.liveTrackingFeed.droneName }}</h3>
          
          <div class="space-y-4">
            <div>
              <label class="text-sm text-gray-600">Battery</label>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div class="bg-green-500 h-2 rounded-full transition-all duration-500" :style="{ width: alphaBattery + '%' }"></div>
              </div>
              <span class="text-sm font-semibold text-gray-700 mt-1 block">{{ alphaBattery }}%</span>
            </div>

            <div>
              <label class="text-sm text-gray-600">Altitude</label>
              <p class="text-lg font-bold text-gray-900">{{ droneTrackingData.liveTrackingFeed.altitude }} m</p>
            </div>

            <div>
              <label class="text-sm text-gray-600">Destination</label>
              <p class="text-gray-800">Jakarta Raya</p>
            </div>

            <div>
              <label class="text-sm text-gray-600">Cargo</label>
              <p class="text-gray-800">Antibiotics & First Aid</p>
            </div>

            <div>
              <label class="text-sm text-gray-600">ETA</label>
              <p class="text-lg font-bold text-blue-600">15 min</p>
            </div>

            <div class="pt-4 border-t space-y-2">
              <div v-for="stat in droneTrackingData.liveTrackingFeed.stats" :key="stat.label" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ stat.label }}</span>
                <span class="font-semibold text-gray-900">{{ stat.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Drones Status Table -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-bold text-gray-900 mb-6">All Drones Status</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Battery</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Destination</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cargo</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">ETA</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="drone in droneTrackingData.fleetStatus" :key="drone.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="font-semibold text-gray-900">{{ drone.name }}</div>
                  <div class="text-xs text-gray-500">{{ drone.id }}</div>
                </td>
                <td class="px-6 py-4">
                  <span :class="getStatusClass(drone.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ drone.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div v-if="drone.battery !== null">
                    <div class="w-24 bg-gray-200 rounded-full h-1.5 mb-1 overflow-hidden">
                      <div :class="[getBatteryClass(drone.battery), 'h-1.5 rounded-full transition-all duration-500']" :style="{ width: drone.battery + '%' }"></div>
                    </div>
                    <span class="text-sm font-semibold">{{ drone.battery }}%</span>
                  </div>
                  <span v-else class="text-gray-500">N/A</span>
                </td>
                <td class="px-6 py-4 text-gray-700">{{ drone.destination }}</td>
                <td class="px-6 py-4 text-gray-700">{{ drone.cargo }}</td>
                <td class="px-6 py-4 text-gray-700">{{ drone.eta }}</td>
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
import { droneTrackingData } from './assets/dummyData'

export default defineComponent({
  name: 'DroneTracking',
  data() {
    return {
      droneTrackingData: JSON.parse(JSON.stringify(droneTrackingData)),
      feedTime: new Date().toLocaleTimeString('id-ID'),
      simulationInterval: null
    }
  },
  computed: {
    alphaBattery() {
      const alpha = this.droneTrackingData.fleetStatus.find(d => d.id === 'DRONE-001');
      return alpha ? alpha.battery : 0;
    }
  },
  mounted() {
    this.simulationInterval = setInterval(this.updateSimulation, 2000);
  },
  beforeUnmount() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
  },
  methods: {
    updateSimulation() {
      // Simulate Speed (40-60 km/h)
      this.droneTrackingData.liveTrackingFeed.speed = Math.floor(Math.random() * (60 - 40 + 1)) + 40;
      
      // Simulate Altitude (110-130 m)
      const alt = Math.floor(Math.random() * (130 - 110 + 1)) + 110;
      this.droneTrackingData.liveTrackingFeed.altitude = alt;
      if (this.droneTrackingData.liveTrackingFeed.stats && this.droneTrackingData.liveTrackingFeed.stats[0]) {
        this.droneTrackingData.liveTrackingFeed.stats[0].value = alt + ' m';
      }
      
      // Simulate Speed string in stats
      if (this.droneTrackingData.liveTrackingFeed.stats && this.droneTrackingData.liveTrackingFeed.stats[2]) {
        this.droneTrackingData.liveTrackingFeed.stats[2].value = (this.droneTrackingData.liveTrackingFeed.speed / 100).toFixed(2) + ' km/s';
      }

      // Simulate slight battery discharging for active drones and charging for charging drones
      this.droneTrackingData.fleetStatus.forEach(drone => {
        if (drone.status === 'Active' && drone.battery > 5 && Math.random() > 0.5) {
          drone.battery -= 1;
        } else if (drone.status === 'Charging' && drone.battery < 100) {
          drone.battery += 1;
          if (drone.battery === 100) drone.status = 'Idle';
        }
      });
      
      // Update the live clock
      this.feedTime = new Date().toLocaleTimeString('id-ID');
    },
    getStatusClass(status) {
      const classes = {
        'Active': 'bg-green-100 text-green-800',
        'Charging': 'bg-blue-100 text-blue-800',
        'Idle': 'bg-gray-100 text-gray-800',
        'Maintenance': 'bg-orange-100 text-orange-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    },
    getBatteryClass(battery) {
      if (battery >= 75) return 'bg-green-500'
      if (battery >= 50) return 'bg-blue-500'
      if (battery >= 25) return 'bg-yellow-500'
      return 'bg-red-500'
    }
  }
})
</script>

<style scoped>
table {
  font-size: 0.95rem;
}
</style>
