import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { API_BASE_URL, CustomerOtpRequestResponse, TokenResponse } from '@supportflow/shared';
import { Observable, tap } from 'rxjs';

const TOKEN_KEY = 'supportflow_customer_token';
const ROLE_KEY = 'supportflow_customer_role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  role = signal<TokenResponse['role'] | null>(localStorage.getItem(ROLE_KEY) as TokenResponse['role'] | null);

  isAuthenticated = computed(() => !!this.token());
  isCustomer = computed(() => this.role() === 'customer');

  customerRequestOtp(email: string): Observable<CustomerOtpRequestResponse> {
    return this.http.post<CustomerOtpRequestResponse>(`${API_BASE_URL}/customer/auth/request-otp`, { email });
  }

  customerVerifyOtp(customerId: string, code: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${API_BASE_URL}/customer/auth/verify-otp`, { customer_id: customerId, code })
      .pipe(tap((res) => this.storeSession(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    this.token.set(null);
    this.role.set(null);
  }

  // Public entry point for flows that obtain a session token without going
  // through customerVerifyOtp directly — e.g. guest ticket submission, which
  // logs the visitor in as a side effect of verifying their email and
  // creating the ticket in one request.
  applySession(res: TokenResponse): void {
    this.storeSession(res);
  }

  private storeSession(res: TokenResponse): void {
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(ROLE_KEY, res.role);
    this.token.set(res.access_token);
    this.role.set(res.role);
  }
}
