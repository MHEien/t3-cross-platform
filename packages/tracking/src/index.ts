import { activeWindow } from 'get-windows';

export interface WindowData {
  id: number;
  title: string;
  appName: string;
  url?: string;
  startTime: number;
  endTime?: number;
}

export class Tracker {
  private currentWindow: WindowData | null = null;

  async trackWindow(): Promise<WindowData | null> {
    const window = await activeWindow();
    if (!window) return null;

    const now = Date.now();
    let data: WindowData | null = null;

    if (this.currentWindow && this.currentWindow.id !== window.id) {
      // Window has changed, finalize the previous window data
      data = {
        ...this.currentWindow,
        endTime: now
      };
    }

    // Update current window
    this.currentWindow = {
      id: window.id,
      title: window.title,
      appName: window.owner.name,
      url: 'url' in window ? window.url : undefined,
      startTime: now
    };

    return data;
  }
}