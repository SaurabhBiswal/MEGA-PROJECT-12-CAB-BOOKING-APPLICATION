import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix default icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Icons (Premium Look)
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to handle map clicks and centering
const MapController = ({ pickup, dropoff, onMapClick }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng);
    },
  });

  useEffect(() => {
    if (pickup && dropoff) {
      // Auto-zoom to fit both points with padding
      const bounds = L.latLngBounds([
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 14);
    } else if (dropoff) {
      map.setView([dropoff.lat, dropoff.lng], 14);
    }
  }, [pickup, dropoff, map]);

  return null;
};

// Component to draw the OSRM route line
const RoutingLayer = ({ pickup, dropoff }) => {
  const map = useMap();
  const [route, setRoute] = useState([]);

  useEffect(() => {
    if (!pickup || !dropoff) {
      setRoute([]);
      return;
    }

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRoute(coords);
        }
      } catch (err) {
        console.error("Routing error:", err);
      }
    };

    fetchRoute();
  }, [pickup, dropoff]);

  if (route.length === 0) return null;

  return (
    <L.Polyline 
      positions={route} 
      pathOptions={{ 
        color: '#3b82f6', 
        weight: 5, 
        opacity: 0.8,
        lineJoin: 'round'
      }} 
    />
  );
};

const MapComponent = ({ pickup, dropoff, onMapClick }) => {
  const defaultCenter = [28.6139, 77.2090]; // Delhi

  return (
    <div className="w-full h-full rounded-inherit overflow-hidden relative border border-gray-700/50">
      <MapContainer 
        center={pickup ? [pickup.lat, pickup.lng] : defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        <MapController pickup={pickup} dropoff={dropoff} onMapClick={onMapClick} />
        <RoutingLayer pickup={pickup} dropoff={dropoff} />

        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>
              <div className="text-xs font-bold">Pickup Point</div>
              <div className="text-[10px] text-gray-500">{pickup.label || 'Selected Location'}</div>
            </Popup>
          </Marker>
        )}

        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
            <Popup>
              <div className="text-xs font-bold text-red-500">Dropoff Point</div>
              <div className="text-[10px] text-gray-500">{dropoff.label || 'Destination'}</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map HUD Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="glass-card p-2 rounded-lg flex flex-col gap-1 border border-white/10 shadow-xl">
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
             <div className="w-2 h-2 rounded-full bg-green-500"></div> PICKUP
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
             <div className="w-2 h-2 rounded-full bg-red-500"></div> DROP
           </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
