import { send, requireAdmin, writeJsonFile, readJsonFile } from "./_github.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "Method not allowed" });

  try {
    requireAdmin(req);

    const body = req.body || {};
    const slug = cleanSlug(body.slug);
    if (!slug) return send(res, 400, { ok: false, error: "Missing slug" });

    const eventPath = `events/${slug}/event.json`;
    const existing = await readJsonFile(eventPath);
    if (existing.exists) return send(res, 409, { ok: false, error: "Event already exists" });

    const event = makeEvent(slug, body);
    const rsvps = { event_slug: slug, responses: [] };
    const css = ":root {\n  --bg: #FFF9EF;\n  --green: #108050;\n  --mint: #20bb9c;\n}\n";

    await writeJsonFile(eventPath, event, `Create event ${slug}`);
    await writeJsonFile(`events/${slug}/rsvps/rsvps.json`, rsvps, `Create RSVP file for ${slug}`);

    // CSS is written as base64 JSON text helper is JSON-only, so skipping CSS write in this MVP.
    // Add event.css manually or extend _github.js with writeTextFile.

    return send(res, 200, {
      ok: true,
      slug,
      invite_url: `/invite.html?event=${slug}`,
      admin_url: `/admin.html?event=${slug}`,
      note: "Create event.css and image folder manually for now."
    });
  } catch (err) {
    return send(res, err.statusCode || 500, { ok: false, error: String(err.message || err) });
  }
}

function cleanSlug(value = "") {
  return String(value).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 80);
}

function makeEvent(slug, body) {
  return {
    meta: { slug, template: "soiree", status: "draft" },
    live: {
      banner: "",
      now: "",
      next: "",
      refresh_seconds: 60,
      updates: { enabled: true, intro: "If anything changes during the event, I’ll update it here.", items: [] }
    },
    event: {
      title: body.title || "New Event",
      date_display: body.date_display || "",
      city: body.city || "",
      host: body.host || "",
      arrival_time: body.arrival_time || ""
    },
    assets: {
      hero_image: `./events/${slug}/imgs/invitation.jpg`,
      script_image: `./events/${slug}/imgs/youre-invited.png`
    },
    venue: {
      name: body.venue_name || "",
      address_line1: body.address_line1 || "",
      address_line2: body.address_line2 || "",
      google_maps_url: body.google_maps_url || ""
    },
    after: { headline: "After", note: "" },
    calendar: { filename: `${slug}.ics`, title: body.title || "New Event", start: "", end: "", location: "", description: "" },
    rsvp: { enabled: true, mode: "api", primary_text: "RSVP", external_url: "", fields: ["name", "email", "phone", "attending", "note"] },
    what_to_bring: [],
    dress_code: body.dress_code || "",
    links: [],
    schedule: [],
    footer: { notes: [] }
  };
}
