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
      <div class="d-flex gap-2 mb-3 align-items-center">
        <button class="btn btn-primary" [disabled]="!selectedScenario || loading"
                (click)="runSelected()">
          <i class="bi bi-play-fill"></i>
          {{ loading ? 'Running...' : 'Run Scenario' }}
          {{ selectedScenario ? '#' + selectedScenario.id : '' }}
        </button>
        <span class="flex-grow-1"></span>
        <button *ngIf="conversationId" class="btn btn-outline-secondary btn-sm" (click)="clearConversation()">
          <i class="bi bi-x-circle"></i> New Conversation
        </button>
      </div>

      <!-- Agent Selector + Freeform -->
      <div class="row g-2">
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="selectedAgent">
            <option *ngFor="let a of agents" [value]="a.id">{{ a.name }}</option>
          </select>
        </div>
        <div class="col-md-9">
          <div class="input-group">
            <input type="text" class="form-control" [(ngModel)]="freeformQuery"
                   placeholder="Ask any agent anything... e.g. 'What aging stock matches our EV leads?'"
                   (keyup.enter)="runFreeform()">
            <button class="btn btn-outline-primary" [disabled]="!freeformQuery || loading"
                    (click)="runFreeform()">
              <i class="bi bi-send"></i> Ask
            </button>
          </div>
        </div>
      </div>
      <div *ngIf="conversationId" class="mt-2">
        <small class="text-muted"><i class="bi bi-chat-dots"></i> Active conversation — follow-up questions use context from previous answers</small>
      </div>
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="text-center py-4">
      <div class="spinner-border text-primary mb-2"></div>
      <p class="text-muted">Agent processing your request...</p>
    </div>

    <!-- Response -->
    <div *ngIf="response && !loading" class="card stat-card p-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0 fw-bold"><i class="bi bi-robot text-primary"></i> Agent Response</h6>
        <span class="badge bg-success">Agent Builder</span>
      </div>
      <div class="agent-response" style="max-height:600px; overflow-y:auto; white-space:pre-wrap;">{{ response }}</div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!response && !loading" class="text-center text-muted py-5">
      <i class="bi bi-robot fs-1"></i>
      <p class="mt-2">Select a scenario or choose an agent and ask a question</p>
    </div>
  `,
})
export class AgentRunnerComponent {
  loading = false;
  response = '';
  freeformQuery = '';
  selectedScenario: Scenario | null = null;
  conversationId = '';
  selectedAgent = 'dealerpulse-orchestrator';

  scenarios: Scenario[] = [
    { id: 1, name: 'Instant Lead Response',     description: 'Customer submits lead at 9:47 PM for mid-size SUV',       agent: 'Consumer',      agentColor: 'danger' },
    { id: 2, name: 'Morning Sales Brief',        description: 'BDC agent prep with full customer intelligence',          agent: 'Sales',         agentColor: 'primary' },
    { id: 3, name: 'Diagnose Before Hood Opens', description: 'DTC P0300 + P0301: rough idle cold start',               agent: 'Service',       agentColor: 'info' },
    { id: 4, name: 'Aging Stock Alert',           description: '$385K exposure on 60+ day inventory',                    agent: 'Inventory',     agentColor: 'warning' },
    { id: 5, name: 'Lead + Inventory Match',      description: 'EV leads overnight match aging Atlas EVs',             agent: 'Multi-Agent',   agentColor: 'success' },
    { id: 6, name: 'Service → Sales Opportunity', description: 'Repeat repair triggers trade-up conversation',          agent: 'Multi-Agent',   agentColor: 'success' },
    { id: 7, name: 'Full Morning Briefing',        description: 'All 4 agents coordinate for dealer principal',          agent: 'All Agents',    agentColor: 'dark' },
  ];

  agents = [
    { id: 'dealerpulse-consumer-agent', name: 'Consumer (Sarah)', color: 'danger' },
    { id: 'dealerpulse-sales-agent', name: 'Sales (BDC)', color: 'primary' },
    { id: 'dealerpulse-service-agent', name: 'Service (Ron)', color: 'info' },
    { id: 'dealerpulse-inventory-agent', name: 'Inventory (Josh)', color: 'warning' },
    { id: 'dealerpulse-orchestrator', name: 'Orchestrator (GM)', color: 'dark' },
  ];

  constructor(private api: ApiService) {}

  selectScenario(s: Scenario) {
    this.selectedScenario = s;
  }

  runSelected() {
    if (!this.selectedScenario) return;
    this.loading = true;
    this.response = '';
    this.api.runV2Scenario(this.selectedScenario.id).subscribe({
      next: (res) => {
        this.response = res.response || res.error || 'No response';
        this.conversationId = res.conversation_id || '';
        this.loading = false;
      },
      error: (err) => { this.response = `Error: ${err.message}`; this.loading = false; },
    });
  }

  runFreeform() {
    if (!this.freeformQuery) return;
    this.loading = true;
    this.response = '';
    this.api.v2Chat(this.selectedAgent, this.freeformQuery, this.conversationId).subscribe({
      next: (res) => {
        this.response = res.response || res.error || 'No response';
        this.conversationId = res.conversation_id || '';
        this.loading = false;
      },
      error: (err) => { this.response = `Error: ${err.message}`; this.loading = false; },
    });
  }

  clearConversation() {
    this.conversationId = '';
    this.response = '';
    this.freeformQuery = '';
  }
}
