async function loadEvent() {
  const res = await fetch('./data/ivy.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not load ivy.json');

  const data = await res.json();

  // Live banner
  if (data.live_banner) {
    const banner = document.getElementById('liveBanner');
    const bannerText = document.getElementById('liveBannerText');

    if (banner && bannerText) {
      banner.style.display = 'block';
      bannerText.innerText = data.live_banner;
    }
  }

  // Live tracker
  const now = document.getElementById('liveNow');
  const next = document.getElementById('liveNext');

  if (now) now.innerText = data.live_now || '';
  if (next) next.innerText = data.live_next || '';

  return data;
}

function el(id) {
  return document.getElementById(id);
}

function setText(id, text) {
  const node = el(id);
  if (node) node.textContent = text ?? '';
}

function safeJoin(...parts) {
  return parts.filter(Boolean).join(' ');
}

function renderLinks(links) {
  const row = el('linksRow');
  if (!row) return;

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
  if (!ul) return;

  ul.innerHTML = '';
  (items || []).forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    ul.appendChild(li);
  });
}

function renderSchedule(items) {
  const ol = el('scheduleList');
  if (!ol) return;

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
  if (!wrap) return;

  if (!updates?.enabled) {
    wrap.hidden = true;
    return;
  }

  wrap.hidden = false;
  setText('updatesIntro', updates.intro || '');

  const list = el('updatesList');
  if (!list) return;

  list.innerHTML = '';

  (updates.items || []).forEach(u => {
    const div = document.createElement('div');
    div.className = 'update';

    div.innerHTML = `
      <div class="update__meta">${(u.type || 'update').toUpperCase()}</div>
      <div class="update__title">${u.title || ''}</div>
      <div class="update__text">${u.text || ''}</div>
    `;

    list.appendChild(div);
  });
}

function setHeroImage(data) {
  const img = el('heroImage');
  const media = img?.closest('.hero__media');

  if (!img) return;

  const heroImage = data?.hero_image;

  if (heroImage === false || heroImage === null || heroImage === '') {
    if (media) media.style.display = 'none';
    else img.style.display = 'none';
    return;
  }

  img.src = heroImage || './assets/Invitation.jpg';

  if (media) media.style.display = '';
  img.style.display = '';
}

function buildCalendarFile(data) {
  const title = data.title || 'Event';
  const location = [
    data.venue?.name,
    data.venue?.address_line1,
    data.venue?.address_line2
  ].filter(Boolean).join(', ');

  const description = `${title} hosted by ${data.host || ''}`.trim();

  const start = '20260613T123000';
  const end = '20260613T153000';

  return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${start}
DTEND:${end}
LOCATION:${location}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;
}

(async function init() {
  try {
    const data = await loadEvent();

    setHeroImage(data);

    setText('dateDisplay', data.date_display);
    setText('cityDisplay', data.city);
    setText('titleDisplay', data.title);
    setText('hostDisplay', data.host);

    const arrival = data.arrival_time
      ? `<strong>${data.arrival_time}</strong>`
      : '<strong>—</strong>';

    const arrivalCopy = el('arrivalCopy');
    if (arrivalCopy) {
      arrivalCopy.innerHTML = `Kindly requests your arrival at ${arrival} to begin the mystery together.`;
    }

    setText('venueName', data.venue?.name);
    setText('venueAddr', safeJoin(data.venue?.address_line1, data.venue?.address_line2));

    const rsvpBtn = el('rsvpBtn');
    if (rsvpBtn) {
      rsvpBtn.textContent = data.rsvp?.primary_text || 'RSVP';
      rsvpBtn.href = data.rsvp?.url || '#';
      rsvpBtn.target = '_blank';
    }

    const mapBtn = el('mapBtn');
    if (mapBtn) {
      mapBtn.href = data.venue?.google_maps_url || '#';
      mapBtn.target = '_blank';
    }

    renderLinks(data.links);
    renderBring(data.what_to_bring);
    setText('dressCode', data.dress_code || '');
    renderSchedule(data.schedule);

    setText('afterTitle', data.after?.headline || 'Main Event');
    setText('afterText', data.after?.note || '');

    renderUpdates(data.live_updates);
    setText('footerNote', data.footer_note || '');

    const calendarBtn = el('calendarBtn');
    if (calendarBtn) {
      calendarBtn.addEventListener('click', () => {
        const ics = buildCalendarFile(data);
        const blob = new Blob([ics], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'ivy-birthday.ics';
        link.click();

        window.URL.revokeObjectURL(url);
      });
    }

    el('app')?.setAttribute('aria-busy', 'false');
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `
      <div style="max-width:900px;margin:40px auto;padding:18px;font-family:system-ui">
        <h1>Couldn’t load event details</h1>
        <p>Make sure <code>./data/ivy.json</code> exists and is valid JSON.</p>
        <pre>${String(err)}</pre>
      </div>
    `;
  }
})();

setInterval(() => {
  location.reload();
}, 60000);