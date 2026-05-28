<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4">
      <!-- Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Smart Relief Allocation System</h1>
        <p class="text-gray-600">Automated supplies and emergency management</p>
      </div>

      <!-- Request Supplies Button -->
      <div class="mb-6">
        <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          ✓ Request Supplies
        </button>
      </div>

      <!-- Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-sm text-gray-600 mb-2">Total Supplies</div>
          <div class="text-3xl font-bold text-blue-600 mb-2">{{ smartReliefData.metrics.totalSupplies }}</div>
          <div class="text-sm text-gray-500">Units available</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-sm text-gray-600 mb-2">Critical Items</div>
          <div class="text-3xl font-bold text-red-600 mb-2">{{ smartReliefData.metrics.criticalItems }}</div>
          <div class="text-sm text-red-500">Requiring immediate restock</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-sm text-gray-600 mb-2">Active Deliveries</div>
          <div class="text-3xl font-bold text-green-600 mb-2">{{ smartReliefData.metrics.activeDeliveries }}</div>
          <div class="text-sm text-gray-500">In transit</div>
        </div>
      </div>

      <!-- Supply Distribution Chart -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Supply Distribution</h2>
          <div class="relative h-72">
            <canvas ref="supplyChartCanvas"></canvas>
          </div>
        </div>

        <!-- Supply Legend -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Distribution Breakdown</h2>
          <div class="space-y-4">
            <div v-for="item in smartReliefData.supplyDistribution" :key="item.name" class="flex items-center justify-between">
              <span class="text-gray-700">{{ item.name }}</span>
              <span class="text-lg font-bold text-gray-900">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Status Table -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Inventory Status</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Item</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">In Stock</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Demand</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in smartReliefData.inventory" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-gray-900">{{ item.item }}</td>
                <td class="px-6 py-4 text-gray-700">{{ item.inStock }} units</td>
                <td class="px-6 py-4 text-gray-700">{{ item.demand }} units</td>
                <td class="px-6 py-4">
                  <span :class="getStatusClass(item.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <button :class="getActionClass(item.action)" class="px-4 py-2 rounded text-white text-sm font-medium hover:opacity-90 transition">
                    {{ item.action }}
                  </button>
                </td>
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
import { smartReliefData } from './assets/dummyData'

export default defineComponent({
  name: 'SmartReliefAllocation',
  data() {
    return {
      smartReliefData,
      chart: null
    }
  },
  mounted() {
    this.drawChart()
  },
  methods: {
    drawChart() {
      const canvas = this.$refs.supplyChartCanvas
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
      
      const data = this.smartReliefData.supplyDistribution
      const maxValue = Math.max(...data.map(d => d.value))
      const barWidth = canvas.width / data.length
      const padding = 40
      const chartHeight = canvas.height - padding * 2

      // Draw bars
      data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * chartHeight
        const x = index * barWidth + 20
        const y = canvas.height - padding - barHeight

        ctx.fillStyle = colors[index % colors.length]
        ctx.fillRect(x, y, barWidth - 40, barHeight)

        // Label
        ctx.fillStyle = '#374151'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(item.name, x + (barWidth - 40) / 2, canvas.height - 15)
      })
    },
    getStatusClass(status) {
      const classes = {
        'Low': 'bg-red-100 text-red-800',
        'Safe': 'bg-green-100 text-green-800',
        'Charge': 'bg-yellow-100 text-yellow-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    },
    getActionClass(action) {
      return action === 'Restock' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
    }
  }
})
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}
</style>
