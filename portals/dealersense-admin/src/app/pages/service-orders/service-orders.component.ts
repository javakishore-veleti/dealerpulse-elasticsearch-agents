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

    <!-- Quick Actions -->
    <div class="d-flex flex-wrap gap-2 mb-3">
      <button class="btn btn-outline-secondary btn-sm" (click)="loadDemo()">
        <i class="bi bi-lightning"></i> Demo: Summit 1500 P0300+P0301
      </button>
      <button class="btn btn-outline-info btn-sm" (click)="askAgent('Show all open service orders with their status, DTC codes, and assigned technician.')">
        <i class="bi bi-bar-chart"></i> Open ROs
      </button>
      <button class="btn btn-outline-warning btn-sm" (click)="askAgent('Find vehicles with 3 or more service visits. Show VIN, visit count, total spend, and flag trade-up candidates.')">
        <i class="bi bi-arrow-repeat"></i> Repeat Repairs
      </button>
      <button class="btn btn-outline-danger btn-sm" (click)="askAgent('Which open ROs have DTC codes that match known TSBs? Cross-reference and show the matching bulletins.')">
        <i class="bi bi-shield-exclamation"></i> TSB Match Scan
      </button>
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="text-center py-4">
      <div class="spinner-border text-info mb-2"></div>
      <p class="text-muted">Service Agent diagnosing...</p>
    </div>

    <!-- Response -->
    <div *ngIf="response && !loading" class="card stat-card p-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0 fw-bold"><i class="bi bi-robot text-info"></i> Service Agent (Ron)</h6>
        <span class="badge bg-success">Agent Builder</span>
      </div>
      <div class="agent-response" style="max-height:500px; overflow-y:auto; white-space:pre-wrap;">{{ response }}</div>
      <div *ngIf="conversationId" class="mt-3 d-flex flex-wrap gap-2">
        <strong class="me-2">Follow-up:</strong>
        <button class="btn btn-sm btn-outline-info" (click)="askAgent('For the repeat repair vehicles you found, check if any are in our CRM as leads or have active service contracts.')">
          <i class="bi bi-people"></i> Check CRM
        </button>
        <button class="btn btn-sm btn-outline-warning" (click)="askAgent('Generate a trade-up outreach message for the customer with the most service visits. Include new vehicle options with incentives.')">
          <i class="bi bi-envelope"></i> Trade-Up Outreach
        </button>
        <button class="btn btn-sm btn-outline-success" (click)="askAgent('Estimate total warranty claim value for all open ROs with matching TSBs.')">
          <i class="bi bi-currency-dollar"></i> Warranty Value
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!response && !loading" class="text-center text-muted py-4">
      <i class="bi bi-wrench-adjustable fs-1 d-block mb-2"></i>
      <p>Enter DTC codes and complaint to run a diagnostic, or use quick actions above.</p>
    </div>
  `,
})
export class ServiceOrdersComponent {
  vin = '';
  dtcCodes = '';
  complaint = '';
  response = '';
  loading = false;
  conversationId = '';

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
    this.response = '';
    const prompt = `Diagnose vehicle VIN ${this.vin}, DTC codes: ${this.dtcCodes}, complaint: ${this.complaint}. Look up matching TSBs, check service history, and generate 3C documentation.`;
    this.api.v2Chat('dealerpulse-service-agent', prompt).subscribe({
      next: (res) => {
        this.response = res.response || res.error || 'No response';
        this.conversationId = res.conversation_id || '';
        this.loading = false;
      },
      error: (err) => { this.response = `Error: ${err.message}`; this.loading = false; },
    });
  }

  askAgent(question: string) {
    this.loading = true;
    this.response = '';
    this.api.v2Chat('dealerpulse-service-agent', question, this.conversationId).subscribe({
      next: (res) => {
        this.response = res.response || res.error || 'No response';
        this.conversationId = res.conversation_id || '';
        this.loading = false;
      },
      error: (err) => { this.response = `Error: ${err.message}`; this.loading = false; },
    });
  }
}
