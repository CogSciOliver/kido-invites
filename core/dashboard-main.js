import { escapeHTML } from "./utils.js";

const form = document.getElementById("dashboardLookup");
const ownerEmailInput = document.getElementById("ownerEmail");
const adminSecretInput = document.getElementById("adminSecret");
const statusEl = document.getElementById("dashboardStatus");
const gridEl = document.getElementById("inviteGrid");
const summaryEl = document.getElementById("dashboardSummary");

const totalInvitesEl = document.getElementById("totalInvites");
const draftInvitesEl = document.getElementById("draftInvites");
const publishedInvitesEl = document.getElementById("publishedInvites");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const ownerEmail = ownerEmailInput.value.trim();
  const adminSecret = adminSecretInput.value.trim();

  if (!ownerEmail || !adminSecret) {
    setStatus("Enter the host email and admin secret.");
    return;
  }

  setStatus("Loading invites...");
  gridEl.innerHTML = "";
  summaryEl.hidden = true;

  try {
    const response = await fetch(
      `/api/list-events?owner=${encodeURIComponent(ownerEmail)}`,
      {
        method: "GET",
        headers: {
          "x-admin-secret": adminSecret,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Could not load invites.");
    }

    renderSummary(data.events);
    renderInvites(data.events);
    setStatus(`${data.events.length} invite${data.events.length === 1 ? "" : "s"} loaded.`);
  } catch (error) {
    console.error(error);
    setStatus(`Dashboard failed: ${error.message}`);
  }
});

function renderSummary(events) {
  const drafts = events.filter((event) => event.status === "draft").length;
  const published = events.filter((event) => event.status === "published").length;

  totalInvitesEl.textContent = events.length;
  draftInvitesEl.textContent = drafts;
  publishedInvitesEl.textContent = published;

  summaryEl.hidden = false;
}

function renderInvites(events) {
  if (!events.length) {
    gridEl.innerHTML = `
      <article class="emptyState card">
        <h2>No invites found</h2>
        <p>No event files are currently attached to this host email.</p>
      </article>
    `;
    return;
  }

  gridEl.innerHTML = events.map(renderInviteCard).join("");
}

function renderInviteCard(event) {
  const slug = encodeURIComponent(event.slug);
  const title = escapeHTML(event.title || "Untitled Invite");
  const status = escapeHTML(event.status || "draft");
  const date = escapeHTML(event.date || "Date not set");
  const template = escapeHTML(event.template || "Template not set");

  return `
    <article class="inviteCard card">
      <div class="inviteCard__header">
        <span class="inviteCard__status">${status}</span>
        <h2 class="inviteCard__title">${title}</h2>
      </div>

      <div class="inviteCard__meta">
        <span><strong>Date:</strong> ${date}</span>
        <span><strong>Slug:</strong> ${escapeHTML(event.slug)}</span>
        <span><strong>Template:</strong> ${template}</span>
      </div>

      <div class="inviteCard__actions">
        <a class="btn btn-primary" href="./invite.html?event=${slug}">View Invite</a>
        <a class="btn btn-secondary" href="./admin.html?event=${slug}">Live Dashboard</a>
        <a class="btn btn-ghost" href="./design.html?event=${slug}">Design</a>
      </div>
    </article>
  `;
}

function setStatus(message) {
  statusEl.textContent = message;
}