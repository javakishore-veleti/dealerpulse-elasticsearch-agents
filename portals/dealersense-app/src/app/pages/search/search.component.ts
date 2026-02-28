import { Component } from '@angular/core';
import { CustomerApiService } from '../../services/customer-api.service';

@Component({
  selector: 'app-search',
  template: `
    <div class="hero-sm">
      <div class="container">
        <h2><i class="bi bi-search"></i> Find Your Vehicle</h2>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <!-- Smart Search Bar -->
        <div class="row justify-content-center mb-4">
          <div class="col-md-8">
            <div class="input-group input-group-lg">
              <input type="text" class="form-control rounded-pill rounded-end-0 border-2"
                     [(ngModel)]="query"
                     placeholder="Try: SUV under 40K with AWD, or EV with tax credit..."
                     (keyup.enter)="search()">
              <button class="btn btn-primary rounded-pill rounded-start-0 px-4" (click)="search()" [disabled]="loading">
                <i class="bi bi-search"></i> {{ loading ? 'Searching...' : 'Search' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Filters -->
        <div class="d-flex justify-content-center gap-2 mb-4">
          <button *ngFor="let f of quickFilters" class="btn btn-outline-secondary btn-sm rounded-pill"
                  (click)="query = f; search()">
            {{ f }}
          </button>
        </div>

        <!-- Results (AI-powered) -->
        <div *ngIf="response" class="row justify-content-center">
          <div class="col-md-10">
            <div class="vehicle-card p-4" style="cursor: default; white-space: pre-wrap; line-height: 1.7;">
              {{ response }}
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!response && !loading" class="text-center py-5">
          <i class="bi bi-car-front" style="font-size: 4rem; color: #cbd5e1;"></i>
          <p class="text-muted mt-3">Search our inventory using natural language.<br>Our AI understands what you want.</p>
        </div>
      </div>
    </div>
  `,
})
export class SearchComponent {
  query = '';
  response = '';
  loading = false;

  quickFilters = [
    'SUV under $40K', 'Electric Vehicles', 'Trucks with 4WD',
    'Family SUV with 3rd row', 'Best deals this month',
  ];

  constructor(private api: CustomerApiService) {}

  search() {
    if (!this.query.trim()) return;
    this.loading = true;
    this.response = '';
    this.api.searchVehicles(this.query).subscribe({
      next: (res) => { this.response = res.response; this.loading = false; },
      error: () => { this.response = 'Unable to search right now. Please try again.'; this.loading = false; },
    });
  }
}
