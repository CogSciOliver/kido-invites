async function loadEvent() {
  const res = await fetch('./data/ivy.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not load event.json');

  const data = await res.json();

  // Live banner
  if (data.live_banner) {
    const banner = document.getElementById("liveBanner");
    const bannerText = document.getElementById("liveBannerText");

    if (banner && bannerText) {
      banner.style.display = "block";
      bannerText.innerText = data.live_banner;
    }
  }

  // Live tracker
  const now = document.getElementById("liveNow");
  const next = document.getElementById("liveNext");

  if (now && data.live_now) now.innerText = data.live_now;
  if (next && data.live_next) next.innerText = data.live_next;

  return data;
}

function el(id) { return document.getElementById(id); }

function setText(id, text) {
  const node = el(id);
  if (node) node.textContent = text ?? '';
}

function safeJoin(...parts) {
  return parts.filter(Boolean).join(' ');
}

function renderLinks(links) {
  const row = el('linksRow');
  row.innerHTML = '';
  if (!Array.isArray(links) || links.length === 0) return;

  links.forEach(l => {
    const a = document.createElement('a');
    a.className = 'chip';
    a.href = l.url || '#';
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = l.label || 'Link';
    row.appendChild(a);
  });
}

function renderBring(items) {
  const ul = el('bringList');
  ul.innerHTML = '';
  (items || []).forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    ul.appendChild(li);
  });
}

function renderSchedule(items) {
  const ol = el('scheduleList');
  ol.innerHTML = '';
  (items || []).forEach(s => {
    const li = document.createElement('li');
    li.className = 'step';
    li.innerHTML = `
      <div class="step__time">${s.time || ''}</div>
      <div>
        <div class="step__title">${s.title || ''}</div>
        <div class="step__details">${s.details || ''}</div>
      </div>
    `;
    ol.appendChild(li);
  });
}

function renderUpdates(updates) {
  const wrap = el('updates');
  if (!updates?.enabled) {
    wrap.hidden = true;
    return;
  }
  wrap.hidden = false;
  setText('updatesIntro', updates.intro || '');

  const list = el('updatesList');
  list.innerHTML = '';

  (updates.items || []).forEach(u => {
    const div = document.createElement('div');
    div.className = 'update';
    const type = (u.type || 'update').toUpperCase();
    div.innerHTML = `
      <div class="update__meta">${type}</div>
      <div class="update__title">${u.title || ''}</div>
      <div class="update__text">${u.text || ''}</div>
    `;
    list.appendChild(div);
  });
}

function setHeroImage() {
  // Default: use your existing artwork. Swap by changing this line or by adding hero_image in event.json
  const img = el('heroImage');
  img.src = './assets/Invitation.jpg';
}

function rsvpHref() {
  return "https://docs.google.com/forms/d/e/1FAIpQLSeFjkOsk2wMSXaJV9CvihUgSufbWLxLCYA7qX0kxBgDNcWJog/viewform";
}

(async function init() {
  try {
    const data = await loadEvent();

    setHeroImage();
    if (data.hero_image) el('heroImage').src = data.hero_image;

    setText('dateDisplay', data.date_display);
    setText('cityDisplay', data.city);
    setText('titleDisplay', data.title);
    setText('hostDisplay', data.host);

    // Arrival line
    const arrival = data.arrival_time ? `<strong>${data.arrival_time}</strong>` : '<strong>—</strong>';
    el('arrivalCopy').innerHTML = `Kindly requests your arrival at ${arrival} to kick off the night with a soak.`;

    // Venue
    setText('venueName', data.venue?.name);
    setText('venueAddr', safeJoin(data.venue?.address_line1, data.venue?.address_line2));

    // Buttons
    const rsvpBtn = el('rsvpBtn');
    rsvpBtn.textContent = data.rsvp?.primary_text || 'RSVP';
    rsvpBtn.href = data.rsvp?.url || "#";
    rsvpBtn.target = "_blank";

    const mapBtn = el('mapBtn');
    mapBtn.href = data.venue?.google_maps_url || '#';
    mapBtn.target = "_blank";

    // Lists
    renderLinks(data.links);
    renderBring(data.what_to_bring);
    setText('dressCode', data.dress_code || '');
    renderSchedule(data.schedule);

    // After section
    setText('afterTitle', data.after?.headline || 'Drinks & Bites');
    setText('afterText', data.after?.note || '');

    // Updates
    renderUpdates(data.live_updates);

    setText('footerNote', data.footer_note || '');

    el('app').setAttribute('aria-busy', 'false');
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `
      <div style="max-width:900px;margin:40px auto;padding:18px;font-family:system-ui">
        <h1>Couldn’t load event details</h1>
        <p>Make sure <code>data/event.json</code> exists and is valid JSON.</p>
        <pre>${String(err)}</pre>
      </div>
    `;
  }
})();

const calendarBtn = document.getElementById("calendarBtn");

calendarBtn.addEventListener("click", () => {

  const start = "20260313T183000";
  const end = "20260313T233000";

  const ics = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Ladies Night Soirée
DTSTART:${start}
DTEND:${end}
LOCATION:Bathhouse Williamsburg, Brooklyn NY
DESCRIPTION:Ladies Night Soirée hosted by Danii Oliver
END:VEVENT
END:VCALENDAR
`;

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "ladies-night.ics";
  link.click();

});

setInterval(() => {
  location.reload();
}, 60000);

// 3000000 ms = 5 minutes refresh for pre-event updates
// 60000 ms = 1 minute refresh during live event