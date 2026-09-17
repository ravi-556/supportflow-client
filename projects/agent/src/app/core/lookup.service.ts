import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL, Agent, Customer, Group, PaginatedResponse } from '@supportflow/shared';

@Injectable({ providedIn: 'root' })
export class LookupService {
  private http = inject(HttpClient);

  // Dropdown data — bounded by the size of the agent roster/group list, not
  // ticket volume, so unwrapping to the first page's results is enough for
  // now rather than building "load more" into every dropdown.
  agents(): Observable<Agent[]> {
    return this.http
      .get<PaginatedResponse<Agent>>(`${API_BASE_URL}/agent/agents`)
      .pipe(map((res) => res.results));
  }

  groups(): Observable<Group[]> {
    return this.http
      .get<PaginatedResponse<Group>>(`${API_BASE_URL}/agent/groups`)
      .pipe(map((res) => res.results));
  }

  customer(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${API_BASE_URL}/agent/customers/${id}`);
  }
}
