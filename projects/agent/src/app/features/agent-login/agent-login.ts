import { Component, signal } from '@angular/core';
import { inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CUSTOMER_APP_URL } from '@supportflow/shared';
import { AuthService } from '../../core/auth.service';

type Step = 'credentials' | 'otp';

@Component({
  selector: 'app-agent-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './agent-login.html',
  styleUrl: './agent-login.scss',
})
export class AgentLogin {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly customerAppUrl = CUSTOMER_APP_URL;

  step = signal<Step>('credentials');
  email = signal('');
  password = signal('');
  otp = signal('');
  agentId = signal<string | null>(null);
  devOtpHint = signal<string | null>(null);
  error = signal<string | null>(null);
  submitting = signal(false);

  submitCredentials(): void {
    this.error.set(null);
    this.submitting.set(true);
    this.auth.agentLogin(this.email(), this.password()).subscribe({
      next: (res) => {
        this.agentId.set(res.agent_id);
        this.devOtpHint.set(res.dev_otp); // dev-only — see backend_django/apps/accounts/
        this.step.set('otp');
        this.submitting.set(false);
      },
      error: () => {
        this.error.set('Invalid email or password.');
        this.submitting.set(false);
      },
    });
  }

  submitOtp(): void {
    const agentId = this.agentId();
    if (!agentId) return;
    this.error.set(null);
    this.submitting.set(true);
    this.auth.agentVerifyOtp(agentId, this.otp()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigateByUrl('/tickets');
      },
      error: () => {
        this.error.set('Incorrect or expired code.');
        this.submitting.set(false);
      },
    });
  }

  backToCredentials(): void {
    this.step.set('credentials');
    this.otp.set('');
    this.error.set(null);
  }
}
