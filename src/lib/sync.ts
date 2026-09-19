import { db } from './db';

export async function exportAllDataAsJSON(): Promise<string> {
  const tasks = await db.tasks.toArray();
  const items = await db.items.toArray();
  const quickNotes = await db.quickNotes.toArray();
  const settings = await db.settings.toArray();

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appName: 'Thakirati',
    data: {
      tasks,
      items,
      quickNotes,
      settings
    }
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `thakirati_backup_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);

  return jsonString;
}

export async function importDataFromJSON(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.data) {
      throw new Error('Invalid backup file structure');
    }

    const { tasks, items, quickNotes, settings } = parsed.data;

    await db.transaction('rw', [db.tasks, db.items, db.quickNotes, db.settings], async () => {
      if (tasks && Array.isArray(tasks)) {
        await db.tasks.clear();
        await db.tasks.bulkAdd(tasks);
      }
      if (items && Array.isArray(items)) {
        await db.items.clear();
        await db.items.bulkAdd(items);
      }
      if (quickNotes && Array.isArray(quickNotes)) {
        await db.quickNotes.clear();
        await db.quickNotes.bulkAdd(quickNotes);
      }
      if (settings && Array.isArray(settings)) {
        await db.settings.clear();
        await db.settings.bulkAdd(settings);
      }
    });

    return true;
  } catch (error) {
    console.error('Failed to import backup:', error);
    return false;
  }
}
