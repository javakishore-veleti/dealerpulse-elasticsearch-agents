import { Component, OnInit } from '@angular/core';

interface ServiceInfo {
  name: string;
  port: number;
  status: 'up' | 'down' | 'unknown';
  url?: string;
  group: string;
}

@Component({
  selector: 'app-devops',
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div></div>
      <button class="btn btn-outline-primary btn-sm" (click)="checkAll()">
        <i class="bi bi-arrow-clockwise"></i> Refresh All
      </button>
    </div>

    <!-- Group: Core Infrastructure -->
    <div *ngFor="let group of groups" class="mb-4">
      <h6 class="text-muted mb-2">{{ group }}</h6>
      <div class="row g-2">
        <div *ngFor="let svc of servicesByGroup(group)" class="col-md-4">
          <div class="card stat-card p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="fw-bold">{{ svc.name }}</div>
                <small class="text-muted">Port {{ svc.port }}</small>
              </div>
              <span class="badge" [ngClass]="{
                'bg-success': svc.status === 'up',
                'bg-danger': svc.status === 'down',
                'bg-secondary': svc.status === 'unknown'
              }">{{ svc.status | uppercase }}</span>
            </div>
            <a *ngIf="svc.url && svc.status === 'up'" [href]="svc.url" target="_blank"
               class="small mt-1">
              <i class="bi bi-box-arrow-up-right"></i> Open UI
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Terminal hint -->
    <div class="card stat-card p-3">
      <h6>Terminal Commands</h6>
      <pre class="bg-dark text-light p-3 rounded small mb-0">
# Start everything
npm run docker:up

# Start specific services
npm run docker:es        # Elasticsearch + Kibana
npm run docker:pg        # PostgreSQL + pgVector
npm run docker:kafka     # Kafka + Kafka UI

# Check status
npm run docker:status

# Stop (keep data)
npm run docker:down

# Nuclear reset
npm run docker:destroy</pre>
    </div>
  `,
})
export class DevopsComponent implements OnInit {
  groups = ['Core Infrastructure', 'Vector Databases', 'Observability', 'Workflow'];

  services: ServiceInfo[] = [
    { name: 'Elasticsearch',  port: 9200,  status: 'unknown', url: undefined,                    group: 'Core Infrastructure' },
    { name: 'Kibana',         port: 5601,  status: 'unknown', url: 'http://localhost:5601',      group: 'Core Infrastructure' },
    { name: 'PostgreSQL',     port: 5432,  status: 'unknown', url: undefined,                    group: 'Core Infrastructure' },
    { name: 'Kafka',          port: 9092,  status: 'unknown', url: undefined,                    group: 'Core Infrastructure' },
    { name: 'Kafka UI',       port: 8080,  status: 'unknown', url: 'http://localhost:8080',      group: 'Core Infrastructure' },
    { name: 'Qdrant',         port: 6333,  status: 'unknown', url: 'http://localhost:6333/dashboard', group: 'Vector Databases' },
    { name: 'Weaviate',       port: 8081,  status: 'unknown', url: undefined,                    group: 'Vector Databases' },
    { name: 'Milvus',         port: 19530, status: 'unknown', url: undefined,                    group: 'Vector Databases' },
    { name: 'ChromaDB',       port: 8082,  status: 'unknown', url: undefined,                    group: 'Vector Databases' },
    { name: 'Prometheus',     port: 9090,  status: 'unknown', url: 'http://localhost:9090',      group: 'Observability' },
    { name: 'Grafana',        port: 3000,  status: 'unknown', url: 'http://localhost:3000',      group: 'Observability' },
    { name: 'OTel Collector', port: 4317,  status: 'unknown', url: undefined,                    group: 'Observability' },
    { name: 'n8n',            port: 5678,  status: 'unknown', url: 'http://localhost:5678',      group: 'Workflow' },
  ];

  constructor() {}

  ngOnInit() {
    this.checkAll();
  }

  servicesByGroup(group: string): ServiceInfo[] {
    return this.services.filter(s => s.group === group);
  }

  checkAll() {
    // For services with HTTP UIs, we can try a quick fetch
    // Most will fail due to CORS in browser, so this is best-effort
    this.services.forEach(svc => {
      if (svc.url) {
        fetch(svc.url, { mode: 'no-cors', signal: AbortSignal.timeout(2000) })
          .then(() => svc.status = 'up')
          .catch(() => svc.status = 'down');
      }
    });
    // Check ES through our backend proxy (avoids CORS)
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        const esSvc = this.services.find(s => s.name === 'Elasticsearch');
        if (esSvc) esSvc.status = data.elasticsearch ? 'up' : 'down';
      })
      .catch(() => {});
  }
}
