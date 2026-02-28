import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-service-orders',
  template: `
    <div class="card stat-card p-3 mb-3">
      <h6 class="mb-3"><i class="bi bi-wrench-adjustable"></i> Vehicle Diagnostic</h6>
      <div class="row g-2 align-items-end">
        <div class="col-md-3">
          <label class="form-label small">VIN</label>
          <input type="text" class="form-control" [(ngModel)]="vin" placeholder="e.g. 1G1YY22G045N25032">
        </div>
        <div class="col-md-2">
          <label class="form-label small">DTC Codes</label>
          <input type="text" class="form-control" [(ngModel)]="dtcCodes" placeholder="P0300, P0301">
        </div>
        <div class="col-md-4">
          <label class="form-label small">Customer Complaint</label>
          <input type="text" class="form-control" [(ngModel)]="complaint"
                 placeholder="Rough idle at cold start..."
                 (keyup.enter)="diagnose()">
        </div>
        <div class="col-md-3">
          <button class="btn btn-danger w-100" (click)="diagnose()" [disabled]="loading">
            <i class="bi bi-search-heart"></i> {{ loading ? 'Diagnosing...' : 'Run Diagnostic' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Diagnostics -->
    <div class="d-flex gap-2 mb-3">
      <button class="btn btn-outline-secondary btn-sm" (click)="loadDemo()">
        <i class="bi bi-lightning"></i> Demo: Silverado P0300+P0301
      </button>
      <button class="btn btn-outline-info btn-sm" (click)="askAgent('Show me the service workload report')">
        <i class="bi bi-bar-chart"></i> Workload Report
      </button>
      <button class="btn btn-outline-warning btn-sm" (click)="askAgent('Find vehicles that are trade-up candidates due to repeat repairs')">
        <i class="bi bi-arrow-repeat"></i> Repeat Repair Candidates
      </button>
    </div>

    <div *ngIf="response" class="agent-response">{{ response }}</div>
  `,
})
export class ServiceOrdersComponent {
  vin = '';
  dtcCodes = '';
  complaint = '';
  response = '';
  loading = false;

  constructor(private api: ApiService) {}

  loadDemo() {
    this.vin = '1G1YY22G045N25032';
    this.dtcCodes = 'P0300, P0301';
    this.complaint = 'Rough idle at cold start, goes away after warm up';
    this.diagnose();
  }

  diagnose() {
    if (!this.dtcCodes && !this.complaint) return;
    this.loading = true;
    this.api.diagnoseVehicle(this.vin, this.dtcCodes, this.complaint).subscribe({
      next: (res) => { this.response = res.response; this.loading = false; },
      error: (err) => { this.response = `Error: ${err.message}`; this.loading = false; },
    });
  }

  askAgent(question: string) {
    this.loading = true;
    this.api.runQuery(question, 'service').subscribe({
      next: (res) => { this.response = res.response; this.loading = false; },
      error: (err) => { this.response = `Error: ${err.message}`; this.loading = false; },
    });
  }
}
