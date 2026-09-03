// Cross-app links only (e.g. "Support customer? Go to the portal ->") — each
// app is now a separate Angular project on its own port, so these can't be
// routerLink; they're real hyperlinks across origins.
export const AGENT_APP_URL = 'http://localhost:4300';
export const CUSTOMER_APP_URL = 'http://localhost:4200';
