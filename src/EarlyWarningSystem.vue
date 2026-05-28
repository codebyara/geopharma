<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4">
      <!-- Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Early Warning Outbreak System</h1>
        <p class="text-gray-600">Monitor disease progression and outbreak patterns over time</p>
      </div>

      <!-- Disease Spread Timeline Chart -->
      <div class="bg-white p-6 rounded-lg shadow mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Disease Spread Timeline</h2>
        <div class="relative h-80">
          <canvas ref="diseaseChartCanvas"></canvas>
        </div>
      </div>

      <!-- Case Count Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="disease in earlyWarningData.caseCounts" :key="disease.id" class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between mb-3">
            <span class="text-3xl">{{ disease.icon }}</span>
            <span :class="disease.trendType === 'up' ? 'text-red-600' : 'text-green-600'" class="font-bold">
              {{ disease.trend }}
            </span>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">{{ disease.disease }}</h3>
          <div class="text-3xl font-bold text-gray-900 mb-1">{{ disease.currentCases }}</div>
          <p class="text-sm text-gray-600">Current cases</p>
        </div>
      </div>

      <!-- Case Count Distribution Chart -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Case Count Distribution</h2>
        <div class="relative h-80">
          <canvas ref="caseChartCanvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { earlyWarningData } from './assets/dummyData'

export default defineComponent({
  name: 'EarlyWarningSystem',
  data() {
    return {
      earlyWarningData
    }
  },
  mounted() {
    this.drawDiseaseChart()
    this.drawCaseChart()
  },
  methods: {
    drawDiseaseChart() {
      const canvas = this.$refs.diseaseChartCanvas
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const data = this.earlyWarningData.diseaseSpreadTimeline
      const width = canvas.width
      const height = canvas.height
      const padding = 50
      const colors = {
        dengue: '#ef4444',
        leptospirosis: '#f97316',
        gastroenteritis: '#06b6d4',
        respiratoryInfection: '#eab308'
      }

      // Clear
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      // Draw grid and axes
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      for (let i = 0; i <= 10; i++) {
        const y = padding + (height - padding * 2) * (i / 10)
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()
      }

      // Draw lines for each disease
      const diseases = ['dengue', 'leptospirosis', 'gastroenteritis', 'respiratoryInfection']
      const maxValue = 150

      diseases.forEach(disease => {
        ctx.strokeStyle = colors[disease]
        ctx.lineWidth = 3
        ctx.beginPath()

        data.forEach((point, index) => {
          const x = padding + (width - padding * 2) * (index / (data.length - 1))
          const y = height - padding - (point[disease] / maxValue) * (height - padding * 2)
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.stroke()
      })

      // Draw axes labels
      ctx.fillStyle = '#374151'
      ctx.font = '12px Arial'
      data.forEach((point, index) => {
        const x = padding + (width - padding * 2) * (index / (data.length - 1))
        ctx.textAlign = 'center'
        ctx.fillText(point.week, x, height - 20)
      })
    },

    drawCaseChart() {
      const canvas = this.$refs.caseChartCanvas
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const data = this.earlyWarningData.caseCountDistribution
      const width = canvas.width
      const height = canvas.height
      const padding = 50
      const colors = {
        dengue: '#ef4444',
        leptospirosis: '#f97316',
        gastroenteritis: '#06b6d4',
        respiratoryInfection: '#eab308'
      }

      // Clear
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      // Draw stacked area
      const diseases = ['dengue', 'leptospirosis', 'gastroenteritis', 'respiratoryInfection']
      const maxTotal = 350

      diseases.forEach((disease, dIdx) => {
        ctx.fillStyle = colors[disease]
        ctx.beginPath()
        
        let prevY = height - padding

        data.forEach((point, index) => {
          const x = padding + (width - padding * 2) * (index / (data.length - 1))
          const sum = diseases.slice(0, dIdx + 1).reduce((acc, d) => acc + point[d], 0)
          const y = height - padding - (sum / maxTotal) * (height - padding * 2)

          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })

        // Draw back along bottom
        for (let i = data.length - 1; i >= 0; i--) {
          const x = padding + (width - padding * 2) * (i / (data.length - 1))
          const prevSum = diseases.slice(0, dIdx).reduce((acc, d) => acc + data[i][d], 0)
          const prevY = height - padding - (prevSum / maxTotal) * (height - padding * 2)
          ctx.lineTo(x, prevY)
        }

        ctx.closePath()
        ctx.fill()
      })

      // Draw axes labels
      ctx.fillStyle = '#374151'
      ctx.font = '12px Arial'
      data.forEach((point, index) => {
        const x = padding + (width - padding * 2) * (index / (data.length - 1))
        ctx.textAlign = 'center'
        ctx.fillText(point.week, x, height - 20)
      })
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
