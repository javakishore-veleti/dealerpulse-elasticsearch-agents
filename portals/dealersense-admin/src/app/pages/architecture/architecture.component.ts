import { Component } from '@angular/core';

@Component({
  selector: 'app-architecture',
  template: `
    <div class="row g-3">

      <!-- Hero Banner -->
      <div class="col-12">
        <div class="greeting-banner">
          <h4><i class="bi bi-diagram-3"></i> DealerPulse — Multi-Agent Architecture</h4>
          <p>How 5 AI agents, 3 Elasticsearch tools, and 6 data indices connect four disconnected dealership departments into one intelligent system.</p>
        </div>
      </div>

      <!-- Tier 01: Core -->
      <div class="col-12">
        <div class="card stat-card p-4">
          <div class="d-flex align-items-center gap-3 mb-3">
            <span class="tier-badge tier-core">01</span>
            <div>
              <h5 class="mb-0 fw-bold">Core Layer — Data & Intelligence Foundation</h5>
              <small class="text-muted">The data backbone that every agent reads from and writes to</small>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-3" *ngFor="let item of coreTier">
              <div class="tier-card tier-card-core">
                <i class="bi" [ngClass]="item.icon"></i>
                <strong>{{ item.title }}</strong>
                <p>{{ item.desc }}</p>
                <div class="tier-tags">
                  <span *ngFor="let t of item.tags" class="tier-tag">{{ t }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tier 02: Middle -->
      <div class="col-12">
        <div class="card stat-card p-4">
          <div class="d-flex align-items-center gap-3 mb-3">
            <span class="tier-badge tier-middle">02</span>
            <div>
              <h5 class="mb-0 fw-bold">Middle Layer — Agent Reasoning & Orchestration</h5>
              <small class="text-muted">Where agents think, plan multi-step actions, and share context</small>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-3" *ngFor="let item of middleTier">
              <div class="tier-card tier-card-middle">
                <i class="bi" [ngClass]="item.icon"></i>
                <strong>{{ item.title }}</strong>
                <p>{{ item.desc }}</p>
                <div class="tier-tags">
                  <span *ngFor="let t of item.tags" class="tier-tag">{{ t }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tier 03: Advanced -->
      <div class="col-12">
        <div class="card stat-card p-4">
          <div class="d-flex align-items-center gap-3 mb-3">
            <span class="tier-badge tier-advanced">03</span>
            <div>
              <h5 class="mb-0 fw-bold">Advanced Layer — Multi-Agent Collaboration & Autonomy</h5>
              <small class="text-muted">Agents coordinate across departments, make decisions, and act independently</small>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-3" *ngFor="let item of advancedTier">
              <div class="tier-card tier-card-advanced">
                <i class="bi" [ngClass]="item.icon"></i>
                <strong>{{ item.title }}</strong>
                <p>{{ item.desc }}</p>
                <div class="tier-tags">
                  <span *ngFor="let t of item.tags" class="tier-tag">{{ t }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Agent Roster -->
      <div class="col-12">
        <div class="card stat-card p-4">
          <h5 class="fw-bold mb-3"><i class="bi bi-people-fill text-primary"></i> Agent Roster</h5>
          <div class="row g-3">
            <div class="col-md-4 col-lg" *ngFor="let agent of agents">
              <div class="agent-card" [style.border-left-color]="agent.color">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <strong>{{ agent.name }}</strong>
                  <span class="badge" [style.background]="agent.color">{{ agent.persona }}</span>
                </div>
                <p class="mb-2">{{ agent.role }}</p>
                <div class="tier-tags">
                  <span *ngFor="let t of agent.tools" class="tier-tag">{{ t }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scenario Map -->
      <div class="col-12">
        <div class="card stat-card p-4">
          <h5 class="fw-bold mb-3"><i class="bi bi-signpost-split text-success"></i> Scenario Map — Data Flow</h5>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Scenario</th>
                  <th>Agents Involved</th>
                  <th>ES Tools Used</th>
                  <th>Complexity</th>
                  <th>Business Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of scenarioMap">
                  <td><strong>{{ s.id }}</strong></td>
                  <td>{{ s.name }}</td>
                  <td>
                    <span *ngFor="let a of s.agents" class="badge me-1" [style.background]="agentColor(a)">{{ a }}</span>
                  </td>
                  <td>
                    <span *ngFor="let t of s.tools" class="tier-tag me-1">{{ t }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="s.complexity === 'Single' ? 'bg-secondary' : s.complexity === 'Multi' ? 'bg-primary' : 'bg-dark'">
                      {{ s.complexity }}
                    </span>
                  </td>
                  <td><small>{{ s.impact }}</small></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ES Index Schema -->
      <div class="col-12">
        <div class="card stat-card p-4">
          <h5 class="fw-bold mb-3"><i class="bi bi-database text-info"></i> Elasticsearch Index Schema</h5>
          <div class="row g-3">
            <div class="col-md-4" *ngFor="let idx of indexSchema">
              <div class="tier-card tier-card-core">
                <i class="bi" [ngClass]="idx.icon"></i>
                <strong>{{ idx.name }}</strong>
                <p>{{ idx.desc }}</p>
                <small class="text-muted">Key fields: {{ idx.fields }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Business Value -->
      <div class="col-12">
        <div class="card stat-card p-4">
          <h5 class="fw-bold mb-3"><i class="bi bi-graph-up-arrow text-warning"></i> Measurable Business Impact</h5>
          <div class="row g-3">
            <div class="col-md-3" *ngFor="let kpi of businessValue">
              <div class="stat-card p-3" [ngClass]="kpi.cardClass">
                <small>{{ kpi.metric }}</small>
                <div class="d-flex align-items-baseline gap-2 mt-1">
                  <span class="fs-4 fw-bold">{{ kpi.after }}</span>
                  <small style="text-decoration: line-through; opacity:0.6;">{{ kpi.before }}</small>
                </div>
                <small>{{ kpi.impact }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .tier-badge {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; font-weight: 800; color: white;
    }
    .tier-core { background: linear-gradient(135deg, #10b981, #059669); }
    .tier-middle { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .tier-advanced { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }

    .tier-card {
      padding: 16px; border-radius: 12px; height: 100%;
      border: 1px solid #e2e8f0; transition: all 0.2s;
    }
    .tier-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .tier-card i { font-size: 1.5rem; display: block; margin-bottom: 8px; }
    .tier-card strong { display: block; margin-bottom: 6px; font-size: 1.05rem; }
    .tier-card p { font-size: 0.9rem; color: #64748b; margin-bottom: 8px; }

    .tier-card-core { border-left: 4px solid #10b981; }
    .tier-card-core i { color: #10b981; }
    .tier-card-middle { border-left: 4px solid #3b82f6; }
    .tier-card-middle i { color: #3b82f6; }
    .tier-card-advanced { border-left: 4px solid #8b5cf6; }
    .tier-card-advanced i { color: #8b5cf6; }

    .tier-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .tier-tag {
      background: #f1f5f9; color: #475569; padding: 2px 8px;
      border-radius: 6px; font-size: 0.78rem; font-weight: 500;
    }

    .agent-card {
      padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;
      border-left: 4px solid #94a3b8; height: 100%;
    }
    .agent-card p { font-size: 0.9rem; color: #64748b; }
  `]
})
export class ArchitectureComponent {

