import Dexie, { type Table } from 'dexie';
import type { Task, ItemLocation, QuickNote, AppSettings } from '../types';

export class ThakiratiDatabase extends Dexie {
  tasks!: Table<Task, string>;
  items!: Table<ItemLocation, string>;
  quickNotes!: Table<QuickNote, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('ThakiratiDB');
    this.version(1).stores({
      tasks: 'id, date, completed, isTimeSpecific, priority, createdAt',
      items: 'id, name, room, updatedAt',
      quickNotes: 'id, createdAt',
      settings: 'id'
    });
  }
}

export const db = new ThakiratiDatabase();

export async function initializeDefaultData() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      id: 'default',
      userName: 'طه',
      soundEnabled: true,
      notificationsEnabled: true,
      theme: 'obsidian',
      autoRolloverPrompt: true,
    });
  }

  const itemsCount = await db.items.count();
  if (itemsCount === 0) {
    const now = new Date().toISOString();
    await db.items.bulkAdd([
      {
        id: 'item-1',
        name: 'جواز السفر والأوراق الرسمية',
        location: 'الدرج الثاني في مكتب الغرفة، داخل ملف شفاف أزرق',
        room: 'bedroom',
        notes: 'معه صور شخصية إضافية وبطاقة الهوية',
        updatedAt: now
      },
      {
        id: 'item-2',
        name: 'مفتاح السيارة الاحتياطي',
        location: 'الدرج الصغير في مدخل الشقة داخل العلبة الخشبية',
        room: 'living',
        notes: 'معه بطاقة الميدالية الفضية',
        updatedAt: now
      },
      {
        id: 'item-3',
        name: 'شاحن الآيباد الأصلي وقلم Apple Pencil',
        location: 'حقيبة الظهر - الجيب الأمامي الصغير',
        room: 'bag',
        notes: 'تأكد من إرجاعه دائماً بعد الاستخدام بالخارج',
        updatedAt: now
      }
    ]);
  }

  const tasksCount = await db.tasks.count();
  if (tasksCount === 0) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    await db.tasks.bulkAdd([
      {
        id: 'task-sample-1',
        title: 'شرب الماء وأخذ الدواء أو الفيتامينات',
        notes: 'مهم جداً على الريق بعد الإفطار',
        date: today,
        time: '10:00',
        isTimeSpecific: true,
        priority: 'urgent',
        completed: false,
        createdAt: now
      },
      {
        id: 'task-sample-2',
        title: 'مراجعة أولويات اليوم وترتيب الملاحظات',
        notes: 'تسجيل أي غرض جديد تم تغيير مكانه',
        date: today,
        isTimeSpecific: false,
        priority: 'important',
        completed: false,
        createdAt: now
      }
    ]);
  }
}
