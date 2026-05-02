import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Mountain } from 'lucide-react';

export function CalendarModal({ isOpen, onClose, records }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const recordDates = records.reduce((acc, record) => {
    acc[record.date] = acc[record.date] ? [...acc[record.date], record] : [record];
    return acc;
  }, {});

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-[#f8fafc] rounded-t-[2.5rem] z-50 max-h-[90dvh] shadow-2xl animate-in slide-in-from-bottom-full duration-500 overflow-hidden flex flex-col">
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-white z-10">
          <h2 className="text-xl font-extrabold text-gray-900">探险日历</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-600 active:scale-90"><X size={20} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
              <span className="font-bold text-lg text-gray-800">{year}年 {month + 1}月</span>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20} /></button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                <div key={d} className="text-xs font-bold text-gray-400 py-2">{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-center">
              {days.map((date, i) => {
                if (!date) return <div key={i} className="aspect-square"></div>;
                
                // 解决中国时区偏移问题
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                
                const dayRecords = recordDates[dateStr];
                const isToday = dateStr === todayStr;
                
                return (
                  <div key={i} className="aspect-square relative flex items-center justify-center">
                    <div className={`w-full h-full rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all
                      ${dayRecords ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30' : 'text-gray-600 bg-gray-50'}
                      ${isToday && !dayRecords ? 'border-2 border-primary-500 text-primary-600' : ''}
                    `}>
                      <span>{date.getDate()}</span>
                      {dayRecords && <Mountain size={10} className="mt-0.5 opacity-80" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <h3 className="font-bold text-gray-800 ml-1">本月足迹</h3>
            {Object.entries(recordDates)
              .filter(([date]) => date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
              .map(([date, dayRecords]) => (
                <div key={date} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start">
                  <div className="bg-primary-100 text-primary-700 rounded-xl p-2 text-center mr-4 min-w-[3rem]">
                    <div className="text-xs font-bold opacity-80">{month + 1}月</div>
                    <div className="text-lg font-extrabold">{parseInt(date.split('-')[2])}</div>
                  </div>
                  <div className="flex-1">
                    {dayRecords.map(r => (
                      <div key={r.id} className="mb-2 last:mb-0">
                        <div className="font-bold text-gray-900">{r.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">海拔 {r.elevation}m</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {Object.entries(recordDates).filter(([date]) => date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length === 0 && (
              <div className="text-center text-gray-400 py-4 text-sm">本月没有探险记录哦~</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
