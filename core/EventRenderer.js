import { escapeHTML, safeJoin } from "./utils.js";

export class EventRenderer {
  constructor(root) {
    this.root = root;
  }

  render(data) {
    this.root.innerHTML = this.template(data);
    this.root.setAttribute("aria-busy", "false");
  }

  template(data) {
    return `
      ${this.liveBanner(data)}
      ${this.liveTracker(data)}
      ${this.updates(data)}
      <header class="hero">
        <div class="hero__media">
          <img class="hero__img" src="${escapeHTML(data.assets?.hero_image)}" alt="Event artwork" loading="eager" />
        </div>
        <div class="hero__content">
          <div class="kicker">
            <div class="kicker__date">${escapeHTML(data.event?.date_display)}</div>
            <div class="kicker__city">${escapeHTML(data.event?.city)}</div>
          </div>
          <h1 class="title">${escapeHTML(data.event?.title)}</h1>
          ${data.assets?.script_image ? `<div class="scriptline"><img src="${escapeHTML(data.assets.script_image)}" alt="You're Invited" class="scriptline__image"></div>` : ""}
          <div class="host">${escapeHTML(data.event?.host)}</div>
          <p class="subcopy">Kindly requests your arrival at <strong>${escapeHTML(data.event?.arrival_time || "—")}</strong>.</p>
          <div class="ctaRow">
            ${data.rsvp?.external_url
        ? `<a class="btn btn--primary" href="${escapeHTML(data.rsvp.external_url)}" target="_blank" rel="noopener">${escapeHTML(data.rsvp.primary_text || "RSVP")}</a>`
        : `<a class="btn btn--primary" href="#rsvp">${escapeHTML(data.rsvp?.primary_text || "RSVP")}</a>`}
            
        <button class="btn btn--ghost" id="calendarBtn" type="button">Add to Calendar</button>
        
               ${data.venue?.website_url
        ? `<a class="btn btn--ghost" href="${escapeHTML(data.venue.website_url)}" target="_blank" rel="noopener">Venue Website</a>`
        : ""
      }
  
              <a class="btn btn--ghost" href="${escapeHTML(data.venue?.google_maps_url || "#")}" target="_blank" rel="noopener">Open Map</a>

            
          </div>
          
          ${this.links(data.links)}
        </div>
      </header>
      <section class="cardGrid">
        ${this.locationCard(data)}
        ${this.scheduleCard(data)}
        ${this.bringCard(data)}
        ${this.afterCard(data)}
      </section>
      ${this.rsvpPanel(data)}
      ${this.footer(data)}
    `;
  }

  liveBanner(data) {
    return data.live?.banner ? `<div class="liveBanner">${escapeHTML(data.live.banner)}</div>` : "";
  }

  liveTracker(data) {
    return `<div class="liveTracker">
      <div class="liveItem liveNowCard"><span class="liveLabel">NOW</span><span>${escapeHTML(data.live?.now || "")}</span></div>
      <div class="liveItem"><span class="liveLabel">NEXT</span><span>${escapeHTML(data.live?.next || "")}</span></div>
    </div>`;
  }

  updates(data) {
    const updates = data.live?.updates;
    if (!updates?.enabled) return "";
    return `<section class="updates">
      <h2 class="updates__title">Live updates</h2>
      <p class="updates__intro">${escapeHTML(updates.intro || "")}</p>
      <div class="updates__list">${(updates.items || []).map(u => `<div class="update"><div class="update__meta">${escapeHTML(u.type || "Update")}</div><div class="update__title">${escapeHTML(u.title || "")}</div><div class="update__text">${escapeHTML(u.text || "")}</div></div>`).join("")}</div>
    </section>`;
  }

  links(links = []) {
    if (!links.length) return "";
    return `<div class="links">${links.map(l => `<a class="chip" href="${escapeHTML(l.url || "#")}" target="_blank" rel="noopener">${escapeHTML(l.label || "Link")}</a>`).join("")}</div>`;
  }

  locationCard(data) {
    return `<section class="card"><h2 class="card__title">Location</h2><div class="venueName">${escapeHTML(data.venue?.name || "")}</div><div class="venueAddr">${escapeHTML(safeJoin(data.venue?.address_line1, data.venue?.address_line2))}</div><div class="hint">Please arrive on time so we can start together.</div></section>`;
  }

  scheduleCard(data) {
    return `<section class="card"><h2 class="card__title">Schedule</h2><ol class="timeline">${(data.schedule || []).map(s => `<li class="step"><div class="step__time">${escapeHTML(s.time || "")}</div><div><div class="step__title">${escapeHTML(s.title || "")}</div><div class="step__details">${escapeHTML(s.details || "")}</div></div></li>`).join("")}</ol></section>`;
  }

  bringCard(data) {
    return `<section class="card"><h2 class="card__title">What to bring</h2><ul class="bullets">${(data.what_to_bring || []).map(i => `<li>${escapeHTML(i)}</li>`).join("")}</ul><div class="hint">${escapeHTML(data.dress_code || "")}</div></section>`;
  }

  afterCard(data) {
    return `<section class="card"><h2 class="card__title">${escapeHTML(data.after?.headline || "After")}</h2><p class="afterText">${escapeHTML(data.after?.note || "")}</p></section>`;
  }

  rsvpPanel(data) {
    if (!data.rsvp?.enabled || data.rsvp?.external_url) return "";
    return `<section class="rsvpPanel" id="rsvp"><h2>RSVP</h2><form class="rsvpGrid" id="rsvpForm">
      <label>Name <input name="name" required /></label>
      <label>Email <input name="email" type="email" /></label>
      <label>Phone <input name="phone" /></label>
      <label>Attending <select name="attending"><option value="yes">Yes</option><option value="no">No</option><option value="maybe">Maybe</option></select></label>
      <label class="full">Note <textarea name="note" rows="3"></textarea></label>
      <button class="btn btn--primary" type="submit">Send RSVP</button>
    </form></section>`;
  }

  footer(data) {
    return `<footer class="footer">${(data.footer?.notes || []).map(n => `<div>${escapeHTML(n)}</div>`).join("")}</footer>`;
  }
}
