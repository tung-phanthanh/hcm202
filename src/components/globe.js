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

// A custom component that animates drawing a line from A to B
function AnimatedPolyline({ positions, color, weight, dashArray, className, duration = 2000, mapRef }) {
  const [currentPos, setCurrentPos] = React.useState(null);
  const [isDrawing, setIsDrawing] = React.useState(true);

  React.useEffect(() => {
    if (!positions || positions.length < 2) return;
    
    const start = positions[0];
    const end = positions[positions.length - 1];
    
    // Reset to start
    setCurrentPos(start);
    setIsDrawing(true);
    
    let startTime = null;
    let animationFrameId;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      
      // Interpolate lat and lng
      const lat = start[0] + (end[0] - start[0]) * progress;
      const lng = start[1] + (end[1] - start[1]) * progress;
      
      const pos = [lat, lng];
      setCurrentPos(pos);
      
      if (mapRef && mapRef.current) {
        mapRef.current.leafletElement.panTo(pos, { animate: false });
      }
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setIsDrawing(false);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [positions, duration, mapRef]);

  if (!positions || positions.length < 2 || !currentPos) return null;

  return (
    <Polyline 
      positions={[positions[0], currentPos]} 
      color={color} 
      weight={weight}
      dashArray={dashArray}
      className={isDrawing ? 'animated-path-drawing' : className}
    />
  );
}

export default function Globe() {
  const [{ markers, focusedMarker, hasLoaded, start, journeyPath, isMapTransitioning, mapTransitionDuration }, dispatch] = useStateValue();
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
      // Chỉ flyTo nếu KHÔNG CÓ hoạt ảnh vẽ đường (tức là không phải chuyển sự kiện)
      if (!journeyPath || journeyPath.length <= 1) {
        map.flyTo(focusedMarker.coordinates, 6, {
          animate: true,
          duration: 1.5
        });
      }
    }
  }, [focusedMarker, journeyPath]);

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
          <AnimatedPolyline 
            key={journeyPath.map(p => p.join(',')).join('-')}
            positions={journeyPath} 
            color="#f59e0b" 
            weight={4}
            dashArray="10, 15"
            className="animated-path"
            duration={mapTransitionDuration || 1500}
            mapRef={mapRef}
          />
        )}
      </Map>
    </div>
  );
}
