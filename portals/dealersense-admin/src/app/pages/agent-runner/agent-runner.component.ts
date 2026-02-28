import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

interface Scenario {
  id: number;
  name: string;
  description: string;
  agent: string;
  agentColor: string;
}

@Component({
  selector: 'app-agent-runner',
  template: `
    <!-- Scenario Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-6 col-lg-4" *ngFor="let s of scenarios">
        <div class="card stat-card p-3 h-100" style="cursor: pointer"
             [class.border-primary]="selectedScenario?.id === s.id"
             (click)="selectScenario(s)">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="fw-bold">#{{ s.id }} {{ s.name }}</span>
            <span class="badge" [ngClass]="'bg-' + s.agentColor">{{ s.agent }}</span>
          </div>
          <small class="text-muted">{{ s.description }}</small>
        </div>
      </div>
    </div>

    <!-- Run Panel -->
    <div class="card stat-card p-3 mb-3">
      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-primary" [disabled]="!selectedScenario || loading"
                (click)="runSelected()">
          <i class="bi bi-play-fill"></i>
          {{ loading ? 'Running...' : 'Run Scenario' }}
          {{ selectedScenario ? '#' + selectedScenario.id : '' }}
        </button>
        <span class="flex-grow-1"></span>
      </div>

      <!-- Freeform query -->
      <div class="input-group">
        <input type="text" class="form-control" [(ngModel)]="freeformQuery"
               placeholder="Or ask anything... e.g. 'What aging stock matches our EV leads?'"
               (keyup.enter)="runFreeform()">
        <button class="btn btn-outline-primary" [disabled]="!freeformQuery || loading"
                (click)="runFreeform()">
          <i class="bi bi-send"></i> Ask
        </button>
      </div>
    </div>

    <!-- Response -->
    <div *ngIf="response" class="agent-response">{{ response }}</div>
    <div *ngIf="!response && !loading" class="text-center text-muted py-5">
      <i class="bi bi-robot fs-1"></i>
      <p class="mt-2">Select a scenario or type a question to get started</p>
    </div>
  `,
})
export class AgentRunnerComponent {
  loading = false;
  response = '';
  freeformQuery = '';
  selectedScenario: Scenario | null = null;

  scenarios: Scenario[] = [
    { id: 1, name: 'Instant Lead Response',     description: 'Customer submits lead at 9:47 PM for mid-size SUV',       agent: 'Consumer',      agentColor: 'success' },
    { id: 2, name: 'Morning Sales Brief',        description: 'BDC agent prep with full customer intelligence',          agent: 'Sales',         agentColor: 'warning' },
    { id: 3, name: 'Diagnose Before Hood Opens', description: 'DTC P0300 + P0301: rough idle cold start',               agent: 'Service',       agentColor: 'danger' },
    { id: 4, name: 'Aging Stock Alert',           description: '$385K exposure on 60+ day inventory',                    agent: 'Inventory',     agentColor: 'info' },
    { id: 5, name: 'Lead + Inventory Match',      description: 'EV leads overnight match aging Atlas EVs',             agent: 'Multi-Agent',   agentColor: 'primary' },
    { id: 6, name: 'Service → Sales Opportunity', description: 'Repeat repair triggers trade-up conversation',          agent: 'Multi-Agent',   agentColor: 'primary' },
    { id: 7, name: 'Full Morning Briefing',        description: 'All 4 agents coordinate for dealer principal',          agent: 'All Agents',    agentColor: 'dark' },
  ];

  constructor(private api: ApiService) {}

  selectScenario(s: Scenario) {
    this.selectedScenario = s;
  }

  runSelected() {
    if (!this.selectedScenario) return;
    this.loading = true;
    this.response = '';
    this.api.runScenario(this.selectedScenario.id).subscribe({
      next: (res) => { this.response = res.response; this.loading = false; },
      error: (err) => { this.response = `Error: ${err.message}`; this.loading = false; },
    });
  }

  runFreeform() {
    if (!this.freeformQuery) return;
    this.loading = true;
    this.response = '';
    this.api.runQuery(this.freeformQuery).subscribe({
      next: (res) => { this.response = res.response; this.loading = false; },
      error: (err) => { this.response = `Error: ${err.message}`; this.loading = false; },
    });
  }
}