  coreTier = [
    { title: 'Cloud Infrastructure', icon: 'bi-cloud', desc: 'Docker Compose orchestrates Elasticsearch, Kibana, and Ollama containers with health checks and persistent volumes.', tags: ['Docker', 'ES 8.17', 'Kibana'] },
    { title: 'LLM Providers', icon: 'bi-cpu', desc: 'Configurable LLM backend — switch between OpenAI GPT-4o and local Ollama models via a single environment variable.', tags: ['GPT-4o', 'Ollama', 'Llama 3.1'] },
    { title: 'Enterprise Data', icon: 'bi-database', desc: 'Six Elasticsearch indices store structured dealership data — inventory, leads, service orders, incentives, pricing, and TSBs.', tags: ['6 Indices', '1,230+ Docs'] },
    { title: 'APIs & Tools', icon: 'bi-tools', desc: 'Three specialized ES tools that agents invoke: full-text Search, ES|QL analytics queries, and multi-step Workflows.', tags: ['Search', 'ES|QL', 'Workflows'] },
  ];

  middleTier = [
    { title: 'Agent Framework', icon: 'bi-diagram-3', desc: 'LangChain-based base agent class with automatic ES tool binding. Each agent inherits and adds domain-specific prompts.', tags: ['LangChain', 'Python', 'Tool Binding'] },
    { title: 'Memory & Context', icon: 'bi-memory', desc: 'Elasticsearch indices serve as shared memory — agents read and write to the same data, enabling cross-department awareness.', tags: ['Shared State', 'ES Indices'] },
    { title: 'Multi-Step Reasoning', icon: 'bi-list-check', desc: 'Agents chain multiple ES operations: search inventory → check incentives → compare pricing → generate recommendation.', tags: ['ReAct', 'Chain-of-Thought'] },
    { title: 'Monitoring', icon: 'bi-activity', desc: 'Data Console provides real-time health checks, index management, and scenario testing from the admin UI.', tags: ['Health Checks', 'Data Console'] },
  ];

  advancedTier = [
    { title: 'Autonomous Decisions', icon: 'bi-lightning-charge', desc: 'Agents independently recommend price adjustments on aging stock and auto-respond to customer leads without human intervention.', tags: ['Scenario 1', 'Scenario 4'] },
    { title: 'Multi-Agent Collaboration', icon: 'bi-people-fill', desc: 'Orchestrator coordinates Consumer, Sales, Service, and Inventory agents to solve cross-department problems.', tags: ['Orchestrator', 'Scenarios 5-7'] },
    { title: 'Cross-System Integration', icon: 'bi-arrows-angle-expand', desc: 'Connects CRM (leads), DMS (inventory), service bay, and pricing systems that normally never share data.', tags: ['4 Departments', '1 Platform'] },
    { title: 'Actionable Output', icon: 'bi-check2-circle', desc: 'Agents don\'t just report — they generate personalized customer outreach, price recommendations, and diagnostic documentation.', tags: ['3C Docs', 'Auto-Outreach'] },
  ];

