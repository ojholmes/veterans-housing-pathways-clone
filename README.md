# Veterans Housing Pathways

Backend scaffold for the "Veterans Housing Pathways" case management app.

Features implemented in this scaffold:
- Prisma models for `Client`, `Interaction`, `Landlord`, and `Navigator` (users).
- Express-based API skeleton with routes for clients, interactions, landlords, and dashboards.
- Daily scheduled "Red Flag" job to email navigators for clients not contacted in 14+ days.
- AI summarization helper that calls OpenAI when `OPENAI_API_KEY` is present; fallback heuristic otherwise.

Quick setup (PowerShell):

```powershell
# 1) clone repo (you already are here)
cd c:\Users\majho\OneDrive\Documents\GitHub\veterans-housing-pathways-clone

# 2) copy env and install
cp .env.example .env
npm install

# 3) Prisma: generate client and apply migrations (SQLite used by default)
# If running for the first time:
npx prisma generate
npx prisma db push

# 4) Start the server
npm run start

# 5) Optional: enable AI features by adding OPENAI_API_KEY to .env
```

Environment variables (see `.env.example`).

Notes:
- The scaffold uses SQLite for local development for simplicity. For production, switch `DATABASE_URL` to a Postgres or MySQL URL in `.env` and run Prisma migrations.
- To enable email alerts configure an SMTP provider and set `SMTP_*` vars in `.env`.
 - To enable email alerts configure an SMTP provider and set `SMTP_*` vars in `.env`.
	 - For local development the server will automatically create an Ethereal test account (no credentials needed) and log a preview URL after sending; open that URL to view the email.
	 - For real sending set these env vars to your SMTP provider credentials: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM`.
	 - Example: for SendGrid SMTP use your SendGrid SMTP host/credentials. When set the app will send real emails via your provider.
	- Auto-configured providers:
		- SendGrid: set `SENDGRID_API_KEY` and the server will use `smtp.sendgrid.net` (user `apikey`, pass = `SENDGRID_API_KEY`). Optionally set `SENDGRID_SMTP_HOST`/`SENDGRID_SMTP_PORT`.
		- Mailgun: set `MAILGUN_SMTP_LOGIN` and `MAILGUN_SMTP_PASSWORD` (and optionally `MAILGUN_SMTP_HOST`/`MAILGUN_SMTP_PORT`).

	Next suggestions (pick one)
	- Use SendGrid/Mailgun templates for consistent email content and better tracking (I can wire templates).
	- Add animated updates to the funnel when live data updates arrive via WebSocket.
	- Continue polishing mobile UI and add end-to-end tests.

	How to use templates with providers

	SendGrid:
	- Set `SENDGRID_API_KEY` and `SENDGRID_TEMPLATE_ID` in your `.env`. The server will send via the SendGrid Web API using that template and pass `clientName`, `clientId`, `subject`, and `html` as `dynamic_template_data`.

	Mailgun:
	- Set `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` in your `.env`. To use a Mailgun stored template, set `MAILGUN_TEMPLATE` to the template name; the server will call Mailgun HTTP API and pass `h:X-Mailgun-Variables` with JSON including `clientName`, `clientId`, `subject`, and `html`.

	WebSocket live updates
	- The backend opens a WebSocket server on the same HTTP port. The frontend connects and listens for `interaction_created` and `client_updated` messages and refreshes dashboard counts.

	End-to-end tests
	- A Playwright scaffold lives in `e2e/` and can be run with `npx playwright test` after installing dependencies. The test expects the frontend on `http://localhost:5173`.
