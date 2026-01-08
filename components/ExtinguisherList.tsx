
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  FileText,
  MapPin,
  Tag,
  Calendar,
  X,
  Filter
} from 'lucide-react';
import { FireExtinguisher, ExtinguisherType, ExtinguisherStatus } from '../types';

interface Props {
  extinguishers: FireExtinguisher[];
  onUpdate: (data: FireExtinguisher[]) => void;
}

const ExtinguisherList: React.FC<Props> = ({ extinguishers, onUpdate }) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [inspectionFilter, setInspectionFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FireExtinguisher | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ExtinguisherStatus>(ExtinguisherStatus.ACTIVE);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (location.state?.filter) {
      if (location.state.filter === 'checked') setInspectionFilter('checked');
      if (location.state.filter === 'pending') setInspectionFilter('pending');
      if (location.state.filter === 'retired') setFilterType('retired_all');
    }
  }, [location.state]);

  const filtered = extinguishers.filter(item => {
    const matchesSearch = item.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesType = filterType === 'all' || item.type === filterType;
    if (filterType === 'retired_all') matchesType = item.status === ExtinguisherStatus.RETIRED;

    let matchesInspection = true;
    const lastDate = item.lastInspectionDate ? new Date(item.lastInspectionDate) : null;
    const isChecked = lastDate && lastDate.getMonth() === currentMonth && lastDate.getFullYear() === currentYear;

    if (inspectionFilter === 'checked') matchesInspection = isChecked === true;
    if (inspectionFilter === 'pending') matchesInspection = isChecked === false && item.status !== ExtinguisherStatus.RETIRED;

    return matchesSearch && matchesType && matchesInspection;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('ยืนยันการลบข้อมูลนี้หรือไม่?')) {
      onUpdate(extinguishers.filter(e => e.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const status = formData.get('status') as ExtinguisherStatus;
    
    const data = {
      code: formData.get('code') as string,
      type: formData.get('type') as ExtinguisherType,
      location: formData.get('location') as string,
      department: formData.get('department') as string,
      weight: formData.get('weight') as string,
      status: status,
      addedDate: formData.get('addedDate') as string,
      retiredDate: status === ExtinguisherStatus.RETIRED ? (formData.get('retiredDate') as string) : undefined,
    };

    if (editingItem) {
      onUpdate(extinguishers.map(item => item.id === editingItem.id ? { ...item, ...data } : item));
    } else {
      onUpdate([...extinguishers, { ...data, id: Date.now().toString(), inspections: [] } as FireExtinguisher]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">จัดการข้อมูลถังดับเพลิง</h2>
          <p className="text-slate-500 text-sm">ค้นหา แก้ไข และสรุปรายการแยกตามหมวดหมู่</p>
        </div>
        <button onClick={() => { setEditingItem(null); setCurrentStatus(ExtinguisherStatus.ACTIVE); setIsModalOpen(true); }} className="bg-[#1B7F43] hover:bg-[#146434] text-white px-5 py-3 rounded-2xl shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2 font-bold">
          <Plus size={20} /> เพิ่มรายการใหม่
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="ค้นหารหัส หรือ สถานที่..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#1B7F43] outline-none" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2.5 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#1B7F43] outline-none font-medium">
            <option value="all">ทุกประเภทถัง</option>
            <option value="retired_all">ถังที่จำหน่ายออกแล้ว</option>
            {Object.values(ExtinguisherType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={inspectionFilter} onChange={(e) => setInspectionFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#1B7F43] outline-none font-medium text-blue-600">
            <option value="all">ทุกสถานะการตรวจในเดือน</option>
            <option value="checked">ตรวจสอบแล้ว</option>
            <option value="pending">ยังไม่ได้ตรวจสอบ</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-[0.15em] font-black">
              <tr>
                <th className="px-8 py-4">รหัส / ประเภท</th>
                <th className="px-8 py-4">ตำแหน่งที่ติดตั้ง</th>
                <th className="px-8 py-4">สถานะปัจจุบัน</th>
                <th className="px-8 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-black text-slate-800 text-base">{item.code}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.type}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><MapPin size={14} className="text-[#1B7F43]" /> {item.location}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{item.department}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === ExtinguisherStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{item.status}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingItem(item); setCurrentStatus(item.status); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-20 text-center text-slate-400 font-bold">ไม่พบข้อมูลที่ตรงตามตัวกรอง</div>}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800">{editingItem ? 'แก้ไขข้อมูล' : 'เพิ่มถังดับเพลิง'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={28} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">รหัสถัง *</label>
                  <input name="code" defaultValue={editingItem?.code} required className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#1B7F43] font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">น้ำหนัก</label>
                  <input name="weight" defaultValue={editingItem?.weight} placeholder="เช่น 15 lbs" className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#1B7F43] font-bold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ประเภท *</label>
                <select name="type" defaultValue={editingItem?.type} required className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#1B7F43] font-bold">
                  {Object.values(ExtinguisherType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">สถานที่ติดตั้ง *</label>
                <input name="location" defaultValue={editingItem?.location} required className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#1B7F43] font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">แผนก *</label>
                  <input name="department" defaultValue={editingItem?.department} required className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#1B7F43] font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">สถานะ</label>
                  <select name="status" value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value as ExtinguisherStatus)} className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#1B7F43] font-bold">
                    {Object.values(ExtinguisherStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-6">
                <button type="submit" className="w-full bg-[#1B7F43] hover:bg-[#146434] text-white py-4 rounded-2xl font-black shadow-xl shadow-green-900/20 transition-all hover:-translate-y-1">
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtinguisherList;
