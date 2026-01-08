
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  TrendingUp,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AppState, ExtinguisherStatus } from '../types';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const stats = useMemo(() => {
    const active = state.extinguishers.filter(e => e.status !== ExtinguisherStatus.RETIRED);
    const retired = state.extinguishers.filter(e => e.status === ExtinguisherStatus.RETIRED);
    
    const checkedThisMonth = active.filter(e => {
      const lastDate = e.lastInspectionDate ? new Date(e.lastInspectionDate) : null;
      return lastDate && lastDate.getMonth() === currentMonth && lastDate.getFullYear() === currentYear;
    });

    const pendingThisMonth = active.length - checkedThisMonth.length;

    return {
      total: active.length,
      retired: retired.length,
      checked: checkedThisMonth.length,
      pending: pendingThisMonth,
      checkPercentage: active.length > 0 ? Math.round((checkedThisMonth.length / active.length) * 100) : 0
    };
  }, [state.extinguishers, currentMonth, currentYear]);

  const pieData = [
    { name: 'ตรวจแล้ว', value: stats.checked, color: '#1B7F43' },
    { name: 'ค้างตรวจ', value: stats.pending, color: '#F43F5E' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-[#1B7F43] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} /> System Operational
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">สรุปผลภาพรวม</h2>
          <p className="text-slate-500 font-medium">ประจำเดือน {new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(new Date())}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Package size={24} />} 
          title="ทั้งหมด (พร้อมใช้งาน)" 
          value={stats.total} 
          subtitle="คลิกเพื่อดูรายการทั้งหมด"
          onClick={() => navigate('/inventory', { state: { filter: 'active' } })}
          variant="primary"
        />
        <StatCard 
          icon={<CheckCircle2 size={24} />} 
          title="ตรวจสอบแล้วในเดือน" 
          value={stats.checked} 
          subtitle={`ความคืบหน้า ${stats.checkPercentage}%`}
          onClick={() => navigate('/inventory', { state: { filter: 'checked' } })}
          variant="success"
        />
        <StatCard 
          icon={<AlertCircle size={24} />} 
          title="ค้างการตรวจสอบ" 
          value={stats.pending} 
          subtitle="คลิกเพื่อดูรายการที่ต้องตรวจ"
          onClick={() => navigate('/inventory', { state: { filter: 'pending' } })}
          variant="danger"
        />
        <StatCard 
          icon={<TrendingUp size={24} />} 
          title="จำหน่ายออกแล้ว" 
          value={stats.retired} 
          subtitle="ถังที่อยู่นอกระบบ"
          onClick={() => navigate('/inventory', { state: { filter: 'retired' } })}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-[2rem] border shadow-sm flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/2">
            <h3 className="text-xl font-bold text-slate-800 mb-2">ความสำเร็จรายเดือน</h3>
            <p className="text-slate-400 text-sm mb-8">เปรียบเทียบสัดส่วนการตรวจเช็คปัจจุบัน</p>
            <div className="space-y-4">
              <ProgressItem label="ตรวจเช็คแล้ว" value={stats.checked} total={stats.total} color="bg-[#1B7F43]" />
              <ProgressItem label="รอดำเนินการ" value={stats.pending} total={stats.total} color="bg-rose-500" />
            </div>
            <button 
              onClick={() => navigate('/inspections')}
              className="mt-10 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              ดำเนินการตรวจตอนนี้ <ArrowUpRight size={18} />
            </button>
          </div>
          <div className="w-full md:w-1/2 h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" animationDuration={1500}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-slate-800">{stats.checkPercentage}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Completed</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1B7F43] p-8 rounded-[2rem] text-white shadow-xl shadow-green-900/20 relative overflow-hidden group">
            <h4 className="text-lg font-bold mb-1">ความครอบคลุม</h4>
            <p className="text-green-100/70 text-sm mb-6 font-medium">Monthly Status</p>
            <div className="text-5xl font-black mb-2">{stats.checked === stats.total && stats.total > 0 ? 'ปลอดภัย' : 'เฝ้าระวัง'}</div>
            <p className="text-green-50 text-xs font-medium leading-relaxed">
              {stats.pending > 0 
                ? `เหลืออีก ${stats.pending} ถัง เพื่อความปลอดภัย 100%`
                : 'ถังดับเพลิงทุกจุดได้รับการตรวจสอบครบถ้วน'}
            </p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border shadow-sm h-full">
             <h4 className="font-bold text-slate-800 mb-6 flex items-center justify-between">ประเภทถังในระบบ</h4>
             <div className="space-y-4">
               {Object.entries(state.extinguishers.reduce((acc: any, curr) => {
                 acc[curr.type] = (acc[curr.type] || 0) + 1;
                 return acc;
               }, {})).map(([type, count]: [string, any]) => (
                 <div key={type} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                   <span className="text-xs font-semibold text-slate-600 truncate max-w-[180px]">{type}</span>
                   <span className="text-xs font-bold text-slate-900">{count}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, onClick, variant }: any) => {
  const styles = {
    primary: 'bg-white border-slate-200 text-blue-600 hover:border-blue-200',
    success: 'bg-white border-slate-200 text-[#1B7F43] hover:border-green-200',
    danger: 'bg-white border-slate-200 text-rose-500 hover:border-rose-200',
    warning: 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
  };
  const iconBgs = { primary: 'bg-blue-50', success: 'bg-green-50', danger: 'bg-rose-50', warning: 'bg-slate-50' };

  return (
    <button onClick={onClick} className={`group p-8 rounded-[2rem] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left ${styles[variant as keyof typeof styles]}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${iconBgs[variant as keyof typeof iconBgs]}`}>
        {icon}
      </div>
      <p className="text-slate-500 text-sm font-bold mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-4xl font-black text-slate-900">{value}</h4>
        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Units</span>
      </div>
      <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-wider">{subtitle}</p>
    </button>
  );
};

const ProgressItem = ({ label, value, total, color }: any) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end text-xs font-bold">
        <span className="text-slate-600 uppercase tracking-wide">{label}</span>
        <span className="text-slate-900">{value} / {total}</span>
      </div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default Dashboard;
