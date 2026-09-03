import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AGENT_APP_URL } from '@supportflow/shared';
import { AuthService } from '../../core/auth.service';

type Step = 'email' | 'otp';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './customer-login.html',
  styleUrl: './customer-login.scss',
})
export class CustomerLogin {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly agentAppUrl = AGENT_APP_URL;

  step = signal<Step>('email');
  email = signal('');
  otp = signal('');
  customerId = signal<string | null>(null);
  devOtpHint = signal<string | null>(null);
  error = signal<string | null>(null);
  submitting = signal(false);

  requestOtp(): void {
    this.error.set(null);
    this.submitting.set(true);
    this.auth.customerRequestOtp(this.email()).subscribe({
      next: (res) => {
        this.customerId.set(res.customer_id);
        this.devOtpHint.set(res.dev_otp); // dev-only — see backend_django/apps/accounts/
        this.step.set('otp');
        this.submitting.set(false);
      },
      error: () => {
        this.error.set('No account found with that email.');
        this.submitting.set(false);
      },
    });
  }

  submitOtp(): void {
    const customerId = this.customerId();
    if (!customerId) return;
    this.error.set(null);
    this.submitting.set(true);
    this.auth.customerVerifyOtp(customerId, this.otp()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigateByUrl('/portal');
      },
      error: () => {
        this.error.set('Incorrect or expired code.');
        this.submitting.set(false);
      },
    });
  }

  backToEmail(): void {
    this.step.set('email');
    this.otp.set('');
    this.error.set(null);
  }
}
