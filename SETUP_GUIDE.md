# 🚀 GeoPharma Development Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd d:\kulyeah\lomba\geopharma\my-project
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Open your browser to: **http://localhost:5173**

### 3. Build for Production
```bash
npm run build
```

---

## 📂 Project Files Overview

### Core Files
- **`index.html`** - HTML entry point with app root element
- **`src/main.js`** - Vue app initialization and plugin setup
- **`src/App.vue`** - Root component with layout
- **`src/router.js`** - Vue Router configuration for navigation

### Pages (Views)
- **`src/Landing.vue`** - Homepage with features, statistics, and CTAs
- **`src/Dashboard.vue`** - Real-time map dashboard with disaster tracking
- **`src/Report.vue`** - Disaster report form with photo upload

### Components
- **`src/Header.vue`** - Navigation bar with responsive mobile menu
- **`src/Footer.vue`** - Site footer with links

### Styling
- **`src/style.css`** - Global Tailwind CSS imports and custom components
- **`tailwind.config.js`** - Tailwind configuration with colors and themes
- **`postcss.config.js`** - PostCSS configuration for CSS processing

### Configuration
- **`vite.config.ts`** - Vite bundler configuration
- **`package.json`** - Project dependencies and scripts
- **`.env.example`** - Environment variables template

---

## 🎯 Features Implemented

### ✅ Landing Page (Landing.vue)
- **Hero Section**: Beautiful background image with CTA buttons
- **Features Section**: 3-column grid of key features
- **Services Section**: 4 service cards (Drone, Logistics, Volunteers, Health)
- **Statistics**: Real-time report counts and metrics
- **Call-to-Action**: Multiple CTAs to guide users

### ✅ Dashboard (Dashboard.vue)
- **Interactive Map**: Leaflet map with disaster markers
- **Layer Control**: Toggle visibility of different data layers
- **Location Details**: Popup card with disaster information
- **System Status**: Live statistics panel
- **Report History**: Recent reports with status badges

### ✅ Report Form (Report.vue)
- **Location Input**: Enter disaster location
- **Disaster Type**: Dropdown with 7 disaster types
- **Severity Level**: Radio buttons for priority assessment
- **Victim Count**: Number input field
- **Medical Needs**: Checkbox list of 8 medical supplies
- **Description**: Textarea for detailed information
- **Photo Upload**: Drag-and-drop or click to upload multiple images
- **Contact Info**: Email and optional phone field
- **Success Message**: Confirmation after submission

### ✅ Navigation (Header.vue)
- **Responsive Header**: Adapts to mobile and desktop
- **Mobile Menu**: Hamburger menu for mobile devices
- **Navigation Links**: Links to Dashboard and Report
- **Branding**: GeoPharma logo and title

### ✅ Footer (Footer.vue)
- **Multi-column Layout**: Platform, Resources, and Legal sections
- **Quick Links**: Navigation and information links
- **Copyright**: Branding and mission statement

---

## 🛠️ Customization Guide

### Change Colors
Edit `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: '#2d5016',      // Forest green
      accent: '#ff6b35',       // Orange
      danger: '#d32f2f',       // Red
      warning: '#f57c00',      // Orange-red
      success: '#388e3c',      // Green
    },
  }
}
```

### Update Hero Background
In `Landing.vue`, modify the background image URL:
```vue
:style="{ backgroundImage: `url('YOUR_IMAGE_URL')` }"
```

### Add More Navigation Items
In `Header.vue`, add to the menu:
```vue
<a href="#section" class="text-gray-700 hover:text-primary transition">New Link</a>
```

### Modify Disaster Types
In `Report.vue`, edit the disaster type options:
```vue
<option value="flood">🌊 Flood</option>
<option value="custom">🎨 Custom Type</option>
```

---

## 📦 Adding New Dependencies

### Install a package
```bash
npm install package-name
```

### Install a dev dependency
```bash
npm install --save-dev package-name
```

### Common packages you might want:
```bash
npm install vue-leaflet              # Leaflet Vue wrapper
npm install geolocation-polyfill      # Geolocation support
npm install date-fns                  # Date utilities
npm install socket.io-client          # Real-time updates
```

---

## 🔌 API Integration

The app is ready to connect to a backend API. Here's how:

### 1. Configure API Base URL
Create `.env` file:
```
VITE_API_BASE_URL=https://api.geopharma.local
```

### 2. Create API Service
Create `src/services/api.js`:
```js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
})

export const disasterAPI = {
  getAll: () => api.get('/disasters'),
  submit: (data) => api.post('/reports', data)
}

export default api
```

### 3. Use in Components
```js
import { disasterAPI } from '@/services/api'

export default {
  methods: {
    async fetchDisasters() {
      const data = await disasterAPI.getAll()
      this.disasters = data
    }
  }
}
```

---

## 🐛 Troubleshooting

### Port 5173 already in use
```bash
npm run dev -- --port 5174
```

### Node modules issues
```bash
rm -r node_modules package-lock.json
npm install
```

### Vite cache issues
```bash
npm run dev -- --force
```

### Map not loading
- Check if Leaflet CDN is accessible
- Verify browser console for errors
- Ensure map container has height (min-h-screen)

---

## 📱 Testing on Mobile

### Using local network
1. Get your computer's IP: `ipconfig` (Windows)
2. Run: `npm run dev`
3. On mobile, visit: `http://YOUR_IP:5173`

### Using mobile emulation
- Open DevTools (F12)
- Click device toolbar icon (Ctrl+Shift+M)
- Test responsive design

---

## 🚢 Deployment

### Build for production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Deploy to GitHub Pages
Update `vite.config.js`:
```js
export default defineConfig({
  base: '/geopharma/',
  // ...
})
```

---

## 📚 Useful Resources

- [Vue.js 3 Docs](https://vuejs.org/)
- [Vue Router Docs](https://router.vuejs.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Vite Docs](https://vitejs.dev/)
- [Leaflet Docs](https://leafletjs.com/)

---

## 🤝 Next Steps

1. **Connect to API** - Update API endpoints in components
2. **Add Authentication** - Implement user login/register
3. **Real-time Updates** - Integrate WebSocket for live data
4. **Geolocation** - Use browser geolocation for auto location
5. **PWA Support** - Add service worker for offline capability
6. **Dark Mode** - Implement dark theme toggle

---

**Happy coding! 🚀**
