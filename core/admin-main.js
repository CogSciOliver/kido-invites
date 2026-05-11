import { EventData } from "./EventData.js";

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