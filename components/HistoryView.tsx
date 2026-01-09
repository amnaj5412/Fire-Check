
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  History, 
  ChevronRight, 
  User, 
  Wrench, 
  Calendar,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileSearch,
  ArrowLeft,
  // Add missing ShieldCheck import
  ShieldCheck
} from 'lucide-react';
import { FireExtinguisher, InspectionRecord } from '../types';

interface Props {
  extinguishers: FireExtinguisher[];
}

const HistoryView: React.FC<Props> = ({ extinguishers }) => {
  const location = useLocation();
  const [selectedExtinguisherId, setSelectedExtinguisherId] = useState<string | null>(null);

  // Deep linking logic from Dashboard
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
          <p className="text-slate-500 text-sm font-medium">เรียกดูรายงานการตรวจสอบย้อนหลังแยกตามรายถัง</p>
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
        {/* Unit Selector */}
        <div className={`lg:col-span-1 space-y-4 ${selectedExtinguisherId ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">รายชื่อถังดับเพลิงในระบบ</h3>
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
              {extinguishers.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-10 italic">ยังไม่มีข้อมูลในระบบ</p>
              )}
            </div>
          </div>
        </div>

        {/* History Timeline */}
        <div className={`lg:col-span-2 ${!selectedExtinguisherId ? 'hidden lg:block' : 'block'}`}>
          {!selectedExtinguisher ? (
            <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-24 flex flex-col items-center justify-center text-slate-400 text-center shadow-inner h-full">
              <History size={64} className="mb-6 opacity-10" />
              <p className="font-bold text-slate-400">กรุณาเลือกถังดับเพลิงจากรายการด้านซ้าย<br/>เพื่อเรียกดูประวัติการตรวจสอบย้อนหลัง</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-[#1B7F43] p-10 rounded-[2.5rem] text-white shadow-xl shadow-green-900/20 relative overflow-hidden">
                 <div className="absolute right-10 top-0 bottom-0 opacity-10 flex items-center">
                    <History size={160} />
                 </div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-4">
                      <ShieldCheck size={14} /> ข้อมูลอุปกรณ์
                   </div>
                   <h3 className="text-3xl font-black mb-1">{selectedExtinguisher.code}</h3>
                   <p className="text-sm font-medium text-green-100 mb-6">{selectedExtinguisher.location} | {selectedExtinguisher.type}</p>
                   
                   <div className="flex flex-wrap gap-4">
                      <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                         <p className="text-[8px] font-black uppercase text-green-100/70 mb-1">น้ำหนัก</p>
                         <p className="text-xs font-bold">{selectedExtinguisher.weight || '-'}</p>
                      </div>
                      <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                         <p className="text-[8px] font-black uppercase text-green-100/70 mb-1">วันที่เริ่มใช้</p>
                         <p className="text-xs font-bold">{new Date(selectedExtinguisher.addedDate).toLocaleDateString('th-TH')}</p>
                      </div>
                   </div>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2 px-2">
                   <Calendar size={14} /> ไทม์ไลน์บันทึกการตรวจสอบ
                </h4>
                
                <div className="relative border-l-2 border-slate-100 ml-4 pl-10 space-y-8 py-4">
                  {selectedExtinguisher.inspections.length > 0 ? (
                    selectedExtinguisher.inspections.map((record, index) => (
                      <HistoryItem key={record.id} record={record} isLatest={index === 0} />
                    ))
                  ) : (
                    <div className="text-slate-400 text-sm font-medium italic py-10">ยังไม่มีประวัติการตรวจสอบในระบบ</div>
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
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(record.date));

  const isOk = record.officerStatus === 'ปกติ' && (!record.technicianStatus || record.technicianStatus === 'ปกติ');

  return (
    <div className="relative">
      <div className={`
        absolute -left-[51px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-md z-10
        ${isOk ? 'bg-green-500' : 'bg-rose-500'}
      `} />
      
      <div className={`
        bg-slate-50 rounded-[2rem] border overflow-hidden transition-all duration-300
        ${isOpen ? 'border-slate-200 shadow-lg' : 'border-transparent hover:border-slate-100'}
      `}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-6 hover:bg-white/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-sm">
              <Calendar size={16} className="text-slate-400" />
            </div>
            <div className="text-left">
              <span className="font-black text-slate-700 block text-sm">{dateStr}</span>
              {isLatest && <span className="text-[8px] bg-[#1B7F43] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest mt-1 inline-block">ล่าสุด</span>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${isOk ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
              {isOk ? 'ปกติ' : 'ผิดปกติ'}
            </span>
            {isOpen ? <ChevronUp size={20} className="text-slate-300" /> : <ChevronDown size={20} className="text-slate-300" />}
          </div>
        </button>

        {isOpen && (
          <div className="p-8 bg-white border-t border-slate-50 space-y-8 animate-in slide-in-from-top-4 duration-300">
            {/* Criteria Grid */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.1em]">
                <FileSearch size={14} /> รายละเอียดการตรวจสอบจุดสำคัญ
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <CriteriaBadge label="สายฉีด" value={record.criteria?.hose || 'ปกติ'} />
                <CriteriaBadge label="คันบังคับ" value={record.criteria?.lever || 'ปกติ'} />
                <CriteriaBadge label="ตัวถัง" value={record.criteria?.body || 'ปกติ'} />
                <CriteriaBadge label="เกจแรงดัน" value={record.criteria?.pressure || 'ปกติ'} />
                <CriteriaBadge label="สิ่งกีดขวาง" value={record.criteria?.obstruction || 'ไม่มี'} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
              {/* Officer Part */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest">
                  <User size={14} /> ขั้นตอนที่ 1: เจ้าหน้าที่
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">ผู้ตรวจสอบ:</span>
                    <span className="font-black text-slate-800">{record.officerName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">สถานะเบื้องต้น:</span>
                    <span className={`font-black ${record.officerStatus === 'ปกติ' ? 'text-green-600' : 'text-rose-600'}`}>{record.officerStatus}</span>
                  </div>
                </div>
                {record.officerNote && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 italic">
                    "{record.officerNote}"
                  </div>
                )}
              </div>

              {/* Technician Part */}
              <div className="space-y-4 border-l border-slate-100 md:pl-8">
                <div className="flex items-center gap-2 text-[#1B7F43] font-black text-xs uppercase tracking-widest">
                  <Wrench size={14} /> ขั้นตอนที่ 2: เทคนิค
                </div>
                {record.isConfirmed ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-bold">ผู้ยืนยัน:</span>
                        <span className="font-black text-slate-800">{record.technicianName}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-bold">สถานะสุทธิ:</span>
                        <span className={`font-black ${record.technicianStatus === 'ปกติ' ? 'text-green-600' : 'text-rose-600'}`}>{record.technicianStatus}</span>
                      </div>
                    </div>
                    {record.technicianNote && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 italic">
                        "{record.technicianNote}"
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center py-6 text-[10px] text-amber-500 font-black uppercase tracking-widest bg-amber-50 rounded-2xl border border-amber-100">
                    <AlertCircle size={14} className="mr-2" /> รอยืนยันโดยช่างเทคนิค
                  </div>
                )}
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
      <span className="text-[8px] text-slate-400 font-black uppercase text-center tracking-tighter">{label}</span>
      <span className={`
        text-[10px] font-black px-2 py-1 rounded-lg text-center
        ${isBad ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'}
      `}>
        {value}
      </span>
    </div>
  );
};

export default HistoryView;
