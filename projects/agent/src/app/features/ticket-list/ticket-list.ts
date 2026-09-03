import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../core/ticket.service';
import { TicketListItem, TicketStatus } from '@supportflow/shared';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [RouterLink, DatePipe, TitleCasePipe],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss',
})
export class TicketList implements OnInit {
  private ticketService = inject(TicketService);

  tickets = signal<TicketListItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  activeFilter = signal<TicketStatus | 'all'>('open');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const status = this.activeFilter() === 'all' ? undefined : this.activeFilter();
    this.ticketService.list(status).subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load tickets — is the backend running on localhost:8000?');
        this.loading.set(false);
      },
    });
  }

  setFilter(filter: TicketStatus | 'all'): void {
    this.activeFilter.set(filter);
    this.load();
  }

  isOverdue(ticket: TicketListItem): boolean {
    if (!ticket.resolution_sla_time) return false;
    return new Date(ticket.resolution_sla_time).getTime() < Date.now();
  }
}
