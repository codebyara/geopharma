# 🌍 GeoPharma - Disaster Intelligence Platform

Indonesia's First Geo-Pharmaceutical Disaster Intelligence Platform for real-time tracking of natural disasters and emergency assistance coordination.

## 📋 Project Overview

GeoPharma is a modern web application built with **Vue.js 3** that enables:
- Real-time disaster tracking on interactive maps
- Community crowdsourced disaster reporting
- Priority zoning for disaster response
- Integration with medical facilities and logistics
- Emergency aid coordination through drones, logistics, and volunteer networks

## 🛠️ Tech Stack

- **Frontend Framework**: Vue.js 3
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Maps**: Leaflet.js
- **Language**: JavaScript/ES6+

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Start development server**:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

3. **Build for production**:
```bash
npm run build
```

4. **Preview production build**:
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── App.vue              # Main app component
├── main.js              # App entry point
├── router.js            # Vue Router configuration
├── style.css            # Global Tailwind styles
├── Header.vue           # Navigation header
├── Footer.vue           # Footer component
├── Landing.vue          # Landing/home page
├── Dashboard.vue        # Real-time map dashboard
├── Report.vue           # Disaster report form
└── assets/              # Static assets
```

## 🎯 Key Features

### 1. **Landing Page**
- Hero section with call-to-action
- Feature highlights
- Statistics dashboard
- Volunteer/partner signup

### 2. **Dashboard**
- Interactive map with Leaflet
- Layer control (disaster zones, health facilities, etc.)
- Real-time report statistics
- Location details popup
- System status monitoring

### 3. **Report Form**
- Location input with autocomplete
- Disaster type selection
- Severity assessment
- Affected victims tracking
- Medical needs checklist
- Photo upload capability
- Contact information collection

### 4. **Navigation**
- Header with responsive menu
- Mobile-friendly hamburger menu
- Quick links to all sections
- Dashboard and Report shortcuts

## 🎨 Design Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Color Scheme**: 
  - Primary: #2d5016 (forest green)
  - Accent: #ff6b35 (orange)
  - Danger: #d32f2f (red)
- **Smooth Animations**: Transitions and hover effects
- **Accessible**: Semantic HTML, proper contrast ratios

## 📊 Components Included

| Component | Purpose |
|-----------|---------|
| Header | Navigation & branding |
| Footer | Site-wide footer |
| Landing | Home page with features |
| Dashboard | Map & disaster tracking |
| Report Form | Crowdsourced reporting |
| Map Viewer | Leaflet interactive map |
| Statistics | Real-time data display |

## 🚀 API Integration Ready

The application is structured to easily integrate with a backend API:
- Report submission endpoints
- Real-time disaster data
- User authentication
- Medical facility database
- Logistics optimization

## 📱 Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Configuration

### Tailwind CSS
Located in `tailwind.config.js` - customize colors, spacing, and more.

### Vite Config
Located in `vite.config.ts` - modify build settings and dev server options.

### Environment Variables
Create a `.env` file for API endpoints and configuration:
```
VITE_API_BASE_URL=https://api.geopharma.local
VITE_MAP_TOKEN=your_mapbox_token
```

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Submit a pull request

## 📄 License

This project is part of the GeoPharma initiative for disaster response and community resilience.

## 📞 Contact & Support

For issues, questions, or contributions, please reach out to the GeoPharma team.

---

**Built with ❤️ for disaster resilience in Indonesia**
