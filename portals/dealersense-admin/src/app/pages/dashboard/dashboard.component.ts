import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <!-- Greeting Banner -->
    <div class="greeting-banner">
      <h4><i class="bi bi-sunrise"></i> Good {{ timeOfDay }}, welcome to DealerPulse</h4>
      <p>Here's what's happening at your dealership right now.</p>
    </div>

    <!-- KPI Cards Row -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card stat-card stat-card-blue p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="text-muted small">Active Leads</div>
              <div class="fs-3 fw-bold">47</div>
            </div>
            <i class="bi bi-people fs-1"></i>
          </div>
          <small><i class="bi bi-arrow-up"></i> 12% vs last week</small>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stat-card stat-card-cyan p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="text-muted small">Vehicles in Stock</div>
              <div class="fs-3 fw-bold">312</div>
            </div>
            <i class="bi bi-car-front fs-1"></i>
          </div>
          <small><i class="bi bi-arrow-down"></i> -3% vs last week</small>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stat-card stat-card-emerald p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="text-muted small">Open Service ROs</div>
              <div class="fs-3 fw-bold">28</div>
            </div>
            <i class="bi bi-wrench-adjustable fs-1"></i>
          </div>
          <small><i class="bi bi-arrow-up"></i> 5% vs last week</small>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stat-card stat-card-amber p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="text-muted small">Aging > 60 Days</div>
              <div class="fs-3 fw-bold">7</div>
            </div>
            <i class="bi bi-exclamation-triangle fs-1"></i>
          </div>
          <small><i class="bi bi-arrow-down"></i> -15% vs last week</small>
        </div>
      </div>
    </div>

    <!-- Quick Actions + Health -->
    <div class="row g-3 mb-4">
      <div class="col-md-8">
        <div class="card stat-card p-3">
          <h6 class="mb-3 fw-bold"><i class="bi bi-lightning-charge text-primary"></i> Quick Agent Actions</h6>
          <div class="d-flex flex-wrap gap-2">
            <button class="quick-action-btn" (click)="runQuick(7)">
              <i class="bi bi-sunrise text-primary"></i> Morning Briefing
            </button>
            <button class="quick-action-btn action-warning" (click)="runQuick(4)">
              <i class="bi bi-clock-history text-warning"></i> Aging Stock Alert
            </button>
            <button class="quick-action-btn action-success" (click)="runQuick(5)">
              <i class="bi bi-link-45deg text-success"></i> Match Leads to Stock
            </button>
          </div>
          <div *ngIf="quickResult" class="agent-response mt-3">{{ quickResult }}</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card stat-card p-3">
          <h6 class="mb-3 fw-bold"><i class="bi bi-heart-pulse text-danger"></i> System Health</h6>
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="health-dot" [ngClass]="esConnected ? 'healthy' : 'unhealthy'"></span>
            <span class="fw-medium">Elasticsearch</span>
          </div>
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="health-dot unknown"></span>
            <span class="fw-medium">LLM Provider</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="health-dot unknown"></span>
            <span class="fw-medium">Kafka</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  esConnected = false;
  quickResult = '';
  timeOfDay = '';

  constructor(private api: ApiService) {
    const hour = new Date().getHours();
    if (hour < 12) this.timeOfDay = 'morning';
    else if (hour < 17) this.timeOfDay = 'afternoon';
    else this.timeOfDay = 'evening';
  }

  ngOnInit() {
    this.api.healthCheck().subscribe({
      next: (res) => this.esConnected = res.status === 'ok',
      error: () => this.esConnected = false,
    });
  }

  runQuick(scenarioId: number) {
    this.quickResult = 'Running agent...';
    this.api.runScenario(scenarioId).subscribe({
      next: (res) => this.quickResult = res.response,
      error: (err) => this.quickResult = `Error: ${err.message}`,
    });
  }
}