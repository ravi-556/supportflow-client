import { Routes } from '@angular/router';
import { CustomerLogin } from './features/customer-login/customer-login';
import { PortalHome } from './features/portal-home/portal-home';
import { MyTickets } from './features/my-tickets/my-tickets';
import { CustomerTicketDetail } from './features/customer-ticket-detail/customer-ticket-detail';
import { Csat } from './features/csat/csat';
import { customerGuard } from './core/auth.guard';

// Customer-facing site — a separate Angular app (and port) from the agent
// site, not just a route prefix within one app anymore.
export const routes: Routes = [
  { path: 'login', component: CustomerLogin },
  // Portal Home is public (KB browsing) — only submitting a request
  // requires sign-in, enforced inside the component itself (PRD §13.1),
  // not by a route guard.
  { path: 'portal', component: PortalHome },
  { path: 'portal/tickets', component: MyTickets, canActivate: [customerGuard] },
  { path: 'portal/tickets/:id', component: CustomerTicketDetail, canActivate: [customerGuard] },
  // PRD §13.5 — deliberately outside /portal and its auth guard. Must render
  // for a signed-out visitor; that's the entire point of a CSAT link.
  { path: 'csat/:reviewId', component: Csat },
  { path: '', redirectTo: 'portal', pathMatch: 'full' },
  { path: '**', redirectTo: 'portal' },
];
