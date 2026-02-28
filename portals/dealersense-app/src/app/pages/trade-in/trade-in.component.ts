import { Component } from '@angular/core';
import { CustomerApiService } from '../../services/customer-api.service';

@Component({
  selector: 'app-trade-in',
  template: `
    <div class="hero-sm">
      <div class="container">
        <h2><i class="bi bi-arrow-left-right"></i> Trade-In Estimator</h2>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="row g-4 justify-content-center">
          <!-- Input -->
          <div class="col-md-5">
            <div class="vehicle-card p-4" style="cursor: default;">
              <h5 class="mb-3">Tell Us About Your Vehicle</h5>

              <div class="mb-3">
                <label class="form-label small fw-bold">Year, Make, Model, Trim</label>
                <input type="text" class="form-control" [(ngModel)]="vehicle"
                       placeholder="e.g. 2021 Chevrolet Malibu LT">
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Mileage</label>
                <div class="input-group">
                  <input type="number" class="form-control" [(ngModel)]="mileage" placeholder="42000">
                  <span class="input-group-text">miles</span>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Condition</label>
                <div class="d-flex gap-2">
                  <button *ngFor="let c of conditions" class="btn flex-fill"
                          [ngClass]="condition === c.value ? 'btn-primary' : 'btn-outline-secondary'"
                          (click)="condition = c.value">
                    {{ c.label }}
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">VIN (optional — for recall check)</label>
                <input type="text" class="form-control" [(ngModel)]="vin"
                       placeholder="e.g. 1G1YY22G045N25032">
              </div>

              <button class="btn btn-primary w-100 rounded-pill py-2 mt-2"
                      (click)="estimate()" [disabled]="!vehicle || loading">
                <i class="bi bi-search-heart"></i>
                {{ loading ? 'Estimating...' : 'Get My Trade-In Value' }}
              </button>
            </div>
          </div>

          <!-- Result -->
          <div class="col-md-5">
            <div *ngIf="response" class="price-breakdown">
              <h5 class="mb-3"><i class="bi bi-cash-stack"></i> Your Trade-In Estimate</h5>
              <div style="white-space: pre-wrap; line-height: 1.8; font-size: 0.95rem;">
                {{ response }}
              </div>
            </div>

            <div *ngIf="!response && !loading" class="text-center py-5">
              <i class="bi bi-cash-stack" style="font-size: 3rem; color: #cbd5e1;"></i>
              <p class="text-muted mt-3 small">Get an instant AI estimate of your vehicle's trade-in value.<br>We'll also check for open recalls and TSBs.</p>
            </div>

            <!-- Value promise -->
            <div class="vehicle-card p-3 mt-3" style="cursor: default;">
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-shield-check fs-3 text-success"></i>
                <div>
                  <strong class="small">Our AI Checks</strong>
                  <p class="text-muted small mb-0">Open recalls, TSBs, market pricing, and condition-based adjustments — all in seconds.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TradeInComponent {
  vehicle = '';
  mileage: number | null = null;
  condition = 'good';
  vin = '';
  response = '';
  loading = false;

  conditions = [
    { label: 'Fair', value: 'fair' },
    { label: 'Good', value: 'good' },
    { label: 'Excellent', value: 'excellent' },
  ];

  constructor(private api: CustomerApiService) {}

  estimate() {
    if (!this.vehicle) return;
    this.loading = true;
    this.response = '';
    const vehicleDesc = this.vin ? `${this.vehicle} (VIN: ${this.vin})` : this.vehicle;
    this.api.estimateTradeIn(vehicleDesc, this.mileage || 0, this.condition).subscribe({
      next: (res) => { this.response = res.response; this.loading = false; },
      error: () => { this.response = 'Unable to estimate right now.'; this.loading = false; },
    });
  }
}
