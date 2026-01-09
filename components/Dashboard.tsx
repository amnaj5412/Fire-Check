
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AppState, ExtinguisherStatus } from '../types.ts';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const stats = useMemo(() => {
    const active = state.extinguishers.filter(e => e.status !== ExtinguisherStatus.RETIRED);
    const checked = active.filter(e => {
      const lastDate = e.lastInspectionDate ? new Date(e.lastInspectionDate) : null;
      return lastDate && lastDate.getMonth() === currentMonth && lastDate.getFullYear() === currentYear;
    });

    const pending = active.length - checked.length;
    const percentage = active.length > 0 ? Math.round((checked.length / active.length) * 100) : 0;

    return { total: active.length, checked: checked.length, pending, percentage };
  }, [state.extinguishers, currentMonth, currentYear]);

  const pieData = [
    { name: 'ตรวจแล้ว', value: stats.checked, color: '#1B7F43' },
    { name: 'ค้างตรวจ', value: stats.pending, color: '#F43F5E' },
  ];

  const handleStatusClick = (code: string) => {
    navigate('/history', { state: { selectedCode: code } });
  };

  return (
    <div className="space-y-10 pb-20 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">สรุปผลภาพรวม</h2>
          <p className="text-slate-500 font-medium mt-1">ประจำเดือน {new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(new Date())}</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-[#1B7F43] px-5 py-2.5 rounded-2xl font-bold text-sm border border-green-100 shadow-sm">
          <Zap size={16} className="fill-current" /> ระบบออนไลน์ปกติ
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20">
        <StatCard 
          icon={<Package className="text-blue-600" />} 
          title="จำนวนถังทั้งหมด" 
          value={stats.total} 
          subtitle="ดูรายการถังทั้งหมด"
          bg="bg-blue-50"
          onClick={() => navigate('/inventory')}
        />
        <StatCard 
          icon={<CheckCircle2 className="text-green-600" />} 
          title="ตรวจสอบแล้ว" 
          value={stats.checked} 
          subtitle="ดูประวัติการตรวจสอบ"
          bg="bg-green-50"
          onClick={() => navigate('/history')}
        />
        <StatCard 
          icon={<AlertCircle className="text-rose-600" />} 
          title="ค้างการตรวจ" 
          value={stats.pending} 
          subtitle="เริ่มการตรวจสอบตอนนี้"
          bg="bg-rose-50"
          onClick={() => navigate('/inspections')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-900">ประสิทธิภาพการทำงาน</h3>
              <p className="text-sm text-slate-400 font-medium">สัดส่วนความคืบหน้าการตรวจเช็ครายเดือน</p>
            </div>
            <button className="text-slate-400 hover:text-slate-900 transition-colors">
              <TrendingUp size={20} />
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 h-[260px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" animationDuration={1000}>
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-900">{stats.percentage}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status</span>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 space-y-6">
              <ProgressItem label="ดำเนินการแล้ว" value={stats.checked} total={stats.total} color="bg-[#1B7F43]" />
              <ProgressItem label="รอดำเนินการ" value={stats.pending} total={stats.total} color="bg-rose-500" />
              <div className="pt-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  <strong>หมายเหตุ:</strong> การตรวจสอบรายเดือนต้องเสร็จสิ้นภายในวันที่ 25 ของทุกเดือน
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1B7F43] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-green-900/30 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <ShieldCheck size={40} className="mb-6 opacity-80" />
            <h4 className="text-lg font-bold mb-2">Safety Score</h4>
            <p className="text-green-100 text-sm font-medium mb-6">ระดับความปลอดภัยโดยรวม</p>
            <div className="text-5xl font-black mb-4 tracking-tighter">Excellent</div>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <ArrowUpRight size={18} className="text-[#1B7F43]" /> สถานะล่าสุด
              </h4>
            </div>
            <div className="space-y-2">
              {state.extinguishers.slice(0, 5).map(e => (
                <button 
                  key={e.id} 
                  onClick={() => handleStatusClick(e.code)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-green-50 rounded-2xl transition-all border border-transparent hover:border-green-100 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${e.lastInspectionDate && new Date(e.lastInspectionDate).getMonth() === currentMonth ? 'bg-green-500' : 'bg-rose-500'}`}></div>
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-900">{e.code}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{e.location}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-[#1B7F43]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, bg, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full text-left bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:scale-[1.02] transition-all group active:scale-95"
  >
    <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:rotate-6`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
    </div>
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
    <div className="text-4xl font-black text-slate-900 tracking-tighter">{value}</div>
    <p className="text-[11px] text-[#1B7F43] font-bold mt-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
       {subtitle} <ArrowUpRight size={14} />
    </p>
  </button>
);

const ProgressItem = ({ label, value, total, color }: any) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end text-xs font-bold uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-slate-900">{value} / {total}</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default Dashboard;
