let map, restroomLayer, userMarker;

// Initialize map with default center
map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

restroomLayer = L.layerGroup().addTo(map);

// Get user location
navigator.geolocation.getCurrentPosition(
  (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    // Center map on user
    map.setView([lat, lon], 15);

    // Show user marker
    userMarker = L.marker([lat, lon]).addTo(map)
      .bindPopup("📍 Your Location")
      .openPopup();

    // Load restrooms automatically
    loadRestrooms(lat, lon);

  },
  (err) => {
    alert("Could not get location. Showing map default view.");
  },
  { enableHighAccuracy: true, timeout: 10000 }
);

// Function to load restrooms near given coordinates
function loadRestrooms(lat, lon) {
  restroomLayer.clearLayers();

  const query = `
    [out:json][timeout:25];
    node["amenity"="toilets"](around:2000,${lat},${lon});
    out;
  `;
  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.elements || data.elements.length === 0) {
        alert("No restrooms found nearby.");
        return;
      }

      data.elements.forEach(place => {
        const name = place.tags && place.tags.name ? place.tags.name : "🚻 Public Restroom";
        const marker = L.marker([place.lat, place.lon]).addTo(restroomLayer);
        const distance = map.distance([lat, lon], [place.lat, place.lon]).toFixed(0);
        marker.bindPopup(`${name}<br>Distance: ${distance} m`);
      });
    })
    .catch(err => {
      console.error(err);
      alert("Error loading restrooms.");
    });
}
