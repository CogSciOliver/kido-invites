# Event Platform + Vercel API Starter

This version keeps the guest invite static, but adds Vercel serverless API routes that write JSON back to GitHub.

## What works

- `invite.html?event=ladies-night`
- Guest RSVP posts to `/api/rsvp`
- Admin live updates post to `/api/update-event`
- Create page posts to `/api/create-event`
- JSON files stay in GitHub, no database required

## Local setup

Install Vercel CLI if needed:

```bash
npm i -g vercel
```

Create `.env.local` from `.env.example`.

Then run:

```bash
vercel dev
```

Open:

```txt
http://localhost:3000/invite.html?event=ladies-night
http://localhost:3000/admin.html?event=ladies-night
http://localhost:3000/create.html
```

## GitHub token

Create a fine-grained personal access token with:

- Repository access: only this repo
- Permissions: Contents → Read and Write

Put it in `.env.local`:

```txt
GITHUB_TOKEN=...
```

## Admin secret

Admin routes require:

```txt
ADMIN_SECRET=...
```

The dashboard asks for this secret in the browser for MVP testing.

For production, replace this with proper auth.

---

# Live Event Invites

A lightweight, modular platform for creating beautiful event invitation websites with live updates and RSVP collection.

---

## Features

- Static HTML invitations
- Modular JavaScript architecture
- Per-event themes
- JSON-driven content
- Live NOW/NEXT updates
- Live announcement banner
- RSVP collection
- Google Maps integration
- Calendar integration
- Mobile-first
- Serverless API support
- GitHub-backed content storage

---

## Technology

Frontend

- HTML5
- CSS3
- Vanilla JavaScript ES Modules

Backend

- Serverless Functions
- GitHub REST API

Development

- Python HTTP Server
- pnpm

No framework.

No build step.

No bundler.

---

## Install

Clone the repository.

Install dependencies.

```bash
pnpm install
```

Although there are currently no npm dependencies, this keeps the project consistent for future additions.

---

## Run

```bash
pnpm serve
```

or

```bash
python3 -m http.server 8000
```

Visit

```
http://localhost:8000
```

---

## Project Structure

```
/
│
├── index.html
├── main.js
├── EventApp.js
├── EventRenderer.js
├── EventTheme.js
├── EventData.js
├── Calendar.js
├── RSVP.js
├── LiveRefresh.js
│
├── events/
│   ├── ladies-night/
│   │   ├── event.json
│   │   ├── event.css
│   │   └── assets/
│
├── api/
│   ├── rsvp.js
│   ├── update-event.js
│   └── ...
│
└── styles/
```

---

## Event Loading

Events are loaded by slug.

Example

```
http://localhost:8000/?event=ladies-night
```

If no slug is supplied, the application loads the default event.

---

## Local Development Notes

Running with Python serves only the frontend.

API endpoints are **not** executed by the Python server.

To test RSVP submission or admin updates, the serverless API must be available (for example, through a compatible local server or deployment).

---

## Design Principles

- Fast loading
- Static first
- Event-driven
- Human-readable JSON
- Self-contained event folders
- Minimal dependencies
- Progressive enhancement

---

## Future Roadmap

- Multi-event landing page
- Authentication for hosts
- Rich admin dashboard
- Media gallery
- SMS reminders
- QR code check-in
- Guest management
- Theme marketplace
- Deployment tooling