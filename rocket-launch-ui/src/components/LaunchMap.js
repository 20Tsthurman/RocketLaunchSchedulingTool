import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
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
  const [selectedSite, setSelectedSite] = useState(null);
  const [scores, setScores] = useState({});

  const launchSites = useMemo(() => [
    {
      name: "Kennedy Space Center",
      position: [28.573255, -80.646895],
      description: "NASA's primary launch center",
      details: "Historic launch site for Apollo and Space Shuttle missions"
    },
    {
      name: "Cape Canaveral",
      position: [28.4889, -80.5778],
      description: "Space Force Station",
      details: "Active launch site for multiple commercial and military missions"
    },
    {
      name: "Vandenberg SFB",
      position: [34.7420, -120.5724],
      description: "West Coast launch site",
      details: "Primary site for polar orbit launches"
    },
    {
      name: "Wallops Flight Facility",
      position: [37.9401, -75.4663],
      description: "NASA's commercial launch site",
      details: "Supports small and medium-sized launches"
    },
    {
      name: "Kodiak Launch Complex",
      position: [57.4356, -152.3378],
      description: "Alaska's spaceport",
      details: "Ideal for polar and high-inclination orbits"
    },
    {
      name: "Spaceport America",
      position: [32.9903, -106.9749],
      description: "Commercial spaceport",
      details: "World's first purpose-built commercial spaceport"
    }
  ], []); // Empty dependency array since this data never changes

  useEffect(() => {
    // Fetch launch scores for all sites
    Promise.all(
      launchSites.map(site =>
        fetch(`/launch_score/${site.name}`)
          .then(res => res.json())
          .catch(err => ({ error: err }))
      )
    ).then(results => {
      const scoreData = {};
      results.forEach((result, index) => {
        if (!result.error) {
          scoreData[launchSites[index].name] = result.composite_score;
        }
      });
      setScores(scoreData);
    });
  }, [launchSites]);

  const getMarkerColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const customIcon = (score) => new L.DivIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${getMarkerColor(score)};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${Math.round(score)}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  return (
    <div className="map-container relative" style={{ height: '500px', width: '100%' }}>
      <MapContainer 
        center={[39.8283, -98.5795]} 
        zoom={4} 
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg overflow-hidden"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {launchSites.map((site) => (
          <React.Fragment key={site.name}>
            <Marker
              position={site.position}
              icon={scores[site.name] ? customIcon(scores[site.name]) : new L.Icon.Default()}
              eventHandlers={{
                click: () => setSelectedSite(site),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">{site.name}</h3>
                  <p className="text-sm text-gray-600">{site.description}</p>
                  <p className="text-sm mt-2">{site.details}</p>
                  {scores[site.name] && (
                    <p className="mt-2 font-bold">
                      Launch Score: {Math.round(scores[site.name])}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
            
            <Circle
              center={site.position}
              pathOptions={{
                color: getMarkerColor(scores[site.name] || 0),
                fillColor: getMarkerColor(scores[site.name] || 0),
                fillOpacity: 0.1
              }}
              radius={50000}
            />
          </React.Fragment>
        ))}
      </MapContainer>
      
      {selectedSite && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="font-bold text-lg">{selectedSite.name}</h3>
          <p className="text-sm text-gray-600">{selectedSite.description}</p>
          <p className="text-sm mt-2">{selectedSite.details}</p>
          {scores[selectedSite.name] && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full`}
                  style={{ backgroundColor: getMarkerColor(scores[selectedSite.name]) }}
                />
                <span className="font-bold">
                  Launch Score: {Math.round(scores[selectedSite.name])}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LaunchMap;