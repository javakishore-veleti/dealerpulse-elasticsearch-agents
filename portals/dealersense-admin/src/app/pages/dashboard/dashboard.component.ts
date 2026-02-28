import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <!-- KPI Cards Row -->
    <div class="row g-3 mb-4">
      <div class="col-md-3" *ngFor="let kpi of kpis">
        <div class="card stat-card p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="text-muted small">{{ kpi.label }}</div>
              <div class="fs-4 fw-bold">{{ kpi.value }}</div>
            </div>
            <i class="bi fs-2 text-primary" [ngClass]="kpi.icon"></i>
          </div>
          <small [ngClass]="kpi.trend > 0 ? 'text-success' : 'text-danger'">
            <i class="bi" [ngClass]="kpi.trend > 0 ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
            {{ kpi.trend }}% vs last week
          </small>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row g-3 mb-4">
      <div class="col-md-8">
        <div class="card stat-card p-3">
          <h6 class="mb-3">Quick Agent Actions</h6>
          <div class="d-flex flex-wrap gap-2">
            <button *ngFor="let s of quickScenarios" class="btn btn-outline-primary btn-sm"
                    (click)="runQuick(s.id)">
              <i class="bi" [ngClass]="s.icon"></i> {{ s.label }}
            </button>
          </div>
          <div *ngIf="quickResult" class="agent-response mt-3">{{ quickResult }}</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card stat-card p-3">
          <h6 class="mb-3">System Health</h6>
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge" [ngClass]="esConnected ? 'bg-success' : 'bg-danger'">●</span>
            Elasticsearch
          </div>
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge bg-secondary">●</span> LLM Provider
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-secondary">●</span> Kafka
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  esConnected = false;
  quickResult = '';
  loading = false;

  kpis = [
    { label: 'Active Leads',     value: '47',     icon: 'bi-people',             trend: 12 },
    { label: 'Vehicles in Stock', value: '312',   icon: 'bi-car-front',          trend: -3 },
    { label: 'Open Service ROs',  value: '28',    icon: 'bi-wrench-adjustable',  trend: 5 },
    { label: 'Aging > 60 Days',   value: '7',     icon: 'bi-exclamation-triangle', trend: -15 },
  ];

  quickScenarios = [
    { id: 7, label: 'Morning Briefing',   icon: 'bi-sunrise' },
    { id: 4, label: 'Aging Stock Alert',   icon: 'bi-clock-history' },
    { id: 5, label: 'Match Leads to Stock', icon: 'bi-link-45deg' },
  ];

  constructor(private api: ApiService) {}

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
