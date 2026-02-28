import { Component } from '@angular/core';
import { CustomerApiService } from '../../services/customer-api.service';

@Component({
  selector: 'app-price-calculator',
  template: `
    <div class="hero-sm">
      <div class="container">
        <h2><i class="bi bi-calculator"></i> Your Price Calculator</h2>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="row g-4 justify-content-center">
          <!-- Input Form -->
          <div class="col-md-5">
            <div class="vehicle-card p-4" style="cursor: default;">
              <h5 class="mb-3">Build Your Deal</h5>

              <div class="mb-3">
                <label class="form-label small fw-bold">Vehicle You're Interested In</label>
                <select class="form-select" [(ngModel)]="selectedModel">
                  <option value="">Choose a model...</option>
                  <option *ngFor="let m of models" [value]="m">{{ m }}</option>
                </select>
              </div>

              <hr>
              <h6 class="text-muted small">TRADE-IN (optional)</h6>

              <div class="mb-3">
                <label class="form-label small fw-bold">Your Current Vehicle</label>
                <input type="text" class="form-control" [(ngModel)]="tradeIn"
                       placeholder="e.g. 2021 Chevrolet Malibu LT">
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Estimated Trade-In Value</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input type="number" class="form-control" [(ngModel)]="tradeValue" placeholder="18000">
                </div>
                <small class="text-muted">
                  Not sure? <a routerLink="/trade-in" class="text-primary">Get an AI estimate</a>
                </small>
              </div>

              <button class="btn btn-primary w-100 rounded-pill py-2 mt-2"
                      (click)="calculate()" [disabled]="!selectedModel || loading">
                <i class="bi bi-calculator"></i>
                {{ loading ? 'Calculating...' : 'Calculate My Price' }}
              </button>
            </div>
          </div>

          <!-- Results -->
          <div class="col-md-5">
            <div *ngIf="response" class="price-breakdown">
              <h5 class="mb-3"><i class="bi bi-receipt"></i> Your Price Breakdown</h5>
              <div style="white-space: pre-wrap; line-height: 1.8; font-size: 0.95rem;">
                {{ response }}
              </div>
            </div>

            <div *ngIf="!response && !loading" class="text-center py-5">
              <i class="bi bi-receipt" style="font-size: 3rem; color: #cbd5e1;"></i>
              <p class="text-muted mt-3 small">Select a vehicle and we'll calculate your real price<br>with all available incentives applied.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PriceCalculatorComponent {
  selectedModel = '';
  tradeIn = '';
  tradeValue: number | null = null;
  response = '';
  loading = false;

  models = [
    '2025 Chevrolet Silverado 1500',
    '2025 Chevrolet Equinox',
    '2025 Chevrolet Equinox EV',
    '2025 Chevrolet Blazer EV',
    '2025 Chevrolet Tahoe',
    '2025 Chevrolet Suburban',
    '2025 Chevrolet Traverse',
    '2025 Chevrolet Trax',
    '2025 Chevrolet Malibu',
    '2025 Chevrolet Camaro',
    '2025 Chevrolet Colorado',
    '2025 Chevrolet Bolt EUV',
    '2025 Chevrolet Corvette',
  ];

  constructor(private api: CustomerApiService) {}

  calculate() {
    if (!this.selectedModel) return;
    this.loading = true;
    this.response = '';
    this.api.calculatePrice(
      this.selectedModel,
      this.tradeIn || undefined,
      this.tradeValue || undefined
    ).subscribe({
      next: (res) => { this.response = res.response; this.loading = false; },
      error: () => { this.response = 'Unable to calculate right now.'; this.loading = false; },
    });
  }
}
