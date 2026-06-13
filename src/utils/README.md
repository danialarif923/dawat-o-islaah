# Nearest Mosques Component

> 🕌 A production-ready React component for finding and navigating to nearby mosques using Google Places API with real-time distance calculations, ratings, and full RTL/dark mode support.

## ✨ Features

### Core Functionality
- 📍 **Geolocation Integration** - Fetch user's current coordinates with error handling
- 🔍 **Google Places API** - Search for mosques within customizable radius (1-50 km)
- 📏 **Distance Calculation** - Haversine formula for accurate straight-line distances
- 🗺️ **Google Maps Navigation** - Direct links to get directions for each mosque
- ⭐ **Ratings & Reviews** - Display mosque ratings and total reviews from Google Places
- 🏪 **Opening Status** - Real-time "Open Now" / "Closed" indicator
- 📸 **Photo Gallery** - Display mosque photos from Google Places API
- 🌍 **Multi-Language** - Full English and Urdu (RTL) support
- 🌓 **Dark Mode** - Seamless dark/light theme integration

### UI/UX Features
- 🎨 **Modern Design** - Glassmorphic components with smooth animations
- 📱 **Fully Responsive** - Mobile-first design (mobile, tablet, desktop)
- 🔄 **Dynamic Sorting** - Sort by distance or rating
- 🎯 **Smart Filtering** - Search mosques by name or location
- ⚡ **Loading States** - Skeleton loaders and spinners
- ⚠️ **Error Handling** - Comprehensive error messages with recovery actions
- 🚀 **Performance** - Debounced API calls and optimized rendering

### State Management
- **Requesting Location** - Loading state with spinner
- **Fetching Data** - Places API data fetching with animations
- **Empty State** - No mosques found with helpful suggestions
- **Error States** - API limits, location denied, network issues
- **Success State** - Full list of mosques with details

---

## 📦 Installation

### 1. Copy Component Files
The component includes three files in `/src/pages/IslamicTools/NearestMosque/`:
- `index.jsx` - Main component
- `utils.js` - Reusable utility functions
- `SETUP.md` - Detailed setup guide

### 2. Verify Dependencies
```bash
# These should already be in your project
npm list lucide-react
npm list react
npm list react-dom
```

### 3. Set Environment Variable
Create `.env` file in your project root:
```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### 4. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Maps JavaScript API** and **Places API**
4. Create an API key
5. Add your domain to restrictions (optional)

---

## 🚀 Quick Start

### 1. Import the Component
```javascript
import NearestMosqueMap from "@/pages/IslamicTools/NearestMosque";
```

### 2. Add to Your Routes
```javascript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/nearest-mosques" element={<NearestMosqueMap />} />
      </Routes>
    </Router>
  );
}
```

### 3. Add Navigation Link
```javascript
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export function Navigation() {
  return (
    <nav>
      <Link to="/nearest-mosques" className="flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Nearest Mosques
      </Link>
    </nav>
  );
}
```

### 4. That's It!
The component handles all the rest - geolocation, API calls, error handling, and UI rendering.

---

## 🎯 Component Props

The component doesn't accept props. Customize by editing the component directly or creating a wrapper:

```javascript
// Create a customizable wrapper
export function CustomMosqueMap({ defaultRadius = 10, defaultSort = "distance" }) {
  // Your wrapper logic here
  return <NearestMosqueMap />;
}
```

---

## 📊 Data Structure

### Mosque Object
```javascript
{
  id: "ChIJN1blonMsZkgR...",  // Google Place ID
  name: "Al-Hidaya Mosque",
  address: "123 Mosque St, City, Country",
  lat: 40.7128,
  lng: -74.0060,
  distance: 2.5,           // km from user
  rating: 4.5,             // Google rating
  reviews: 128,            // Total reviews
  isOpen: true,            // Boolean or null
  placeId: "ChIJN1blonMsZkgR...",
  photos: [PhotoObject],   // Google Places photo objects
  types: ["place_of_worship", "mosque"]
}
```

---

## 🛠️ Utility Functions

The `utils.js` file exports helpful functions:

```javascript
import {
  calculateHaversineDistance,
  searchMosques,
  getUserGeolocation,
  getGoogleMapsDirectionLink,
  formatDistance,
  getTranslations,
  sortMosques,
  filterMosquesByQuery,
  debounce,
  loadGoogleMapsScript,
} from "./utils.js";

// Calculate distance
const km = calculateHaversineDistance(40.7128, -74.0060, 40.7580, -73.9855);

// Get user location
const location = await getUserGeolocation();

// Search for mosques
const mosques = await searchMosques(location, 5); // radius in km

// Get Google Maps link
const mapLink = getGoogleMapsDirectionLink(mosque);

// Format distance for display
const display = formatDistance(2.5); // "2.5 km"
```

---

## 🎨 Customization

### Change Default Radius
Edit in `index.jsx`:
```javascript
const [radius, setRadius] = useState(10); // Change from 5 to 10 km
```

### Modify Radius Range
```javascript
<input
  type="range"
  min="2"      {/* Minimum radius */}
  max="100"    {/* Maximum radius */}
  value={radius}
  onChange={(e) => setRadius(Number(e.target.value))}
