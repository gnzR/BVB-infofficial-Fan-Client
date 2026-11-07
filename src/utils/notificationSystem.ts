import { playStadiumCheerSound } from './cheerSound';

export interface BVBNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  category: 'transfer' | 'news' | 'injury' | 'ticker';
  url?: string;
  source: 'BVB.de' | 'Transfermarkt' | 'System' | string;
  read: boolean;
  priority?: 'urgent' | 'normal';
}

const STORAGE_KEY = 'bvb_notification_archive_v1';

export function getNotificationArchive(): BVBNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultNotifications();
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load notifications archive", e);
    return getDefaultNotifications();
  }
}

export function saveNotificationArchive(list: BVBNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to save notifications", e);
  }
}

export function triggerBVBNotification(notif: Omit<BVBNotification, 'id' | 'timestamp' | 'read'>): BVBNotification {
  const newEntry: BVBNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  // Play audio cheer!
  playStadiumCheerSound();

  // Try browser push notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`💛 BVB 09: ${newEntry.title}`, {
        body: newEntry.body,
        icon: '/favicon.ico',
        tag: newEntry.id,
      });
    } catch (e) {
      console.warn("Browser notification trigger warning:", e);
    }
  }

  // Save to archive
  const existing = getNotificationArchive();
  const updated = [newEntry, ...existing];
  saveNotificationArchive(updated);

  return newEntry;
}

export function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) {
    return Promise.resolve('unsupported');
  }
  return Notification.requestPermission();
}

function getDefaultNotifications(): BVBNotification[] {
  return [
    {
      id: 'notif-1',
      title: 'Echtzeit BVB.de: Serhou Guirassy trainiert voll mit',
      body: 'Gute Nachrichten von den Ruhrnachrichten & BVB.de: Der Stürmer ist für das kommende Champions League Spiel einsatzbereit.',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 min ago
      category: 'news',
      source: 'BVB.de',
      read: false,
      priority: 'urgent',
    },
    {
      id: 'notif-2',
      title: 'Transfermarkt Gerücht: BVB beobachtet Offensiv-Talent',
      body: 'Transfermarkt meldet: Dortmund zeigt Interesse an einem flexiblen Flügelstürmer aus der Eredivisie. Wechselwahrscheinlichkeit bei 58%.',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3h ago
      category: 'transfer',
      source: 'Transfermarkt',
      read: true,
      priority: 'normal',
    },
    {
      id: 'notif-3',
      title: 'Verletzungs-Update: Felix Nmecha macht Fortschritte',
      body: 'Der Mittelfeldakteur hat das Reha-Programm erfolgreich abgeschlossen und stieg heute ins individuelle Lauftraining ein.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18h ago
      category: 'injury',
      source: 'BVB.de',
      read: true,
      priority: 'normal',
    },
    {
      id: 'notif-4',
      title: 'Heimsieg im Signal Iduna Park! 3:1 gegen RB Leipzig',
      body: 'Tore durch Brandt, Guirassy und Gittens sichern 3 wichtige Punkte vor der Gelben Wand.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      category: 'ticker',
      source: 'BVB.de',
      read: true,
      priority: 'urgent',
    }
  ];
}
