import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { OfficeLocation } from '../types';

interface GeofenceMapProps {
  office: OfficeLocation;
  userLat: number;
  userLng: number;
  distanceMeters: number;
  isInside: boolean;
  onSelectCoordinates?: (lat: number, lng: number) => void;
  interactiveSelect?: boolean;
}

export const GeofenceMap: React.FC<GeofenceMapProps> = ({
  office,
  userLat,
  userLng,
  distanceMeters,
  isInside,
  onSelectCoordinates,
  interactiveSelect = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelectCoordinates);

  // Keep latest callback ref to avoid re-binding click handler repeatedly
  useEffect(() => {
    onSelectRef.current = onSelectCoordinates;
  }, [onSelectCoordinates]);

  // Initialize Map ONCE on mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const container = mapContainerRef.current;

    // Guard against double initialization or leftover Leaflet ID
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      } catch {
        // ignore
      }
      mapInstanceRef.current = null;
    }

    const map = L.map(container, {
      center: [office.latitude, office.longitude],
      zoom: 17,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Add base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Layer group for dynamic markers/shapes
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    if (interactiveSelect) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onSelectRef.current) {
          onSelectRef.current(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
    };
  }, [interactiveSelect]);

  // Update map layers and view when office or user coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (!map || !layerGroup) return;

    // Clear previous markers & overlays safely
    layerGroup.clearLayers();

    // Office Custom Icon
    const officeIcon = L.divIcon({
      className: 'custom-office-pin',
      html: `
        <div style="
          background-color: #1e3a8a;
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          font-weight: bold;
          font-size: 18px;
        ">
          🏢
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    // Add Office Marker
    const officeMarker = L.marker([office.latitude, office.longitude], { icon: officeIcon }).bindPopup(
      `<div style="font-family: sans-serif;">
        <strong>${office.name}</strong><br/>
        Radius Absensi: ${office.radiusMeters} meter
      </div>`
    );
    layerGroup.addLayer(officeMarker);

    // Geofence Radius Circle
    const circleColor = isInside ? '#10b981' : '#ef4444';
    const circle = L.circle([office.latitude, office.longitude], {
      color: circleColor,
      fillColor: circleColor,
      fillOpacity: 0.18,
      radius: office.radiusMeters,
      weight: 2,
      dashArray: isInside ? '' : '6, 6',
    });
    layerGroup.addLayer(circle);

    // User Location Icon
    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: `
        <div style="
          background-color: ${isInside ? '#059669' : '#dc2626'};
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 0 12px ${isInside ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'};
          font-size: 14px;
        ">
          📍
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Add User Marker
    const userMarker = L.marker([userLat, userLng], { icon: userIcon }).bindPopup(
      `<div style="font-family: sans-serif;">
        <strong>Posisi GPS Anda</strong><br/>
        Jarak: ${distanceMeters}m dari lokasi kantor<br/>
        Status: <span style="color:${isInside ? '#059669' : '#dc2626'}; font-weight:bold;">
          ${isInside ? 'VALID (Dalam Radius)' : 'DILUAR RADIUS'}
        </span>
      </div>`
    );
    layerGroup.addLayer(userMarker);

    // Line connecting User to Office
    const polyline = L.polyline(
      [
        [office.latitude, office.longitude],
        [userLat, userLng],
      ],
      {
        color: isInside ? '#10b981' : '#f59e0b',
        weight: 2,
        opacity: 0.8,
        dashArray: '4, 4',
      }
    );
    layerGroup.addLayer(polyline);

    // Fit bounds safely without crash
    try {
      const bounds = L.latLngBounds([
        [office.latitude, office.longitude],
        [userLat, userLng],
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
    } catch {
      // ignore fitBounds bounds exception if coordinates identical
    }
  }, [office, userLat, userLng, distanceMeters, isInside]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-50">
      <div ref={mapContainerRef} className="w-full h-72 sm:h-80 z-0" />

      {/* Floating Status Badge */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-slate-200 text-xs sm:text-sm font-medium flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full animate-pulse ${
            isInside ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'
          }`}
        />
        <div>
          <span className="text-slate-500">Jarak: </span>
          <span className="font-bold text-slate-800">{distanceMeters} Meter</span>
          <span className="mx-1 text-slate-300">|</span>
          <span className={isInside ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
            {isInside ? 'Di Dalam Radius Kantor' : 'Di Luar Radius Kantor'}
          </span>
        </div>
      </div>
    </div>
  );
};
