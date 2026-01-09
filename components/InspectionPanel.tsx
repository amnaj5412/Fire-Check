
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  User, 
  Wrench, 
  CheckCircle, 
  Search,
  Save,
  Info,
  ChevronRight,
  Camera,
  Keyboard,
  ArrowLeft,
  Scan,
  Loader2,
  AlertTriangle,
  X,
  RefreshCw
} from 'lucide-react';
import jsQR from 'jsqr';
import { FireExtinguisher, InspectionRecord, ExtinguisherStatus, InspectionCriteria } from '../types';

interface Props {
  extinguishers: FireExtinguisher[];
  onUpdate: (data: FireExtinguisher[]) => void;
}

const InspectionPanel: React.FC<Props> = ({ extinguishers, onUpdate }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [verificationMode, setVerificationMode] = useState<'idle' | 'scanning' | 'manual'>('idle');
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const lastScanTime = useRef<number>(0);
  const lastScannedCode = useRef<string>('');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const selectedItem = useMemo(() => 
    extinguishers.find(e => e.id === selectedId), 
    [extinguishers, selectedId]
  );

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    // Keep it slightly longer for success, short for error
    const duration = type === 'success' ? 3000 : 4000;
    setTimeout(() => setToast(null), duration);
  };

  const isInspectedThisMonth = (item: FireExtinguisher) => {
    if (!item.lastInspectionDate) return false;
    const date = new Date(item.lastInspectionDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  };

  const handleVerifyCode = useCallback((code: string) => {
    const cleanCode = code.trim().toUpperCase();
    
    // Logic to prevent repeated error showing for the same invalid scan
    if (cleanCode === lastScannedCode.current && error) return false;
    lastScannedCode.current = cleanCode;

    const item = extinguishers.find(e => e.code.toUpperCase() === cleanCode);
    
    if (!item) {
      setError(`ไม่พบอุปกรณ์รหัส "${cleanCode}" ในคลังข้อมูล`);
      return false;
    }
    if (item.status === ExtinguisherStatus.RETIRED) {
      setError('ถังนี้ถูก "จำหน่ายออก" แล้ว ไม่สามารถทำการตรวจสอบได้');
      return false;
    }
    if (isInspectedThisMonth(item)) {
      setError('ถังนี้ผ่านการตรวจสอบประจำเดือนเรียบร้อยแล้ว');
      return false;
    }

    setIsProcessing(true);
    // Flow logic: if level 1 exists but not confirmed, go to level 2 automatically
    const needsConfirm = item.inspections.length > 0 && !item.inspections[0].isConfirmed;
    setSelectedId(item.id);
    setStep(needsConfirm ? 2 : 1);
    setVerificationMode('idle');
    setError(null);
    setIsProcessing(false);
    return true;
  }, [extinguishers, currentMonth, currentYear, error]);

  const stopCamera = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = 0;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      videoRef.current.srcObject = null;
    }
    lastScannedCode.current = '';
  }, []);

  const scanFrame = useCallback((time: number) => {
    if (verificationMode !== 'scanning' || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    
    // Balanced scanning rate (~12 FPS) for mobile efficiency
    if (time - lastScanTime.current > 80) {
      lastScanTime.current = time;

      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (ctx) {
          // Optimized ROI for standard mobile aspect ratios
          const minDim = Math.min(video.videoWidth, video.videoHeight);
          const scanSize = Math.floor(minDim * 0.75);
          const sx = (video.videoWidth - scanSize) / 2;
          const sy = (video.videoHeight - scanSize) / 2;

          const targetSize = 480; // Lower resolution for faster processing
          canvas.width = targetSize;
          canvas.height = targetSize;

          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(video, sx, sy, scanSize, scanSize, 0, 0, targetSize, targetSize);
          
          const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
          
          // Grayscale pre-process to improve jsQR detection in low light
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11);
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
          }
          
          const code = jsQR(data, targetSize, targetSize, {
            inversionAttempts: "attemptBoth",
          });

          if (code && code.data) {
            const success = handleVerifyCode(code.data);
            if (success) {
              stopCamera();
              return;
            }
          }
        }
      }
    }
    
    requestRef.current = requestAnimationFrame(scanFrame);
  }, [verificationMode, handleVerifyCode, stopCamera]);

  const startCamera = async () => {
    setVerificationMode('scanning');
    setError(null);
    setIsProcessing(false);
    lastScannedCode.current = '';
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 1 }
        } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            requestRef.current = requestAnimationFrame(scanFrame);
          } catch (e) {
            console.error("Video play error:", e);
            setError('การสตรีมวิดีโอขัดข้อง โปรดรีเฟรชหน้าจอ');
          }
        };
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError('ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบสิทธิ์การใช้งานใน Browser');
      setVerificationMode('manual');
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

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

    const isAbnormal = Object.values(criteria).some(v => v === 'ชำรุด' || v === 'ไม่ปกติ' || v === 'มี');

    const newRecord: InspectionRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      criteria,
      officerName: formData.get('officerName') as string,
      officerStatus: isAbnormal ? 'ผิดปกติ' : 'ปกติ',
      officerNote: formData.get('officerNote') as string,
      isConfirmed: false
    };

    onUpdate(extinguishers.map(e => e.id === selectedItem.id ? { ...e, inspections: [newRecord, ...e.inspections] } : e));
    
    showNotification(`บันทึกข้อมูลตรวจสอบ Level 1 ของ ${selectedItem.code} เรียบร้อย`);
    
    setTimeout(() => {
      setSelectedId(null);
    }, 600);
  };

  const handleLevel2Submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem || !selectedItem.inspections[0]) return;

    const formData = new FormData(e.currentTarget);
    const updatedRecord: InspectionRecord = {
      ...selectedItem.inspections[0],
      technicianName: formData.get('technicianName') as string,
      technicianStatus: formData.get('technicianStatus') as any,
      technicianNote: formData.get('technicianNote') as string,
      isConfirmed: true
    };

    onUpdate(extinguishers.map(e => e.id === selectedItem.id ? { ...e, lastInspectionDate: new Date().toISOString(), inspections: [updatedRecord, ...e.inspections.slice(1)] } : e));
    
    showNotification(`ยืนยันความสมบูรณ์ (Level 2) ของ ${selectedItem.code} สำเร็จ`);
    
    setTimeout(() => {
      setSelectedId(null);
    }, 600);
  };

  return (
    <div className="relative min-h-[50vh]">
      {/* Dynamic Toast System */}
      {toast?.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
           <div className={`
             px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/20 text-white
             ${toast.type === 'success' ? 'bg-[#1B7F43] shadow-green-900/40' : 'bg-rose-600 shadow-rose-900/40'}
           `}>
              <div className="bg-white/20 p-2.5 rounded-full">
                {toast.type === 'success' ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
              </div>
              <div className="pr-4 border-r border-white/10">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-0.5">
                  {toast.type === 'success' ? 'บันทึกสำเร็จ' : 'แจ้งเตือน'}
                </p>
                <p className="text-sm font-bold whitespace-nowrap">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="hover:scale-110 active:scale-90 transition-transform p-1">
                <X size={18} />
              </button>
           </div>
        </div>
      )}

      {!selectedId ? (
        <div className="max-w-xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="text-center space-y-3">
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">ระบุตัวตนอุปกรณ์</h2>
             <p className="text-slate-500 font-medium text-sm">เลือกวิธีสแกน QR Code หรือกรอกรหัสประจำถัง</p>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
            {verificationMode === 'idle' ? (
              <div className="p-10 space-y-6">
                 <button 
                  onClick={startCamera}
                  className="w-full flex flex-col items-center justify-center gap-5 p-14 bg-[#1B7F43] text-white rounded-[2.5rem] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-green-900/30 group"
                 >
                   <div className="bg-white/20 p-8 rounded-full group-hover:bg-white/30 transition-all">
                     <Scan size={56} />
                   </div>
                   <div className="text-center">
                      <p className="text-2xl font-black text-white">เปิดกล้องสแกน</p>
                      <p className="text-[10px] text-green-100/70 font-black uppercase tracking-[0.2em] mt-2">Safe & Secure Identification</p>
                   </div>
                 </button>

                 <div className="flex items-center gap-4 px-10 py-2">
                   <div className="h-px bg-slate-100 flex-1"></div>
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-4">หรือ</span>
                   <div className="h-px bg-slate-100 flex-1"></div>
                 </div>

                 <button 
                  onClick={() => setVerificationMode('manual')}
                  className="w-full flex items-center justify-center gap-3 p-6 bg-slate-50 text-slate-700 border border-slate-200 rounded-[1.8rem] hover:bg-slate-100 active:scale-98 transition-all font-bold"
                 >
                   <Keyboard size={20} className="text-slate-400" /> พิมพ์รหัสด้วยตนเอง
                 </button>
              </div>
            ) : verificationMode === 'scanning' ? (
              <div className="p-4 space-y-6 animate-in zoom-in-95 duration-300">
                <div className="relative aspect-square bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 ring-8 ring-slate-50/50">
                   <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                   <canvas ref={canvasRef} className="hidden" />
                   
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                      <div className="w-2/3 aspect-square border-2 border-green-400/20 rounded-[4rem] relative shadow-[0_0_0_100vmax_rgba(0,0,0,0.7)] overflow-hidden">
                         <div className="scanner-line"></div>
                         <div className="absolute top-0 left-0 w-14 h-14 border-t-8 border-l-8 border-green-500 rounded-tl-[3rem]"></div>
                         <div className="absolute top-0 right-0 w-14 h-14 border-t-8 border-r-8 border-green-500 rounded-tr-[3rem]"></div>
                         <div className="absolute bottom-0 left-0 w-14 h-14 border-b-8 border-l-8 border-green-500 rounded-bl-[3rem]"></div>
                         <div className="absolute bottom-0 right-0 w-14 h-14 border-b-8 border-r-8 border-green-500 rounded-br-[3rem]"></div>
                      </div>
                   </div>

                   <div className="absolute top-10 left-0 w-full flex justify-center px-6 z-20">
                      <div className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full text-[10px] font-black text-white uppercase tracking-[0.25em] flex items-center gap-3 border border-white/10 shadow-2xl">
                         <RefreshCw size={14} className="animate-spin text-green-400" />
                         Analyzing Frame...
                      </div>
                   </div>

                   <div className="absolute bottom-10 left-0 w-full flex justify-center px-6 z-20">
                      <div className="bg-white/10 backdrop-blur-md px-10 py-3.5 rounded-2xl text-[11px] font-bold text-white text-center border border-white/20">
                         จัดวาง QR Code ให้พอดีกับกรอบสแกน
                      </div>
                   </div>
                </div>
                
                {error && (
                  <div className="mx-4 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 flex items-center gap-4 animate-in shake duration-300">
                    <AlertTriangle size={20} className="shrink-0" /> {error}
                  </div>
                )}
                
                <div className="flex justify-between items-center px-6 pb-6 pt-2">
                  <button 
                    onClick={() => { stopCamera(); setVerificationMode('idle'); }}
                    className="text-sm font-black text-slate-400 flex items-center gap-2 hover:text-slate-600 transition-colors"
                  >
                    <ArrowLeft size={20} /> ย้อนกลับ
                  </button>
                  <button 
                    onClick={() => { stopCamera(); setVerificationMode('manual'); }}
                    className="text-[11px] font-black text-[#1B7F43] bg-green-50 px-6 py-3 rounded-xl border border-green-100 hover:bg-green-100 transition-colors uppercase tracking-wider"
                  >
                    พิมพ์รหัสแทน
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-10 space-y-8 animate-in zoom-in-95 duration-300">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รหัสประจำเครื่อง (Equipment Code)</label>
                    <div className="relative">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="เช่น FE-001..." 
                        value={manualCode}
                        onChange={(e) => { setManualCode(e.target.value); setError(null); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode(manualCode)}
                        className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-200 rounded-[1.8rem] text-2xl font-black focus:ring-8 focus:ring-green-500/10 focus:border-[#1B7F43] outline-none transition-all shadow-inner uppercase tracking-wider"
                      />
                    </div>
                    {error && (
                      <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 flex items-center gap-4 animate-in fade-in">
                         <AlertTriangle size={20} className="shrink-0" /> {error}
                      </div>
                    )}
                 </div>

                 <div className="flex flex-col gap-4 pt-4">
                   <button 
                    onClick={() => handleVerifyCode(manualCode)}
                    disabled={!manualCode || isProcessing}
                    className="w-full bg-[#1B7F43] text-white py-6 rounded-[1.8rem] font-black text-xl shadow-2xl shadow-green-900/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-4 group"
                   >
                     ตรวจสอบข้อมูล <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                   <button 
                    onClick={() => { setVerificationMode('idle'); setError(null); }}
                    className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors text-sm"
                   >
                     ยกเลิกและย้อนกลับ
                   </button>
                 </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-10 opacity-30">
             <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <ShieldCheck size={18} /> Compliance Verified
             </div>
             <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Camera size={18} /> HD Optics
             </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="bg-[#1B7F43] p-12 text-white relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="flex items-center justify-between mb-10">
                <button 
                  onClick={() => setSelectedId(null)}
                  className="p-3.5 hover:bg-white/10 rounded-2xl transition-all active:scale-90"
                >
                  <ArrowLeft size={32} />
                </button>
                <div className="flex gap-3">
                  <Tab active={step === 1} label="Level 1: ตรวจเช็ค" icon={<User size={16} />} disabled={step !== 1} />
                  <Tab active={step === 2} label="Level 2: ยืนยัน" icon={<Wrench size={16} />} disabled={step !== 2} />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] opacity-80 mb-4">
                    <ShieldCheck size={16} /> Monthly Inspection Form
                  </div>
                  <h3 className="text-5xl font-black tracking-tighter leading-none">{selectedItem?.code}</h3>
                  <p className="text-base font-medium text-green-100 pt-3">{selectedItem?.location} | {selectedItem?.type}</p>
                </div>
                <div className="bg-black/10 backdrop-blur-xl px-8 py-6 rounded-[2rem] border border-white/15 shadow-inner">
                  <p className="text-[10px] font-black uppercase text-green-100/60 mb-2 tracking-widest">Weight Spec</p>
                  <p className="text-2xl font-black">{selectedItem?.weight || 'Standard'}</p>
                </div>
              </div>
            </div>

            <div className="p-12">
              {step === 1 ? (
                <form onSubmit={handleLevel1Submit} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                    <ModernRadio label="1. สภาพสายฉีด (Hose & Nozzle)" name="hose" options={['ปกติ', 'ชำรุด']} />
                    <ModernRadio label="2. คันบังคับและซีล (Lever & Seal)" name="lever" options={['ปกติ', 'ชำรุด']} />
                    <ModernRadio label="3. สภาพตัวถังภายนอก (Cylinder Body)" name="body" options={['ปกติ', 'ชำรุด']} />
                    <ModernRadio label="4. แรงดัน (Pressure Gauge)" name="pressure" options={['ปกติ', 'ไม่ปกติ']} />
                    <div className="md:col-span-2">
                      <ModernRadio label="5. สิ่งกีดขวางจุดติดตั้ง (Access/Obstruction)" name="obstruction" options={['ไม่มี', 'มี']} />
                    </div>
                  </div>

                  <div className="h-px bg-slate-100"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <InputGroup label="ชื่อ-นามสกุล เจ้าหน้าที่ตรวจสอบ *" name="officerName" required />
                    <InputGroup label="หมายเหตุการตรวจสอบ (เพิ่มเติม)" name="officerNote" textarea />
                  </div>

                  <div className="flex justify-end pt-6">
                    <button 
                      type="submit"
                      className="bg-[#1B7F43] text-white px-14 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-green-900/30 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-4"
                    >
                      <Save size={26} /> บันทึกข้อมูล Level 1
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLevel2Submit} className="space-y-12">
                   <div className="bg-amber-50 p-10 rounded-[2.5rem] border border-amber-100 flex items-start gap-6 shadow-sm">
                      <div className="bg-amber-200/50 p-4 rounded-2xl text-amber-700">
                         <Info size={28} />
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Technical Reference (Level 1)</p>
                         <p className="text-lg text-amber-900/80 font-medium leading-relaxed">
                            เจ้าหน้าที่ <span className="font-bold underline decoration-amber-300">{selectedItem?.inspections[0]?.officerName}</span> ได้ระบุสถานะว่าอุปกรณ์ <span className={`font-black ${selectedItem?.inspections[0]?.officerStatus === 'ปกติ' ? 'text-green-700' : 'text-rose-700'}`}>{selectedItem?.inspections[0]?.officerStatus}</span>
                         </p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ผลการยืนยันทางเทคนิค (Final Result)</label>
                        <div className="flex gap-5">
                          <label className="flex-1 flex items-center justify-center p-6 border-2 border-slate-100 rounded-[1.8rem] bg-slate-50 cursor-pointer hover:bg-white hover:border-green-500 transition-all group has-[:checked]:bg-white has-[:checked]:border-green-500 has-[:checked]:shadow-xl has-[:checked]:scale-[1.02]">
                            <input type="radio" name="technicianStatus" value="ปกติ" defaultChecked className="hidden" />
                            <div className="text-center">
                               <p className="text-sm font-black text-slate-400 group-has-[:checked]:text-green-600 uppercase tracking-wider">ปกติ / พร้อมใช้</p>
                               <p className="text-[9px] text-slate-300 group-has-[:checked]:text-green-400 font-bold mt-1">Ready for Service</p>
                            </div>
                          </label>
                          <label className="flex-1 flex items-center justify-center p-6 border-2 border-slate-100 rounded-[1.8rem] bg-slate-50 cursor-pointer hover:bg-white hover:border-rose-500 transition-all group has-[:checked]:bg-white has-[:checked]:border-rose-500 has-[:checked]:shadow-xl has-[:checked]:scale-[1.02]">
                            <input type="radio" name="technicianStatus" value="ผิดปกติ" className="hidden" />
                            <div className="text-center">
                               <p className="text-sm font-black text-slate-400 group-has-[:checked]:text-rose-600 uppercase tracking-wider">ผิดปกติ / ส่งซ่อม</p>
                               <p className="text-[9px] text-slate-300 group-has-[:checked]:text-rose-400 font-bold mt-1">Maintenance Needed</p>
                            </div>
                          </label>
                        </div>
                      </div>
                      <InputGroup label="ชื่อช่างเทคนิคผู้ยืนยันข้อมูล *" name="technicianName" required />
                   </div>

                   <InputGroup label="รายละเอียดการบำรุงรักษา / ข้อเสนอแนะเชิงลึก" name="technicianNote" textarea />

                   <div className="flex justify-end pt-8">
                    <button 
                      type="submit"
                      className="bg-[#1B7F43] text-white px-16 py-6 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-green-900/30 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-5"
                    >
                      <CheckCircle size={32} /> ยืนยันข้อมูลสำเร็จ (Finalize)
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Tab = ({ active, label, icon, disabled }: any) => (
  <div className={`
    flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-sm font-black transition-all
    ${active ? 'bg-white text-[#1B7F43] shadow-2xl scale-105' : 'text-white/40'}
    ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}
  `}>
    {icon} {label}
  </div>
);

const ModernRadio = ({ label, name, options }: any) => (
  <div className="space-y-4">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="flex gap-5">
      {options.map((opt: string) => (
        <label key={opt} className="flex-1 flex items-center justify-center p-6 border-2 border-slate-50 rounded-[1.8rem] bg-slate-50 cursor-pointer hover:bg-white hover:border-[#1B7F43] transition-all group has-[:checked]:bg-white has-[:checked]:border-[#1B7F43] has-[:checked]:shadow-xl has-[:checked]:scale-[1.02]">
          <input type="radio" name={name} value={opt} defaultChecked={opt === options[0]} className="hidden" />
          <span className="text-sm font-black text-slate-400 group-has-[:checked]:text-[#1B7F43] uppercase tracking-[0.1em]">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

const InputGroup = ({ label, name, required, textarea }: any) => (
  <div className="space-y-3.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
    {textarea ? (
      <textarea name={name} rows={5} className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[1.8rem] text-sm font-medium focus:ring-8 focus:ring-green-500/5 focus:border-[#1B7F43] outline-none transition-all resize-none shadow-inner placeholder:text-slate-300" placeholder="ระบุรายละเอียดเพิ่มเติม..." />
    ) : (
      <input name={name} required={required} autoComplete="off" className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[1.8rem] text-base font-bold focus:ring-8 focus:ring-green-500/5 focus:border-[#1B7F43] outline-none transition-all shadow-inner placeholder:text-slate-300" placeholder="พิมพ์ชื่อ-นามสกุล..." />
    )}
  </div>
);

export default InspectionPanel;
