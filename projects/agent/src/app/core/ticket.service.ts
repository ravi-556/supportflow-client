import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL, Message, MessageCreate, TicketActivity, TicketDetail, TicketListItem, TicketUpdate } from '@supportflow/shared';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);

  list(status?: string): Observable<TicketListItem[]> {
    const url = status ? `${API_BASE_URL}/agent/tickets?status=${status}` : `${API_BASE_URL}/agent/tickets`;
    return this.http.get<TicketListItem[]>(url);
  }

  get(id: string): Observable<TicketDetail> {
    return this.http.get<TicketDetail>(`${API_BASE_URL}/agent/tickets/${id}`);
  }

  update(id: string, patch: TicketUpdate): Observable<TicketDetail> {
    return this.http.patch<TicketDetail>(`${API_BASE_URL}/agent/tickets/${id}`, patch);
  }

  listMessages(ticketId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${API_BASE_URL}/agent/tickets/${ticketId}/messages`);
  }

  addMessage(ticketId: string, message: MessageCreate): Observable<Message> {
    return this.http.post<Message>(`${API_BASE_URL}/agent/tickets/${ticketId}/messages`, message);
  }

  listActivities(ticketId: string): Observable<TicketActivity[]> {
    return this.http.get<TicketActivity[]>(`${API_BASE_URL}/agent/tickets/${ticketId}/activities`);
  }
}
