/**
 * disaster.store.js
 * Letakkan di: src/stores/disaster.store.js
 */

import { defineStore } from 'pinia'
import {
  getReports,
  getFloodAreas,
  getInfrastructure,
  DISASTER_CONFIG,
  FLOOD_STATE_CONFIG,
  REGION_CODES
} from '@/services/petabencana.service'

export const useDisasterStore = defineStore('disaster', {
  state: () => ({
    reports: [],
    floodAreas: [],
    infrastructure: [],

    selectedRegion: 'ID-JK',
    selectedDisasterType: null,

    isLoading: false,
    error: null,
    lastUpdated: null,
    refreshInterval: null,

    layers: {
      disasterZone:    true,
      areaPriority:    false,
      diseaseSpread:   false,
      healthFacility:  true,
      waterSanitation: false,
    },
  }),

  getters: {
    // Laporan bencana → siap render di peta
    formattedReports: (state) => {
      return state.reports
        .map((feature) => {
          const props = feature.properties || {}
          const coords = feature.geometry?.coordinates || [0, 0]
          const disasterType = props.disaster_type || 'flood'
          const config = DISASTER_CONFIG[disasterType] || { icon: '⚠️', label: disasterType, color: '#6B7280' }

          return {
            id: props.pkey || Math.random(),
            lat: coords[1],
            lng: coords[0],
            type: disasterType,
            typeLabel: config.label,
            icon: config.icon,
            color: config.color,
            title: props.title || config.label,
            text: props.text || '',
            location: props.tags?.district_name || props.tags?.city || props.tags?.local_area_name || 'Tidak diketahui',
            city: props.tags?.city || '',
            createdAt: props.created_at ? new Date(props.created_at) : null,
            imageUrl: props.image_url || null,
            popupLabel: `${config.icon} ${config.label}`,
          }
        })
        .filter(r => r.lat && r.lng)
    },

    // Area banjir → polygon overlay peta
    formattedFloodAreas: (state) => {
      return state.floodAreas
        .map((feature) => {
          const stateLevel = feature.properties?.state || 1
          const config = FLOOD_STATE_CONFIG[stateLevel] || FLOOD_STATE_CONFIG[1]
          return {
            id: feature.properties?.area_id || Math.random(),
            geometry: feature.geometry,
            stateLevel,
            stateLabel: config.label,
            color: config.color,
            areaName: feature.properties?.area_name || 'Area Banjir',
          }
        })
        .filter(a => a.geometry)
    },

    // Fasilitas kesehatan → marker peta
    formattedInfrastructure: (state) => {
      return state.infrastructure
        .map((feature) => {
          const props = feature.properties || {}
          const coords = feature.geometry?.coordinates || [0, 0]
          return {
            id: props.pkey || Math.random(),
            lat: coords[1],
            lng: coords[0],
            name: props.name || 'Fasilitas Kesehatan',
            type: props.infrastructure_type || '',
          }
        })
        .filter(f => f.lat && f.lng)
    },

    // Statistik untuk panel kanan
    reportStats: (state) => {
      const total = state.reports.length
      const withImage = state.reports.filter(r => r.properties?.image_url).length
      return {
        total,
        verified: withImage,
        pending: total - withImage,
        verificationRate: total > 0 ? Math.round((withImage / total) * 100) : 0,
      }
    },

    // 5 laporan terbaru
    recentReports(state) {
      return [...this.formattedReports]
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 5)
        .map(r => ({
          id: r.id,
          type: r.typeLabel,
          location: r.location,
          time: r.createdAt ? timeAgo(r.createdAt) : 'Baru saja',
          status: getPriorityLabel(r.type),
          statusClass: getPriorityClass(r.type),
        }))
    },

    // Jumlah zona prioritas tinggi
    highPriorityCount(state) {
      const highFlood = this.formattedFloodAreas.filter(a => a.stateLevel >= 3).length
      const highReports = this.formattedReports.filter(r =>
        ['earthquake', 'volcano', 'fire'].includes(r.type)
      ).length
      return highFlood + highReports
    },

    hasData: (state) => state.reports.length > 0 || state.floodAreas.length > 0,
  },

  actions: {
    async fetchAll() {
      this.isLoading = true
      this.error = null
      try {
        await Promise.allSettled([
          this.fetchReports(),
          this.fetchFloodAreas(),
          this.layers.healthFacility ? this.fetchInfrastructure() : Promise.resolve(),
        ])
        this.lastUpdated = new Date()
      } catch (err) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },

    async fetchReports() {
      try {
        this.reports = await getReports({
          admin: this.selectedRegion,
          disaster_type: this.selectedDisasterType,
        })
        console.log(`[reports] ${this.reports.length} laporan dari ${this.selectedRegion}`)
      } catch (err) {
        console.error('[fetchReports]', err.message)
        this.reports = []
      }
    },

    async fetchFloodAreas() {
      try {
        this.floodAreas = await getFloodAreas({ admin: this.selectedRegion })
        console.log(`[floods] ${this.floodAreas.length} area banjir`)
      } catch (err) {
        console.error('[fetchFloodAreas]', err.message)
        this.floodAreas = []
      }
    },

    async fetchInfrastructure(type = 'Hospital') {
      try {
        this.infrastructure = await getInfrastructure({
          admin: this.selectedRegion,
          infrastructure_type: type,
        })
        console.log(`[infra] ${this.infrastructure.length} fasilitas`)
      } catch (err) {
        console.error('[fetchInfrastructure]', err.message)
        this.infrastructure = []
      }
    },

    async changeRegion(regionCode) {
      this.selectedRegion = regionCode
      await this.fetchAll()
    },

    async changeDisasterType(type) {
      this.selectedDisasterType = type || null
      await this.fetchReports()
    },

    async toggleLayer(layerName) {
      this.layers[layerName] = !this.layers[layerName]
      if (layerName === 'healthFacility' && this.layers.healthFacility) {
        await this.fetchInfrastructure()
      }
    },

    startAutoRefresh() {
      this.stopAutoRefresh()
      this.refreshInterval = setInterval(() => this.fetchAll(), 5 * 60 * 1000)
    },

    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
        this.refreshInterval = null
      }
    },
  },
})

// ─── Private helpers ─────────────────────────────────────────────────────────
function timeAgo(date) {
  const s = Math.floor((new Date() - date) / 1000)
  if (s < 60)    return 'Baru saja'
  if (s < 3600)  return `${Math.floor(s / 60)} menit lalu`
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`
  return `${Math.floor(s / 86400)} hari lalu`
}

function getPriorityLabel(type) {
  return { earthquake: 'Critical', volcano: 'Critical', flood: 'High', fire: 'High', wind: 'Medium', haze: 'Low' }[type] || 'Medium'
}

function getPriorityClass(type) {
  return { earthquake: 'bg-red-100 text-red-700', volcano: 'bg-red-100 text-red-700', flood: 'bg-orange-100 text-orange-700', fire: 'bg-orange-100 text-orange-700', wind: 'bg-yellow-100 text-yellow-700', haze: 'bg-gray-100 text-gray-700' }[type] || 'bg-yellow-100 text-yellow-700'
}