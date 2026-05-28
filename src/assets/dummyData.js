// Dummy Database untuk semua fitur

// ===== SMART RELIEF ALLOCATION =====
export const smartReliefData = {
  metrics: {
    totalSupplies: 12930,
    criticalItems: 2,
    activeDeliveries: 8
  },
  supplyDistribution: [
    { name: 'Medicine', value: 2500 },
    { name: 'Medical Equipment', value: 2200 },
    { name: 'Food', value: 3100 },
    { name: 'Water', value: 3500 },
    { name: 'Tents', value: 1630 }
  ],
  inventory: [
    {
      id: 1,
      item: 'Antibiotics',
      inStock: 450,
      demand: 380,
      status: 'Low',
      action: 'Restock'
    },
    {
      id: 2,
      item: 'First Aid Kit',
      inStock: 890,
      demand: 650,
      status: 'Safe',
      action: 'Monitor'
    },
    {
      id: 3,
      item: 'Bandages',
      inStock: 1200,
      demand: 980,
      status: 'Safe',
      action: 'Monitor'
    },
    {
      id: 4,
      item: 'First Aid Kit',
      inStock: 650,
      demand: 450,
      status: 'Charge',
      action: 'Restock'
    },
    {
      id: 5,
      item: 'Oxygen Tank',
      inStock: 45,
      demand: 120,
      status: 'Charge',
      action: 'Restock'
    },
    {
      id: 6,
      item: 'Clean Water',
      inStock: 2400,
      demand: 3200,
      status: 'Low',
      action: 'Restock'
    }
  ]
}

// ===== WATER & SANITATION =====
export const waterSanitationData = {
  metrics: {
    activeZones: 9,
    highPriority: 7,
    activeDrains: 4,
    healthFacilities: 2,
    waterSanitationPoints: 1,
    lowReport: 10
  },
  disasterZones: [
    {
      id: 1,
      name: 'Disaster Zone',
      severity: 'Critical',
      waterQuality: 'Poor',
      operationalStatus: 'Compromised',
      capacity: '1500 L/day',
      lastInspection: '2024-04-25',
      warning: 'Water is contaminated! It requires distillation and treatment before consumption. Distribute bottled water as an alternative.'
    }
  ],
  systemStatus: {
    highPriority: 7,
    activeDrains: 4,
    healthFacilities: 2,
    waterPoints: 1,
    lowReport: 10
  },
  waterQualityParams: {
    phLevel: { value: 6.8, unit: 'pH', status: 'good' },
    turbidity: { value: 2.5, unit: 'NTU', status: 'High' },
    bacteria: { value: 'E.coli Detected', unit: '', status: 'warning' },
    lastInspection: '2024-04-25'
  }
}

// ===== EARLY WARNING OUTBREAK SYSTEM =====
export const earlyWarningData = {
  diseaseSpreadTimeline: [
    { week: 'Week 1', dengue: 12, leptospirosis: 5, gastroenteritis: 8, respiratoryInfection: 3 },
    { week: 'Week 2', dengue: 28, leptospirosis: 12, gastroenteritis: 18, respiratoryInfection: 8 },
    { week: 'Week 3', dengue: 45, leptospirosis: 24, gastroenteritis: 32, respiratoryInfection: 18 },
    { week: 'Week 4', dengue: 72, leptospirosis: 45, gastroenteritis: 55, respiratoryInfection: 32 },
    { week: 'Week 5', dengue: 98, leptospirosis: 68, gastroenteritis: 78, respiratoryInfection: 58 },
    { week: 'Week 6', dengue: 145, leptospirosis: 98, gastroenteritis: 102, respiratoryInfection: 89 }
  ],
  caseCounts: [
    {
      id: 1,
      disease: 'Dengue Fever',
      icon: '🔴',
      currentCases: 156,
      trend: '-3%',
      trendType: 'down'
    },
    {
      id: 2,
      disease: 'Leptospirosis',
      icon: '🟠',
      currentCases: 67,
      trend: '+4%',
      trendType: 'up'
    },
    {
      id: 3,
      disease: 'Diarrhea',
      icon: '🔵',
      currentCases: 124,
      trend: '+2%',
      trendType: 'up'
    },
    {
      id: 4,
      disease: 'Respiratory Infection',
      icon: '🟡',
      currentCases: 89,
      trend: '-2%',
      trendType: 'down'
    }
  ],
  caseCountDistribution: [
    { week: 'Week 1', dengue: 12, leptospirosis: 5, gastroenteritis: 8, respiratoryInfection: 3 },
    { week: 'Week 2', dengue: 18, leptospirosis: 9, gastroenteritis: 14, respiratoryInfection: 7 },
    { week: 'Week 3', dengue: 35, leptospirosis: 18, gastroenteritis: 26, respiratoryInfection: 15 },
    { week: 'Week 4', dengue: 58, leptospirosis: 32, gastroenteritis: 42, respiratoryInfection: 28 },
    { week: 'Week 5', dengue: 85, leptospirosis: 52, gastroenteritis: 68, respiratoryInfection: 45 },
    { week: 'Week 6', dengue: 110, leptospirosis: 78, gastroenteritis: 95, respiratoryInfection: 68 }
  ]
}

// ===== DRONE TRACKING SYSTEM =====
export const droneTrackingData = {
  metrics: {
    activeDrones: 3,
    totalFleet: 5,
    inMaintenance: 1,
    missionsDone: 24
  },
  fleetStatus: [
    {
      id: 'DRONE-001',
      name: 'Medical Drone Alpha',
      status: 'Active',
      battery: 87,
      destination: 'Jakarta Raya',
      cargo: 'Antibiotics & First Aid',
      eta: '15 min'
    },
    {
      id: 'DRONE-002',
      name: 'Medical Drone Beta',
      status: 'Charging',
      battery: 45,
      destination: 'Bandung Utara',
      cargo: 'Oxygen Tanks',
      eta: '30 min'
    },
    {
      id: 'DRONE-003',
      name: 'Medical Drone Gamma',
      status: 'Idle',
      battery: 92,
      destination: 'Base Station',
      cargo: 'None',
      eta: '5 min'
    },
    {
      id: 'DRONE-004',
      name: 'Medical Drone Delta',
      status: 'Idle',
      battery: 31,
      destination: 'Base Station',
      cargo: 'None',
      eta: '8 min'
    },
    {
      id: 'DRONE-005',
      name: 'Medical Drone Epsilon',
      status: 'Maintenance',
      battery: null,
      destination: 'Maintenance Hub',
      cargo: 'N/A',
      eta: 'N/A'
    }
  ],
  liveTrackingFeed: {
    droneId: 'DRONE-001',
    droneName: 'Medical Drone Alpha',
    coordinates: {
      lat: -6.2088,
      lng: 106.8456
    },
    altitude: 120,
    zoom: 3,
    speed: 45,
    signal: 'Strong',
    video: 'Live Feed',
    stats: [
      { label: 'Altitude', value: '120 m' },
      { label: 'Distance', value: '12.3 km' },
      { label: 'Speed', value: '0.3 km/s' }
    ]
  },
  mapCenter: [-6.2088, 106.8456],
  mapZoom: 10,
  droneLocations: [
    { lat: -6.2088, lng: 106.8456, id: 'DRONE-001', name: 'DRONE-001' },
    { lat: -6.2750, lng: 106.8300, id: 'DRONE-002', name: 'DRONE-002' },
    { lat: -6.1900, lng: 106.8650, id: 'DRONE-003', name: 'DRONE-003' }
  ]
}
