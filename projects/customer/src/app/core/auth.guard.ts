import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// UX only (redirect to login) — the real security boundary is the backend's
// IsCustomer, which rejects a non-customer JWT regardless of what the
// frontend does.
export const customerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isCustomer()) return true;
  return router.parseUrl('/login');
};