/>
```

### Add Custom Translations
```javascript
const translations = {
  title: "Your Custom Title",
  description: "Your custom description",
  // ... more keys
};
```

### Style Customization
All styling uses Tailwind CSS. Modify color scheme:
```javascript
// Change from emerald/teal to your brand colors
// Search for "emerald" and "teal" in the component
// Replace with your colors (e.g., "blue", "purple")
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Geolocation permission works
- [ ] Mosques display correctly
- [ ] Distance calculations are accurate
- [ ] Sorting (distance/rating) works
- [ ] Search filtering works
- [ ] "Get Directions" button opens Google Maps
- [ ] Dark mode toggle works
- [ ] RTL (Urdu) layout is correct
- [ ] Mobile responsiveness is good
- [ ] Error states display correctly

### Test Different Scenarios
```javascript
// Test with no location permission
// Test in different cities/countries
// Test with different radius values
// Test with slow network (DevTools throttling)
// Test on mobile devices
```

---

## 🔍 Troubleshooting

### API Not Responding
```
Error: "Places API Error: OVER_QUERY_LIMIT"
```
**Solution:** You've hit the API quota. Check Google Cloud Console quotas.

### Geolocation Not Working
```
Error: "Location permission denied"
```
**Solution:** Enable location in browser settings. On HTTPS only (except localhost).

### Mosques Not Showing
```
"No mosques found in this radius"
```
**Solution:** User might be in a location without mosques. Try increasing radius.

### API Key Invalid
```
Error: "Failed to load Google Maps"
```
**Solution:** 
1. Verify API key is correct in `.env`
2. Enable "Maps JavaScript API" in Google Cloud
3. Check API key restrictions

---

## 📈 Performance Optimization

### API Call Debouncing
The component automatically debounces API calls when radius changes. To adjust wait time:

```javascript
// In the component, change the searchMosques call debounce timing
const debouncedSearch = debounce(() => searchMosques(...), 500); // 500ms
```

### Caching Strategies
- Browser geolocation is cached (check `maximumAge`)
- Google Places results are cached per search
- Photos are loaded from Google's CDN

### Best Practices
- Use reasonable default radius (5-10 km)
- Limit API requests with debouncing
- Cache user location
- Lazy load photos

---

## 🌍 Localization

### Supported Languages
- ✅ English (LTR)
- ✅ Urdu (RTL)

### Adding New Language
1. Update `translations` object in component
2. Update `getTranslations()` in utils.js
3. Test RTL layout if new language is RTL

Example:
```javascript
const translations = {
  title: language === "ar" ? "أقرب المساجد" : "Nearest Mosques",
  // ... more keys
};
```

---

## 🔒 Security Considerations

### API Key Protection
1. Never commit API key to Git
2. Add to `.env` and `.gitignore`
3. Set domain restrictions in Google Cloud Console

### CSP Headers
If using Content Security Policy:
```
script-src: https://maps.googleapis.com
frame-src: https://maps.googleapis.com
```

---

## 📱 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Latest versions |
| Firefox | ✅ Full | Latest versions |
| Safari | ✅ Full | iOS 13+ |
| Edge | ✅ Full | Latest versions |
| IE 11 | ❌ No | Not supported |

---

## 📄 File Structure

```
src/pages/IslamicTools/NearestMosque/
├── index.jsx          # Main component (600+ lines)
├── utils.js          # Utility functions (400+ lines)
├── SETUP.md          # Detailed setup guide
└── README.md         # This file
```

---

## 🎓 Learning Resources

- [Google Maps Platform Docs](https://developers.google.com/maps)
- [Places API Reference](https://developers.google.com/maps/documentation/places/web-service)
- [React Hooks Guide](https://react.dev/reference/react/hooks)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Geolocation API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

---

## 🚀 Future Enhancements

Potential features to add:
- [ ] Prayer times integration
- [ ] Mosque amenities (parking, wheelchair access)
- [ ] User reviews and ratings
- [ ] Favorite/bookmark mosques
- [ ] Share mosque details
- [ ] Street view integration
- [ ] Crowd density information
- [ ] Nearby facilities (restaurants, etc.)

---

## 💡 Tips & Tricks

### Pre-fill User Location
```javascript
// On component mount, automatically request location
useEffect(() => {
  getUserLocation();
}, []);
```

### Add Search History
```javascript
// Store recent searches in localStorage
localStorage.setItem("mosque_search_history", JSON.stringify(recentSearches));
```

### Optimize Photo Loading
```javascript
// Only load photos when user expands card
const [photoLoaded, setPhotoLoaded] = useState(false);
```

### Add Favorites
```javascript
// Store user's favorite mosques
const [favorites, setFavorites] = useState(() => 
  JSON.parse(localStorage.getItem("favorite_mosques") || "[]")
);
```

---

## 📞 Support

For issues or questions:
1. Check the SETUP.md file
2. Review troubleshooting section
3. Check browser console for errors
4. Verify Google Cloud Console configuration

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jun 2026 | Initial release |

---

## 📄 License

Part of the Dawat-o-Islaah project. Use freely within your application.

---

**Made with ❤️ for the Muslim Community**

Last updated: June 2026
