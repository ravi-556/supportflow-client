// Types + the one shared constant only — no services, no components, no
// Angular-specific code. Split deliberately: business logic (services,
// routes, guards) lives separately in projects/agent and projects/customer,
// mirroring the backend's agent_views.py/customer_views.py split (shared
// models.py, separate service/view logic per audience). This file exists
// purely so TicketStatus, TokenResponse, etc. have exactly one definition
// instead of two copies that could drift.
export * from './models';
export * from './auth.models';
export * from './api.config';
export * from './app-urls';
