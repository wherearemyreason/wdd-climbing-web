import React, { useState, useEffect } from 'react';
import { X, MapPin, Compass } from 'lucide-react';
import { MedalUploader, PhotosUploader } from './ImageUploader';
import { MapPicker } from './MapPicker';
import { db } from '../utils/db';
import exifr from 'exifr';

const INITIAL_FORM = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  elevation: '',
  notes: '',
  coordinates: null,
  medalIcon: '',
  photos: []
};

export function AddRecordModal({ isOpen, onClose, onAdded }) {
  const [isPickingMap, setIsPickingMap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractMsg, setExtractMsg] = useState("");
  const [formData, setFormData] = useState({...INITIAL_FORM});

  // 每次打开弹窗时重置表单
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...INITIAL_FORM,
        date: new Date().toISOString().split('T')[0]
      });
      setExtractMsg("");
      setIsPickingMap(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 从照片中提取 GPS EXIF 数据（每次上传新照片都会尝试提取）
  const extractGpsFromFiles = async (files) => {
    for (const file of files) {
      try {
        const gps = await exifr.gps(file);
        if (gps && gps.latitude && gps.longitude) {
          setFormData(prev => ({...prev, coordinates: [gps.longitude, gps.latitude]}));
          setExtractMsg("✨ 已自动读取照片拍摄位置！");
          setTimeout(() => setExtractMsg(""), 3500);
          return true;
        }
      } catch (err) {
        console.error("EXIF 提取失败:", err);
      }
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.coordinates || !formData.medalIcon) {
      alert("请填写山峰名称、打卡位置并上传打卡勋章照片！");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await db.addRecord({
        ...formData,
        elevation: Number(formData.elevation) || 0
      });
      onAdded();
      onClose();
    } catch (err) {
      alert("保存失败，请重试！");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-3xl border-t border-white/60 rounded-t-[2.5rem] z-40 max-h-[92dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-500 ease-out">
        <div className="sticky top-0 bg-white/70 backdrop-blur-2xl px-6 py-5 flex flex-col items-center border-b border-gray-200/50 z-10">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-5"></div>
          <div className="w-full flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
              <Compass className="text-primary-500 mr-2" size={24} />
              新探险打卡
            </h2>
            <button onClick={onClose} className="p-2.5 bg-gray-100/80 hover:bg-gray-200 rounded-full text-gray-600 active:scale-90 transition-all">
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* 照片坐标提取成功提示 */}
        {extractMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-primary-600 text-white px-5 py-2.5 rounded-full shadow-lg shadow-primary-500/30 font-bold text-sm animate-in fade-in slide-in-from-top-4 duration-300 whitespace-nowrap">
            {extractMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-8 relative">
          <div className="-mt-2 flex justify-center">
            <MedalUploader 
              value={formData.medalIcon} 
              onChange={async (val, file) => {
                setFormData(prev => ({...prev, medalIcon: val}));
                // 每次上传勋章照片都尝试提取坐标
                if (file) {
                  await extractGpsFromFiles([file]);
                }
              }} 
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">山峰名称 <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                required
                placeholder="例如：大明山"
                className="w-full px-5 py-4 bg-white/70 backdrop-blur-md border border-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] transition-all text-gray-900 font-bold text-lg"
                value={formData.title}
                onChange={e => setFormData(prev => ({...prev, title: e.target.value}))}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">攀登日期 <span className="text-red-400">*</span></label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-4 bg-white/70 backdrop-blur-md border border-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] transition-all text-gray-900 font-bold"
                  value={formData.date}
                  onChange={e => setFormData(prev => ({...prev, date: e.target.value}))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">海拔高度</label>
                <div className="relative">
                  <input 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="1760"
                    className="w-full pl-5 pr-10 py-4 bg-white/70 backdrop-blur-md border border-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] transition-all text-gray-900 font-bold text-lg"
                    value={formData.elevation}
                    onChange={e => setFormData(prev => ({...prev, elevation: e.target.value.replace(/[^0-9]/g, '')}))}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">m</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">打卡坐标 <span className="text-red-400">*</span></label>
              <button 
                type="button"
                onClick={() => setIsPickingMap(true)}
                className={`w-full flex items-center justify-between px-5 py-4 border-2 rounded-2xl transition-all shadow-sm ${formData.coordinates ? 'bg-primary-50/50 border-primary-400 text-primary-700' : 'bg-white/70 border-white text-gray-500 hover:bg-white'}`}
              >
                <span className="flex items-center font-bold text-lg">
                  <MapPin size={22} className={`mr-3 ${formData.coordinates ? 'text-primary-500' : 'text-gray-400'}`} />
                  {formData.coordinates 
                    ? `${formData.coordinates[0].toFixed(4)}, ${formData.coordinates[1].toFixed(4)}` 
                    : "在地图上选择位置"}
                </span>
                {formData.coordinates && <span className="text-primary-600 font-bold text-xs bg-primary-100 px-3 py-1.5 rounded-full">重新调整</span>}
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">一句话心得</label>
              <textarea 
                rows="3"
                placeholder="记录下最美妙的瞬间吧..."
                className="w-full px-5 py-4 bg-white/70 backdrop-blur-md border border-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] transition-all resize-none text-gray-900 font-medium"
                value={formData.notes}
                onChange={e => setFormData(prev => ({...prev, notes: e.target.value}))}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200/40 mt-2">
            <PhotosUploader 
              photos={formData.photos}
              onChange={async (val, files) => {
                setFormData(prev => ({...prev, photos: val}));
                // 每次上传新照片都尝试提取坐标
                if (files && files.length > 0) {
                  await extractGpsFromFiles(files);
                }
              }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl font-bold text-xl shadow-float active:scale-[0.98] transition-all disabled:opacity-70 mt-4 mb-10 border border-primary-400/50"
          >
            {isSubmitting ? '正在封存记录...' : '完成打卡 🚀'}
          </button>
        </form>
      </div>

      {isPickingMap && (
        <MapPicker 
          initialCoords={formData.coordinates}
          onConfirm={(coords) => {
            setFormData(prev => ({...prev, coordinates: coords}));
            setIsPickingMap(false);
          }}
          onCancel={() => setIsPickingMap(false)}
        />
      )}
    </>
  );
}
