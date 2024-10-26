import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LaunchMap = () => {
  const launchSites = [
    {
      name: "Kennedy Space Center",
      position: [28.573255, -80.646895],
      description: "NASA's primary launch center"
    },
    {
      name: "Cape Canaveral Space Force Station",
      position: [28.4889, -80.5778],
      description: "Historic launch site"
    }
  ];

  return (
    <div className="map-container" style={{ height: '500px', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={[28.573255, -80.646895]} 
        zoom={10} 
        style={{ height: '100%', width: '100%', position: 'absolute' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {launchSites.map((site, index) => (
          <Marker key={index} position={site.position}>
            <Popup>
              <div>
                <h3 className="mb-2">{site.name}</h3>
                <p className="mb-0">{site.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LaunchMap;