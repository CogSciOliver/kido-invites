import { EventData } from "./EventData.js";
import { escapeHTML } from "./utils.js";

const slug = EventData.getSlug();
const encodedSlug = encodeURIComponent(slug);

const inviteHref = `./invite.html?event=${encodedSlug}`;
const designHref = `./design.html?event=${encodedSlug}`;

const viewInvite = document.getElementById("viewInvite");
const copyInviteLink = document.getElementById("copyInviteLink");
const designInviteLink = document.getElementById("designInviteLink");
const status = document.getElementById("saveStatus");

if (viewInvite) {
  viewInvite.href = inviteHref;
}

if (designInviteLink) {
  designInviteLink.href = designHref;
}

if (copyInviteLink) {
  copyInviteLink.href = inviteHref;

  copyInviteLink.addEventListener("click", async (event) => {
    event.preventDefault();

    const shareUrl = new URL(inviteHref, window.location.href).href;

    try {
      await navigator.clipboard.writeText(shareUrl);

      if (status) {
        status.textContent = "Invite link copied.";
      }
    } catch (err) {
      if (status) {
        status.textContent = "Copy failed. Select and copy the link manually.";
      }

      window.prompt("Copy invite link:", shareUrl);
    }
  });
}

const data = await EventData.load(slug);

document.getElementById("title").textContent = `${data.event?.title || "Event"}`;
document.getElementById("liveBanner").value = data.live?.banner || "";
document.getElementById("liveNow").value = data.live?.now || "";
document.getElementById("liveNext").value = data.live?.next || "";

if (status) {
  status.textContent = "Your event is ready to update.";
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
const rsvpGroups = document.getElementById("rsvpGroups");

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

    renderRsvpGroups(result.responses || []);

    setRsvpStatus(`Loaded ${result.responses?.length || 0} RSVP(s).`);
  } catch (err) {
    setRsvpStatus(`RSVP load failed: ${err.message}`);
  }
}

function setRsvpStatus(message) {
  if (rsvpStatus) {
    rsvpStatus.textContent = message;
  }
}

function renderRsvpGroups(responses = []) {
  if (!rsvpGroups) return;

  const grouped = {
    yes: [],
    maybe: [],
    no: []
  };

  responses.forEach((item) => {
    const status = normalizeAttending(item.attending);
    grouped[status].push(item);
  });

  rsvpGroups.innerHTML = [
    renderRsvpGroup("yes", "Yes", grouped.yes),
    renderRsvpGroup("maybe", "Maybe", grouped.maybe),
    renderRsvpGroup("no", "No", grouped.no)
  ].join("");
}

function renderRsvpGroup(key, label, items = []) {
  const mutedClass = key === "no" ? " rsvpGroup--muted" : "";

  return `
    <details class="rsvpGroup rsvpGroup--${key}${mutedClass}">
      <summary>
        <span class="rsvpGroup__title">${label}: ${items.length}</span>
        <span class="rsvpGroup__toggle">
          <span class="rsvpGroup__toggleView">View</span>
          <span class="rsvpGroup__toggleClose">Close</span>
        </span>
      </summary>

      <div class="rsvpGuestList">
        ${items.length
      ? items
        .slice()
        .reverse()
        .map(renderRsvpGuest)
        .join("")
      : `<p class="rsvpEmpty">No ${label.toLowerCase()} RSVPs yet.</p>`
    }
      </div>
    </details>
  `;
}

function renderRsvpGuest(item = {}) {
  const submitted = item.created_at
    ? new Date(item.created_at).toLocaleString()
    : "";

  const email = cleanText(item.email);
  const phone = cleanText(item.phone);
  const note = cleanText(item.note);

  const emailLink = email
    ? `<a href="${escapeHTML(mailtoHref(email))}">${escapeHTML(email)}</a>`
    : "";

  const phoneLink = phone
    ? `<a href="${escapeHTML(telHref(phone))}">${escapeHTML(phone)}</a>`
    : "";

  const contactLine = [emailLink, phoneLink].filter(Boolean).join(" <span>|</span> ");

  return `
    <article class="rsvpGuest">
      <div class="rsvpGuest__topline">
        <strong>${escapeHTML(item.name || "Guest")}</strong>
        <span>${escapeHTML(submitted)}</span>
      </div>

      ${note
      ? `<p class="rsvpGuest__note"><strong>Note:</strong> ${escapeHTML(note)}</p>`
      : ""
    }

      ${contactLine
      ? `<div class="rsvpGuest__contact"><span>Contact:</span> ${contactLine}</div>`
      : ""
    }
    </article>
  `;
}

function normalizeAttending(value = "") {
  const status = String(value).toLowerCase().trim();

  if (status === "yes") return "yes";
  if (status === "maybe") return "maybe";
  if (status === "no") return "no";

  return "maybe";
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function mailtoHref(email = "") {
  return `mailto:${email.trim()}`;
}

function telHref(phone = "") {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : "#";
}