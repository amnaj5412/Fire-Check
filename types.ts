
export enum ExtinguisherType {
  DRY_CHEMICAL = 'Dry Chemical (ผงเคมีแห้ง)',
  CO2 = 'CO2 (ก๊าซคาร์บอนไดออกไซด์)',
  FOAM = 'Foam (โฟม)',
  WATER = 'Water (น้ำสะสมแรงดัน)',
  CLEAN_AGENT = 'Clean Agent (สารสะอาด)',
}

export enum ExtinguisherStatus {
  ACTIVE = 'พร้อมใช้งาน',
  RETIRED = 'จำหน่ายออก',
  MAINTENANCE = 'ส่งซ่อม',
}

export interface InspectionCriteria {
  hose: 'ปกติ' | 'ชำรุด';
  lever: 'ปกติ' | 'ชำรุด';
  body: 'ปกติ' | 'ชำรุด';
  pressure: 'ปกติ' | 'ไม่ปกติ';
  obstruction: 'มี' | 'ไม่มี';
}

export interface InspectionRecord {
  id: string;
  date: string;
  // Criteria details
  criteria: InspectionCriteria;
  // Level 1: Department Staff
  officerName: string;
  officerStatus: 'ปกติ' | 'ผิดปกติ';
  officerNote: string;
  // Level 2: Technician
  technicianName?: string;
  technicianStatus?: 'ปกติ' | 'ผิดปกติ';
  technicianNote?: string;
  isConfirmed: boolean;
}

export interface FireExtinguisher {
  id: string;
  code: string;
  type: ExtinguisherType;
  location: string;
  department: string;
  weight: string;
  status: ExtinguisherStatus;
  addedDate: string; // วันที่เริ่มใช้งาน/เพิ่มถัง
  retiredDate?: string; // วันที่จำหน่ายออก
  lastInspectionDate?: string;
  inspections: InspectionRecord[];
}

export interface AppState {
  extinguishers: FireExtinguisher[];
}
