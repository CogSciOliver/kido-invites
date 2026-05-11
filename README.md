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
