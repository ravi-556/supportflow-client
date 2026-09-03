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
} from '@supportflow/shared';

@Injectable({ providedIn: 'root' })
export class CustomerTicketService {
  private http = inject(HttpClient);

  list(statusGroup?: CustomerStatusGroup): Observable<CustomerTicketListItem[]> {
    const url = statusGroup
      ? `${API_BASE_URL}/customer/tickets?status_group=${statusGroup}`
      : `${API_BASE_URL}/customer/tickets`;
    return this.http.get<CustomerTicketListItem[]>(url);
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
