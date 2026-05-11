import { EventData } from "./EventData.js";
import { EventTheme } from "./EventTheme.js";
import { EventRenderer } from "./EventRenderer.js";
import { Calendar } from "./Calendar.js";
import { RSVP } from "./RSVP.js";
import { LiveRefresh } from "./LiveRefresh.js";

export class EventApp {
  constructor({ root, slug }) {
    this.root = root;
    this.slug = slug;
  }

  async init() {
    try {
      EventTheme.load(this.slug);
      const data = await EventData.load(this.slug);
      new EventRenderer(this.root).render(data);
      Calendar.bind(data);
      RSVP.bind(data);
      LiveRefresh.start(data);
    } catch (err) {
      console.error(err);
      this.root.innerHTML = `<div style="max-width:900px;margin:40px auto;padding:18px;font-family:system-ui"><h1>Couldn’t load event</h1><pre>${String(err)}</pre></div>`;
      this.root.setAttribute("aria-busy", "false");
    }
  }
}
