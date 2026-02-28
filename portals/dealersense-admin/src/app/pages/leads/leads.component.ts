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
    <div class="d-flex gap-2 mb-3">
      <button class="btn btn-outline-success btn-sm" (click)="query='new leads'; search()">
        <i class="bi bi-inbox"></i> New Leads
      </button>
      <button class="btn btn-outline-warning btn-sm" (click)="query='EV interested leads'; search()">
        <i class="bi bi-lightning"></i> EV Interest
      </button>
      <button class="btn btn-outline-info btn-sm" (click)="askAgent('Which leads should I prioritize today?')">
        <i class="bi bi-robot"></i> AI: Prioritize Leads
      </button>
    </div>

    <div *ngIf="response" class="agent-response">{{ response }}</div>
  `,
})
export class LeadsComponent {
  query = '';
  statusFilter = '';
  response = '';
  loading = false;

  constructor(private api: ApiService) {}

  search() {
    const fullQuery = [this.query, this.statusFilter ? `status ${this.statusFilter}` : ''].filter(Boolean).join(', ');
    if (!fullQuery) return;
    this.loading = true;
    this.api.searchLeads(fullQuery).subscribe({
      next: (res) => { this.response = res.response; this.loading = false; },
      error: (err) => { this.response = `Error: ${err.message}`; this.loading = false; },
    });
  }

  askAgent(question: string) {
    this.loading = true;
    this.api.runQuery(question, 'sales').subscribe({
      next: (res) => { this.response = res.response; this.loading = false; },
      error: (err) => { this.response = `Error: ${err.message}`; this.loading = false; },
    });
  }
}
