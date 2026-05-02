import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AddRecordModal } from './components/AddRecordModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { CalendarModal } from './components/CalendarModal';
import { Plus, Mountain, LayoutList, Maximize, Minimize, Calendar } from 'lucide-react';
import { db } from './utils/db';
import 'leaflet/dist/leaflet.css';

// 高德地图瓦片（国内直连，无需翻墙）
const GAODE_TILE_URL = 'https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7';

// 用于动态更新地图中心和缩放的辅助组件
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// 用于全屏时强制刷新地图尺寸的辅助组件
function MapResizer({ trigger }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 400);
  }, [trigger, map]);
  return null;
}

// 创建自定义勋章 Marker 图标
function createMedalIcon(medalSrc) {
  return L.divIcon({
    className: 'custom-medal-marker',
    html: `
      <div style="position:relative; cursor:pointer;">
        <div style="position:absolute; bottom:-5px; left:50%; transform:translateX(-50%) rotate(45deg); width:14px; height:14px; background:white; border-radius:2px; box-shadow:0 2px 6px rgba(0,0,0,0.15);"></div>
        <div style="width:52px; height:52px; border-radius:50%; border:3px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.2); overflow:hidden; position:relative; z-index:1; background:#f9fafb;">
          <img src="${medalSrc}" style="width:100%; height:100%; object-fit:cover;" />
        </div>
      </div>
    `,
    iconSize: [52, 62],
    iconAnchor: [26, 62],
  });
}

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  
  const [mapCenter, setMapCenter] = useState([30.5723, 104.0665]); // [lat, lng] for Leaflet
  const [mapZoom, setMapZoom] = useState(6);

  const loadRecords = async () => {
    const data = await db.getAllRecords();
    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setRecords(sortedData);
    
    if (sortedData.length > 0) {
      setMapCenter([sortedData[0].coordinates[1], sortedData[0].coordinates[0]]);
      setMapZoom(8);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div className="relative flex flex-col h-[100dvh] bg-[#f8fafc] font-sans overflow-hidden">
      <div className={`${isMapFullscreen ? 'fixed inset-0 z-40' : 'relative h-[45vh] w-full z-10'} shadow-inner bg-gray-200`}>
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={GAODE_TILE_URL} maxZoom={18} />
          <MapController center={mapCenter} zoom={mapZoom} />
          <MapResizer trigger={isMapFullscreen} />
          
          {records.map((record) => (
            <Marker 
              key={record.id}
              position={[record.coordinates[1], record.coordinates[0]]}
              icon={createMedalIcon(record.medalIcon)}
              eventHandlers={{
                click: () => {
                  setSelectedRecord(record);
                  if (isMapFullscreen) setIsMapFullscreen(false);
                }
              }}
            />
          ))}
        </MapContainer>
        
        <button 
          onClick={() => setIsMapFullscreen(!isMapFullscreen)}
          className="absolute top-6 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-lg text-gray-700 active:scale-90 transition-all z-[1000]"
        >
          {isMapFullscreen ? <Minimize size={20} strokeWidth={2.5} /> : <Maximize size={20} strokeWidth={2.5} />}
        </button>
        
        {!isMapFullscreen && <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#f8fafc] to-transparent z-10"></div>}
      </div>

      <div className={`flex-1 flex flex-col relative z-20 bg-[#f8fafc] rounded-t-3xl -mt-6 pt-6 px-5 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] ${isMapFullscreen ? 'hidden' : 'flex'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center">
            <LayoutList size={22} className="mr-2 text-primary-500" />
            探险足迹 <span className="ml-2 text-sm text-gray-400 font-medium">{records.length} 座山峰</span>
          </h2>
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full active:scale-95 transition-all shadow-sm border border-primary-100"
          >
            <Calendar size={16} className="mr-1" />
            探险日历
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 opacity-60 mt-10">
              <Mountain size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-400 font-medium">还没有探险记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map(record => (
                <div 
                  key={record.id} 
                  onClick={() => setSelectedRecord(record)}
                  className="bg-white rounded-[1.25rem] p-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-inner mr-4 border border-gray-100">
                    <img src={record.medalIcon} className="w-full h-full object-cover" alt="勋章" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate mb-1">{record.title}</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5">
                      {record.date} • {record.elevation}m
                    </p>
                    <p className="text-gray-600 text-sm truncate font-medium">{record.notes || "暂无心得"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <button 
        onClick={() => setIsModalOpen(true)}
        className={`fixed right-6 w-16 h-16 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-2xl shadow-float flex items-center justify-center text-white active:scale-90 transition-all duration-500 z-30 ${isMapFullscreen ? 'bottom-8' : 'bottom-8'}`}
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>

      <AddRecordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdded={loadRecords} />
      <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} onUpdate={loadRecords} />
      <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} records={records} />
    </div>
  )
}
