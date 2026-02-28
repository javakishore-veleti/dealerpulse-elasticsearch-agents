import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-leads',
  template: `
    

    <div class="card stat-card p-3 mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-6">
          <label class="form-label small">Search Leads</label>
          <input type="text" class="form-control" [(ngModel)]="query"
                 placeholder="Customer name, vehicle preference, or status..."
                 (keyup.enter)="search()">
        </div>
        <div class="col-md-3">
          <label class="form-label small">Status</label>
          <select class="form-select" [(ngModel)]="statusFilter">
            <option value="">All</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="test_drive">Test Drive</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>
        </div>
        <div class="col-md-3">
          <button class="btn btn-primary w-100" (click)="search()" [disabled]="loading">
            <i class="bi bi-search"></i> {{ loading ? 'Searching...' : 'Search' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pipeline Quick Actions -->
    <div class="d-flex flex-wrap gap-2 mb-3">
      <button class="btn btn-outline-success btn-sm" (click)="askAgent('Show all new leads from the last 7 days with their vehicle preferences and budgets')">
        <i class="bi bi-inbox"></i> New Leads
      </button>
      <button class="btn btn-outline-warning btn-sm" (click)="askAgent('Find all leads interested in EV vehicles and match them to available EV inventory with current incentives')">
        <i class="bi bi-lightning"></i> EV Leads + Match
      </button>
      <button class="btn btn-outline-info btn-sm" (click)="askAgent('Which leads should I prioritize today? Consider budget, trade-in equity, and matching inventory.')">
        <i class="bi bi-robot"></i> AI: Prioritize
      </button>
      <button class="btn btn-outline-primary btn-sm" (click)="askAgent('Prepare a BDC briefing for the top 5 highest-budget leads with suggested opening offers')">
        <i class="bi bi-clipboard-data"></i> BDC Briefing
      </button>
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="text-center py-4">
      <div class="spinner-border text-primary mb-2"></div>
      <p class="text-muted">Sales Agent analyzing leads...</p>
    </div>

    <!-- Response -->
    <div *ngIf="response && !loading" class="card stat-card p-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0 fw-bold"><i class="bi bi-robot text-primary"></i> Sales Agent (BDC)</h6>
        <span class="badge bg-success">Agent Builder</span>
      </div>
      <div class="agent-response" style="max-height:500px; overflow-y:auto; white-space:pre-wrap;">{{ response }}</div>
      <div *ngIf="conversationId" class="mt-3 d-flex flex-wrap gap-2">
        <strong class="me-2">Follow-up:</strong>
        <button class="btn btn-sm btn-outline-primary" (click)="askAgent('For the top lead, draft a personalized email with vehicle recommendations and incentives')">
          <i class="bi bi-envelope"></i> Draft Email
        </button>
        <button class="btn btn-sm btn-outline-warning" (click)="askAgent('Which of these leads have trade-ins that give them the best equity position?')">
          <i class="bi bi-arrow-left-right"></i> Trade-In Analysis
        </button>
        <button class="btn btn-sm btn-outline-success" (click)="askAgent('Match all these leads to our best available inventory with pricing')">
          <i class="bi bi-link-45deg"></i> Match to Stock
        </button>
      </div>
    </div>
  `,
})
export class LeadsComponent {
  query = '';
  statusFilter = '';
  response = '';
  loading = false;
  conversationId = '';

  constructor(private api: ApiService) {}

  search() {
    const fullQuery = [this.query, this.statusFilter ? `status: ${this.statusFilter}` : ''].filter(Boolean).join(', ');
    if (!fullQuery) return;
    this.loading = true;
    this.response = '';
    this.api.v2Chat('dealerpulse-sales-agent', `Search leads: ${fullQuery}`).subscribe({
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
    this.api.v2Chat('dealerpulse-sales-agent', question, this.conversationId).subscribe({
      next: (res) => {
        this.response = res.response || res.error || 'No response';
        this.conversationId = res.conversation_id || '';
        this.loading = false;
      },
      error: (err) => { this.response = `Error: ${err.message}`; this.loading = false; },
    });
  }
}
