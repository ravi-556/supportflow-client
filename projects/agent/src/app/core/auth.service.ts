import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { AgentLoginResponse, TokenResponse } from '@supportflow/shared';
import { API_BASE_URL } from '@supportflow/shared';
import { Observable, tap } from 'rxjs';

const TOKEN_KEY = 'supportflow_agent_token';
const ROLE_KEY = 'supportflow_agent_role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  role = signal<TokenResponse['role'] | null>(localStorage.getItem(ROLE_KEY) as TokenResponse['role'] | null);

  isAuthenticated = computed(() => !!this.token());
  isAgent = computed(() => ['admin', 'agent', 'light_agent'].includes(this.role() ?? ''));

  agentLogin(email: string, password: string): Observable<AgentLoginResponse> {
    return this.http.post<AgentLoginResponse>(`${API_BASE_URL}/agent/auth/login`, { email, password });
  }

  agentVerifyOtp(agentId: string, code: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${API_BASE_URL}/agent/auth/verify-otp`, { agent_id: agentId, code })
      .pipe(tap((res) => this.storeSession(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    this.token.set(null);
    this.role.set(null);
  }

  private storeSession(res: TokenResponse): void {
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(ROLE_KEY, res.role);
    this.token.set(res.access_token);
    this.role.set(res.role);
  }
}
