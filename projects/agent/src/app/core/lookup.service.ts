import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL, Agent, Customer, Group } from '@supportflow/shared';

@Injectable({ providedIn: 'root' })
export class LookupService {
  private http = inject(HttpClient);

  agents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(`${API_BASE_URL}/agent/agents`);
  }

  groups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${API_BASE_URL}/agent/groups`);
  }

  customer(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${API_BASE_URL}/agent/customers/${id}`);
  }
}
