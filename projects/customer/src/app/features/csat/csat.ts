import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupportService } from '../../core/support.service';
import { CsatReview } from '@supportflow/shared';

// PRD §13.5 revision: Freshdesk's real 5-point scale, not Zendesk's binary
// Good/Bad. Labels are Freshdesk's own wording.
export const RATING_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Bad' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Very Good' },
];

@Component({
  selector: 'app-csat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './csat.html',
  styleUrl: './csat.scss',
})
export class Csat implements OnInit {
  private route = inject(ActivatedRoute);
  private supportService = inject(SupportService);

  readonly ratingOptions = RATING_OPTIONS;

  review = signal<CsatReview | null>(null);
  loading = signal(true);
  notFound = signal(false);

  selectedScore = signal<number | null>(null);
  comment = signal('');
  submitting = signal(false);
  error = signal<string | null>(null);

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

  selectScore(value: number): void {
    this.selectedScore.set(value);
  }

  scoreLabel(score: number): string {
    return this.ratingOptions.find((o) => o.value === score)?.label ?? String(score);
  }

  submit(): void {
    const review = this.review();
    const score = this.selectedScore();
    if (!review || score === null || this.submitting()) return;
    // Deliberate Submit action, not one-click — a comment box in the same
    // form means the visitor needs a chance to type before sending (PRD
    // §13.5 UI spec).
    this.error.set(null);
    this.submitting.set(true);
    this.supportService.submitCsatReview(review.id, score, this.comment().trim()).subscribe({
      next: (updated) => {
        this.review.set(updated);
        this.submitting.set(false);
      },
      error: () => {
        this.error.set('Could not submit your rating — please try again.');
        this.submitting.set(false);
      },
    });
  }
}
