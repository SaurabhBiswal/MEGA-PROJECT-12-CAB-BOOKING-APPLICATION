import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Beautiful custom SVG icons
const pickupIcon = L.divIcon({
  className: '',
  html: `<div style="display:flex;flex-direction:column;align-items:center;">
    <div style="background:#22c55e;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(34,197,94,0.6);"></div>
    <div style="width:2px;height:14px;background:#22c55e;opacity:0.7;"></div>
  </div>`,
  iconSize: [24, 38],
  iconAnchor: [12, 38],
});

const dropoffIcon = L.divIcon({
  className: '',
  html: `<div style="display:flex;flex-direction:column;align-items:center;">
    <div style="background:#ef4444;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(239,68,68,0.6);"></div>
    <div style="width:2px;height:14px;background:#ef4444;opacity:0.7;"></div>
  </div>`,
  iconSize: [24, 38],
  iconAnchor: [12, 38],
});

const driverIcon = L.divIcon({
  className: '',
  html: `<div style="background:#3b82f6;width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3);display:flex;align-items:center;justify-content:center;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Smart map auto-fit when both points are set
const AutoFitBounds = ({ pickup, dropoff }) => {
  const map = useMap();
  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds([pickup, dropoff]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else if (pickup) {
      map.setView(pickup, 14);
    }
  }, [pickup, dropoff, map]);
  return null;
};

// Draw routing line using OSRM (free routing API)
const RoutingLayer = ({ pickup, dropoff }) => {
  const map = useMap();
  const routeRef = useRef(null);

  useEffect(() => {
    // Remove old route
    if (routeRef.current) {
      map.removeLayer(routeRef.current);
      routeRef.current = null;
    }

    if (pickup && dropoff) {
      const fetchRoute = async () => {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${dropoff[1]},${dropoff[0]}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            const polyline = L.polyline(coords, {
              color: '#3b82f6',
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            });
            polyline.addTo(map);
            routeRef.current = polyline;
          }
        } catch (e) {
          // Fallback straight line
          const polyline = L.polyline([pickup, dropoff], { color: '#3b82f6', weight: 4, dashArray: '8,8' });
          polyline.addTo(map);
          routeRef.current = polyline;
        }
      };
      fetchRoute();
    }

    return () => {
      if (routeRef.current) {
        map.removeLayer(routeRef.current);
      }
    };
  }, [pickup, dropoff, map]);

  return null;
};

// Click handler to set points
const ClickHandler = ({ onPickup, onDropoff, pickup }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      // Reverse geocode
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`);
        const data = await res.json();
        const name = data.display_name?.split(',').slice(0, 3).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        if (!pickup) {
          onPickup([lat, lng], name);
        } else {
          onDropoff([lat, lng], name);
        }
      } catch {
        if (!pickup) onPickup([lat, lng], `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        else onDropoff([lat, lng], `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    }
  });
  return null;
};

const MapComponent = ({ pickup, dropoff, driverLocation, height = '400px', onPickup, onDropoff, interactive = false }) => {
  const defaultCenter = [28.6139, 77.2090]; // New Delhi

  return (
    <div style={{ height, width: '100%', overflow: 'hidden' }}>
      <MapContainer
        center={pickup || defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoFitBounds pickup={pickup} dropoff={dropoff} />
        <RoutingLayer pickup={pickup} dropoff={dropoff} />

        {interactive && (
          <ClickHandler onPickup={onPickup} onDropoff={onDropoff} pickup={pickup} />
        )}

        {pickup && (
          <Marker position={pickup} icon={pickupIcon}>
            <Popup><strong>📍 Pickup</strong></Popup>
          </Marker>
        )}
        {dropoff && (
          <Marker position={dropoff} icon={dropoffIcon}>
            <Popup><strong>🏁 Dropoff</strong></Popup>
          </Marker>
        )}
        {driverLocation && (
          <Marker position={driverLocation} icon={driverIcon}>
            <Popup><strong>🚗 Driver</strong></Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
