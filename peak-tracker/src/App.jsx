import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import { AddRecordModal } from './components/AddRecordModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { CalendarModal } from './components/CalendarModal';
import { Plus, Mountain, LayoutList, Maximize, Minimize, Calendar } from 'lucide-react';
import { db } from './utils/db';
import 'mapbox-gl/dist/mapbox-gl.css';

export const MAP_STYLE = 'mapbox://styles/mapbox/outdoors-v12';
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const mapRef = useRef();

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current.resize(), 50);
      setTimeout(() => mapRef.current.resize(), 300);
    }
  }, [isMapFullscreen]);
  
  const [viewState, setViewState] = useState({
    longitude: 104.0665,
    latitude: 30.5723,
    zoom: 6
  });

  const loadRecords = async () => {
    const data = await db.getAllRecords();
    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setRecords(sortedData);
    
    if (sortedData.length > 0) {
      setViewState(prev => ({
        ...prev,
        longitude: sortedData[0].coordinates[0],
        latitude: sortedData[0].coordinates[1],
        zoom: 8
      }));
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div className="relative flex flex-col h-[100dvh] bg-[#f8fafc] font-sans overflow-hidden">
      <div className={`${isMapFullscreen ? 'fixed inset-0 z-40' : 'relative h-[45vh] w-full z-10'} shadow-inner bg-gray-200`}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle={MAP_STYLE}
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
        >
          {records.map((record) => (
            <Marker 
              key={record.id} 
              longitude={record.coordinates[0]} 
              latitude={record.coordinates[1]} 
              anchor="bottom" 
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedRecord(record);
                if (isMapFullscreen) setIsMapFullscreen(false);
              }}
            >
              <div className="relative group cursor-pointer active:scale-95 transition-transform duration-300">
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 rounded-sm shadow-md"></div>
                <div className="w-14 h-14 rounded-full border-[3px] border-white shadow-lg overflow-hidden relative z-10 bg-gray-50">
                  <img src={record.medalIcon} className="w-full h-full object-cover" alt="勋章" />
                </div>
              </div>
            </Marker>
          ))}
        </Map>
        
        <button 
          onClick={() => setIsMapFullscreen(!isMapFullscreen)}
          className="absolute top-6 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-lg text-gray-700 active:scale-90 transition-all z-50"
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
