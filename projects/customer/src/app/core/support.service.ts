import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL, CsatReview, FaqDetail, FaqListItem, PaginatedResponse } from '@supportflow/shared';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private http = inject(HttpClient);

  // First-page-only for now: search results and subject-suggestions are
  // typeahead-shaped (re-queried on every keystroke), not a browsable list a
  // "load more" makes sense on.
  searchArticles(query: string): Observable<FaqListItem[]> {
    const url = query
      ? `${API_BASE_URL}/customer/kb/articles?q=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/customer/kb/articles`;
    return this.http.get<PaginatedResponse<FaqListItem>>(url).pipe(map((res) => res.results));
  }

  // Not paginated server-side (already limit=6) — response shape unchanged.
  popularArticles(): Observable<FaqListItem[]> {
    return this.http.get<FaqListItem[]>(`${API_BASE_URL}/customer/kb/articles/popular`);
  }

  getArticle(id: string): Observable<FaqDetail> {
    return this.http.get<FaqDetail>(`${API_BASE_URL}/customer/kb/articles/${id}`);
  }

  getCsatReview(reviewId: string): Observable<CsatReview> {
    return this.http.get<CsatReview>(`${API_BASE_URL}/customer/csat/${reviewId}`);
  }

  submitCsatReview(reviewId: string, score: 'good' | 'bad'): Observable<CsatReview> {
    return this.http.post<CsatReview>(`${API_BASE_URL}/customer/csat/${reviewId}`, { score });
  }
}
