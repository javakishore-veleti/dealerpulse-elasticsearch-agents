import { Component } from '@angular/core';
import { CustomerApiService } from '../../services/customer-api.service';

@Component({
  selector: 'app-service-tracker',
  template: `
    <div class="hero-sm">
      <div class="container">
        <h2><i class="bi bi-wrench"></i> Service Tracker</h2>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <!-- Search -->
            <div class="vehicle-card p-4 mb-4" style="cursor: default;">
              <h5 class="mb-3">Check Your Vehicle's Service Status</h5>
              <p class="text-muted small">Enter your VIN, RO number, phone number, or last name to look up your service status.</p>
              <div class="input-group input-group-lg">
                <input type="text" class="form-control rounded-pill rounded-end-0 border-2"
                       [(ngModel)]="identifier"
                       placeholder="VIN, RO number, phone, or last name"
                       (keyup.enter)="track()">
                <button class="btn btn-primary rounded-pill rounded-start-0 px-4"
                        (click)="track()" [disabled]="!identifier.trim() || loading">
                  <i class="bi bi-search"></i> {{ loading ? 'Looking up...' : 'Track' }}
                </button>
              </div>
            </div>

            <!-- Quick demo buttons -->
            <div class="d-flex justify-content-center gap-2 mb-4">
              <button class="btn btn-outline-secondary btn-sm rounded-pill"
                      (click)="identifier = '1G1YY22G045N25032'; track()">
                <i class="bi bi-lightning"></i> Demo: VIN Lookup
              </button>
              <button class="btn btn-outline-secondary btn-sm rounded-pill"
                      (click)="identifier = 'Show all open service orders'; track()">
                <i class="bi bi-list-check"></i> Demo: Open ROs
              </button>
            </div>

            <!-- Result -->
            <div *ngIf="response" class="vehicle-card p-4" style="cursor: default;">
              <div class="d-flex align-items-center gap-2 mb-3">
                <i class="bi bi-clipboard-check fs-4 text-primary"></i>
                <h5 class="mb-0">Service Status</h5>
              </div>
              <div style="white-space: pre-wrap; line-height: 1.7; font-size: 0.95rem;">
                {{ response }}
              </div>
            </div>

            <!-- Empty state -->
            <div *ngIf="!response && !loading" class="text-center py-5">
              <i class="bi bi-wrench-adjustable" style="font-size: 3rem; color: #cbd5e1;"></i>
              <p class="text-muted mt-3 small">Track your vehicle's repair status in real time.</p>
            </div>

            <!-- Status legend -->
            <div class="vehicle-card p-3 mt-4" style="cursor: default;">
              <h6 class="small fw-bold mb-2">Status Guide</h6>
              <div class="d-flex flex-wrap gap-3">
                <span *ngFor="let s of statuses" class="small">
                  <span class="badge rounded-pill" [ngClass]="s.color">●</span>
                  {{ s.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ServiceTrackerComponent {
  identifier = '';
  response = '';
  loading = false;

  statuses = [
    { label: 'Checked In', color: 'bg-secondary' },
    { label: 'Diagnosed', color: 'bg-info' },
    { label: 'Parts Ordered', color: 'bg-warning' },
    { label: 'In Progress', color: 'bg-primary' },
    { label: 'Complete', color: 'bg-success' },
  ];

  constructor(private api: CustomerApiService) {}

  track() {
    if (!this.identifier.trim()) return;
    this.loading = true;
    this.response = '';
    this.api.trackService(this.identifier).subscribe({
      next: (res) => { this.response = res.response; this.loading = false; },
      error: () => { this.response = 'Unable to look up service status right now.'; this.loading = false; },
    });
  }
}
