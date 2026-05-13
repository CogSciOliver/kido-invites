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

          ${this.inviteHeadline(data)}

          <div class="host">${escapeHTML(data.event?.host)}</div>

          <p class="subcopy">
            ${escapeHTML(data.event?.invite_phrase || "kindly requests your presence at")}
            <strong>${escapeHTML(data.event?.title || "this event")}</strong>
            ${data.event?.arrival_time
              ? `at <strong>${escapeHTML(data.event.arrival_time)}</strong>.`
              : "."
            }
          </p>

          <div class="ctaRow">
            <a class="btn btn--primary" href="#rsvp">
              ${escapeHTML(data.rsvp?.primary_text || "RSVP")}
            </a>

            <button class="btn btn--ghost" id="calendarBtn" type="button">Add to Calendar</button>

            ${data.venue?.website_url
              ? `<a class="btn btn--ghost" href="${escapeHTML(data.venue.website_url)}" target="_blank" rel="noopener">Venue Website</a>`
              : ""
            }

            ${data.venue?.google_maps_url
              ? `<a class="btn btn--ghost" href="${escapeHTML(data.venue.google_maps_url)}" target="_blank" rel="noopener">Open Map</a>`
              : ""
            }
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

  inviteHeadline(data) {
    const headline = data.event?.invite_headline || "You're Invited";
    const font = data.design?.invite_text_font || "sans";

    return `
      <div class="scriptline scriptline--${escapeHTML(font)}">
        <span class="scriptline__text">${escapeHTML(headline)}</span>
      </div>
    `;
  }

  liveBanner(data) {
    return data.live?.banner
      ? `<div class="liveBanner">${escapeHTML(data.live.banner)}</div>`
      : "";
  }

  liveTracker(data) {
    if (!data.live?.now && !data.live?.next) return "";

    return `
      <div class="liveTracker">
        ${data.live?.now
          ? `<div class="liveItem liveNowCard"><span class="liveLabel">NOW</span><span>${escapeHTML(data.live.now)}</span></div>`
          : ""
        }

        ${data.live?.next
          ? `<div class="liveItem"><span class="liveLabel">NEXT</span><span>${escapeHTML(data.live.next)}</span></div>`
          : ""
        }
      </div>
    `;
  }

  updates(data) {
    const updates = data.live?.updates;

    if (!updates?.enabled) return "";

    return `
      <section class="updates">
        <h2 class="updates__title">Live updates</h2>
        <p class="updates__intro">${escapeHTML(updates.intro || "")}</p>
        <div class="updates__list">
          ${(updates.items || []).map((update) => `
            <div class="update">
              <div class="update__meta">${escapeHTML(update.type || "Update")}</div>
              <div class="update__title">${escapeHTML(update.title || "")}</div>
              <div class="update__text">${escapeHTML(update.text || "")}</div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  links(links = []) {
    if (!links.length) return "";

    return `
      <div class="links">
        ${links.map((link) => `
          <a class="chip" href="${escapeHTML(link.url || "#")}" target="_blank" rel="noopener">
            ${escapeHTML(link.label || "Link")}
          </a>
        `).join("")}
      </div>
    `;
  }

  locationCard(data) {
    if (!data.venue?.name && !data.venue?.address_line1 && !data.venue?.address_line2) {
      return "";
    }

    return `
      <section class="card">
        <h2 class="card__title">Location</h2>
        <div class="venueName">${escapeHTML(data.venue?.name || "")}</div>
        <div class="venueAddr">${escapeHTML(safeJoin(data.venue?.address_line1, data.venue?.address_line2))}</div>
        <div class="hint">Please arrive on time so we can start together.</div>
      </section>
    `;
  }

  scheduleCard(data) {
    const schedule = data.schedule || [];

    if (!schedule.length) return "";

    return `
      <section class="card">
        <h2 class="card__title">Schedule</h2>
        <ol class="timeline">
          ${schedule.map((item) => `
            <li class="step">
              <div class="step__time">${escapeHTML(item.time || "")}</div>
              <div>
                <div class="step__title">${escapeHTML(item.title || "")}</div>
                <div class="step__details">${escapeHTML(item.details || "")}</div>
              </div>
            </li>
          `).join("")}
        </ol>
      </section>
    `;
  }

  bringCard(data) {
    const bringItems = data.what_to_bring || [];
    const dressCode = data.dress_code || "";

    if (!bringItems.length && !dressCode) return "";

    return `
      <section class="card">
        <h2 class="card__title">Guest Info</h2>

        ${bringItems.length
          ? `<h3 class="card__subtitle">What to bring</h3>
             <ul class="bullets">${bringItems.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`
          : ""
        }

        ${dressCode
          ? `<div class="hint"><strong>Dress Code:</strong> ${escapeHTML(dressCode)}</div>`
          : ""
        }
      </section>
    `;
  }

  afterCard(data) {
    if (!data.after?.enabled) return "";

    return `
      <section class="card">
        <h2 class="card__title">${escapeHTML(data.after?.headline || "After")}</h2>
        <p class="afterText">${escapeHTML(data.after?.note || "")}</p>
      </section>
    `;
  }

  rsvpPanel(data) {
    if (!data.rsvp?.enabled) return "";

    return `
      <section class="rsvpPanel" id="rsvp">
        <h2>RSVP</h2>

        ${data.rsvp?.note
          ? `<p class="muted">${escapeHTML(data.rsvp.note)}</p>`
          : ""
        }

        <form class="rsvpGrid" id="rsvpForm">
          <label>Name <input name="name" required /></label>
          <label>Email <input name="email" type="email" /></label>
          <label>Phone <input name="phone" /></label>

          <label>
            Attending
            <select name="attending">
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="maybe">Maybe</option>
            </select>
          </label>

          <label class="full">Note <textarea name="note" rows="3"></textarea></label>

          <button class="btn btn--primary" type="submit">Send RSVP</button>
        </form>
      </section>
    `;
  }

  footer(data) {
    const notes = data.footer?.notes || [];

    if (!notes.length) return "";

    return `
      <footer class="footer">
        ${notes.map((note) => `<div>${escapeHTML(note)}</div>`).join("")}
      </footer>
    `;
  }
}