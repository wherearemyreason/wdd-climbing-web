import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, ArrowUp, Edit3, Save, Trash2 } from 'lucide-react';
import { db } from '../utils/db';

export function RecordDetailModal({ record, onClose, onUpdate }) {
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    elevation: '',
    lng: '',
    lat: '',
    notes: ''
  });

  useEffect(() => {
    if (record) {
      setEditData({
        elevation: record.elevation || '',
        lng: record.coordinates ? record.coordinates[0].toFixed(5) : '',
        lat: record.coordinates ? record.coordinates[1].toFixed(5) : '',
        notes: record.notes || ''
      });
      setIsEditing(false);
    }
  }, [record]);

  if (!record) return null;

  const handleSave = async () => {
    const updates = {
      elevation: Number(editData.elevation) || 0,
      coordinates: [Number(editData.lng) || 0, Number(editData.lat) || 0],
      notes: editData.notes
    };
    try {
      await db.updateRecord(record.id, updates);
      Object.assign(record, updates);
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('保存失败，请重试');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`确定要删除“${record.title}”这条探险记录吗？此操作不可恢复。`)) {
      try {
        await db.deleteRecord(record.id);
        if (onUpdate) onUpdate();
        onClose();
      } catch (err) {
        alert('删除失败，请重试');
      }
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="fixed bottom-0 left-0 right-0 bg-[#f8fafc] rounded-t-[2.5rem] z-40 max-h-[92dvh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-full duration-500 ease-out">
        {/* 顶部工具栏 */}
        <div className="sticky top-0 bg-[#f8fafc]/80 backdrop-blur-xl px-6 py-4 flex flex-col items-center border-b border-gray-200/50 z-20">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-4"></div>
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden mr-3 bg-white">
                <img src={record.medalIcon} className="w-full h-full object-cover" alt="勋章" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {record.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <button onClick={handleSave} className="p-2 bg-primary-100 hover:bg-primary-200 rounded-full text-primary-600 active:scale-90 transition-all">
                  <Save size={20} strokeWidth={2.5} />
                </button>
              ) : (
                <>
                  <button onClick={handleDelete} className="p-2 bg-red-50 hover:bg-red-100 rounded-full text-red-500 active:scale-90 transition-all">
                    <Trash2 size={20} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => setIsEditing(true)} className="p-2 bg-gray-200/50 hover:bg-gray-200 rounded-full text-gray-600 active:scale-90 transition-all">
                    <Edit3 size={20} strokeWidth={2.5} />
                  </button>
                </>
              )}
              <button onClick={onClose} className="p-2 bg-gray-200/50 hover:bg-gray-200 rounded-full text-gray-600 active:scale-90 transition-all">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        <div className="py-6">
          {/* 照片画廊 */}
          {record.photos && record.photos.length > 0 && (
            <div className="mb-6">
              <div className="px-6 mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">精选照片</h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">共 {record.photos.length} 张</span>
              </div>
              <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 px-6 pb-2">
                {record.photos.map((photo, i) => (
                  <div 
                    key={i} 
                    onClick={() => setFullscreenImage(photo)}
                    className="snap-start shrink-0 w-36 h-36 rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative group cursor-pointer"
                  >
                    <img src={photo} alt={`Photo ${i+1}`} className="w-full h-full object-cover active:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 详情信息卡片 */}
          <div className="px-6 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mr-3">
                    <Calendar size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">日期</p>
                    <p className="font-bold text-gray-900">{record.date}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mr-3">
                    <ArrowUp size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">海拔</p>
                    {isEditing ? (
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          value={editData.elevation}
                          onChange={e => setEditData({...editData, elevation: e.target.value})}
                          className="w-16 text-sm font-bold border-b-2 border-primary-400 focus:outline-none text-gray-900 bg-transparent"
                        />
                        <span className="font-bold text-gray-900">m</span>
                      </div>
                    ) : (
                      <p className="font-bold text-gray-900">{record.elevation ? `${record.elevation}m` : '未知'}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3 flex items-center">
                  <MapPin size={12} className="mr-1" /> 坐标定位
                </p>
                {isEditing ? (
                  <div className="flex gap-2 items-center">
                    <input 
                      type="number" 
                      value={editData.lat}
                      onChange={e => setEditData({...editData, lat: e.target.value})}
                      className="w-24 px-2 py-1 text-sm font-mono bg-gray-50 rounded-lg border focus:border-primary-400 focus:outline-none"
                      placeholder="纬度"
                    />
                    <span className="font-bold text-gray-400">N,</span>
                    <input 
                      type="number" 
                      value={editData.lng}
                      onChange={e => setEditData({...editData, lng: e.target.value})}
                      className="w-24 px-2 py-1 text-sm font-mono bg-gray-50 rounded-lg border focus:border-primary-400 focus:outline-none"
                      placeholder="经度"
                    />
                    <span className="font-bold text-gray-400">E</span>
                  </div>
                ) : (
                  <p className="font-mono text-sm font-medium text-primary-600 bg-primary-50 p-3 rounded-xl inline-block">
                    {record.coordinates[1].toFixed(4)}° N, {record.coordinates[0].toFixed(4)}° E
                  </p>
                )}
              </div>
            </div>

            {/* 探险心得 */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">探险心得</p>
              {isEditing ? (
                <textarea 
                  value={editData.notes}
                  onChange={e => setEditData({...editData, notes: e.target.value})}
                  placeholder="记录下这次攀登的感受吧..."
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none resize-none h-32 text-gray-700 text-sm leading-relaxed"
                />
              ) : (
                <p className={`text-sm leading-relaxed font-medium ${record.notes ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                  {record.notes || "暂无心得，点击顶部编辑按钮添加"}
                </p>
              )}
            </div>
          </div>
          <div className="h-12"></div>
        </div>
      </div>

      {/* 全屏图片查看器 */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
            onClick={() => setFullscreenImage(null)}
          >
            <X size={24} />
          </button>
          <img 
            src={fullscreenImage} 
            alt="Fullscreen"
            className="max-w-full max-h-[90vh] object-contain animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
