
import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter,
  X,
  Save,
  Calendar,
  QrCode,
  Download,
  Printer,
  AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { FireExtinguisher, ExtinguisherType, ExtinguisherStatus } from '../types';

interface Props {
  extinguishers: FireExtinguisher[];
  onUpdate: (data: FireExtinguisher[]) => void;
}

const ExtinguisherList: React.FC<Props> = ({ extinguishers, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FireExtinguisher | null>(null);
  const [viewingQR, setViewingQR] = useState<FireExtinguisher | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const filtered = extinguishers.filter(item => 
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: FireExtinguisher) => {
    setEditingItem(item || null);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setValidationError(null);
    setIsModalOpen(false);
  };

  const handleOpenQR = (item: FireExtinguisher) => {
    setViewingQR(item);
    setIsQRModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การลบข้อมูลจะไม่สามารถกู้คืนได้')) {
      onUpdate(extinguishers.filter(e => e.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = (formData.get('code') as string).trim().toUpperCase();
    
    // Validate Duplicate Code
    const isDuplicate = extinguishers.some(e => 
      e.code.toUpperCase() === code && (!editingItem || e.id !== editingItem.id)
    );

    if (isDuplicate) {
      setValidationError(`รหัส "${code}" มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง`);
      return;
    }

    const newItem: FireExtinguisher = {
      id: editingItem?.id || Date.now().toString(),
      code,
      type: formData.get('type') as ExtinguisherType,
      location: formData.get('location') as string,
      department: formData.get('department') as string,
      weight: formData.get('weight') as string,
      status: formData.get('status') as ExtinguisherStatus,
      addedDate: formData.get('addedDate') as string,
      retiredDate: formData.get('retiredDate') as string || undefined,
      inspections: editingItem?.inspections || [],
      lastInspectionDate: editingItem?.lastInspectionDate
    };

    if (editingItem) {
      onUpdate(extinguishers.map(e => e.id === editingItem.id ? newItem : e));
    } else {
      onUpdate([...extinguishers, newItem]);
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">คลังอุปกรณ์ (Inventory)</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">บริหารจัดการข้อมูลและสถานะการพร้อมใช้งานของอุปกรณ์ทั้งหมด</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#1B7F43] text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-green-900/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> เพิ่มถังใหม่
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 px-2">
          <Filter size={16} /> Filter Results:
        </div>
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="ค้นหาด้วย รหัสถัง, สถานที่ติดตั้ง หรือแผนก..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-green-500/10 focus:border-[#1B7F43] outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">รายการ / แผนก</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ข้อมูลทางเทคนิค</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">สถานที่ติดตั้ง</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">เริ่มใช้งาน</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">สถานะ</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="font-black text-slate-900 text-base">{item.code}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{item.department}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-slate-700">{item.type}</div>
                    <div className="text-[10px] text-slate-400 font-medium">Size: {item.weight || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-slate-600 leading-snug">{item.location}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                      <Calendar size={14} className="opacity-30" />
                      {item.addedDate ? new Date(item.addedDate).toLocaleDateString('th-TH') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                      ${item.status === ExtinguisherStatus.ACTIVE 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : item.status === ExtinguisherStatus.RETIRED 
                          ? 'bg-slate-100 text-slate-500 border border-slate-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }
                    `}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-1">
                      <ActionButton onClick={() => handleOpenQR(item)} icon={<QrCode size={18} />} color="text-[#1B7F43]" bg="hover:bg-green-50" title="QR Code" />
                      <ActionButton onClick={() => handleOpenModal(item)} icon={<Edit3 size={18} />} color="text-blue-600" bg="hover:bg-blue-50" title="แก้ไข" />
                      <ActionButton onClick={() => handleDelete(item.id)} icon={<Trash2 size={18} />} color="text-rose-600" bg="hover:bg-rose-50" title="ลบ" />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <div className="bg-slate-50 p-4 rounded-full text-slate-200">
                          <Search size={48} />
                       </div>
                       <p className="text-slate-400 font-bold text-sm italic">ไม่พบข้อมูลอุปกรณ์ที่คุณกำลังมองหา</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      {isQRModalOpen && viewingQR && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-10 flex flex-col items-center text-center">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 mb-8 shadow-inner">
                   <QRCodeSVG value={viewingQR.code} size={180} level="H" includeMargin={true} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">{viewingQR.code}</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-8">{viewingQR.location}</p>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                   <button className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors text-sm">
                      <Download size={18} /> รูปภาพ
                   </button>
                   <button className="flex items-center justify-center gap-2 bg-[#1B7F43] text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-green-900/20 transition-all text-sm">
                      <Printer size={18} /> พิมพ์ Label
                   </button>
                </div>
                <button 
                  onClick={() => setIsQRModalOpen(false)}
                  className="mt-8 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <form onSubmit={handleSave}>
              <div className="bg-[#1B7F43] p-10 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black">{editingItem ? 'แก้ไขข้อมูลอุปกรณ์' : 'เพิ่มถังดับเพลิงใหม่'}</h3>
                  <p className="text-green-100/70 text-sm font-medium mt-1">ตรวจสอบความถูกต้องก่อนการบันทึกข้อมูล</p>
                </div>
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
                {validationError && (
                  <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 animate-in shake duration-300">
                     <AlertCircle size={24} className="text-rose-500 shrink-0" />
                     <p className="text-sm font-bold text-rose-600 leading-tight">{validationError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputGroup label="รหัสอุปกรณ์ (Equipment Code) *" name="code" defaultValue={editingItem?.code} required />
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ประเภทสารดับเพลิง (Agent Type)</label>
                    <select 
                      name="type" 
                      defaultValue={editingItem?.type || ExtinguisherType.DRY_CHEMICAL}
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-[#1B7F43] outline-none transition-all"
                    >
                      {Object.values(ExtinguisherType).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <InputGroup label="สถานที่ติดตั้ง (Location) *" name="location" defaultValue={editingItem?.location} required />
                  <InputGroup label="หน่วยงานที่ดูแล (Department) *" name="department" defaultValue={editingItem?.department} required />
                  <InputGroup label="ขนาดบรรจุ (Capacity/Weight)" name="weight" defaultValue={editingItem?.weight} placeholder="เช่น 15 lbs" />
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">สถานะปัจจุบัน (Status)</label>
                    <select 
                      name="status" 
                      defaultValue={editingItem?.status || ExtinguisherStatus.ACTIVE}
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-[#1B7F43] outline-none transition-all"
                    >
                      {Object.values(ExtinguisherStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่นำเข้าเครื่อง (Initial Date) *</label>
                    <input 
                      type="date" 
                      name="addedDate" 
                      defaultValue={editingItem?.addedDate || new Date().toISOString().split('T')[0]} 
                      required
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-[#1B7F43] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่จำหน่ายออก (Retire Date)</label>
                    <input 
                      type="date" 
                      name="retiredDate" 
                      defaultValue={editingItem?.retiredDate || ''} 
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-[#1B7F43] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-slate-50 flex justify-end gap-4 bg-slate-50/50">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="bg-[#1B7F43] text-white px-12 py-4 rounded-2xl font-black text-base shadow-xl shadow-green-900/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-3"
                >
                  <Save size={20} /> บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ onClick, icon, color, bg, title }: any) => (
  <button 
    onClick={onClick}
    className={`p-2.5 ${color} ${bg} rounded-xl transition-all flex items-center justify-center`}
    title={title}
  >
    {icon}
  </button>
);

const InputGroup = ({ label, name, defaultValue, required, placeholder }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
    <input 
      name={name} 
      required={required} 
      defaultValue={defaultValue}
      placeholder={placeholder}
      autoComplete="off"
      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-[#1B7F43] outline-none transition-all shadow-inner placeholder:text-slate-300" 
    />
  </div>
);

export default ExtinguisherList;
