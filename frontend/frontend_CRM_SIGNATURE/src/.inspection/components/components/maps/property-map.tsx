// 'use client';

// import { useEffect, useRef } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // Leaflet's default marker icons reference image files by relative path, which breaks
// // under bundlers like Turbopack/Webpack. Re-pointing them to a CDN sidesteps that
// // entirely rather than fighting asset-loading config.
// const defaultIcon = L.icon({
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// export function PropertyMap({
//   latitude,
//   longitude,
//   title,
// }: {
//   latitude: number;
//   longitude: number;
//   title: string;
// }) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const mapRef = useRef<L.Map | null>(null);

//   useEffect(() => {
//     if (!containerRef.current || mapRef.current) return;

//     const map = L.map(containerRef.current).setView([latitude, longitude], 14);
//     mapRef.current = map;

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: '&copy; OpenStreetMap contributors',
//       maxZoom: 19,
//     }).addTo(map);

//     L.marker([latitude, longitude], { icon: defaultIcon }).addTo(map).bindPopup(title);

//     return () => {
//       map.remove();
//       mapRef.current = null;
//     };
//   }, [latitude, longitude, title]);

//   return <div ref={containerRef} className="h-72 w-full rounded-xl" />;
// }
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's default marker icons reference image files by relative path, which breaks
// under bundlers like Turbopack/Webpack. Re-pointing them to a CDN sidesteps that
// entirely rather than fighting asset-loading config.
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function PropertyMap({
  latitude,
  longitude,
  title,
  editable = false,
  onPositionChange,
}: {
  latitude: number;
  longitude: number;
  title: string;
  editable?: boolean;
  onPositionChange?: (latitude: number, longitude: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  // Kept in a ref so the map-init effect doesn't need to depend on the callback
  // identity and re-run the whole map setup every render.
  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([latitude, longitude], 14);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([latitude, longitude], {
      icon: defaultIcon,
      draggable: editable,
    })
      .addTo(map)
      .bindPopup(editable ? 'Drag me, or click the map, to set the exact spot' : title);

    if (editable) {
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onPositionChangeRef.current?.(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onPositionChangeRef.current?.(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // latitude/longitude/title intentionally only matter at mount time here â€”
    // while editing, position changes flow through the marker + callback, not
    // through re-passing new props into this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable]);

  return (
    <div
      ref={containerRef}
      className={`h-72 w-full rounded-xl ${editable ? 'cursor-crosshair' : ''}`}
    />
  );
}