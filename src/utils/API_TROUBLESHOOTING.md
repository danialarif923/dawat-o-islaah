# 🔧 Google Maps API - Troubleshooting Guide

## Error: "API Request Denied"

This is the most common error. Here's how to fix it step-by-step.

---

## ✅ Complete Setup Checklist

### Step 1: Create/Select Google Cloud Project
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create a new project or select existing one
- [ ] Name your project (e.g., "Dawat-o-Islaah")
- [ ] Click **CREATE**

### Step 2: Enable Required APIs
1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for and enable EACH of these:
   - [ ] **Maps JavaScript API** - Click **ENABLE**
   - [ ] **Places API** - Click **ENABLE**
   - [ ] **Geocoding API** - Click **ENABLE** (optional but recommended)

**⚠️ IMPORTANT:** Enable **Places API (New)** if available, or the regular **Places API**

### Step 3: Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. A popup will show your new API key
4. Click **COPY** and save it somewhere safe
5. Click **RESTRICT KEY** to set it up

### Step 4: Restrict Your API Key
1. In the API key page:
   - **Name:** Give it a name (e.g., "Mosque Finder Key")
   
2. **Application restrictions:**
   - Select **HTTP referrers (web sites)**
   - Add your domains:
     ```
     localhost:*
     localhost:5173
     yourdomain.com
     ```
   - OR select **None** (for testing - less secure)

3. **API restrictions:**
   - Select **Restrict key**
   - Check ONLY these:
     - ✅ Maps JavaScript API
     - ✅ Places API
     - ✅ Geocoding API (optional)
   - Click **SAVE**

4. **Copy your API key** and note it down

### Step 5: Add to Your Project
1. Create `.env` file in project root:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_KEY_HERE
   ```
   
2. **Replace** `YOUR_ACTUAL_KEY_HERE` with your actual API key

3. Add to `.gitignore`:
   ```
   .env
   .env.local
   ```

4. **RESTART** your development server:
   ```bash
   npm run dev
   ```

5. **REFRESH** your browser (Ctrl+Shift+R for hard refresh)

---

## 🔍 Debugging Steps

### Check if API Key is Loaded
Open browser DevTools (F12) → Console, and run:
```javascript
console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
```

Should output your API key. If it shows `undefined`:
- ✗ Your `.env` file is not set up correctly
- ✗ You haven't restarted the dev server
- ✗ The key name is wrong in `.env`

### Check if Google Maps API is Loaded
In DevTools Console, run:
```javascript
console.log(window.google?.maps?.places)
```

Should output an object. If it shows `undefined`:
- ✗ Google Maps script failed to load
- ✗ API key is invalid or missing

### Check Console for Errors
Open DevTools → **Console** tab and look for:
- ❌ 404 errors loading Google Maps script
- ❌ CORS errors
- ❌ Permission errors

---

## 🆘 Common Issues & Solutions

### Issue 1: "REQUEST_DENIED"
**Cause:** Places API not enabled OR API key restrictions too tight

**Fix:**
```
1. Go to Google Cloud Console
2. Enable "Places API"
3. In API key settings, make sure "Places API" is checked under API restrictions
4. Set application restrictions to "None" (for testing)
5. Wait 5 minutes
6. Refresh browser
```

### Issue 2: "OVER_QUERY_LIMIT"
**Cause:** Too many API requests in short time (rate limit)

**Fix:**
- ✓ Wait 5-10 minutes
- ✓ Try searching again
- ✓ Check your billing account is valid

### Issue 3: "INVALID_REQUEST"
**Cause:** Location or search parameters are invalid

**Fix:**
- ✓ Make sure location permission is enabled
- ✓ Try increasing search radius
- ✓ Check that you're actually in a location with internet

### Issue 4: Script loads but no mosques appear
**Cause:** Either no mosques in that area OR API query is restricted

**Fix:**
- ✓ Try larger radius (change 5 km to 20 km)
- ✓ Check you're in right location
- ✓ Verify Places API has Nearby Search enabled

### Issue 5: "You have included the Google Maps JavaScript API multiple times"
**Cause:** Script was loading multiple times (FIXED in latest version)

**Fix:**
- ✓ This should be fixed now
- ✓ If still seeing it, try hard refresh (Ctrl+Shift+R)

---

## 📋 Verification Checklist

Before testing the app, verify:

- [ ] `.env` file exists with `VITE_GOOGLE_MAPS_API_KEY`
- [ ] API key value is correct (copied from Google Cloud Console)
- [ ] Maps JavaScript API is **ENABLED** in Google Cloud
- [ ] Places API is **ENABLED** in Google Cloud
- [ ] Geocoding API is **ENABLED** in Google Cloud
- [ ] API key has **Maps JavaScript API** in restrictions
- [ ] API key has **Places API** in restrictions
- [ ] Application restrictions set correctly
- [ ] Dev server restarted (`npm run dev`)
- [ ] Browser hard refreshed (Ctrl+Shift+R)

---

## 🧪 Test Your Setup

Once configured, test with this in browser console:

```javascript
// Test 1: Check API key is loaded
console.log("API Key:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.slice(0, 10) + "...");

// Test 2: Check Google Maps loaded
console.log("Maps loaded:", !!window.google?.maps);

// Test 3: Check Places API loaded
console.log("Places API loaded:", !!window.google?.maps?.places);

// Test 4: Check Location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    console.log("Your location:", pos.coords.latitude, pos.coords.longitude);
  });
}
```

All should return `true` or valid values.

---

## 💰 Cost Information

**Monthly free tier includes:**
- $200 free credit (resets monthly)
- Covers ~6,000+ API requests

**After free tier:**
- Nearby Search: $17 per 1,000 requests
- Places Details: $7 per 1,000 requests

For a small app, you'll likely stay in the free tier.

---

## 🔗 Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [API Quotas & Limits](https://developers.google.com/maps/billing-and-pricing/pricing)
- [Deprecation Info](https://developers.google.com/maps/legacy)

---

## 🚀 Quick Test

Once everything is set up:

1. Visit `http://localhost:5173/nearest-mosque`
2. Click **"Get My Location"** button
3. Should show your coordinates
4. Should list nearby mosques after 2-3 seconds

If you see mosques, you're all set! ✅

---

## 📞 Still Having Issues?

Check these in order:

1. **Browser DevTools Console** - Any red errors?
2. **API Key Valid?** - Copy it directly from Google Cloud
3. **APIs Enabled?** - Check ALL three are enabled
4. **Restrictions Set?** - Make sure Places API is checked
5. **Hard Refresh?** - Ctrl+Shift+R or Cmd+Shift+R
6. **Dev Server Restarted?** - Kill and restart `npm run dev`

---

**Last Updated:** June 2026
**Status:** Working ✅
