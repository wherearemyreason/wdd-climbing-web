import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Check, X, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const GAODE_TILE_URL = 'https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7';

// 十字准星图标
const crosshairIcon = L.divIcon({
  className: 'crosshair-icon',
  html: '',
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// 跟踪地图中心位置的组件
function CenterTracker({ onCenterChange }) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onCenterChange([center.lng, center.lat]);
    }
  });
  return null;
}

// 动态飞行到新位置的组件
function FlyToCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 0.5 });
    }
  }, [center, zoom]);
  return null;
}

export function MapPicker({ initialCoords, onConfirm, onCancel }) {
  const defaultCenter = initialCoords 
    ? [initialCoords[1], initialCoords[0]]  // [lat, lng]
    : [30.5723, 104.0665]; // 成都
  const defaultZoom = initialCoords ? 14 : 4;

  const [currentCenter, setCurrentCenter] = useState(
    initialCoords ? [initialCoords[0], initialCoords[1]] : [104.0665, 30.5723]
  ); // [lng, lat]
  const [flyTarget, setFlyTarget] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // 初次加载时，如果没有坐标就尝试自动获取当前定位
  useEffect(() => {
    if (!initialCoords) {
      handleLocateMe();
    }
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("您的设备不支持地理定位功能");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFlyTarget([lat, lng]); // Leaflet uses [lat, lng]
        setCurrentCenter([lng, lat]); // Our state uses [lng, lat]
        setIsLocating(false);
      },
      (error) => {
        console.error("定位失败:", error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300">
      <div className="flex items-center justify-between p-4 shadow-sm z-20 bg-white/90 backdrop-blur-md relative">
        <button onClick={onCancel} className="p-2 text-gray-500 bg-gray-100 rounded-full active:scale-90 transition-transform"><X size={20} /></button>
        <span className="font-bold text-lg text-gray-800">选择打卡位置</span>
        <button 
          onClick={() => onConfirm(currentCenter)}
          className="px-5 py-2 bg-primary-600 text-white rounded-full font-bold flex items-center shadow-lg shadow-primary-500/30 active:scale-90 transition-transform"
        >
          <Check size={18} className="mr-1" strokeWidth={2.5} /> 确定位置
        </button>
      </div>
      
      <div className="flex-1 relative">
        <MapContainer 
          center={defaultCenter} 
          zoom={defaultZoom} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={GAODE_TILE_URL} maxZoom={18} />
          <CenterTracker onCenterChange={setCurrentCenter} />
          {flyTarget && <FlyToCenter center={flyTarget} zoom={14} />}
        </MapContainer>
        
        {/* 定位当前位置的回退按钮 */}
        <button 
          onClick={handleLocateMe}
          className="absolute bottom-10 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-600 active:scale-90 transition-all border border-gray-100 z-[1000]"
        >
          <Navigation size={22} className={isLocating ? "animate-pulse" : ""} fill={isLocating ? "currentColor" : "none"} />
        </button>

        {/* 悬浮在中心的十字准星 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
          <div className="mb-10 relative flex flex-col items-center animate-bounce">
            <MapPin size={46} className="text-primary-600 drop-shadow-lg" fill="currentColor" stroke="white" strokeWidth={1.5} />
            <div className="w-3 h-1.5 bg-black/25 rounded-[100%] blur-[2px] mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
