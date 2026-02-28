import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-inventory',
  template: `
    <!-- Search Bar -->
    <div class="card stat-card p-3 mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-5">
          <label class="form-label small">Search Inventory</label>
          <input type="text" class="form-control" [(ngModel)]="query"
                 placeholder="e.g. SUV AWD under 45000, Atlas EV, aging stock..."
                 (keyup.enter)="search()">
        </div>
        <div class="col-md-2">
          <label class="form-label small">Status</label>
          <select class="form-select" [(ngModel)]="statusFilter">
            <option value="">All</option>
            <option value="in_stock">In Stock</option>
            <option value="in_transit">In Transit</option>
            <option value="service_hold">Service Hold</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label small">Days on Lot</label>
          <select class="form-select" [(ngModel)]="agingFilter">
            <option value="">All</option>
            <option value="30">30+ days</option>
            <option value="45">45+ days</option>
            <option value="60">60+ days (critical)</option>
          </select>
        </div>
        <div class="col-md-3">
          <button class="btn btn-primary w-100" (click)="search()" [disabled]="loading">
            <i class="bi bi-search"></i> {{ loading ? 'Searching...' : 'Search' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="d-flex flex-wrap gap-2 mb-3">
      <button class="btn btn-outline-danger btn-sm" (click)="askAgent('Show all aging stock over 60 days with total capital exposure by model. Recommend specific price adjustments.')">
        <i class="bi bi-clock-history"></i> Aging Stock Report
      </button>
      <button class="btn btn-outline-warning btn-sm" (click)="askAgent('Find all vehicles priced above market average. Show the delta and recommend repricing.')">
        <i class="bi bi-graph-up-arrow"></i> Pricing Alerts
      </button>
      <button class="btn btn-outline-success btn-sm" (click)="askAgent('Which vehicles have active incentives right now? Show the best stacking opportunities.')">
        <i class="bi bi-tags"></i> Incentive Opportunities
      </button>
      <button class="btn btn-outline-primary btn-sm" (click)="askAgent('Give me a full inventory health report: total units, average days on lot, turn rate, and risk assessment.')">
        <i class="bi bi-clipboard-data"></i> Health Report
      </button>
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="text-center py-4">
      <div class="spinner-border text-warning mb-2"></div>
      <p class="text-muted">Inventory Agent analyzing stock...</p>
    </div>

    <!-- Response -->
    <div *ngIf="response && !loading" class="card stat-card p-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0 fw-bold"><i class="bi bi-robot text-warning"></i> Inventory Agent (Josh)</h6>
        <span class="badge bg-success">Agent Builder</span>
      </div>
      <div class="agent-response" style="max-height:500px; overflow-y:auto; white-space:pre-wrap;">{{ response }}</div>
      <div *ngIf="conversationId" class="mt-3 d-flex flex-wrap gap-2">
        <strong class="me-2">Follow-up:</strong>
        <button class="btn btn-sm btn-outline-danger" (click)="askAgent('For the aging stock you identified, match them to any active customer leads who might be interested.')">
          <i class="bi bi-link-45deg"></i> Match to Leads
        </button>
        <button class="btn btn-sm btn-outline-warning" (click)="askAgent('What happens if we take no action on the aging stock? Give me the 30-day risk assessment.')">
          <i class="bi bi-exclamation-triangle"></i> Risk Assessment
        </button>
        <button class="btn btn-sm btn-outline-success" (click)="askAgent('Draft a price adjustment memo for the inventory manager with specific dollar amounts for each vehicle.')">
          <i class="bi bi-file-text"></i> Price Memo
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!response && !loading" class="text-center text-muted py-4">
      <i class="bi bi-car-front fs-1 d-block mb-2"></i>
      <p>Search inventory or use the quick actions above to get AI-powered insights.</p>
    </div>
  `,
})
export class InventoryComponent {
  query = '';
  statusFilter = '';
  agingFilter = '';
  response = '';
  loading = false;
  conversationId = '';

  constructor(private api: ApiService) {}

  search() {
    const fullQuery = [this.query, this.statusFilter ? `status: ${this.statusFilter}` : '',
      this.agingFilter ? `days on lot over ${this.agingFilter}` : ''].filter(Boolean).join(', ');
    if (!fullQuery) return;
    this.loading = true;
    this.response = '';
    this.api.v2Chat('dealerpulse-inventory-agent', `Search inventory: ${fullQuery}`).subscribe({
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
    this.api.v2Chat('dealerpulse-inventory-agent', question, this.conversationId).subscribe({
      next: (res) => {
        this.response = res.response || res.error || 'No response';
        this.conversationId = res.conversation_id || '';
        this.loading = false;
      },
      error: (err) => { this.response = `Error: ${err.message}`; this.loading = false; },
    });
  }
}
