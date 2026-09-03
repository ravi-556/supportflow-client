import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupportService } from '../../core/support.service';
import { CsatReview } from '@supportflow/shared';

@Component({
  selector: 'app-csat',
  standalone: true,
  templateUrl: './csat.html',
  styleUrl: './csat.scss',
})
export class Csat implements OnInit {
  private route = inject(ActivatedRoute);
  private supportService = inject(SupportService);

  review = signal<CsatReview | null>(null);
  loading = signal(true);
  notFound = signal(false);
  submitting = signal(false);

  ngOnInit(): void {
    const reviewId = this.route.snapshot.paramMap.get('reviewId')!;
    this.supportService.getCsatReview(reviewId).subscribe({
      next: (review) => {
        this.review.set(review);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  submit(score: 'good' | 'bad'): void {
    const review = this.review();
    if (!review || this.submitting()) return;
    // One-click by design — no separate confirm step (PRD §13.5).
    this.submitting.set(true);
    this.supportService.submitCsatReview(review.id, score).subscribe({
      next: (updated) => {
        this.review.set(updated);
        this.submitting.set(false);
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }
}
