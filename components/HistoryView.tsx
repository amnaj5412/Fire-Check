
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  History, 
  ChevronRight, 
  User, 
  Wrench, 
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileSearch,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { FireExtinguisher, InspectionRecord } from '../types.ts';

interface Props {
  extinguishers: FireExtinguisher[];
}

const HistoryView: React.FC<Props> = ({ extinguishers }) => {
  const location = useLocation();
  const [selectedExtinguisherId, setSelectedExtinguisherId] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { selectedCode?: string };
    if (state?.selectedCode) {
      const extinguisher = extinguishers.find(e => e.code === state.selectedCode);
      if (extinguisher) {
        setSelectedExtinguisherId(extinguisher.id);
      }
    }
  }, [location, extinguishers]);

  const selectedExtinguisher = extinguishers.find(e => e.id === selectedExtinguisherId);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">ประวัติการตรวจสอบ</h2>
          <p className="text-slate-500 text-sm font-medium">เรียกดูรายงานการตรวจสอบย้อนหลัง</p>
        </div>
        {selectedExtinguisherId && (
          <button 
            onClick={() => setSelectedExtinguisherId(null)}
            className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-100 lg:hidden"
          >
            <ArrowLeft size={14} /> เลือกถังอื่น
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-1 space-y-4 ${selectedExtinguisherId ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-6 overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">รายชื่อถังดับเพลิง</h3>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {extinguishers.map(e => (
                <button
                  key={e.id}
                  onClick={() => setSelectedExtinguisherId(e.id)}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-2xl transition-all border
                    ${selectedExtinguisherId === e.id 
                      ? 'bg-green-50 text-[#1B7F43] border-green-100 shadow-inner' 
                      : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}
                  `}
                >
                  <div className="text-left">
                    <div className="font-black text-sm">{e.code}</div>
                    <div className="text-[10px] opacity-70 font-bold truncate max-w-[150px] uppercase">{e.location}</div>
                  </div>
                  <ChevronRight size={18} className={selectedExtinguisherId === e.id ? 'text-[#1B7F43]' : 'text-slate-300'} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`lg:col-span-2 ${!selectedExtinguisherId ? 'hidden lg:block' : 'block'}`}>
          {!selectedExtinguisher ? (
            <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-24 flex flex-col items-center justify-center text-slate-400 text-center shadow-inner h-full">
              <History size={64} className="mb-6 opacity-10" />
              <p className="font-bold">กรุณาเลือกถังดับเพลิง<br/>เพื่อเรียกดูประวัติ</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-[#1B7F43] p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                 <div className="relative z-10">
                   <h3 className="text-3xl font-black mb-1">{selectedExtinguisher.code}</h3>
                   <p className="text-sm font-medium text-green-100 mb-6">{selectedExtinguisher.location}</p>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl">
                <div className="relative border-l-2 border-slate-100 ml-4 pl-10 space-y-8 py-4">
                  {selectedExtinguisher.inspections.length > 0 ? (
                    selectedExtinguisher.inspections.map((record, index) => (
                      <HistoryItem key={record.id} record={record} isLatest={index === 0} />
                    ))
                  ) : (
                    <div className="text-slate-400 text-sm font-medium italic py-10">ยังไม่มีประวัติการตรวจสอบ</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HistoryItem: React.FC<{ record: InspectionRecord; isLatest: boolean }> = ({ record, isLatest }) => {
  const [isOpen, setIsOpen] = useState(isLatest);
  const dateStr = new Intl.DateTimeFormat('th-TH', { 
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(record.date));

  const isOk = record.officerStatus === 'ปกติ' && (!record.technicianStatus || record.technicianStatus === 'ปกติ');

  return (
    <div className="relative">
      <div className={`absolute -left-[51px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-md z-10 ${isOk ? 'bg-green-500' : 'bg-rose-500'}`} />
      <div className={`bg-slate-50 rounded-[2rem] border overflow-hidden transition-all ${isOpen ? 'border-slate-200 shadow-lg' : 'border-transparent'}`}>
        <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-6">
          <div className="text-left">
            <span className="font-black text-slate-700 block text-sm">{dateStr}</span>
            {isLatest && <span className="text-[8px] bg-[#1B7F43] text-white px-2 py-0.5 rounded-full font-black uppercase mt-1 inline-block">ล่าสุด</span>}
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${isOk ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
              {isOk ? 'ปกติ' : 'ผิดปกติ'}
            </span>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {isOpen && (
          <div className="p-8 bg-white border-t border-slate-50 space-y-8 animate-in slide-in-from-top-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <CriteriaBadge label="สายฉีด" value={record.criteria?.hose || 'ปกติ'} />
                <CriteriaBadge label="คันบังคับ" value={record.criteria?.lever || 'ปกติ'} />
                <CriteriaBadge label="ตัวถัง" value={record.criteria?.body || 'ปกติ'} />
                <CriteriaBadge label="แรงดัน" value={record.criteria?.pressure || 'ปกติ'} />
                <CriteriaBadge label="สิ่งกีดขวาง" value={record.criteria?.obstruction || 'ไม่มี'} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CriteriaBadge: React.FC<{ label: string, value: string }> = ({ label, value }) => {
  const isBad = value === 'ชำรุด' || value === 'ไม่ปกติ' || value === 'มี';
  return (
    <div className="flex flex-col gap-2 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <span className="text-[8px] text-slate-400 font-black uppercase text-center">{label}</span>
      <span className={`text-[10px] font-black px-2 py-1 rounded-lg text-center ${isBad ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'}`}>
        {value}
      </span>
    </div>
  );
};

export default HistoryView;
