# Event Evite with Live Updates 
— quick editable site

## Fastest way to publish (GitHub Pages)
1) Create a GitHub repo (public or private with Pages enabled).
2) Upload everything in this folder.
3) In GitHub: Settings → Pages → Deploy from branch → select `main` and `/ (root)`.
4) Your link will appear there.

## How to make quick edits during the night
Open `data/event.json` and edit:
- schedule times/titles/details
- venue/address/map
- live_updates.items (add/modify items)

Save — then refresh the webpage.  
Tip: If the changes don't show right away, hard-refresh (Cmd+Shift+R).

## Change the hero image
Option A: replace `assets/Invitation.jpg` with your own image (keep the same name).  
Option B: add `"hero_image": "./assets/YourImage.jpg"` to event.json.

## RSVP behavior
The RSVP button is a mailto link using the email in `event.json`:
`rsvp.email`

If you prefer a form later (Google Form, Typeform, Tally), replace the RSVP link in `script.js`
or add a `rsvp.url` field and point the button to it.
