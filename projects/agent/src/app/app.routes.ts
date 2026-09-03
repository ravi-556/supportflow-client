import { Routes } from '@angular/router';
import { TicketList } from './features/ticket-list/ticket-list';
import { TicketDetail } from './features/ticket-detail/ticket-detail';
import { AgentLogin } from './features/agent-login/agent-login';
import { agentGuard } from './core/auth.guard';

// Agent/admin-facing site — a separate Angular app (and port) from the
// customer portal, not just a route prefix within one app anymore. Real
// enforcement is still the backend rejecting a non-agent JWT; this guard is
// UX only.
export const routes: Routes = [
  { path: 'login', component: AgentLogin },
  { path: 'tickets', component: TicketList, canActivate: [agentGuard] },
  { path: 'tickets/:id', component: TicketDetail, canActivate: [agentGuard] },
  // TODO Phase 3: 'admin/automation' -> Admin Settings
  { path: '', redirectTo: 'tickets', pathMatch: 'full' },
  { path: '**', redirectTo: 'tickets' },
];
