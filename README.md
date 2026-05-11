# Event Invite With Live Day of Edits — quick editable app

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

### Run App During Production
Run in Terminal:
``` 
python3 -m http.server 8000 
```
Visit:
```
http://localhost:8000
```

## MVP Platform Build out 
event-platform/
  index.html                 # landing / event lookup
  invite.html                # guest invite page 
  admin.html                 # host dashboard
  create.html                # make new invite
  script.js                  # script for all invites
  style.css                  # style for all invites
  invite-template        # macro for all invites
  
  unique-event-name/                # content for each event 
  unique-event-name/imgs/          # imgs for each event that are not hosted elsewhere
  unique-event-name/event.json
  unique-event-name/event.css