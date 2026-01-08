
import React, { useState } from 'react';
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
  FileSearch
} from 'lucide-react';
import { FireExtinguisher, InspectionRecord } from '../types';

interface Props {
  extinguishers: FireExtinguisher[];
}

const HistoryView: React.FC<Props> = ({ extinguishers }) => {
  const [selectedExtinguisherId, setSelectedExtinguisherId] = useState<string | null>(null);

  const selectedExtinguisher = extinguishers.find(e => e.id === selectedExtinguisherId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ประวัติการตรวจสอบ</h2>
          <p className="text-slate-500 text-sm">เรียกดูรายงานการตรวจสอบย้อนหลังแยกตามรายถัง</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unit Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border shadow-sm p-4">
            <h3 className="font-bold text-slate-700 mb-4 px-2">รายชื่อถังดับเพลิง</h3>
            <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-2">
              {extinguishers.map(e => (
                <button
                  key={e.id}
                  onClick={() => setSelectedExtinguisherId(e.id)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-xl transition-all
                    ${selectedExtinguisherId === e.id ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'hover:bg-slate-50 text-slate-600'}
                  `}
                >
                  <div className="text-left">
                    <div className="font-bold text-sm">{e.code}</div>
                    <div className="text-[10px] opacity-70 truncate max-w-[150px]">{e.location}</div>
                  </div>
                  <ChevronRight size={16} className={selectedExtinguisherId === e.id ? 'text-red-400' : 'text-slate-300'} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History Timeline */}
        <div className="lg:col-span-2">
          {!selectedExtinguisher ? (
            <div className="bg-white rounded-2xl border border-dashed p-12 flex flex-col items-center justify-center text-slate-400 text-center">
              <History size={48} className="mb-4 opacity-20" />
              <p>กรุณาเลือกถังดับเพลิงเพื่อดูประวัติการตรวจสอบ</p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-red-100 text-red-600 p-3 rounded-xl">
                    <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">ไทม์ไลน์การตรวจสอบ: {selectedExtinguisher.code}</h3>
                    <p className="text-sm text-slate-500">{selectedExtinguisher.location} | {selectedExtinguisher.type}</p>
                  </div>
                </div>
                
                <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-8 py-4">
                  {selectedExtinguisher.inspections.length > 0 ? (
                    selectedExtinguisher.inspections.map((record, index) => (
                      <HistoryItem key={record.id} record={record} isLatest={index === 0} />
                    ))
                  ) : (
                    <div className="text-slate-400 text-sm italic">ยังไม่มีประวัติการตรวจสอบในระบบ</div>
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
        absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm
        ${isOk ? 'bg-emerald-500' : 'bg-red-500'}
      `} />
      
      <div className="bg-slate-50 rounded-2xl border overflow-hidden">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-100/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-slate-400" />
            <span className="font-bold text-slate-700">{dateStr}</span>
            {isLatest && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">ล่าสุด</span>}
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-xs font-bold ${isOk ? 'text-emerald-600' : 'text-red-600'}`}>
              {isOk ? 'ปกติ' : 'พบข้อบกพร่อง'}
            </span>
            {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </div>
        </button>

        {isOpen && (
          <div className="p-4 bg-white border-t space-y-4 animate-in slide-in-from-top-2">
            {/* Criteria Grid */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                <FileSearch size={14} /> รายละเอียดเกณฑ์การตรวจสอบ
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <CriteriaBadge label="สายฉีด" value={record.criteria?.hose || 'ปกติ'} />
                <CriteriaBadge label="คันบังคับ" value={record.criteria?.lever || 'ปกติ'} />
                <CriteriaBadge label="ตัวถัง" value={record.criteria?.body || 'ปกติ'} />
                <CriteriaBadge label="เกจแรงดัน" value={record.criteria?.pressure || 'ปกติ'} />
                <CriteriaBadge label="สิ่งกีดขวาง" value={record.criteria?.obstruction || 'ไม่มี'} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Officer Part */}
              <div className="space-y-2 border-r md:pr-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2">
                  <User size={14} /> ขั้นตอนที่ 1: เจ้าหน้าที่แผนก
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">ผู้ตรวจสอบ:</span>
                  <span className="font-medium">{record.officerName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">สถานะ:</span>
                  <span className={`font-bold ${record.officerStatus === 'ปกติ' ? 'text-emerald-600' : 'text-red-600'}`}>{record.officerStatus}</span>
                </div>
                {record.officerNote && (
                  <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="italic">" {record.officerNote} "</span>
                  </div>
                )}
              </div>

              {/* Technician Part */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-2">
                  <Wrench size={14} /> ขั้นตอนที่ 2: ช่างเทคนิค
                </div>
                {record.isConfirmed ? (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">ผู้ยืนยัน:</span>
                      <span className="font-medium">{record.technicianName}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">สถานะสุดท้าย:</span>
                      <span className={`font-bold ${record.technicianStatus === 'ปกติ' ? 'text-emerald-600' : 'text-red-600'}`}>{record.technicianStatus}</span>
                    </div>
                    {record.technicianNote && (
                      <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="italic">" {record.technicianNote} "</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center py-4 text-xs text-amber-500 font-medium italic">
                    <AlertCircle size={14} className="mr-1" /> รอยืนยันโดยช่าง
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
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-slate-400 font-medium">{label}</span>
      <span className={`
        text-[10px] font-bold px-2 py-0.5 rounded-md text-center
        ${isBad ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}
      `}>
        {value}
      </span>
    </div>
  );
};

export default HistoryView;
