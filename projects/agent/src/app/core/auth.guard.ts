import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// UX only (redirect to login) — the real security boundary is the backend's
// IsAgent, which rejects a non-agent JWT regardless of what the frontend does.
export const agentGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAgent()) return true;
  return router.parseUrl('/login');
};
