import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Health ──
  healthCheck(): Observable<any> {
    return this.http.get(`${this.base}/health`);
  }

  // ── Agent Runner ──
  runScenario(scenarioId: number): Observable<any> {
    return this.http.post(`${this.base}/scenario`, { scenario_id: scenarioId });
  }

  runQuery(query: string, agent: string = 'orchestrator'): Observable<any> {
    return this.http.post(`${this.base}/query`, { query, agent });
  }

  // ── Inventory ──
  searchInventory(query: string, filters?: any): Observable<any> {
    return this.http.post(`${this.base}/query`, {
      query: `Search inventory: ${query}`,
      agent: 'inventory',
    });
  }

  // ── Leads ──
  searchLeads(query: string): Observable<any> {
    return this.http.post(`${this.base}/query`, {
      query: `Search leads: ${query}`,
      agent: 'consumer',
    });
  }

  // ── Service ──
  diagnoseVehicle(vin: string, dtcCodes: string, complaint: string): Observable<any> {
    return this.http.post(`${this.base}/query`, {
      query: `Diagnose vehicle VIN ${vin}, DTC codes: ${dtcCodes}, complaint: ${complaint}`,
      agent: 'service',
    });
  }

  // ── DevOps (these would hit a separate DevOps API — placeholder) ──
  getServiceStatus(): Observable<any> {
    return this.http.get(`${this.base}/health`);
  }

  // Data Management
  getIndices() {
    return this.http.get<any>(`${this.base}/indices`);
  }

  loadAllData() {
    return this.http.post<any>(`${this.base}/data/load`, {});
  }

  loadIndexData(indexName: string) {
    return this.http.post<any>(`${this.base}/data/load/${indexName}`, {});
  }

  resetAllData() {
    return this.http.delete<any>(`${this.base}/data/reset`);
  }

  resetIndex(indexName: string) {
    return this.http.delete<any>(`${this.base}/data/reset/${indexName}`);
  }

  testScenario(scenarioId: number) {
    return this.http.post<any>(`${this.base}/scenario/test/${scenarioId}`, {});
  }

  // ═══ Agent Builder v2 ═══

  private v2 = `${this.base}/v2`;

  // Status
  getAgentBuilderStatus(): Observable<any> {
    return this.http.get(`${this.v2}/status`);
  }

  // Tools
  getV2Tools(): Observable<any> {
    return this.http.get(`${this.v2}/tools`);
  }

  registerAllTools(): Observable<any> {
    return this.http.post(`${this.v2}/tools/register-all`, {});
  }

  registerTool(toolId: string): Observable<any> {
    return this.http.post(`${this.v2}/tools/register/${toolId}`, {});
  }

  deleteTool(toolId: string): Observable<any> {
    return this.http.delete(`${this.v2}/tools/${toolId}`);
  }

  deleteAllTools(): Observable<any> {
    return this.http.delete(`${this.v2}/tools`);
  }

  // Agents
  getV2Agents(): Observable<any> {
    return this.http.get(`${this.v2}/agents`);
  }

  registerAllAgents(): Observable<any> {
    return this.http.post(`${this.v2}/agents/register-all`, {});
  }

  registerAgent(agentId: string): Observable<any> {
    return this.http.post(`${this.v2}/agents/register/${agentId}`, {});
  }

  deleteAgent(agentId: string): Observable<any> {
    return this.http.delete(`${this.v2}/agents/${agentId}`);
  }

  deleteAllAgents(): Observable<any> {
    return this.http.delete(`${this.v2}/agents`);
  }

  // Registry
  getRegistrySummary(): Observable<any> {
    return this.http.get(`${this.v2}/registry/summary`);
  }

  // Scenarios v2
  getV2Scenarios(): Observable<any> {
    return this.http.get(`${this.v2}/scenarios`);
  }

  runV2Scenario(scenarioId: number): Observable<any> {
    return this.http.post(`${this.v2}/scenarios/run/${scenarioId}`, {});
  }

  // Chat
  v2Chat(agentId: string, input: string, conversationId?: string): Observable<any> {
    return this.http.post(`${this.v2}/chat`, { agent_id: agentId, input, conversation_id: conversationId });
  }
}
