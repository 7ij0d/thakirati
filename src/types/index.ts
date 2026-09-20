export type PriorityLevel = 'urgent' | 'important' | 'normal';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (e.g. "14:30")
  isTimeSpecific: boolean;
  priority: PriorityLevel;
  completed: boolean;
  completedAt?: string;
  isSpontaneous?: boolean; // Done without a prior task ("إنجاز مفاجئ")
  rolledOverFrom?: string; // e.g. '2026-09-18'
  voiceMemoUrl?: string; // base64 or blob URL
  createdAt: string;
}

export type RoomCategory = 
  | 'bedroom' 
  | 'office' 
  | 'car' 
  | 'bag' 
  | 'living' 
  | 'kitchen' 
  | 'other';

export interface ItemLocation {
  id: string;
  name: string; // e.g. "جواز السفر", "مفتاح السيارة الاحتياطي"
  location: string; // e.g. "الدرج السفلي لمكتب الغرفة داخل ملف أزرق"
  room: RoomCategory;
  roomCustom?: string;
  photoUrl?: string; // Base64 data URL
  notes?: string;
  updatedAt: string;
}

export interface QuickNote {
  id: string;
  content: string;
  type: 'text' | 'voice';
  audioDataUrl?: string;
  durationSeconds?: number;
  createdAt: string;
}

export interface AppSettings {
  id?: string;
  userName: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme: 'dark' | 'obsidian';
  autoRolloverPrompt: boolean;
}
