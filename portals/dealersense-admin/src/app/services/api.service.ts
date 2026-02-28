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
}
