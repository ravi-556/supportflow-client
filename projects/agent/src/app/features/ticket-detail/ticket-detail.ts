import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TicketService } from '../../core/ticket.service';
import { LookupService } from '../../core/lookup.service';
import {
  Agent,
  CUSTOMER_APP_URL,
  Group,
  Message,
  PriorityLevel,
  TicketActivity,
  TicketDetail as TicketDetailModel,
  TicketStatus,
} from '@supportflow/shared';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss',
})
export class TicketDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);
  private lookupService = inject(LookupService);

  ticket = signal<TicketDetailModel | null>(null);
  messages = signal<Message[]>([]);
  activities = signal<TicketActivity[]>([]);
  agents = signal<Agent[]>([]);
  groups = signal<Group[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // No auth yet (deferred per PRD) — stand-in for "who is currently acting".
  actingAgentId = signal<string | null>(null);

  replyBody = signal('');
  replyIsPrivate = signal(false);
  sending = signal(false);

  csatLinkCopied = signal(false);

  readonly statuses: TicketStatus[] = ['open', 'pending', 'resolved', 'closed'];
  readonly priorities: PriorityLevel[] = ['urgent', 'high', 'medium', 'low'];

  ngOnInit(): void {
    this.lookupService.agents().subscribe((agents) => {
      this.agents.set(agents);
      if (agents.length > 0) this.actingAgentId.set(agents[0].id);
    });
    this.lookupService.groups().subscribe((groups) => this.groups.set(groups));
    this.load();
  }

  private ticketId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const id = this.ticketId();
    forkJoin({
      ticket: this.ticketService.get(id),
      messages: this.ticketService.listMessages(id),
      activities: this.ticketService.listActivities(id),
    }).subscribe({
      next: ({ ticket, messages, activities }) => {
        this.ticket.set(ticket);
        this.messages.set(messages);
        this.activities.set(activities);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load this ticket.');
        this.loading.set(false);
      },
    });
  }

  // PRD §13.5 addendum — testing aid only, since no email exists to click.
  // The /csat route lives in the customer app (a different origin/port
  // after the agent/customer split), never in this one — so this must
  // build off CUSTOMER_APP_URL, not window.location.origin.
  csatLink(reviewId: string): string {
    return `${CUSTOMER_APP_URL}/csat/${reviewId}`;
  }

  copyCsatLink(reviewId: string): void {
    navigator.clipboard.writeText(this.csatLink(reviewId)).then(() => {
      this.csatLinkCopied.set(true);
      setTimeout(() => this.csatLinkCopied.set(false), 1500);
    });
  }

  // Freshdesk's real 5-point labels (PRD §13.5 revision) — same lookup as
  // the customer CSAT page's RATING_OPTIONS; kept as a tiny local constant
  // rather than pulled into @supportflow/shared, which only carries types.
  private static readonly SCORE_LABELS: Record<number, string> = {
    1: 'Poor',
    2: 'Bad',
    3: 'Neutral',
    4: 'Good',
    5: 'Very Good',
  };

  scoreLabel(score: number): string {
    return TicketDetail.SCORE_LABELS[score] ?? String(score);
  }

  agentName(id: string | null): string {
    if (!id) return 'Unassigned';
    const a = this.agents().find((x) => x.id === id);
    return a ? `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim() || a.email : id;
  }

  setStatus(status: TicketStatus): void {
    const t = this.ticket();
    if (!t || t.status === status) return;
    this.ticketService.update(t.id, { status, changed_by_agent_id: this.actingAgentId() ?? undefined }).subscribe(() => this.load());
  }

  setPriority(priority: PriorityLevel): void {
    const t = this.ticket();
    if (!t || t.priority === priority) return;
    this.ticketService.update(t.id, { priority, changed_by_agent_id: this.actingAgentId() ?? undefined }).subscribe(() => this.load());
  }

  setAgent(agentId: string): void {
    const t = this.ticket();
    if (!t) return;
    this.ticketService
      .update(t.id, { agent_id: agentId || null, changed_by_agent_id: this.actingAgentId() ?? undefined })
      .subscribe(() => this.load());
  }

  setGroup(groupId: string): void {
    const t = this.ticket();
    if (!t) return;
    this.ticketService
      .update(t.id, { group_id: groupId || null, changed_by_agent_id: this.actingAgentId() ?? undefined })
      .subscribe(() => this.load());
  }

  sendReply(): void {
    const t = this.ticket();
    const body = this.replyBody().trim();
    const actingAgent = this.actingAgentId();
    if (!t || !body || !actingAgent) return;

    this.sending.set(true);
    this.ticketService
      .addMessage(t.id, {
        description: body,
        reply_by: 'agent',
        agent_id: actingAgent,
        is_private: this.replyIsPrivate(),
      })
      .subscribe({
        next: () => {
          this.replyBody.set('');
          this.sending.set(false);
          this.load();
        },
        error: () => {
          this.sending.set(false);
          this.error.set('Could not send that message.');
        },
      });
  }
}
