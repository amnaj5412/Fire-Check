
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TableProperties, 
  ShieldCheck, 
  History, 
  Menu, 
  X,
  Bell
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ExtinguisherList from './components/ExtinguisherList';
import InspectionPanel from './components/InspectionPanel';
import HistoryView from './components/HistoryView';
import { AppState, FireExtinguisher, ExtinguisherStatus } from './types';

const INITIAL_DATA: FireExtinguisher[] = [
  {
    id: '1',
    code: 'FE-001',
    type: 'Dry Chemical (ผงเคมีแห้ง)' as any,
    location: 'โถงทางเดิน ชั้น 1',
    department: 'ธุรการ',
    weight: '15 lbs',
    status: ExtinguisherStatus.ACTIVE,
    addedDate: new Date().toISOString().split('T')[0],
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
    addedDate: new Date().toISOString().split('T')[0],
    inspections: []
  }
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('fire_check_data');
    return saved ? JSON.parse(saved) : { extinguishers: INITIAL_DATA };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('fire_check_data', JSON.stringify(state));
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
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-white p-1 rounded-xl shadow-xl shadow-black/20 w-14 h-14 flex items-center justify-center overflow-hidden shrink-0">
                  <img 
                    src="./logo.jpg" 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=FC&background=1B7F43&color=fff&size=128';
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white leading-tight">Fire Check</h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Security System</p>
                </div>
              </div>

              <nav className="space-y-1.5">
                <SidebarLink to="/" icon={<LayoutDashboard size={22} />} label="ภาพรวมระบบ" onClick={() => setIsSidebarOpen(false)} />
                <SidebarLink to="/inventory" icon={<TableProperties size={22} />} label="จัดการฐานข้อมูล" onClick={() => setIsSidebarOpen(false)} />
                <SidebarLink to="/inspections" icon={<ShieldCheck size={22} />} label="บันทึกการตรวจสอบ" onClick={() => setIsSidebarOpen(false)} />
                <SidebarLink to="/history" icon={<History size={22} />} label="ประวัติและรายงาน" onClick={() => setIsSidebarOpen(false)} />
              </nav>
            </div>

            <div className="mt-auto p-8 border-t border-slate-800/50">
              <div className="flex items-center gap-3 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <div className="w-10 h-10 rounded-full bg-[#1B7F43] flex items-center justify-center font-bold text-sm">FC</div>
                <div>
                  <p className="text-xs font-bold">Main System</p>
                  <p className="text-[10px] text-slate-500">v2.1.0 Online</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-20 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-8 shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} className="text-slate-600" />
              </button>
              <h2 className="text-slate-800 font-bold hidden md:block uppercase text-xs tracking-[0.2em]">Fire Extinguisher Management</h2>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">Operator</p>
                  <p className="text-[10px] text-[#1B7F43] font-bold uppercase tracking-widest">Authorized</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 p-1 shadow-sm">
                  <img 
                    src="./logo.jpg" 
                    alt="User" 
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=OP&background=f1f5f9&color=64748b';
                    }}
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-[1600px] mx-auto p-6 md:p-10">
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
          ? 'bg-[#1B7F43] text-white shadow-xl shadow-green-900/40 translate-x-1' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'}
      `}
    >
      <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} transition-colors`}>
        {icon}
      </span>
      <span className="font-semibold text-sm tracking-wide">{label}</span>
    </Link>
  );
};

export default App;
