const resultBox = document.getElementById("resultBox");
const createResultLinks = document.getElementById("createResultLinks");
const designInviteLink = document.getElementById("designInviteLink");
const viewDashboardLink = document.getElementById("viewDashboardLink");
const viewInviteLink = document.getElementById("viewInviteLink");
const createForm = document.getElementById("createForm");
const guestLinksList = document.getElementById("guestLinksList");
const addGuestLink = document.getElementById("addGuestLink");
const afterPartyFields = document.getElementById("afterPartyFields");
const inviteHeadline = document.getElementById("inviteHeadline");
const inviteTextFont = document.getElementById("inviteTextFont");
const invitePhrasePreview = document.getElementById("invitePhrasePreview");

syncAfterPartyFields();
syncInvitePreview();

document.querySelectorAll('input[name="hasAfterParty"]').forEach((radio) => {
  radio.addEventListener("change", syncAfterPartyFields);
});

if (inviteHeadline) {
  inviteHeadline.addEventListener("change", syncInvitePreview);
}

if (inviteTextFont) {
  inviteTextFont.addEventListener("change", syncInvitePreview);
}

if (addGuestLink) {
  addGuestLink.addEventListener("click", addGuestLinkRow);
}

if (guestLinksList) {
  guestLinksList.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".removeGuestLink");
    if (!removeButton) return;

    const rows = guestLinksList.querySelectorAll(".guestLinkRow");
    const row = removeButton.closest(".guestLinkRow");

    if (rows.length <= 1) {
      row.querySelector(".guestLinkLabel").value = "";
      row.querySelector(".guestLinkUrl").value = "";
      return;
    }

    row.remove();
  });
}

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = createForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Creating...";

  const payload = {
    slug: value("slug"),

    invite_headline: value("inviteHeadline"),
    invite_phrase: value("invitePhrase"),

    title: value("title"),
    host: value("host"),
    date_display: value("dateDisplay"),
    city: value("city"),
    arrival_time: value("arrivalTime"),

    live_banner: value("liveBanner"),
    live_now: value("liveNow"),
    live_next: value("liveNext"),

    venue_name: value("venueName"),
    address_line1: value("addressLine1"),
    address_line2: value("addressLine2"),
    google_maps_url: value("mapUrl"),
    venue_website_url: value("venueWebsiteUrl"),

    schedule: parseSchedule("scheduleItems"),

    what_to_bring: lines("whatToBring"),
    dress_code: value("dressCode"),

    has_after_party: selectedRadio("hasAfterParty") === "yes",
    after_headline: value("afterHeadline"),
    after_note: value("afterNote"),

    links: collectGuestLinks(),

    hero_image: value("heroImage"),
    invite_text_font: value("inviteTextFont"),

    event_start_date: value("eventStartDate"),
    event_start_time: value("eventStartTime"),
    event_end_date: value("eventEndDate"),
    event_end_time: value("eventEndTime"),
    calendar_start: toCalendarDate(value("eventStartDate"), value("eventStartTime")),
    calendar_end: toCalendarDate(value("eventEndDate"), value("eventEndTime")),
    calendar_description: value("calendarDescription"),

    rsvp_primary_text: value("rsvpPrimaryText"),
    rsvp_note: value("rsvpNote"),

    footer_notes: lines("footerNotes")
  };

  try {
    const res = await fetch("/api/create-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": value("adminSecret")
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (!res.ok || !result.ok) {
      resultBox.hidden = false;
      createResultLinks.hidden = true;
      resultBox.textContent = result.error || JSON.stringify(result, null, 2);
      return;
    }

    resultBox.hidden = true;
    resultBox.textContent = JSON.stringify(result, null, 2);

    designInviteLink.href = result.design_url;
    viewDashboardLink.href = result.admin_url;
    viewInviteLink.href = result.invite_url;

    createResultLinks.hidden = false;

    if (!res.ok || !result.ok) {
      resultBox.textContent = `Create failed:\n${JSON.stringify(result, null, 2)}`;
    }
  } catch (err) {
    resultBox.textContent = `Create failed: ${err.message}`;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Create Event & Links";
  }
});

function value(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function selectedRadio(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function lines(id) {
  return value(id)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSchedule(id) {
  return lines(id)
    .map((line) => {
      const [time = "", title = "", details = ""] = line
        .split("|")
        .map((part) => part.trim());

      return { time, title, details };
    })
    .filter((item) => item.time || item.title || item.details);
}

function collectGuestLinks() {
  if (!guestLinksList) return [];

  return [...guestLinksList.querySelectorAll(".guestLinkRow")]
    .map((row) => {
      return {
        label: row.querySelector(".guestLinkLabel")?.value.trim() || "",
        url: row.querySelector(".guestLinkUrl")?.value.trim() || ""
      };
    })
    .filter((link) => link.label && link.url);
}

function addGuestLinkRow() {
  const row = document.createElement("div");
  row.className = "guestLinkRow";

  row.innerHTML = `
    <label>
      Link Button Text
      <input class="guestLinkLabel" placeholder="Example: Gift Registry Website" />
    </label>

    <label>
      Link URL
      <input class="guestLinkUrl" type="url" placeholder="https://..." />
    </label>

    <button class="btn btn--delete removeGuestLink" type="button">Remove</button>
  `;

  guestLinksList.appendChild(row);
}

function syncAfterPartyFields() {
  if (!afterPartyFields) return;

  const hasAfterParty = selectedRadio("hasAfterParty") === "yes";
  afterPartyFields.hidden = !hasAfterParty;
}

function syncInvitePreview() {
  if (!invitePhrasePreview) return;

  invitePhrasePreview.textContent = value("inviteHeadline") || "You're Invited";
  invitePhrasePreview.dataset.font = value("inviteTextFont") || "sans";
}

function toCalendarDate(date, time) {
  if (!date || !time) return "";

  const cleanDate = date.replaceAll("-", "");
  const cleanTime = time.replace(":", "").padEnd(4, "0");

  return `${cleanDate}T${cleanTime}00`;
}

function updateInvitePhrasePreviewFont() {
  if (!inviteTextFont || !invitePhrasePreview) return;

  invitePhrasePreview.classList.remove(
    "invitePhrasePreview--sans-01",
    "invitePhrasePreview--sans-02",
    "invitePhrasePreview--serif",
    "invitePhrasePreview--script-01",
    "invitePhrasePreview--script-02",
    "invitePhrasePreview--script-03"
  );

  invitePhrasePreview.classList.add(
    `invitePhrasePreview--${inviteTextFont.value || "serif"}`
  );
}

inviteTextFont?.addEventListener("change", updateInvitePhrasePreviewFont);
updateInvitePhrasePreviewFont();