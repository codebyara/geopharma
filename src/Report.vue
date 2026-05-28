<template>
  <div class="report-page bg-gray-50 min-h-screen py-12">
    <div class="container mx-auto px-4 max-w-2xl">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-4xl font-bold text-primary mb-2">Submit Field Report</h1>
        <p class="text-gray-600 mb-8">Help us track disasters and coordinate aid efforts. Your report matters!</p>

        <form @submit.prevent="submitReport" class="space-y-6">
          <!-- Location Input -->
          <div>
            <label class="block text-lg font-semibold text-gray-800 mb-2">
              📍 Location
            </label>
            <input 
              v-model="form.location" 
              type="text" 
              placeholder="City, District, or exact coordinates"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              required
            >
            <p class="text-xs text-gray-500 mt-1">Enter your current location or where the disaster occurred</p>
          </div>

          <!-- Disaster Type -->
          <div>
            <label class="block text-lg font-semibold text-gray-800 mb-2">
              🚨 Disaster Type
            </label>
            <select 
              v-model="form.disasterType" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              required
            >
              <option value="">Select a disaster type</option>
              <option value="flood">🌊 Flood</option>
              <option value="landslide">⛰️ Landslide</option>
              <option value="earthquake">🌍 Earthquake</option>
              <option value="tornado">🌪️ Tornado</option>
              <option value="drought">☀️ Drought</option>
              <option value="fire">🔥 Fire</option>
              <option value="other">❓ Other</option>
            </select>
          </div>

          <!-- Severity Level -->
          <div>
            <label class="block text-lg font-semibold text-gray-800 mb-2">
              ⚠️ Severity Level
            </label>
            <div class="flex gap-4">
              <label v-for="level in ['Low', 'Medium', 'High', 'Critical']" :key="level" class="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  v-model="form.severity" 
                  :value="level"
                  class="w-4 h-4"
                >
                <span class="ml-2">{{ level }}</span>
              </label>
            </div>
          </div>

          <!-- Affected Victims -->
          <div>
            <label class="block text-lg font-semibold text-gray-800 mb-2">
              👥 Number of Affected Victims
            </label>
            <input 
              v-model.number="form.victims" 
              type="number" 
              placeholder="0"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              min="0"
            >
          </div>

          <!-- Medical Needs -->
          <div>
            <label class="block text-lg font-semibold text-gray-800 mb-2">
              🏥 Medical Needs
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label v-for="need in medicalNeeds" :key="need" class="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  :value="need"
                  v-model="form.medicalNeeds"
                  class="w-4 h-4"
                >
                <span>{{ need }}</span>
              </label>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-lg font-semibold text-gray-800 mb-2">
              📝 Description
            </label>
            <textarea 
              v-model="form.description" 
              placeholder="Provide detailed information about the situation, weather conditions, accessibility, etc."
              rows="5"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            ></textarea>
          </div>

          <!-- Photo Upload -->
          <div>
            <label class="block text-lg font-semibold text-gray-800 mb-2">
              📸 Upload Photos
            </label>
            <div class="border-2 border-dashed border-primary rounded-lg p-8 text-center hover:bg-primary/5 transition cursor-pointer"
                 @click="$refs.photoInput.click()">
              <p class="text-2xl mb-2">📷</p>
              <p class="text-gray-700 font-semibold">Click to upload or drag & drop</p>
              <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              <input 
                ref="photoInput"
                @change="handlePhotoUpload"
                type="file" 
                accept="image/*" 
                multiple 
                class="hidden"
              >
            </div>
            <div v-if="form.photos.length > 0" class="mt-4 grid grid-cols-4 gap-4">
              <div v-for="(photo, idx) in form.photos" :key="idx" class="relative">
                <img :src="photo" :alt="`Photo ${idx+1}`" class="w-full h-24 object-cover rounded-lg">
                <button 
                  @click="form.photos.splice(idx, 1)" 
                  type="button"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-lg font-semibold text-gray-800 mb-2">
                📧 Email
              </label>
              <input 
                v-model="form.email" 
                type="email" 
                placeholder="your@email.com"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                required
              >
            </div>
            <div>
              <label class="block text-lg font-semibold text-gray-800 mb-2">
                📱 Phone (Optional)
              </label>
              <input 
                v-model="form.phone" 
                type="tel" 
                placeholder="+62 xxx-xxxx-xxxx"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              >
            </div>
          </div>

          <!-- Terms -->
          <label class="flex items-start space-x-3 cursor-pointer">
            <input 
              v-model="form.agreeTerms" 
              type="checkbox"
              class="w-4 h-4 mt-1"
              required
            >
            <span class="text-sm text-gray-700">
              I agree that this information will be used for disaster response and coordination. I confirm the accuracy of this report.
            </span>
          </label>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="!form.agreeTerms"
            class="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Submit Report
          </button>
        </form>

        <!-- Success Message -->
        <div v-if="showSuccess" class="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p class="text-green-700 font-semibold">✓ Report submitted successfully!</p>
          <p class="text-green-600 text-sm">Thank you for helping us track and respond to disasters. Your information will be verified by our team.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Report',
  data() {
    return {
      form: {
        location: '',
        disasterType: '',
        severity: 'High',
        victims: 0,
        medicalNeeds: [],
        description: '',
        photos: [],
        email: '',
        phone: '',
        agreeTerms: false
      },
      medicalNeeds: ['Antibiotics', 'Clean Water', 'First Aid Kits', 'Bandages', 'Pain Relief', 'Oxygen', 'Blankets', 'Food'],
      showSuccess: false
    }
  },
  methods: {
    handlePhotoUpload(event) {
      const files = event.target.files
      for (let file of files) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.form.photos.push(e.target.result)
        }
        reader.readAsDataURL(file)
      }
    },
    submitReport() {
      console.log('Report submitted:', this.form)
      
      // Show success message
      this.showSuccess = true
      
      // Reset form after 3 seconds
      setTimeout(() => {
        this.form = {
          location: '',
          disasterType: '',
          severity: 'High',
          victims: 0,
          medicalNeeds: [],
          description: '',
          photos: [],
          email: '',
          phone: '',
          agreeTerms: false
        }
        this.showSuccess = false
      }, 3000)
    }
  }
})
</script>

<style scoped>
textarea {
  resize: vertical;
}
</style>
