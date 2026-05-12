import { EventData } from "./EventData.js";
import { escapeHTML } from "./utils.js";

const slug = EventData.getSlug("ladies-night");

const viewInvite = document.getElementById("viewInvite");
const status = document.getElementById("saveStatus");

viewInvite.href = `./invite.html?event=${encodeURIComponent(slug)}`;

const data = await EventData.load(slug);

document.getElementById("adminTitle").textContent = `${data.event?.title || "Event"} Admin`;
document.getElementById("liveBanner").value = data.live?.banner || "";
document.getElementById("liveNow").value = data.live?.now || "";
document.getElementById("liveNext").value = data.live?.next || "";

if (status) {
  status.textContent = "Ready to save updates.";
}

document.getElementById("liveForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (status) {
    status.textContent = "Saving...";
  }

  const payload = {
    event_slug: slug,
    live_banner: document.getElementById("liveBanner").value,
    live_now: document.getElementById("liveNow").value,
    live_next: document.getElementById("liveNext").value
  };

  try {
    const res = await fetch("/api/update-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": document.getElementById("adminSecret").value.trim()
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (!result.ok) {
      if (status) {
        status.textContent = `Save failed: ${result.error}`;
      }
      return;
    }

    Object.assign(data, result.event);

    if (status) {
      status.textContent = `Saved successfully at ${new Date().toLocaleTimeString()}`;
    }
  } catch (err) {
    if (status) {
      status.textContent = `Save failed: ${err.message}`;
    }
  }
});

const rsvpStatus = document.getElementById("rsvpStatus");
const refreshRsvps = document.getElementById("refreshRsvps");
const rsvpRows = document.getElementById("rsvpRows");

if (refreshRsvps) {
  refreshRsvps.addEventListener("click", loadRsvps);
}

loadRsvps();

async function loadRsvps() {
  setRsvpStatus("Loading RSVPs...");

  try {
    const res = await fetch(`/api/rsvp?event=${encodeURIComponent(slug)}`);
    const result = await res.json();

    if (!res.ok || !result.ok) {
      setRsvpStatus(`RSVP load failed: ${result.error || "Unknown error"}`);
      return;
    }

    renderRsvpCounts(result.counts);
    renderRsvpRows(result.responses || []);

    setRsvpStatus(`Loaded ${result.responses?.length || 0} RSVP(s).`);
  } catch (err) {
    setRsvpStatus(`RSVP load failed: ${err.message}`);
  }
}

function renderRsvpCounts(counts = {}) {
  setText("rsvpTotal", counts.total || 0);
  setText("rsvpYes", counts.yes || 0);
  setText("rsvpMaybe", counts.maybe || 0);
  setText("rsvpNo", counts.no || 0);
}

function renderRsvpRows(responses = []) {
  if (!rsvpRows) return;

  if (!responses.length) {
    rsvpRows.innerHTML = `<tr><td colspan="5">No RSVPs yet.</td></tr>`;
    return;
  }

  rsvpRows.innerHTML = responses
    .slice()
    .reverse()
    .map((item) => {
      const submitted = item.created_at
        ? new Date(item.created_at).toLocaleString()
        : "";

      const contact = [item.email, item.phone]
        .filter(Boolean)
        .map(escapeHTML)
        .join("<br>");

      return `
        <tr>
          <td>${escapeHTML(item.name || "Guest")}</td>
          <td>${escapeHTML(item.attending || "")}</td>
          <td>${contact}</td>
          <td>${escapeHTML(item.note || "")}</td>
          <td>${escapeHTML(submitted)}</td>
        </tr>
      `;
    })
    .join("");
}

function setRsvpStatus(message) {
  if (rsvpStatus) {
    rsvpStatus.textContent = message;
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}