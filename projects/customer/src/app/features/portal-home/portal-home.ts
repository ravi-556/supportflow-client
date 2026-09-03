import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CustomerTicketService } from '../../core/customer-ticket.service';
import { SupportService } from '../../core/support.service';
import { CustomerTicketListItem, FaqDetail, FaqListItem, TicketTypeEnum } from '@supportflow/shared';

@Component({
  selector: 'app-portal-home',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './portal-home.html',
  styleUrl: './portal-home.scss',
})
export class PortalHome implements OnInit {
  private auth = inject(AuthService);
  private supportService = inject(SupportService);
  private customerTicketService = inject(CustomerTicketService);

  readonly ticketTypes: { value: TicketTypeEnum; label: string }[] = [
    { value: 'question', label: 'Question' },
    { value: 'incident', label: 'Incident' },
    { value: 'bug', label: 'Bug' },
    { value: 'feature_request', label: 'Feature Request' },
  ];

  isSignedIn = this.auth.isCustomer;

  // Search
  searchQuery = signal('');
  searchResults = signal<FaqListItem[]>([]);
  searching = signal(false);
  private searchDebounce?: ReturnType<typeof setTimeout>;

  // Popular articles
  popularArticles = signal<FaqListItem[]>([]);
  loadingPopular = signal(true);

  // Inline article view
  openArticleDetail = signal<FaqDetail | null>(null);

  // Submit form
  subject = signal('');
  ticketType = signal<TicketTypeEnum | null>(null);
  description = signal('');
  subjectSuggestions = signal<FaqListItem[]>([]);
  private subjectDebounce?: ReturnType<typeof setTimeout>;
  submitting = signal(false);
  error = signal<string | null>(null);
  confirmation = signal<CustomerTicketListItem | null>(null);

  // Guest email verification (not signed in) — verifies email ownership
  // inline via OTP as an anti-spam gate, instead of redirecting away to a
  // separate login screen. See PRD §13.1.
  guestEmail = signal('');
  guestOtpSent = signal(false);
  guestOtp = signal('');
  devOtpHint = signal<string | null>(null);

  ngOnInit(): void {
    this.supportService.popularArticles().subscribe({
      next: (articles) => {
        this.popularArticles.set(articles);
        this.loadingPopular.set(false);
      },
      error: () => this.loadingPopular.set(false),
    });
  }

  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.runSearch(), 300);
  }

  private runSearch(): void {
    const q = this.searchQuery().trim();
    this.searching.set(true);
    this.supportService.searchArticles(q).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.searching.set(false);
      },
      error: () => this.searching.set(false),
    });
  }

  onSubjectInput(): void {
    clearTimeout(this.subjectDebounce);
    const subject = this.subject().trim();
    if (subject.length < 3) {
      this.subjectSuggestions.set([]);
      return;
    }
    this.subjectDebounce = setTimeout(() => {
      this.supportService.searchArticles(subject).subscribe({
        next: (results) => this.subjectSuggestions.set(results),
        error: () => {},
      });
    }, 300);
  }

  openArticle(id: string): void {
    this.supportService.getArticle(id).subscribe({
      next: (article) => this.openArticleDetail.set(article),
      error: () => {},
    });
  }

  closeArticle(): void {
    this.openArticleDetail.set(null);
  }

  canSubmit(): boolean {
    if (!this.subject().trim() || !this.description().trim()) return false;
    if (this.isSignedIn()) return true;
    if (!this.guestOtpSent()) return !!this.guestEmail().trim();
    return !!this.guestOtp().trim();
  }

  submitLabel(): string {
    if (this.isSignedIn()) return this.submitting() ? 'Submitting…' : 'Submit request';
    if (!this.guestOtpSent()) return this.submitting() ? 'Sending code…' : 'Send verification code';
    return this.submitting() ? 'Verifying…' : 'Verify & submit request';
  }

  submit(): void {
    if (!this.canSubmit()) return;

    if (this.isSignedIn()) {
      this.submitTicket();
      return;
    }
    if (!this.guestOtpSent()) {
      this.sendGuestOtp();
      return;
    }
    this.submitGuestTicket();
  }

  private submitTicket(): void {
    this.error.set(null);
    this.submitting.set(true);
    this.customerTicketService
      .create({
        subject: this.subject(),
        description: this.description(),
        ticket_type: this.ticketType(),
      })
      .subscribe({
        next: (ticket) => {
          this.confirmation.set(ticket);
          this.submitting.set(false);
        },
        error: () => {
          this.error.set('Could not submit your request — please try again.');
          this.submitting.set(false);
        },
      });
  }

  private sendGuestOtp(): void {
    this.error.set(null);
    this.submitting.set(true);
    this.customerTicketService.requestGuestOtp(this.guestEmail().trim()).subscribe({
      next: (res) => {
        this.guestOtpSent.set(true);
        this.devOtpHint.set(res.dev_otp);
        this.submitting.set(false);
      },
      error: () => {
        this.error.set('Could not send a verification code — please try again.');
        this.submitting.set(false);
      },
    });
  }

  private submitGuestTicket(): void {
    this.error.set(null);
    this.submitting.set(true);
    this.customerTicketService
      .submitGuestTicket({
        email: this.guestEmail().trim(),
        code: this.guestOtp().trim(),
        subject: this.subject(),
        description: this.description(),
        ticket_type: this.ticketType(),
      })
      .subscribe({
        next: (res) => {
          this.auth.applySession(res);
          this.confirmation.set(res.ticket);
          this.submitting.set(false);
        },
        error: () => {
          this.error.set('Incorrect or expired code — please try again.');
          this.submitting.set(false);
        },
      });
  }

  submitAnother(): void {
    this.confirmation.set(null);
    this.subject.set('');
    this.ticketType.set(null);
    this.description.set('');
    this.guestEmail.set('');
    this.guestOtpSent.set(false);
    this.guestOtp.set('');
    this.devOtpHint.set(null);
  }
}
