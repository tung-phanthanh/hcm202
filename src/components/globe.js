import React, { useEffect, useRef } from 'react';
import { Map, TileLayer, Marker, Tooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';

import { useStateValue } from '../state';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons not showing up due to webpack issues with leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export default function Globe() {
  const [{ markers, focusedMarker, hasLoaded, start, journeyPath, isMapTransitioning }, dispatch] = useStateValue();
  const mapRef = useRef();

  useEffect(() => {
    // Simulate loading to trigger the app state to LOADED
    // (since we don't need to wait for textures like in 3D globe)
    dispatch({ type: 'LOADED' });
  }, [dispatch]);

  // Center map on the focused marker or default to Vietnam
  const defaultCenter = [16.0, 106.0];
  const center = focusedMarker ? focusedMarker.coordinates : defaultCenter;
  const zoom = focusedMarker ? 6 : 4;

  useEffect(() => {
    if (mapRef.current && focusedMarker) {
      const map = mapRef.current.leafletElement;
      map.flyTo(focusedMarker.coordinates, 6, {
        animate: true,
        duration: 2.0
      });
    }
  }, [focusedMarker]);

  if (!hasLoaded) return null;

  return (
    <div 
      style={{ 
        height: '100vh', 
        width: '100vw', 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        zIndex: 10,
        opacity: (start && isMapTransitioning) ? 1 : 0,
        pointerEvents: (start && isMapTransitioning) ? 'auto' : 'none',
        transition: 'opacity 0.8s ease-in-out'
      }}
    >
      <Map 
        ref={mapRef}
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false} // Disable default zoom control to avoid overlap with UI
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {start && markers.map(marker => (
          <Marker 
            key={marker.id} 
            position={marker.coordinates}
            interactive={false} // Enforce linear navigation, no clicking
          />
        ))}
        {start && journeyPath && journeyPath.length > 1 && (
          <Polyline 
            positions={journeyPath} 
            color="#f59e0b" 
            weight={4}
            className="animated-path"
          />
        )}
      </Map>
    </div>
  );
}
