import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerTicketService } from '../../core/customer-ticket.service';
import { CustomerStatusGroup, CustomerTicketListItem } from '@supportflow/shared';

type Tab = CustomerStatusGroup | 'all';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-tickets.html',
  styleUrl: './my-tickets.scss',
})
export class MyTickets implements OnInit {
  private customerTicketService = inject(CustomerTicketService);

  tickets = signal<CustomerTicketListItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  activeTab = signal<Tab>('all');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const tab = this.activeTab();
    const statusGroup = tab === 'all' ? undefined : tab;
    this.customerTicketService.list(statusGroup).subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your tickets.');
        this.loading.set(false);
      },
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.load();
  }

  emptyMessage(): string {
    if (this.activeTab() === 'open') return 'No open tickets.';
    if (this.activeTab() === 'resolved') return 'No resolved tickets.';
    return 'No tickets yet.';
  }

  relativeTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
