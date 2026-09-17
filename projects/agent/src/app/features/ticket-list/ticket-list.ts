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
  totalCount = signal(0);
  hasMore = signal(false);
  loading = signal(true);
  loadingMore = signal(false);
  error = signal<string | null>(null);
  activeFilter = signal<TicketStatus | 'all'>('open');

  private page = 1;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.page = 1;
    const status = this.activeFilter() === 'all' ? undefined : this.activeFilter();
    this.ticketService.list(status, this.page).subscribe({
      next: (res) => {
        this.tickets.set(res.results);
        this.totalCount.set(res.count);
        this.hasMore.set(res.next !== null);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load tickets — is the backend running on localhost:8000?');
        this.loading.set(false);
      },
    });
  }

  loadMore(): void {
    if (!this.hasMore() || this.loadingMore()) return;
    this.loadingMore.set(true);
    const status = this.activeFilter() === 'all' ? undefined : this.activeFilter();
    const nextPage = this.page + 1;
    this.ticketService.list(status, nextPage).subscribe({
      next: (res) => {
        this.page = nextPage;
        this.tickets.update((existing) => [...existing, ...res.results]);
        this.hasMore.set(res.next !== null);
        this.loadingMore.set(false);
      },
      error: () => {
        this.error.set('Could not load more tickets.');
        this.loadingMore.set(false);
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
