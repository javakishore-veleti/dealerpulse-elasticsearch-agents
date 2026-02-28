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
                 placeholder="e.g. SUV AWD under 45000, Blazer EV, aging stock..."
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

    <!-- AI-Powered Results -->
    <div *ngIf="response" class="agent-response mb-3">{{ response }}</div>

    <!-- Quick Queries -->
    <div *ngIf="!response" class="text-center text-muted py-4">
      <p>Try these:</p>
      <div class="d-flex flex-wrap justify-content-center gap-2">
        <button class="btn btn-outline-secondary btn-sm" (click)="query='aging stock over 60 days'; search()">
          Aging Stock (60+ days)
        </button>
        <button class="btn btn-outline-secondary btn-sm" (click)="query='EV SUV inventory'; search()">
          EV SUV Inventory
        </button>
        <button class="btn btn-outline-secondary btn-sm" (click)="query='Silverado 1500 in stock'; search()">
          Silverado 1500
        </button>
      </div>
    </div>
  `,
})
export class InventoryComponent {
  query = '';
  statusFilter = '';
  agingFilter = '';
  response = '';
  loading = false;

  constructor(private api: ApiService) {}

  search() {
    const fullQuery = [this.query, this.statusFilter ? `status: ${this.statusFilter}` : '',
      this.agingFilter ? `days on lot over ${this.agingFilter}` : ''].filter(Boolean).join(', ');
    if (!fullQuery) return;
    this.loading = true;
    this.response = '';
    this.api.searchInventory(fullQuery).subscribe({
      next: (res) => { this.response = res.response; this.loading = false; },
      error: (err) => { this.response = `Error: ${err.message}`; this.loading = false; },
    });
  }
}
