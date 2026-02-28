import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // AI Chat — routes through Consumer Agent
  chat(message: string): Observable<any> {
    return this.http.post(`${this.base}/query`, { query: message, agent: 'consumer' });
  }

  // Vehicle search — routes through Inventory Agent
  searchVehicles(query: string): Observable<any> {
    return this.http.post(`${this.base}/query`, {
      query: `Customer searching: ${query}`,
      agent: 'consumer',
    });
  }

  // Price calculation — routes through Orchestrator (needs inventory + incentives)
  calculatePrice(model: string, tradeIn?: string, tradeValue?: number): Observable<any> {
    let query = `Calculate the best price for a ${model}`;
    if (tradeIn) query += ` with trade-in: ${tradeIn} valued at $${tradeValue}`;
    query += '. Include all applicable incentives and show the breakdown.';
    return this.http.post(`${this.base}/query`, { query, agent: 'orchestrator' });
  }

  // Trade-in estimate
  estimateTradeIn(vehicle: string, mileage: number, condition: string): Observable<any> {
    return this.http.post(`${this.base}/query`, {
      query: `Estimate trade-in value for: ${vehicle}, ${mileage} miles, ${condition} condition. Check for any open recalls or TSBs.`,
      agent: 'orchestrator',
    });
  }

  // Service tracker
  trackService(identifier: string): Observable<any> {
    return this.http.post(`${this.base}/query`, {
      query: `Look up service status for: ${identifier}. Show current RO status, what work is being done, and estimated completion.`,
      agent: 'service',
    });
  }

  // Test drive scheduling (placeholder — would need a real booking endpoint)
  scheduleTestDrive(vehicle: string, name: string, phone: string, preferredDate: string): Observable<any> {
    return this.http.post(`${this.base}/query`, {
      query: `Customer ${name} (${phone}) wants to test drive: ${vehicle} on ${preferredDate}. Check availability and confirm.`,
      agent: 'sales',
    });
  }

  healthCheck(): Observable<any> {
    return this.http.get(`${this.base}/health`);
  }
}
