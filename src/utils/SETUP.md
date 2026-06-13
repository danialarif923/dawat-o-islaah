# Nearest Mosques Feature - Setup Guide

## 📋 Overview
The Nearest Mosques feature is a complete, production-ready React component that:
- ✅ Fetches user's current location via Geolocation API
- ✅ Searches for mosques using Google Places API
- ✅ Calculates accurate distances using Haversine formula
- ✅ Displays mosques ranked by distance or rating
- ✅ Shows mosque details: name, address, opening status, ratings, photos
- ✅ Provides direct navigation links to Google Maps
- ✅ Fully responsive with dark/light theme support
- ✅ RTL support (Urdu language)
- ✅ Comprehensive error handling & loading states

---

## 🔧 Installation & Dependencies

### Required NPM Packages
You **don't need** to install any additional packages! The component uses:

1. **lucide-react** (for icons) - Already in your project
2. **Context APIs** (LanguageContext, ThemeContext) - Already in your project
3. **Browser APIs** (Geolocation, Google Maps) - Built-in

### Verify Existing Dependencies
Run this command to ensure you have lucide-react:
```bash
npm list lucide-react
```

If not installed:
```bash
npm install lucide-react
```

---

## 🔑 Google Maps API Configuration

### Step 1: Get Your API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
4. Create an API key (Service account or Browser key)
5. Set up restrictions (optional but recommended)

### Step 2: Add Environment Variable

#### For Vite Projects (Recommended)
Create or update your `.env` file in the project root:

```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

#### For Create React App
If using CRA, use:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

**Note:** The component currently uses `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` (Vite syntax).

### Step 3: Verify Configuration
```javascript
// In your component, you'll see:
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
if (!apiKey) {
  // Error message shown to user
}
```

---

## 📁 Project Structure

```
src/
├── pages/
│   └── IslamicTools/
│       └── NearestMosque/
│           ├── index.jsx          ← Main component
│           └── SETUP.md           ← This file
├── context/
│   ├── LanguageContext.jsx        ← Already exists
│   ├── ThemeContext.jsx           ← Already exists
│   └── AuthContext.jsx            ← For user data
└── ...
```

---

## 🎯 Integration Steps

### 1. Import the Component
```javascript
// In your routing file or parent component
import NearestMosqueMap from "../pages/IslamicTools/NearestMosque";

// Add to your routes
<Route path="/nearest-mosques" element={<NearestMosqueMap />} />
```

### 2. Add Navigation Link
```javascript
// In your navigation menu
<Link to="/nearest-mosques">
  <MapPin className="w-5 h-5" />
  Nearest Mosques
</Link>
```

### 3. Verify Context Providers
Ensure your app wraps with required providers:

```javascript
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          {/* Your routes here */}
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
```

---

## 🚀 Features Breakdown

### Core Functionality
| Feature | Status | Details |
|---------|--------|---------|
| Geolocation | ✅ | Browser native API with error handling |
| Places Search | ✅ | Google Places API (Nearby Search) |
| Distance Calc | ✅ | Haversine formula (client-side) |
| Sorting | ✅ | By distance or rating |
| Radius Control | ✅ | Dynamic slider (1-50 km) |
| Filtering | ✅ | Search by text query |
| Theme Support | ✅ | Dark/Light modes |
| RTL Support | ✅ | Urdu language |
| Photo Display | ✅ | Google Places photos |

### UI/UX Elements
- **Glassmorphic Header** with sticky positioning
- **Gradient Badges** for distance display
- **Smooth Animations** on hover effects
- **Loading States** with spinner
- **Error Alerts** with helpful messages
- **Empty States** with action buttons
- **Responsive Grid** (mobile-first design)
- **Icon Integration** with lucide-react

### User States Handled
1. **Initial Load** - Prompts user to share location
2. **Location Loading** - Shows spinner while fetching coordinates
3. **Searching Mosques** - Shows loading state while API fetches
4. **No Results** - Shows empty state with "increase radius" option
5. **API Errors** - Shows error messages with recovery actions
6. **Location Denied** - Shows helpful permission instructions

---

## ⚙️ Customization Options

### Change Default Radius
```javascript
const [radius, setRadius] = useState(5); // Default: 5 km
// Change to: setRadius(10); // 10 km default
```

### Modify Radius Range
```javascript
<input
  type="range"
  min="1"      {/* Change minimum */}
  max="50"     {/* Change maximum */}
  value={radius}
  onChange={(e) => setRadius(Number(e.target.value))}
