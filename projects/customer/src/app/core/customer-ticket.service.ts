import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  API_BASE_URL,
  CustomerMessage,
  CustomerMessageCreate,
  CustomerStatusGroup,
  CustomerTicketCreate,
  CustomerTicketListItem,
  GuestTicketOtpRequestResponse,
  GuestTicketSubmit,
  GuestTicketSubmitResponse,
  PaginatedResponse,
} from '@supportflow/shared';

@Injectable({ providedIn: 'root' })
export class CustomerTicketService {
  private http = inject(HttpClient);

  list(statusGroup?: CustomerStatusGroup, page = 1): Observable<PaginatedResponse<CustomerTicketListItem>> {
    const params = new URLSearchParams({ page: String(page) });
    if (statusGroup) params.set('status_group', statusGroup);
    return this.http.get<PaginatedResponse<CustomerTicketListItem>>(`${API_BASE_URL}/customer/tickets?${params}`);
  }

  create(ticket: CustomerTicketCreate): Observable<CustomerTicketListItem> {
    return this.http.post<CustomerTicketListItem>(`${API_BASE_URL}/customer/tickets`, ticket);
  }

  get(id: string): Observable<CustomerTicketListItem> {
    return this.http.get<CustomerTicketListItem>(`${API_BASE_URL}/customer/tickets/${id}`);
  }

  listMessages(id: string): Observable<CustomerMessage[]> {
    return this.http.get<CustomerMessage[]>(`${API_BASE_URL}/customer/tickets/${id}/messages`);
  }

  addMessage(id: string, message: CustomerMessageCreate): Observable<CustomerMessage> {
    return this.http.post<CustomerMessage>(`${API_BASE_URL}/customer/tickets/${id}/messages`, message);
  }

  requestGuestOtp(email: string): Observable<GuestTicketOtpRequestResponse> {
    return this.http.post<GuestTicketOtpRequestResponse>(`${API_BASE_URL}/customer/guest-tickets/otp`, { email });
  }

  submitGuestTicket(payload: GuestTicketSubmit): Observable<GuestTicketSubmitResponse> {
    return this.http.post<GuestTicketSubmitResponse>(`${API_BASE_URL}/customer/guest-tickets`, payload);
  }
}
