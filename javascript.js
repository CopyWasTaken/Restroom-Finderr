let map;
let restroomLayer;
let userMarker;

map = L.map('map').setView([20,0],2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);

restroomLayer = L.layerGroup().addTo(map);

function startSearch(){

document.getElementById("status").innerText = "Getting your location..."

navigator.geolocation.getCurrentPosition(

(pos)=>{

let lat = pos.coords.latitude
let lon = pos.coords.longitude

map.setView([lat,lon],15)

if(userMarker){
map.removeLayer(userMarker)
}

userMarker = L.marker([lat,lon]).addTo(map)
.bindPopup("📍 Your Location")
.openPopup()

loadRestrooms(lat,lon)

},

()=>{
document.getElementById("status").innerText = "❌ Location access denied"
},

{enableHighAccuracy:true,timeout:10000}

)

}

function loadRestrooms(lat,lon){

document.getElementById("status").innerText = "Searching for nearby restrooms..."

restroomLayer.clearLayers()

let query = `
[out:json][timeout:25];
node["amenity"="toilets"](around:1000,${lat},${lon});
out;
`

let url = "https://overpass.kumi.systems/api/interpreter?data=" + encodeURIComponent(query)

fetch(url)
.then(res=>res.json())
.then(data=>{

if(!data.elements || data.elements.length===0){

document.getElementById("status").innerText = "No restrooms found nearby"

return

}

document.getElementById("status").innerText = data.elements.length + " restrooms found"

data.elements.forEach(place=>{

let name = place.tags && place.tags.name ? place.tags.name : "🚻 Public Restroom"

let marker = L.marker([place.lat,place.lon]).addTo(restroomLayer)

let distance = map.distance([lat,lon],[place.lat,place.lon]).toFixed(0)

marker.bindPopup(name + "<br>Distance: " + distance + " m")

})

})
.catch(()=>{

document.getElementById("status").innerText = "⚠️ Error loading restroom data"

})

}
