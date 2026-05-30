// File: emulator.mjs (Script Mesin IoT)
import { createClient } from '@supabase/supabase-js'
import WebSocket from 'ws'

const supabaseUrl = 'https://ytzagjdxjyuxkchjgrsh.supabase.co'
const supabaseKey = 'sb_publishable_V0dZ0N97ApHgAh-M15H0Rg_6_0JMhj-'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

console.log("🚀 Menyalakan Mesin Emulator MULTI-DRONE GEO-PHARMA...");

setInterval(async () => {
  // 1. Ambil SEMUA drone tanpa terkecuali
  const { data: allDrones, error } = await supabase.from('drones').select('*');
  
  // Jika ada drone yang terbang (bisa 1, 2, atau 10 sekaligus)
  if (allDrones && allDrones.length > 0) {
    
    // 2. Mesin akan mengeksekusi (looping) masing-masing drone secara independen
    for (const drone of allDrones) {
      
      if (drone.status === 'en_route') {
        // Ambil posisi terakhir drone ini (jika belum ada, set dari Hub Semarang)
        // let currentLat = drone.current_latitude || -6.9932;
        // let currentLng = drone.current_longitude || 110.4203;
        // let battery = drone.current_battery || 100;

        //titik dari makasar(rs wahidin)
        let currentLat = drone.current_latitude || -5.1345;
        let currentLng = drone.current_longitude || 119.4908;
        let battery = drone.current_battery || 100;

        // Simulasi Drone Terbang Mendekati Targetnya masing-masing
        currentLat += (drone.target_latitude - currentLat) * 0.08; 
        currentLng += (drone.target_longitude - currentLng) * 0.08;
        battery -= 0.1; // Baterai berkurang perlahan
        
        const speed = Math.floor(Math.random() * (110 - 100 + 1)) + 100;
        const altitude = Math.floor(Math.random() * (130 - 120 + 1)) + 120;

        // Kirim data ke Supabase khusus untuk ID drone ini
        await supabase.from('drones').update({
          current_latitude: currentLat,
          current_longitude: currentLng,
          current_battery: Math.max(0, Math.floor(battery)), // Pastikan baterai tidak minus
          current_speed: speed,
          current_altitude: altitude
        }).eq('id', drone.id);
        
        console.log(`📡 [${drone.drone_code}] MENGUDARA | Baterai: ${Math.floor(battery)}% | Alt: ${altitude}m | Speed: ${speed}km/h`);
        
      } else if (drone.status === 'idle') {
        // Cek apakah baterainya belum 100% atau posisinya tidak di Hanggar
        if (drone.current_battery !== 100 || drone.current_latitude !== -5.1345) {
          
          await supabase.from('drones').update({
            current_latitude: -5.1345, // Reset ke Hub Makassar
            current_longitude: 119.4908,
            current_battery: 100,      // Pengecasan Otomatis (Hot-Swap)!
            current_speed: 0,
            current_altitude: 0
          }).eq('id', drone.id);

          console.log(`🔋 [${drone.drone_code}] BATERAI DI-SWAP (100%) & PARKIR DI HUB.`);
        }
      }
      
    } // Akhir dari for loop
  } // Akhir dari if (allDrones)
}, 1500); // Eksekusi serentak setiap 1.5 detik