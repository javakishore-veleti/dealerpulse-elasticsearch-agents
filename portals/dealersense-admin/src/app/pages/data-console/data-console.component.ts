import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

interface IndexInfo {
  index: string;
  exists: boolean;
  doc_count: number;
  loading?: boolean;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-data-console',
  template: `
    <div class="row g-3">

      <!-- Panel 1: ES Health -->
      <div class="col-md-6">
        <div class="card stat-card p-3">
          <h6 class="mb-3 fw-bold"><i class="bi bi-heart-pulse text-danger"></i> Elasticsearch Connection</h6>
          <div class="d-flex align-items-center gap-3 mb-3">
            <span class="health-dot" [ngClass]="esHealthy ? 'healthy' : 'unhealthy'"></span>
            <span class="fw-medium fs-5">{{ esHealthy ? 'Connected' : 'Disconnected' }}</span>
          </div>
          <div *ngIf="esCluster" class="agent-response" style="max-height:150px; font-size:0.8rem;">{{ esCluster | json }}</div>
          <button class="btn btn-outline-primary btn-sm mt-2" (click)="checkHealth()" [disabled]="checking">
            <i class="bi bi-arrow-clockwise" [class.spin]="checking"></i> {{ checking ? 'Checking...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Panel 2: Quick Actions -->
      <div class="col-md-6">
        <div class="card stat-card p-3">
          <h6 class="mb-3 fw-bold"><i class="bi bi-lightning-charge text-warning"></i> Quick Actions</h6>
          <div class="d-flex flex-wrap gap-2">
            <button class="quick-action-btn" (click)="loadAll()" [disabled]="loadingAll">
              <i class="bi bi-cloud-download text-primary"></i> {{ loadingAll ? 'Loading...' : 'Load All Data' }}
            </button>
            <button class="quick-action-btn action-warning" (click)="resetAll()" [disabled]="resettingAll">
              <i class="bi bi-trash text-danger"></i> {{ resettingAll ? 'Resetting...' : 'Reset All Data' }}
            </button>
            <button class="quick-action-btn action-success" (click)="refreshIndices()">
              <i class="bi bi-arrow-repeat text-success"></i> Refresh Counts
            </button>
          </div>
          <div *ngIf="actionMessage" class="alert mt-3 mb-0"
               [ngClass]="actionSuccess ? 'alert-success' : 'alert-danger'">
            {{ actionMessage }}
          </div>
        </div>
      </div>

      <!-- Panel 3: Index Manager -->
      <div class="col-12">
        <div class="card stat-card p-3">
          <h6 class="mb-3 fw-bold"><i class="bi bi-database text-primary"></i> Index Manager</h6>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Status</th>
                  <th>Documents</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let idx of indices">
                  <td>
                    <i class="bi" [ngClass]="idx.icon" style="color: #3b82f6;"></i>
                    <strong class="ms-2">{{ idx.label }}</strong>
                    <br><small class="text-muted">{{ idx.index }}</small>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="idx.exists ? 'bg-success' : 'bg-secondary'">
                      {{ idx.exists ? 'Active' : 'Not Created' }}
                    </span>
                  </td>
                  <td>
                    <span class="fs-5 fw-bold" [style.color]="idx.doc_count > 0 ? '#10b981' : '#94a3b8'">
                      {{ idx.doc_count }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-outline-primary" (click)="loadIndex(idx)" [disabled]="idx.loading">
                        <i class="bi" [ngClass]="idx.loading ? 'bi-hourglass-split' : 'bi-cloud-download'"></i>
                        {{ idx.loading ? 'Loading...' : 'Load' }}
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="resetIndex(idx)" [disabled]="idx.loading">
                        <i class="bi bi-trash"></i> Reset
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-3 d-flex justify-content-between align-items-center">
            <span class="text-muted">
              Total: <strong>{{ totalDocs }}</strong> documents across <strong>{{ activeIndices }}</strong> indices
            </span>
            <span class="badge" [ngClass]="allLoaded ? 'bg-success' : 'bg-warning'">
              {{ allLoaded ? '✓ All Data Loaded' : '⚠ Data Missing' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Panel 4: Scenario Tester -->
      <div class="col-12">
        <div class="card stat-card p-3">
          <h6 class="mb-3 fw-bold"><i class="bi bi-play-circle text-success"></i> Scenario Tester</h6>
          <div class="row g-2 mb-3">
            <div *ngFor="let s of scenarios" class="col-md-4">
              <div class="scenario-card p-3" [class.selected]="selectedScenario === s.id"
                   (click)="selectedScenario = s.id">
                <div class="d-flex justify-content-between align-items-start">
                  <strong>#{{ s.id }} {{ s.name }}</strong>
                  <span class="badge" [ngClass]="s.badgeClass">{{ s.badge }}</span>
                </div>
                <small class="text-muted">{{ s.description }}</small>
              </div>
            </div>
          </div>
          <button class="btn btn-success btn-lg" (click)="runTest()" [disabled]="!selectedScenario || testRunning">
            <i class="bi" [ngClass]="testRunning ? 'bi-hourglass-split' : 'bi-play-fill'"></i>
            {{ testRunning ? 'Running Scenario ' + selectedScenario + '...' : 'Run Scenario ' + (selectedScenario || '') }}
          </button>
          <div *ngIf="testResult" class="agent-response mt-3">{{ testResult }}</div>
          <div *ngIf="testError" class="alert alert-danger mt-3">{{ testError }}</div>
        </div>
      </div>

    </div>
  `,
})
export class DataConsoleComponent implements OnInit {
  esHealthy = false;
  esCluster: any = null;
  checking = false;

