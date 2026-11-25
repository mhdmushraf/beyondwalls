// Google Maps JavaScript API key — the same browser key Saqr uses (Linkzone's Google Cloud).
// In Google Cloud → Credentials, add this app's domains to the key's website restrictions
// (beyondwalls.ae/*, *.base44.app/*), or Google refuses to load it here.
// If Google fails to load, the maps fall back to free OpenStreetMap automatically.
export const GOOGLE_MAPS_API_KEY = 'AIzaSyDqGm2ok3haWfS2SaaytZhgPgIvq9k7PK0';

// Advanced markers need a Map ID. DEMO_MAP_ID works; create a "Beyond Walls" Map ID later for custom styling.
export const GOOGLE_MAP_ID = 'DEMO_MAP_ID';

let loader = null;

/** Loads Maps JS (vector map + advanced markers + geocoding) once. */
export function loadGoogleMaps() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (!GOOGLE_MAPS_API_KEY) return Promise.reject(new Error('no key'));
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { loader = null; reject(new Error('Google Maps timed out')); }, 12000);
    const done = async () => {
      try {
        const [{ Map }, { AdvancedMarkerElement }, { Geocoder }] = await Promise.all([
          window.google.maps.importLibrary('maps'),
          window.google.maps.importLibrary('marker'),
          window.google.maps.importLibrary('geocoding'),
        ]);
        clearTimeout(timeout);
        resolve({ ...window.google.maps, Map, AdvancedMarkerElement, Geocoder });
      } catch (e) { clearTimeout(timeout); loader = null; reject(e); }
    };
    // Google calls this when the key is refused (wrong domain, billing off).
    window.gm_authFailure = () => { clearTimeout(timeout); loader = null; reject(new Error('Google Maps key refused for this site')); };
    if (window.google?.maps?.importLibrary) { done(); return; }
    const cb = '__bwGmapsReady';
    window[cb] = done;
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&v=weekly&loading=async&libraries=marker&callback=${cb}`;
    s.async = true;
    s.onerror = () => { clearTimeout(timeout); loader = null; reject(new Error('Google Maps failed to load')); };
    document.head.appendChild(s);
  });
  return loader;
}