  agents = [
    { name: 'Consumer Agent', persona: 'Sarah', role: 'Instant lead response with inventory + incentive matching for online buyers.', color: '#ef4444', tools: ['Search', 'ES|QL'] },
    { name: 'Sales Agent', persona: 'BDC', role: 'Deal preparation briefings with full customer intelligence for sales staff.', color: '#3b82f6', tools: ['Search', 'ES|QL', 'Workflow'] },
    { name: 'Service Agent', persona: 'Ron', role: 'DTC diagnosis → TSB lookup → fix recommendation with 3C auto-documentation.', color: '#06b6d4', tools: ['Search', 'ES|QL'] },
    { name: 'Inventory Agent', persona: 'Josh', role: 'Aging stock alerts, pricing anomalies, and competitive market positioning.', color: '#f59e0b', tools: ['ES|QL', 'Workflow'] },
    { name: 'Orchestrator', persona: 'GM', role: 'Routes queries to the right agents and synthesizes cross-functional intelligence.', color: '#1e293b', tools: ['All (Delegation)'] },
  ];

  scenarioMap = [
    { id: 1, name: 'Instant Lead Response', agents: ['Consumer'], tools: ['Search', 'ES|QL'], complexity: 'Single', impact: '78% higher close rate with <5min response' },
    { id: 2, name: 'Morning Sales Brief', agents: ['Sales'], tools: ['Search', 'ES|QL', 'Workflow'], complexity: 'Single', impact: 'BDC handles 3x more leads per day' },
    { id: 3, name: 'Diagnose Before Hood Opens', agents: ['Service'], tools: ['Search', 'ES|QL'], complexity: 'Single', impact: '40% more cars through service bay' },
    { id: 4, name: 'Aging Stock Alert', agents: ['Inventory'], tools: ['ES|QL', 'Workflow'], complexity: 'Single', impact: '$50K-200K reduced carrying cost/month' },
    { id: 5, name: 'Lead + Inventory Match', agents: ['Consumer', 'Inventory'], tools: ['Search', 'ES|QL'], complexity: 'Multi', impact: 'Overnight leads matched to aging stock' },
    { id: 6, name: 'Service → Sales Opportunity', agents: ['Service', 'Sales', 'Inventory'], tools: ['Search', 'ES|QL', 'Workflow'], complexity: 'Multi', impact: 'Repeat repairs converted to trade-ups' },
    { id: 7, name: 'Full Morning Briefing', agents: ['Consumer', 'Sales', 'Service', 'Inventory'], tools: ['All'], complexity: 'Full', impact: 'Complete operational intelligence in 30 seconds' },
  ];

  indexSchema = [
    { name: 'dealer-inventory', icon: 'bi-car-front', desc: 'Vehicle stock with pricing, age, status, and specifications.', fields: 'vin, model, msrp, days_on_lot, status' },
    { name: 'dealer-leads', icon: 'bi-people', desc: 'Customer inquiries with vehicle preferences and budget.', fields: 'name, preferred_model, budget, source, status' },
    { name: 'dealer-service-orders', icon: 'bi-wrench-adjustable', desc: 'Repair orders with DTC codes, complaints, and history.', fields: 'vin, dtc_codes, complaint, repair_count' },
    { name: 'dealer-incentives', icon: 'bi-tags', desc: 'Active OEM incentive programs by model and type.', fields: 'model, type, amount, start_date, end_date' },
    { name: 'dealer-pricing-alerts', icon: 'bi-graph-up-arrow', desc: 'Market pricing comparisons flagging overpriced units.', fields: 'vin, our_price, market_avg, delta' },
    { name: 'dealer-tsb-recalls', icon: 'bi-shield-exclamation', desc: 'Technical service bulletins and recall notices.', fields: 'bulletin_id, models, dtc_codes, fix_procedure' },
  ];

  businessValue = [
    { metric: 'Lead Response Time', before: '8-12 hours', after: '< 60s', impact: '78% higher close rate', cardClass: 'stat-card-blue' },
    { metric: 'Sales Prep Time', before: '15-20 min/lead', after: '< 30s', impact: '3x more leads/day', cardClass: 'stat-card-cyan' },
    { metric: 'Diagnostic Time', before: '30-60 min', after: '2-5 min', impact: '40% more throughput', cardClass: 'stat-card-emerald' },
    { metric: 'Aging Stock Detection', before: 'Weekly review', after: 'Real-time', impact: '$50K-200K saved/month', cardClass: 'stat-card-amber' },
  ];

  agentColor(name: string): string {
    const map: Record<string, string> = {
      'Consumer': '#ef4444', 'Sales': '#3b82f6',
      'Service': '#06b6d4', 'Inventory': '#f59e0b',
    };
    return map[name] || '#1e293b';
  }
}