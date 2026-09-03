import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL, CsatReview, FaqDetail, FaqListItem } from '@supportflow/shared';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private http = inject(HttpClient);

  searchArticles(query: string): Observable<FaqListItem[]> {
    const url = query
      ? `${API_BASE_URL}/customer/kb/articles?q=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/customer/kb/articles`;
    return this.http.get<FaqListItem[]>(url);
  }

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
