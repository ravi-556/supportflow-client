import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomerTicketService } from '../../core/customer-ticket.service';
import { CustomerMessage, CustomerTicketListItem } from '@supportflow/shared';

@Component({
  selector: 'app-customer-ticket-detail',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './customer-ticket-detail.html',
  styleUrl: './customer-ticket-detail.scss',
})
export class CustomerTicketDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private customerTicketService = inject(CustomerTicketService);

  ticket = signal<CustomerTicketListItem | null>(null);
  messages = signal<CustomerMessage[]>([]);
  loading = signal(true);
  notFound = signal(false);

  replyBody = signal('');
  sending = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  private ticketId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  load(): void {
    this.loading.set(true);
    this.notFound.set(false);
    const id = this.ticketId();
    forkJoin({
      ticket: this.customerTicketService.get(id),
      messages: this.customerTicketService.listMessages(id),
    }).subscribe({
      next: ({ ticket, messages }) => {
        this.ticket.set(ticket);
        this.messages.set(messages);
        this.loading.set(false);
      },
      error: () => {
        // A wrong owner and a nonexistent ticket both 404 identically
        // server-side (PRD §13.3) — the UI shouldn't distinguish them either.
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  sendReply(): void {
    const body = this.replyBody().trim();
    if (!body) return;
    this.error.set(null);
    this.sending.set(true);
    this.customerTicketService.addMessage(this.ticketId(), { description: body }).subscribe({
      next: () => {
        this.replyBody.set('');
        this.sending.set(false);
        // Re-fetch rather than append-only — a reply on a Pending/Resolved/
        // Closed ticket auto-reopens it (§8.1), and the status badge should
        // reflect that immediately, not just the new message.
        this.load();
      },
      error: () => {
        this.error.set('Could not send your reply — please try again.');
        this.sending.set(false);
      },
    });
  }
}