/>
```

### Add More Sort Options
```javascript
const [sortBy, setSortBy] = useState("distance");
// Add 'open-now', 'highest-rated', etc.
```

### Customize Translations
Update the `translations` object in the component:
```javascript
const translations = {
  title: isRtl ? "Your Urdu Title" : "Your English Title",
  // ... more translations
};
```

---

## 🧪 Testing Checklist

- [ ] Environment variable `VITE_GOOGLE_MAPS_API_KEY` is set
- [ ] Browser location permission works
- [ ] Mosques appear in the list
- [ ] Distance calculations are accurate
- [ ] "Get Directions" opens Google Maps
- [ ] Radius slider updates results
- [ ] Search filter works
- [ ] Sort by rating/distance works
- [ ] Theme toggle (dark/light) works
- [ ] RTL text alignment correct (Urdu)
- [ ] Error messages appear on API failures
- [ ] Mobile responsive layout works

---

## 🔍 Troubleshooting

### "Google Maps API key not configured"
**Solution:** Check that `VITE_GOOGLE_MAPS_API_KEY` is set in `.env` file

### "Geolocation is not supported"
**Solution:** Requires HTTPS (except localhost). Use HTTPS in production.

### "No mosques found in this radius"
**Solution:** 
- User might be in a location with no mosques
- Try increasing the radius using the slider
- Check internet connectivity

### "Failed to load Google Maps"
**Solution:**
- Verify API key is correct
- Enable "Maps JavaScript API" & "Places API" in Google Cloud Console
- Check API key restrictions (allow your domain)

### Slow API responses
**Solution:** 
- API calls are debounced when radius changes
- Use smaller radius for faster results
- Check network tab in DevTools

### Photos not loading
**Solution:**
- Some mosques don't have photos in Google Places
- Component gracefully handles missing photos
- Shows card without image in that case

---

## 📊 API Usage & Quotas

### Google Places API Costs
- **Nearby Search**: ~$32 per 1000 requests
- **Quotas**: Free tier includes $200/month credit

### To Monitor Usage:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Quotas
3. Search for "Places API"
4. View current usage

### Optimization Tips:
- Implement caching for user location
- Debounce radius changes to prevent repeated API calls
- Set reasonable default radius (5-10 km)
- Combine multiple search parameters to reduce requests

---

## 🔒 Security Best Practices

### API Key Safety
1. **Never** commit API key to Git
2. Use `.env` files (add to `.gitignore`)
3. Set API key restrictions in Google Cloud Console:
   - HTTP Referrers (restrict to your domain)
   - IP address whitelist (if applicable)

### Content Security Policy
If using CSP headers, add:
```
script-src: https://maps.googleapis.com
```

---

## 📱 Responsive Breakpoints

The component is fully responsive:
- **Mobile (< 768px)**: Single column, optimized touch targets
- **Tablet (768px - 1024px)**: Two columns
- **Desktop (> 1024px)**: Full layout with optimal spacing

---

## 🎨 Theme & Styling

The component integrates with your existing theme system:

### Dark Mode
```javascript
theme === "dark" ? "bg-gray-900" : "bg-gray-50"
```

### Light Mode
- Clean white backgrounds
- Clear text contrast
- Professional appearance

### Tailwind CSS
All styling uses Tailwind utility classes. Ensure Tailwind is configured in your project.

---

## 🌐 Language Support

### Urdu (RTL)
- Automatically detects language from `useLanguage()` hook
- Reverses layout when `language === "ur"`
- All text translations included

### English (LTR)
- Default language
- Full English translations included

### Adding New Languages
Update the `translations` object:
```javascript
const translations = {
  title: isRtl ? "Your Language" : "Your Language",
  // Add all keys for new language
};
```

---

## 📞 Support Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API Reference](https://developers.google.com/maps/documentation/places/web-service/overview)
- [React Hooks Documentation](https://react.dev/reference/react/hooks)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 📝 Component Props

The component doesn't accept props currently. To customize:

1. Edit the component directly
2. Create a wrapper component that passes props
3. Use context/redux for global configuration

---

## ✨ Future Enhancements

Potential improvements:
- [ ] Cache mosque data to reduce API calls
- [ ] Add prayer times display
- [ ] Show mosque facilities (parking, wheelchair access)
- [ ] Add reviews/comments section
- [ ] Implement user favorites/bookmarks
- [ ] Add mosque contact information
- [ ] Create mosque detail modal
- [ ] Support multiple mosques selection for comparison

---

## 📄 License

This component is part of your Dawat-o-Islaah project. Use it freely within your application.

---

**Last Updated:** June 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
