import { send, requireAdmin, writeJsonFile, readJsonFile } from "./_github.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });
  if (req.method !== "POST") {
    return send(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    requireAdmin(req);

    const body = req.body || {};
    const slug = cleanSlug(body.slug);

    if (!slug) {
      return send(res, 400, { ok: false, error: "Missing slug" });
    }

    const eventPath = `events/${slug}/event.json`;
    const existing = await readJsonFile(eventPath);

    if (existing.exists) {
      return send(res, 409, { ok: false, error: "Event already exists" });
    }

    const event = makeEvent(slug, body);
    const rsvps = {
      event_slug: slug,
      responses: []
    };

    await writeJsonFile(eventPath, event, `Create event ${slug}`);
    await writeJsonFile(
      `events/${slug}/rsvps/rsvps.json`,
      rsvps,
      `Create RSVP file for ${slug}`
    );

    return send(res, 200, {
      ok: true,
      slug,
      invite_url: `/invite.html?event=${slug}`,
      design_url: `/design.html?event=${slug}`,
      admin_url: `/admin.html?event=${slug}`,
      note: "Create event.css and image folder manually for now."
    });
  } catch (err) {
    return send(res, err.statusCode || 500, {
      ok: false,
      error: String(err.message || err)
    });
  }
}

function makeEvent(slug, body) {
  const title = cleanText(body.title) || "New Event";
  const venueName = cleanText(body.venue_name);
  const addressLine1 = cleanText(body.address_line1);
  const addressLine2 = cleanText(body.address_line2);

  return {
    meta: {
      slug,
      template: "soiree",
      status: "draft"
    },

    live: {
      banner: cleanText(body.live_banner),
      now: cleanText(body.live_now),
      next: cleanText(body.live_next),
      refresh_seconds: 600, // 10 minutes
      updates: {
        enabled: true,
        intro: "If anything changes during the event, I'll update it here.",
        items: []
      }
    },

    event: {
      title,
      date_display: cleanText(body.date_display),
      city: cleanText(body.city),
      host: cleanText(body.host),
      invite_headline: cleanText(body.invite_headline) || "You're Invited",
      invite_phrase: cleanText(body.invite_phrase) || "kindly requests your presence at",
      arrival_time: cleanText(body.arrival_time)
    },

    design: {
      invite_text_font: cleanText(body.invite_text_font) || "sans"
    },

    assets: {
      hero_image: body.hero_image || "./indie-pigeon-logo.png"
    },

    venue: {
      name: venueName,
      address_line1: addressLine1,
      address_line2: addressLine2,
      google_maps_url: cleanText(body.google_maps_url),
      website_url: cleanText(body.venue_website_url)
    },

    schedule: cleanSchedule(body.schedule),

    what_to_bring: cleanStringArray(body.what_to_bring),
    dress_code: cleanText(body.dress_code),

    after: {
      enabled: Boolean(body.has_after_party),
      headline: cleanText(body.after_headline),
      note: cleanText(body.after_note)
    },

    links: cleanLinks(body.links),

    calendar: {
      filename: `${slug}.ics`,
      title,
      start: cleanText(body.calendar_start) || toCalendarDate(body.event_start_date, body.event_start_time),
      end: cleanText(body.calendar_end) || toCalendarDate(body.event_end_date, body.event_end_time),
      location: compactJoin(venueName, addressLine1, addressLine2),
      description: cleanText(body.calendar_description)
    },

    rsvp: {
      enabled: true,
      mode: "api",
      primary_text: cleanText(body.rsvp_primary_text) || "RSVP",
      note: cleanText(body.rsvp_note),
      external_url: "",
      fields: ["name", "email", "phone", "attending", "note"]
    },

    footer: {
      notes: cleanStringArray(body.footer_notes)
    }
  };
}

function cleanSlug(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80);
}

function cleanText(value = "", max = 1000) {
  return String(value || "")
    .trim()
    .slice(0, max);
}

function cleanStringArray(value = []) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => cleanText(item, 300))
    .filter(Boolean)
    .slice(0, 30);
}

function cleanSchedule(value = []) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item = {}) => ({
      time: cleanText(item.time, 100),
      title: cleanText(item.title, 200),
      details: cleanText(item.details, 500)
    }))
    .filter((item) => item.time || item.title || item.details)
    .slice(0, 30);
}

function cleanLinks(value = []) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item = {}) => ({
      label: cleanText(item.label, 100),
      url: cleanText(item.url, 1000)
    }))
    .filter((item) => item.label && item.url)
    .slice(0, 20);
}

function toCalendarDate(date = "", time = "") {
  const safeDate = cleanText(date);
  const safeTime = cleanText(time);

  if (!safeDate || !safeTime) return "";

  const compactDate = safeDate.replaceAll("-", "");
  const compactTime = safeTime.replace(":", "").padEnd(4, "0");

  return `${compactDate}T${compactTime}00`;
}

function compactJoin(...parts) {
  return parts
    .map((part) => cleanText(part))
    .filter(Boolean)
    .join(", ");
}