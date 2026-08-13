import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Utility for custom Leaflet marker icons using HTML/Emojis
export function createEmojiIcon(emoji: string, bgClass: string = 'bg-emerald-600') {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="${bgClass} text-white w-9 h-9 rounded-full border-2 border-white shadow-md flex items-center justify-center text-lg transform hover:scale-110 transition-transform cursor-pointer">
        ${emoji}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32]
  });
}

export function createUserLocationIcon() {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
        <div class="w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white text-xs font-black">
          👤
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

// 1. PICKER MAP COMPONENT (Merchant selecting shop location)
interface MapPickerProps {
  initialLat: number;
  initialLng: number;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  initialLat,
  initialLng,
  onLocationSelect,
  height = '320px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map if re-rendered
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const startLat = initialLat || 28.7512;
    const startLng = initialLng || 77.4215;

    const map = L.map(mapContainerRef.current).setView([startLat, startLng], 14);
    mapInstanceRef.current = map;

    // Free OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const icon = createEmojiIcon('📍', 'bg-amber-500');
    const marker = L.marker([startLat, startLng], {
      draggable: true,
      icon
    }).addTo(map);

    markerRef.current = marker;

    // Notify parent on drag end
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onLocationSelect(pos.lat, pos.lng);
    });

    // Notify parent on map click
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });

    // Invalidate size after render to fix Leaflet gray box issue inside modal
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker if props change
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current && initialLat && initialLng) {
      markerRef.current.setLatLng([initialLat, initialLng]);
      mapInstanceRef.current.panTo([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner">
      <div ref={mapContainerRef} style={{ height }} className="w-full z-10" />
    </div>
  );
};

// 2. SINGLE SHOP MAP VIEW COMPONENT
interface SingleShopMapProps {
  lat: number;
  lng: number;
  shopName: string;
  categoryLabel: string;
  address: string;
  phone: string;
  height?: string;
}

export const SingleShopMapView: React.FC<SingleShopMapProps> = ({
  lat,
  lng,
  shopName,
  categoryLabel,
  address,
  phone,
  height = '300px'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current).setView([lat, lng], 15);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const icon = createEmojiIcon('🏪', 'bg-emerald-600');
    const marker = L.marker([lat, lng], { icon }).addTo(map);

    const popupContent = `
      <div style="font-family: sans-serif; padding: 2px;">
        <h4 style="margin:0 0 4px; font-weight: 800; color: #065f46; font-size: 14px;">${shopName}</h4>
        <p style="margin:0 0 4px; font-size: 12px; font-weight: 600; color: #334155;">🏷️ ${categoryLabel}</p>
        <p style="margin:0 0 6px; font-size: 11px; color: #64748b;">📍 ${address}</p>
        <a href="tel:${phone}" style="display:inline-block; background:#059669; color:#fff; padding:4px 10px; border-radius:8px; font-size:11px; font-weight:bold; text-decoration:none;">📞 ${phone}</a>
      </div>
    `;

    marker.bindPopup(popupContent).openPopup();

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, shopName]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md">
      <div ref={containerRef} style={{ height }} className="w-full z-10" />
    </div>
  );
};

// 3. MULTI-SHOP MAP VIEW COMPONENT (Nearby Search)
export interface ShopPinItem {
  id: string;
  name: string;
  shopName: string;
  lat: number;
  lng: number;
  categoryLabel: string;
  phone: string;
  address: string;
  distanceKm?: number;
}

interface MultiShopMapProps {
  userLat?: number;
  userLng?: number;
  shops: ShopPinItem[];
  onShopSelect?: (shopId: string) => void;
  height?: string;
}

export const MultiShopMapView: React.FC<MultiShopMapProps> = ({
  userLat,
  userLng,
  shops,
  onShopSelect,
  height = '350px'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const defaultLat = userLat || (shops.length > 0 ? shops[0].lat : 28.7512);
    const defaultLng = userLng || (shops.length > 0 ? shops[0].lng : 77.4215);

    const map = L.map(containerRef.current).setView([defaultLat, defaultLng], 12);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const bounds = L.latLngBounds([]);

    // 1. User Location Marker
    if (userLat && userLng) {
      const userIcon = createUserLocationIcon();
      const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
      userMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; color: #1e3a8a;">
          📍 आपकी वर्तमान लोकेशन
        </div>
      `);
      bounds.extend([userLat, userLng]);
    }

    // 2. Shop Markers
    shops.forEach((shop) => {
      if (!shop.lat || !shop.lng) return;

      const shopIcon = createEmojiIcon('🏪', 'bg-emerald-600');
      const marker = L.marker([shop.lat, shop.lng], { icon: shopIcon }).addTo(map);

      const distanceText = shop.distanceKm !== undefined ? `<span style="background:#f59e0b; color:#fff; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">${shop.distanceKm.toFixed(1)} km दूर</span>` : '';

      const popupHtml = `
        <div style="font-family: sans-serif; padding: 2px;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:4px; margin-bottom:4px;">
            <h4 style="margin:0; font-weight: 800; color: #065f46; font-size: 13px;">${shop.shopName}</h4>
            ${distanceText}
          </div>
          <p style="margin:0 0 4px; font-size: 11px; font-weight: 600; color: #475569;">🏷️ ${shop.categoryLabel}</p>
          <p style="margin:0 0 6px; font-size: 10px; color: #64748b;">📍 ${shop.address}</p>
          <a href="tel:${shop.phone}" style="display:inline-block; background:#059669; color:#fff; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:bold; text-decoration:none;">📞 कॉल करें</a>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (onShopSelect) {
        marker.on('click', () => onShopSelect(shop.id));
      }

      bounds.extend([shop.lat, shop.lng]);
    });

    // Auto fit map to include all pins
    if (shops.length > 0 || (userLat && userLng)) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch (e) {
        console.warn('Could not fit bounds', e);
      }
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLat, userLng, shops]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md">
      <div ref={containerRef} style={{ height }} className="w-full z-10" />
    </div>
  );
};
