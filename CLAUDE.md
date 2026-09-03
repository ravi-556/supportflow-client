# SupportFlow — Client (Angular)

The frontend for SupportFlow, a Zendesk-style customer support ticketing system. Talks to the Django REST API in the separate `supportflow-server` repo (sibling folder in local dev: `../supportflow-server`).

Product/implementation specs (PRD, feature gap analysis, Zendesk/Freshdesk research) live in the separate `supportflow` planning folder, not in this repo — see `../supportflow/docs/`.

## Two separate Angular projects, not one app

- `projects/agent` (agent + admin, port 4300) and `projects/customer` (customer portal + public CSAT page, port 4200) — different builds, different ports, different deploy targets.
- Types only (no services, no components) are shared, via `projects/shared/src`, imported as `@supportflow/shared`.
- New agent-facing work goes in `projects/agent`; new customer-facing work goes in `projects/customer`; a type both sides need goes in `projects/shared`.
- A link from one app to the other (e.g. the CSAT link on the agent sidebar, or the "sign in as agent"/"go to portal" switch links) must be a real `href` built from `AGENT_APP_URL`/`CUSTOMER_APP_URL` (also in `@supportflow/shared`) — never `routerLink` and never `window.location.origin`, since that resolves to whichever app's own origin happened to render the link, not the other one.

## Dev environment

```bash
nvm use                          # Node via nvm, see .nvmrc
npx ng serve customer --port 4200   # customer portal + CSAT
npx ng serve agent --port 4300      # agent/admin
```

Requires the backend API running separately (see `supportflow-server`'s `CLAUDE.md`).
