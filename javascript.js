let map, restroomLayer, userMarker;

// Initialize the map with user location
navigator.geolocation.getCurrentPosition(
  (pos) => {
    let lat = pos.coords.latitude;
    let lon = pos.coords.longitude;

    map = L.map('map').setView([lat, lon], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    userMarker = L.marker([lat, lon]).addTo(map)
      .bindPopup("📍 Your Location")
      .openPopup();

    restroomLayer = L.layerGroup().addTo(map);

  }, 
  (err) => {
    alert("Could not get location. Map may not show correctly.");
    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);
    restroomLayer = L.layerGroup().addTo(map);
  }
);

// Find nearby restrooms
function findRestrooms() {
  if (!userMarker) {
    alert("User location not found yet.");
    return;
  }

  // Clear old markers
  restroomLayer.clearLayers();

  let lat = userMarker.getLatLng().lat;
  let lon = userMarker.getLatLng().lng;

  let query = `
    [out:json][timeout:25];
    node["amenity"="toilets"](around:2000,${lat},${lon});
    out;
  `;
  let url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.elements || data.elements.length === 0) {
        alert("No restrooms found nearby.");
        return;
      }

      data.elements.forEach(place => {
        let name = place.tags && place.tags.name ? place.tags.name : "🚻 Public Restroom";
        let marker = L.marker([place.lat, place.lon]).addTo(restroomLayer);
        let distance = map.distance([lat, lon], [place.lat, place.lon]).toFixed(0);
        marker.bindPopup(`${name}<br>Distance: ${distance} m`);
      });
    })
    .catch(err => {
      console.error(err);
      alert("Error loading restrooms.");
    });
}
