
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  User, 
  Wrench, 
  CheckCircle, 
  AlertTriangle,
  ClipboardList,
  Search,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import { FireExtinguisher, InspectionRecord, ExtinguisherStatus, InspectionCriteria } from '../types';

interface Props {
  extinguishers: FireExtinguisher[];
  onUpdate: (data: FireExtinguisher[]) => void;
}

const InspectionPanel: React.FC<Props> = ({ extinguishers, onUpdate }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState('');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const filteredItems = extinguishers.filter(e => 
    e.status !== ExtinguisherStatus.RETIRED &&
    (e.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
     e.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedItem = useMemo(() => 
    extinguishers.find(e => e.id === selectedId), 
    [extinguishers, selectedId]
  );

  const isInspectedThisMonth = (item: FireExtinguisher) => {
    if (!item.lastInspectionDate) return false;
    const date = new Date(item.lastInspectionDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  };

  const handleLevel1Submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem) return;

    const formData = new FormData(e.currentTarget);
    
    const criteria: InspectionCriteria = {
      hose: formData.get('hose') as any,
      lever: formData.get('lever') as any,
      body: formData.get('body') as any,
      pressure: formData.get('pressure') as any,
      obstruction: formData.get('obstruction') as any,
    };

    const isAbnormal = 
      criteria.hose === 'ชำรุด' || 
      criteria.lever === 'ชำรุด' || 
      criteria.body === 'ชำรุด' || 
      criteria.pressure === 'ไม่ปกติ' || 
      criteria.obstruction === 'มี';

    const newRecord: InspectionRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      criteria,
      officerName: formData.get('officerName') as string,
      officerStatus: isAbnormal ? 'ผิดปกติ' : 'ปกติ',
      officerNote: formData.get('officerNote') as string,
      isConfirmed: false
    };

    onUpdate(extinguishers.map(e => 
      e.id === selectedItem.id 
        ? { ...e, inspections: [newRecord, ...e.inspections] } 
        : e
    ));
    alert('บันทึกการตรวจสอบโดยเจ้าหน้าที่สำเร็จ กรุณาแจ้งช่างอาคารเพื่อเข้ามายืนยันผล');
    setSelectedId(null);
  };

  const handleLevel2Submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem) return;

    const formData = new FormData(e.currentTarget);
    const latestInspection = selectedItem.inspections[0];

    if (!latestInspection) return;

    const updatedRecord: InspectionRecord = {
      ...latestInspection,
      technicianName: formData.get('technicianName') as string,
      technicianStatus: formData.get('technicianStatus') as any,
      technicianNote: formData.get('technicianNote') as string,
      isConfirmed: true
    };

    onUpdate(extinguishers.map(e => 
      e.id === selectedItem.id 
        ? { 
            ...e, 
            lastInspectionDate: new Date().toISOString(),
            inspections: [updatedRecord, ...e.inspections.slice(1)]
          } 
        : e
    ));
    alert('ช่างอาคารทำการยืนยันและปิดรอบการตรวจเดือนนี้สำเร็จ');
    setSelectedId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Left List */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <ClipboardList className="text-[#1B7F43]" /> รายการรอตรวจ
            </h3>
            <span className="text-xs font-bold text-slate-400">{filteredItems.length} ถัง</span>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="ค้นหารหัสถัง หรือ สถานที่..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#1B7F43] transition-all font-medium text-sm"
            />
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredItems.map(item => {
              const checked = isInspectedThisMonth(item);
              const needsConfirm = item.inspections.length > 0 && !item.inspections[0].isConfirmed;
              const isSelected = selectedId === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setStep(needsConfirm ? 2 : 1);
                  }}
                  className={`
                    w-full text-left p-5 rounded-2xl border-2 transition-all group relative overflow-hidden
                    ${isSelected ? 'border-[#1B7F43] bg-green-50/30' : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50'}
                    ${checked ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-black text-base tracking-tight ${isSelected ? 'text-[#1B7F43]' : 'text-slate-800'}`}>
                      {item.code}
                    </span>
                    {checked ? (
                      <CheckCircle size={20} className="text-[#1B7F43]" />
                    ) : needsConfirm ? (
                      <AlertTriangle size={20} className="text-amber-500 animate-pulse" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-slate-300" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 truncate">
                    <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0"></span> {item.location}
                  </div>
                  {needsConfirm && (
                    <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-white bg-amber-500 px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-lg shadow-amber-500/20">
                      Step 2: รอช่างยืนยัน
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="lg:col-span-8">
        {!selectedItem ? (
          <div className="h-full bg-white rounded-[2rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-20 text-slate-400 text-center animate-pulse">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <ShieldCheck size={64} className="opacity-10" />
            </div>
            <p className="text-xl font-bold text-slate-300">กรุณาเลือกถังดับเพลิงจากรายการเพื่อเริ่มต้นบันทึก</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border shadow-xl shadow-slate-200/50 flex flex-col h-full animate-in zoom-in-95 duration-500 overflow-hidden">
            {/* Form Header */}
            <div className="p-8 border-b bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedItem.code}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-slate-500 font-semibold">{selectedItem.location}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span className="text-xs font-black text-[#1B7F43] uppercase tracking-widest">{selectedItem.type}</span>
                </div>
              </div>
              
              <div className="flex p-1.5 bg-slate-200/50 rounded-2xl">
                <StepButton 
                  active={step === 1} 
                  label="1. เจ้าหน้าที่แผนก" 
                  onClick={() => setStep(1)} 
                  disabled={selectedItem.inspections.length > 0 && !selectedItem.inspections[0].isConfirmed}
                />
                <div className="w-8 flex items-center justify-center text-slate-400">
                  <ChevronRight size={16} />
                </div>
                <StepButton 
                  active={step === 2} 
                  label="2. ช่างอาคาร" 
                  onClick={() => setStep(2)} 
                  disabled={!(selectedItem.inspections.length > 0 && !selectedItem.inspections[0].isConfirmed)}
                />
              </div>
            </div>

            <div className="p-8 lg:p-10 flex-1 overflow-y-auto">
              {step === 1 ? (
                <form onSubmit={handleLevel1Submit} className="space-y-10">
                  <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[1.5rem] flex items-start gap-5">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                      <User size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-blue-900 text-lg">รายการตรวจสอบโดยเจ้าหน้าที่</h4>
                      <p className="text-sm text-blue-700 font-medium">กรุณาตรวจสอบสภาพทางกายภาพของถังดับเพลิงในจุดที่ท่านรับผิดชอบ</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CriteriaInput name="hose" label="สายฉีดพ่น" options={['ปกติ', 'ชำรุด']} />
                    <CriteriaInput name="lever" label="คันบังคับ/มือจับ" options={['ปกติ', 'ชำรุด']} />
                    <CriteriaInput name="body" label="สภาพตัวถัง" options={['ปกติ', 'ชำรุด']} />
                    <CriteriaInput name="pressure" label="เกจแรงดัน / น้ำหนัก" options={['ปกติ', 'ไม่ปกติ']} />
                    <CriteriaInput name="obstruction" label="สิ่งกีดขวางการใช้งาน" options={['ไม่มี', 'มี']} />
                  </div>

                  <div className="space-y-6 pt-8 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-wide">ชื่อผู้ตรวจ (เจ้าหน้าที่) *</label>
                        <input name="officerName" placeholder="ระบุชื่อ-นามสกุล" required className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-semibold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-wide">หมายเหตุเพิ่มเติม</label>
                        <input name="officerNote" placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-semibold" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/25 transition-all hover:-translate-y-1">
                    บันทึกข้อมูลระดับที่ 1 และแจ้งช่าง
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLevel2Submit} className="space-y-10">
                  <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-[1.5rem] flex items-start gap-5">
                    <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
                      <Wrench size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-emerald-900 text-lg">การยืนยันผลโดยช่างเทคนิค</h4>
                      <p className="text-sm text-emerald-700 font-medium">ยืนยันผลการตรวจและลงนามรับรองความปลอดภัย</p>
                    </div>
                  </div>

                  {selectedItem.inspections[0] && (
                    <div className="p-8 bg-slate-900 text-white rounded-[2rem] shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-4 right-4 text-white/10 group-hover:text-white/20 transition-colors">
                         <Info size={120} />
                       </div>
                       <h5 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-6">บันทึกจากขั้นตอนที่ 1</h5>
                       <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 relative z-10">
                          <SummaryItem label="สายฉีด" value={selectedItem.inspections[0].criteria.hose} />
                          <SummaryItem label="คันบังคับ" value={selectedItem.inspections[0].criteria.lever} />
                          <SummaryItem label="ตัวถัง" value={selectedItem.inspections[0].criteria.body} />
                          <SummaryItem label="แรงดัน" value={selectedItem.inspections[0].criteria.pressure} />
                          <SummaryItem label="สิ่งกีดขวาง" value={selectedItem.inspections[0].criteria.obstruction} />
                       </div>
                       <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center relative z-10">
                         <div className="text-xs text-white/50 font-medium italic">โดย: {selectedItem.inspections[0].officerName}</div>
                         <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedItem.inspections[0].officerStatus === 'ปกติ' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                           สถานะ: {selectedItem.inspections[0].officerStatus}
                         </div>
                       </div>
                    </div>
                  )}

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-wide">ชื่อช่างผู้ยืนยัน (Technician) *</label>
                        <input name="technicianName" required placeholder="ระบุชื่อช่างอาคาร" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-600 transition-all font-semibold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-wide">สถานะสุดท้ายหลังการยืนยัน *</label>
                        <div className="flex gap-4">
                          <label className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-2xl cursor-pointer border-2 border-transparent peer-checked:border-emerald-500 transition-all hover:bg-slate-100">
                            <input type="radio" name="technicianStatus" value="ปกติ" defaultChecked className="hidden peer" />
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                            <span className="font-black text-slate-700 text-sm">ปกติ</span>
                          </label>
                          <label className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-2xl cursor-pointer border-2 border-transparent peer-checked:border-red-500 transition-all hover:bg-slate-100">
                            <input type="radio" name="technicianStatus" value="ผิดปกติ" className="hidden peer" />
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-red-500 peer-checked:bg-red-500 flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                            <span className="font-black text-slate-700 text-sm">ผิดปกติ</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-wide">บันทึกทางเทคนิค / การซ่อมบำรุง</label>
                      <textarea name="technicianNote" rows={3} placeholder="ระบุบันทึกการซ่อมหรือเปลี่ยนอะไหล่ (ถ้ามี)" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-600 transition-all font-semibold resize-none" />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/25 transition-all hover:-translate-y-1">
                    ยืนยันการตรวจสอบและปิดงาน (Level 2)
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StepButton = ({ active, label, onClick, disabled }: any) => (
  <button 
    className={`
      px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest
      ${active ? 'bg-white text-slate-900 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}
      ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
    `}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
);

const CriteriaInput: React.FC<{ name: string, label: string, options: string[] }> = ({ name, label, options }) => (
  <div className="p-5 bg-slate-50 rounded-2xl space-y-3 group hover:bg-slate-100 transition-colors">
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <div className="flex gap-2">
      {options.map((opt, i) => (
        <label key={opt} className="flex-1">
          <input type="radio" name={name} value={opt} defaultChecked={i === 0} className="hidden peer" />
          <div className="text-center py-2.5 px-2 rounded-xl text-xs font-black border-2 border-slate-200 bg-white peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900 cursor-pointer transition-all">
            {opt}
          </div>
        </label>
      ))}
    </div>
  </div>
);

const SummaryItem = ({ label, value }: any) => {
  const isBad = value === 'ชำรุด' || value === 'ไม่ปกติ' || value === 'มี';
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">{label}</div>
      <div className={`text-sm font-black ${isBad ? 'text-rose-400' : 'text-emerald-400'}`}>{value}</div>
    </div>
  );
};

export default InspectionPanel;
