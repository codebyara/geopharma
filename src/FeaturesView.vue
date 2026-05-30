<template>
  <div class="features-container">
    <h1>Fitur Utama Sistem</h1>
    
    <div class="features-grid">
      <div class="feature-card">
        <h3>Smart Drug Allocation</h3>
        <p>Sistem cerdas yang menganalisis dan mendistribusikan alokasi obat-obatan ke area terdampak bencana secara presisi berdasarkan tingkat urgensi dan ketersediaan stok.</p>
      </div>

      <div class="feature-card">
        <h3>Real-Time Reporting</h3>
        <p>Pemantauan kondisi lapangan dan pelaporan data kebencanaan serta status farmasi yang diperbarui secara langsung (real-time) untuk mempercepat pengambilan keputusan.</p>
      </div>
      
      <div class="feature-card">
        <h3>Geospatial Intelligence</h3>
        <p>Pemetaan area berisiko tinggi dan prediksi penyebaran wabah pasca-bencana menggunakan teknologi pemetaan satelit dan drone aktif.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.features-container {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
h1 {
  text-align: center;
  color: #1A5319;
  margin-bottom: 3rem;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
.feature-card {
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}
.feature-card:hover {
  transform: translateY(-5px);
  border-color: #1A5319;
}
h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}
</style>