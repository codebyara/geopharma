/**
 * petabencana.service.js
 * Service layer untuk integrasi API PetaBencana.id
 *
 * Letakkan file ini di: src/services/petabencana.service.js
 *
 * Install dependency dulu:
 *   npm install topojson-client
 */

import axios from 'axios'
import * as topojson from 'topojson-client'

// Gunakan proxy saat dev, langsung saat production
const BASE_URL = import.meta.env.DEV
  ? '/petabencana'
  : 'https://data.petabencana.id'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'API error'
    console.error('[PetaBencana API Error]', msg, err.response?.data)
    return Promise.reject(new Error(msg))
  }
)

// ─── Helper: TopoJSON → GeoJSON features array ───────────────────────────────
function topoToFeatures(apiResponse) {
  try {
    const data = apiResponse?.result || apiResponse;
    if (!data) return [];

    // 1. Cek apakah formatnya sudah GeoJSON standar (punya array 'features')
    if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
      return data.features;
    }

    // 2. Jika bukan GeoJSON, coba parse sebagai TopoJSON
    if (data.objects) {
      const objectName = Object.keys(data.objects)[0];
      if (objectName) {
        const geo = topojson.feature(data, data.objects[objectName]);
        return geo?.features || [];
      }
    }

    return [];
  } catch (e) {
    console.error('[Parsing Data Error]', e);
    return [];
  }
}

// ─── Kode wilayah Indonesia ──────────────────────────────────────────────────
export const REGION_CODES = {
  jakarta:        'ID-JK',
  jawa_barat:     'ID-JB',
  jawa_tengah:    'ID-JT',
  jawa_timur:     'ID-JI',
  yogyakarta:     'ID-YO',
  banten:         'ID-BT',
  sumatera_barat: 'ID-SB',
  sulawesi_sel:   'ID-SN',
}

// ─── 1. REPORTS ──────────────────────────────────────────────────────────────
/**
 * Ambil laporan bencana
 * @param {string} [admin]         - Kode wilayah, contoh: 'ID-JK'
 * @param {string} [disaster_type] - 'flood'|'earthquake'|'wind'|'haze'|'volcano'|'fire'
 */
export async function getReports({ admin = null, disaster_type = null } = {}) {
  const params = {}
  if (admin) params.admin = admin
  if (disaster_type) params.disaster_type = disaster_type

  const { data } = await api.get('/reports', { params })
  return topoToFeatures(data)
}

/**
 * Ambil arsip laporan berdasarkan rentang waktu
 * @param {string} params.start  - ISO date, contoh: '2025-01-01T00:00:00+07:00'
 * @param {string} params.end    - ISO date
 * @param {string} [params.admin]
 */
export async function getReportsArchive({ start, end, admin = null } = {}) {
  const params = { start, end }
  if (admin) params.admin = admin

  const { data } = await api.get('/reports/archive', { params })
  return topoToFeatures(data)
}

// ─── 2. FLOODS ───────────────────────────────────────────────────────────────
/**
 * Ambil area banjir aktif
 * @param {string} [admin]         - Kode wilayah (detail hanya tersedia untuk ID-JK)
 * @param {number} [minimum_state] - Level minimum 1–4
 */
export async function getFloodAreas({ admin = 'ID-JK', minimum_state = 1 } = {}) {
  const { data } = await api.get('/floods', { params: { admin, minimum_state } })
  return topoToFeatures(data)
}

// ─── 3. INFRASTRUCTURE ───────────────────────────────────────────────────────
/**
 * Ambil fasilitas kesehatan / infrastruktur
 * @param {string} admin
 * @param {string} [infrastructure_type] - 'Hospital'|'Clinic'|'Fire Station'|'Police'|'Evacuation Center'
 */
export async function getInfrastructure({ admin, infrastructure_type = null } = {}) {
  const params = { admin }
  if (infrastructure_type) params.infrastructure_type = infrastructure_type

  const { data } = await api.get('/infrastructure', { params })
  return topoToFeatures(data)
}

// ─── 4. FLOOD GAUGES ─────────────────────────────────────────────────────────
export async function getFloodGauges(admin = 'ID-JK') {
  const { data } = await api.get('/floodgauges', { params: { admin } })
  return topoToFeatures(data)
}

// ─── Config tipe bencana ─────────────────────────────────────────────────────
export const DISASTER_CONFIG = {
  flood:      { label: 'Banjir',        icon: '🌊', color: '#3B82F6' },
  earthquake: { label: 'Gempa Bumi',    icon: '🌍', color: '#EF4444' },
  wind:       { label: 'Angin Kencang', icon: '🌪️', color: '#8B5CF6' },
  haze:       { label: 'Kabut Asap',    icon: '🌫️', color: '#6B7280' },
  volcano:    { label: 'Gunung Api',    icon: '🌋', color: '#F97316' },
  fire:       { label: 'Kebakaran',     icon: '🔥', color: '#DC2626' },
}

export const FLOOD_STATE_CONFIG = {
  1: { label: 'Waspada', color: '#FCD34D' },
  2: { label: 'Siaga',   color: '#FB923C' },
  3: { label: 'Awas',    color: '#EF4444' },
  4: { label: 'Ekstrem', color: '#7F1D1D' },
}