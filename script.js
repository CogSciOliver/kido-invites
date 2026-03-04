async function loadEvent() {
  const res = await fetch('./data/event.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not load event.json');
  return await res.json();
}

function el(id){ return document.getElementById(id); }

function setText(id, text){
  const node = el(id);
  if (node) node.textContent = text ?? '';
}

function safeJoin(...parts){
  return parts.filter(Boolean).join(' ');
}

function renderLinks(links){
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

function renderBring(items){
  const ul = el('bringList');
  ul.innerHTML = '';
  (items || []).forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    ul.appendChild(li);
  });
}

function renderSchedule(items){
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

function renderUpdates(updates){
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

function setHeroImage(){
  // Default: use your existing artwork. Swap by changing this line or by adding hero_image in event.json
  const img = el('heroImage');
  img.src = './assets/Invitation.jpg';
}

function rsvpHref(email){
  if (!email) return '#';
  return `mailto:${email}?subject=${encodeURIComponent('RSVP — Ladies\' Night Soirée')}`;
}

(async function init(){
  try{
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
    rsvpBtn.href = rsvpHref(data.rsvp?.email);

    const mapBtn = el('mapBtn');
    mapBtn.href = data.venue?.google_maps_url || '#';

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
  }catch(err){
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
