import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* Fix marker icon path for many bundlers */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

const SAMPLE_POINTS = [
  { id: 1, name: "Program A", lat: 47.6062, lng: -122.3321, city: "Seattle" },
  { id: 2, name: "Program B", lat: 47.2529, lng: -122.4443, city: "Tacoma" }
];

export default function MapPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Interactive Map</h2>
      <div className="rounded border overflow-hidden">
        <MapContainer center={[47.6062, -122.3321]} zoom={9} className="leaflet-container">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {SAMPLE_POINTS.map(p => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                <div>
                  <strong>{p.name}</strong>
                  <div className="text-sm text-gray-600">{p.city}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
