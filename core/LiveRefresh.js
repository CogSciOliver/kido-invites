export class LiveRefresh {
  static start(data) {
    const seconds = Number(data.live?.refresh_seconds || 0);
    if (!seconds || seconds < 10) return;
    window.setTimeout(() => window.location.reload(), seconds * 1000);
  }
}
