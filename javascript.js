let restroomLayer = L.layerGroup().addTo(map)

function findRestrooms(){

restroomLayer.clearLayers()

navigator.geolocation.getCurrentPosition((pos)=>{

let lat = pos.coords.latitude
let lon = pos.coords.longitude

let query = `
[out:json];
node["amenity"="toilets"](around:1200,${lat},${lon});
out;
`

let url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query)

fetch(url)
.then(res=>res.json())
.then(data=>{

if(data.elements.length === 0){
alert("No restrooms found nearby")
}

data.elements.forEach(place=>{

let marker = L.marker([place.lat, place.lon]).addTo(restroomLayer)

marker.bindPopup("🚻 Public Restroom")

})

})
.catch(()=>alert("Error loading restrooms"))

})

}