  loadingAll = false;
  resettingAll = false;
  actionMessage = '';
  actionSuccess = false;

  selectedScenario: number | null = null;
  testRunning = false;
  testResult = '';
  testError = '';

  indices: IndexInfo[] = [
    { index: 'dealer-inventory', exists: false, doc_count: 0, label: 'Inventory', icon: 'bi-car-front' },
    { index: 'dealer-leads', exists: false, doc_count: 0, label: 'Leads', icon: 'bi-people' },
    { index: 'dealer-service-orders', exists: false, doc_count: 0, label: 'Service Orders', icon: 'bi-wrench-adjustable' },
    { index: 'dealer-incentives', exists: false, doc_count: 0, label: 'Incentives', icon: 'bi-tags' },
    { index: 'dealer-pricing-alerts', exists: false, doc_count: 0, label: 'Pricing Alerts', icon: 'bi-graph-up-arrow' },
    { index: 'dealer-tsb-recalls', exists: false, doc_count: 0, label: 'TSBs & Recalls', icon: 'bi-shield-exclamation' },
  ];

  scenarios = [
    { id: 1, name: 'Instant Lead Response', badge: 'Consumer', badgeClass: 'bg-danger', description: 'Customer submits lead at 9:47 PM' },
    { id: 2, name: 'Morning Sales Brief', badge: 'Sales', badgeClass: 'bg-primary', description: 'BDC agent prep with full intelligence' },
    { id: 3, name: 'Diagnose Before Hood Opens', badge: 'Service', badgeClass: 'bg-info', description: 'DTC P0300+P0301: rough idle cold start' },
    { id: 4, name: 'Aging Stock Alert', badge: 'Inventory', badgeClass: 'bg-warning text-dark', description: '$385K exposure on 60+ day inventory' },
    { id: 5, name: 'Lead + Inventory Match', badge: 'Multi-Agent', badgeClass: 'bg-success', description: 'EV leads overnight match aging Blazer EVs' },
    { id: 6, name: 'Service → Sales Opportunity', badge: 'Multi-Agent', badgeClass: 'bg-success', description: 'Repeat repair triggers trade-up' },
    { id: 7, name: 'Full Morning Briefing', badge: 'All Agents', badgeClass: 'bg-dark', description: 'All 4 agents coordinate for dealer principal' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.checkHealth();
    this.refreshIndices();
  }

  get totalDocs() { return this.indices.reduce((sum, i) => sum + i.doc_count, 0); }
  get activeIndices() { return this.indices.filter(i => i.exists).length; }
  get allLoaded() { return this.indices.every(i => i.doc_count > 0); }

  checkHealth() {
    this.checking = true;
    this.api.healthCheck().subscribe({
      next: (res) => {
        this.esHealthy = res.status === 'ok';
        this.esCluster = res;
        this.checking = false;
      },
      error: () => { this.esHealthy = false; this.checking = false; }
    });
  }

  refreshIndices() {
    this.api.getIndices().subscribe({
      next: (res) => {
        if (res.indices) {
          res.indices.forEach((remote: any) => {
            const local = this.indices.find(i => i.index === remote.index);
            if (local) {
              local.exists = remote.exists;
              local.doc_count = remote.doc_count;
            }
          });
        }
      },
      error: () => {}
    });
  }

  loadAll() {
    this.loadingAll = true;
    this.actionMessage = '';
    this.api.loadAllData().subscribe({
      next: (res) => {
        this.loadingAll = false;
        this.actionSuccess = res.success;
        this.actionMessage = res.success ? 'All data loaded successfully!' : (res.error || 'Load failed');
        this.refreshIndices();
      },
      error: (err) => {
        this.loadingAll = false;
        this.actionSuccess = false;
        this.actionMessage = 'Failed to connect to backend';
      }
    });
  }

  resetAll() {
    if (!confirm('This will DELETE all 6 indices. Continue?')) return;
    this.resettingAll = true;
    this.actionMessage = '';
    this.api.resetAllData().subscribe({
      next: (res) => {
        this.resettingAll = false;
        this.actionSuccess = res.success;
        this.actionMessage = res.success ? `Deleted: ${res.deleted?.join(', ')}` : (res.error || 'Reset failed');
        this.refreshIndices();
      },
      error: () => {
        this.resettingAll = false;
        this.actionSuccess = false;
        this.actionMessage = 'Failed to connect to backend';
      }
    });
  }

  loadIndex(idx: IndexInfo) {
    idx.loading = true;
    this.api.loadIndexData(idx.index).subscribe({
      next: (res) => {
        idx.loading = false;
        this.refreshIndices();
      },
      error: () => { idx.loading = false; }
    });
  }

  resetIndex(idx: IndexInfo) {
    if (!confirm(`Delete ${idx.label} index?`)) return;
    idx.loading = true;
    this.api.resetIndex(idx.index).subscribe({
      next: () => {
        idx.loading = false;
        idx.exists = false;
        idx.doc_count = 0;
      },
      error: () => { idx.loading = false; }
    });
  }

  runTest() {
    if (!this.selectedScenario) return;
    this.testRunning = true;
    this.testResult = '';
    this.testError = '';
    this.api.testScenario(this.selectedScenario).subscribe({
      next: (res) => {
        this.testRunning = false;
        if (res.success) {
          this.testResult = typeof res.response === 'string' ? res.response : JSON.stringify(res.response, null, 2);
        } else {
          this.testError = res.error || 'Scenario failed';
        }
      },
      error: (err) => {
        this.testRunning = false;
        this.testError = 'Failed to connect to backend. Is the API running on :8000?';
      }
    });
  }
}