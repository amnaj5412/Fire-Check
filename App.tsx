
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TableProperties, 
  ShieldCheck, 
  History, 
  Menu, 
  X,
  Bell,
  Search,
  Settings
} from 'lucide-react';
import Dashboard from './components/Dashboard.tsx';
import ExtinguisherList from './components/ExtinguisherList.tsx';
import InspectionPanel from './components/InspectionPanel.tsx';
import HistoryView from './components/HistoryView.tsx';
import { AppState, FireExtinguisher, ExtinguisherStatus } from './types.ts';

const INITIAL_DATA: FireExtinguisher[] = [
  {
    id: '1',
    code: 'FE-001',
    type: 'Dry Chemical (ผงเคมีแห้ง)' as any,
    location: 'โถงทางเดิน ชั้น 1',
    department: 'ธุรการ',
    weight: '15 lbs',
    status: ExtinguisherStatus.ACTIVE,
    addedDate: '2024-01-10',
    inspections: []
  },
  {
    id: '2',
    code: 'FE-002',
    type: 'CO2 (ก๊าซคาร์บอนไดออกไซด์)' as any,
    location: 'ห้องเซิร์ฟเวอร์ ชั้น 2',
    department: 'ไอที',
    weight: '10 lbs',
    status: ExtinguisherStatus.ACTIVE,
    addedDate: '2024-01-12',
    inspections: []
  }
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('fire_check_data_modern');
    return saved ? JSON.parse(saved) : { extinguishers: INITIAL_DATA };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('fire_check_data_modern', JSON.stringify(state));
  }, [state]);

  const updateExtinguishers = (newExtinguishers: FireExtinguisher[]) => {
    setState(prev => ({ ...prev, extinguishers: newExtinguishers }));
  };

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-[#1B7F43] p-2 rounded-2xl shadow-lg shadow-green-900/20">
                  <ShieldCheck size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">FireCheck</h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Pro Edition</p>
                </div>
              </div>

              <nav className="space-y-1">
                <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="ภาพรวมระบบ" onClick={() => setIsSidebarOpen(false)} />
                <SidebarLink to="/inventory" icon={<TableProperties size={20} />} label="จัดการข้อมูลถัง" onClick={() => setIsSidebarOpen(false)} />
                <SidebarLink to="/inspections" icon={<ShieldCheck size={20} />} label="บันทึกการตรวจ" onClick={() => setIsSidebarOpen(false)} />
                <SidebarLink to="/history" icon={<History size={20} />} label="ประวัติรายงาน" onClick={() => setIsSidebarOpen(false)} />
              </nav>
            </div>

            <div className="mt-auto p-8 border-t border-slate-100">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">AD</div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">Administrator</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black">Online</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} className="text-slate-600" />
              </button>
              <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200">
                <Search size={16} className="text-slate-400" />
                <input type="text" placeholder="ค้นหาข้อมูล..." className="bg-transparent border-none focus:outline-none text-xs w-48" />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2.5 hover:bg-slate-100 rounded-2xl transition-colors relative">
                <Bell size={20} className="text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2.5 hover:bg-slate-100 rounded-2xl transition-colors">
                <Settings size={20} className="text-slate-600" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Routes>
                <Route path="/" element={<Dashboard state={state} />} />
                <Route path="/inventory" element={<ExtinguisherList extinguishers={state.extinguishers} onUpdate={updateExtinguishers} />} />
                <Route path="/inspections" element={<InspectionPanel extinguishers={state.extinguishers} onUpdate={updateExtinguishers} />} />
                <Route path="/history" element={<HistoryView extinguishers={state.extinguishers} />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`
        flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group
        ${isActive 
          ? 'bg-[#1B7F43] text-white shadow-lg shadow-green-900/20 translate-x-1' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-[#1B7F43] hover:translate-x-1'}
      `}
    >
      <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#1B7F43]'} transition-colors`}>
        {icon}
      </span>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </Link>
  );
};

export default App;
