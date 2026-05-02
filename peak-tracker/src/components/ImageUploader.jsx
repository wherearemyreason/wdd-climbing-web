import React, { useRef } from 'react';
import { Camera, Plus, X } from 'lucide-react';
import { fileToBase64 } from '../utils/image';

export function MedalUploader({ value, onChange }) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onChange(base64, file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`w-32 h-32 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden cursor-pointer relative transition-transform duration-300 ${value ? 'active:scale-95' : 'bg-gray-50 hover:bg-gray-100 active:scale-95'}`}
      >
        {value ? (
          <img src={value} alt="Medal" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-primary-400">
            <Camera size={40} strokeWidth={1.5} />
            <span className="text-xs mt-2 font-bold tracking-wider">设置勋章</span>
          </div>
        )}
        {value && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Camera size={32} className="text-white" />
          </div>
        )}
      </div>
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}

export function PhotosUploader({ photos, onChange }) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const base64Promises = files.map(fileToBase64);
    const base64s = await Promise.all(base64Promises);
    onChange([...photos, ...base64s], files);
  };

  const removePhoto = (index) => {
    onChange(photos.filter((_, i) => i !== index), []);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">精选照片 <span className="text-gray-600 font-medium">({photos.length})</span></label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, i) => (
          <div key={i} className="aspect-square rounded-2xl overflow-hidden relative shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] group">
            <img src={photo} alt="Photo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
              className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white rounded-full p-1.5 backdrop-blur-md transition-colors"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        ))}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/50 flex flex-col items-center justify-center text-primary-400 cursor-pointer active:scale-95 transition-all hover:bg-primary-50"
        >
          <Plus size={32} strokeWidth={2} />
        </div>
      </div>
      <input 
        type="file" 
        accept="image/*" 
        multiple
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}
