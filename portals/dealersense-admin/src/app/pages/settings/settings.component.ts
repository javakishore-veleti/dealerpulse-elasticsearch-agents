import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  template: `
    <div class="row g-4">
      <!-- LLM Configuration -->
      <div class="col-md-6">
        <div class="card stat-card p-3">
          <h6><i class="bi bi-cpu"></i> LLM Provider</h6>
          <hr>
          <div class="mb-3">
            <label class="form-label small">Provider</label>
            <select class="form-select" [(ngModel)]="settings.llmProvider">
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="ollama">Ollama (Local — Llama 3.1)</option>
            </select>
          </div>
          <div *ngIf="settings.llmProvider === 'openai'" class="mb-3">
            <label class="form-label small">OpenAI API Key</label>
            <input type="password" class="form-control" [(ngModel)]="settings.openaiKey"
                   placeholder="sk-...">
          </div>
          <div *ngIf="settings.llmProvider === 'openai'" class="mb-3">
            <label class="form-label small">Model</label>
            <select class="form-select" [(ngModel)]="settings.openaiModel">
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </select>
          </div>
          <div *ngIf="settings.llmProvider === 'ollama'" class="mb-3">
            <label class="form-label small">Ollama Model</label>
            <input type="text" class="form-control" [(ngModel)]="settings.ollamaModel"
                   placeholder="llama3.1:8b">
          </div>
        </div>
      </div>

      <!-- Elasticsearch Connection -->
      <div class="col-md-6">
        <div class="card stat-card p-3">
          <h6><i class="bi bi-database"></i> Elasticsearch</h6>
          <hr>
          <div class="mb-3">
            <label class="form-label small">URL</label>
            <input type="text" class="form-control" [(ngModel)]="settings.esUrl"
                   placeholder="http://localhost:9200">
          </div>
          <button class="btn btn-outline-primary btn-sm" (click)="testEsConnection()">
            <i class="bi bi-plug"></i> Test Connection
          </button>
          <span *ngIf="esTestResult" class="ms-2 small"
                [ngClass]="esTestResult === 'Connected' ? 'text-success' : 'text-danger'">
            {{ esTestResult }}
          </span>
        </div>
      </div>

      <!-- Dealer Information -->
      <div class="col-md-6">
        <div class="card stat-card p-3">
          <h6><i class="bi bi-building"></i> Dealer Information</h6>
          <hr>
          <div class="mb-3">
            <label class="form-label small">Dealership Name</label>
            <input type="text" class="form-control" [(ngModel)]="settings.dealerName"
                   placeholder="Prestige Chevrolet">
          </div>
          <div class="mb-3">
            <label class="form-label small">Location</label>
            <input type="text" class="form-control" [(ngModel)]="settings.dealerLocation"
                   placeholder="Charlotte, NC">
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="col-md-6">
        <div class="card stat-card p-3">
          <h6><i class="bi bi-database-gear"></i> Data Management</h6>
          <hr>
          <p class="small text-muted">Synthetic data for development and demos.</p>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-success btn-sm" (click)="loadData()">
              <i class="bi bi-cloud-upload"></i> Load Synthetic Data
            </button>
            <button class="btn btn-outline-danger btn-sm">
              <i class="bi bi-trash"></i> Reset All Data
            </button>
          </div>
          <div *ngIf="dataMessage" class="mt-2 small">{{ dataMessage }}</div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="mt-4">
      <button class="btn btn-primary" (click)="save()">
        <i class="bi bi-check-lg"></i> Save Settings
      </button>
      <span *ngIf="saved" class="ms-2 text-success small">✓ Saved</span>
    </div>
  `,
})
export class SettingsComponent {
  saved = false;
  esTestResult = '';
  dataMessage = '';

  settings = {
    llmProvider: 'openai',
    openaiKey: '',
    openaiModel: 'gpt-4o',
    ollamaModel: 'llama3.1:8b',
    esUrl: 'http://localhost:9200',
    dealerName: 'Prestige Chevrolet',
    dealerLocation: 'Charlotte, NC',
  };

  save() {
    // In a real app, this would POST to /api/settings
    this.saved = true;
    setTimeout(() => this.saved = false, 3000);
  }

  testEsConnection() {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => this.esTestResult = data.elasticsearch ? 'Connected' : 'Unreachable')
      .catch(() => this.esTestResult = 'Failed');
  }

  loadData() {
    this.dataMessage = 'Loading... (run npm run data:load in terminal)';
  }
}
