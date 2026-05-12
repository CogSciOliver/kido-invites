import { send, writeJsonFile, readJsonFile } from "./_github.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });

  try {
    if (req.method === "GET") {
      return await getRsvps(req, res);
    }

    if (req.method === "POST") {
      return await saveRsvp(req, res);
    }

    return send(res, 405, { ok: false, error: "Method not allowed" });
  } catch (err) {
    return send(res, err.statusCode || 500, {
      ok: false,
      error: String(err.message || err)
    });
  }
}

async function getRsvps(req, res) {
  const slug = cleanSlug(getQueryParam(req, "event") || getQueryParam(req, "event_slug"));

  if (!slug) {
    return send(res, 400, { ok: false, error: "Missing event" });
  }

  const path = `events/${slug}/rsvps/rsvps.json`;
  const file = await readJsonFile(path);

  const data = file.exists
    ? normalizeRsvpData(file.json, slug)
    : { event_slug: slug, responses: [] };

  return send(res, 200, {
    ok: true,
    event_slug: slug,
    counts: countResponses(data.responses),
    responses: data.responses
  });
}

async function saveRsvp(req, res) {
  const body = req.body || {};
  const slug = cleanSlug(body.event_slug);

  if (!slug) {
    return send(res, 400, { ok: false, error: "Missing event_slug" });
  }

  const path = `events/${slug}/rsvps/rsvps.json`;
  const file = await readJsonFile(path);

  const data = file.exists
    ? normalizeRsvpData(file.json, slug)
    : { event_slug: slug, responses: [] };

  data.responses.push({
    id: makeId(),
    created_at: new Date().toISOString(),
    name: cleanText(body.name),
    email: cleanText(body.email),
    phone: cleanText(body.phone),
    attending: cleanText(body.attending),
    note: cleanText(body.note)
  });

  await writeJsonFile(path, data, `Add RSVP for ${slug}`);

  return send(res, 200, { ok: true, message: "RSVP saved" });
}

function normalizeRsvpData(data, slug) {
  return {
    event_slug: data?.event_slug || slug,
    responses: Array.isArray(data?.responses) ? data.responses : []
  };
}

function countResponses(responses = []) {
  return responses.reduce(
    (counts, item) => {
      const attending = String(item.attending || "").toLowerCase();

      counts.total += 1;

      if (attending === "yes") counts.yes += 1;
      else if (attending === "no") counts.no += 1;
      else if (attending === "maybe") counts.maybe += 1;
      else counts.unknown += 1;

      return counts;
    },
    { total: 0, yes: 0, no: 0, maybe: 0, unknown: 0 }
  );
}

function getQueryParam(req, name) {
  if (req.query?.[name]) return req.query[name];

  try {
    const url = new URL(req.url, "https://event-platform.local");
    return url.searchParams.get(name) || "";
  } catch {
    return "";
  }
}

function cleanSlug(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80);
}

function cleanText(value = "") {
  return String(value || "").trim().slice(0, 1000);
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}