import { Component, ViewChild, ElementRef } from '@angular/core';
import { CustomerApiService } from '../../services/customer-api.service';

interface SearchResult {
  query: string;
  response: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  template: `
    <!-- Hero with search bar integrated -->
    <div class="hero-sm">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between">
          <h2><i class="bi bi-search-heart"></i> Smart Search</h2>
          <!-- Search bar in hero, right-aligned -->
          <div class="hero-search">
            <div class="input-group">
              <input type="text" class="form-control" [(ngModel)]="userInput"
                     placeholder="Search for your perfect vehicle..."
                     (keyup.enter)="search()" [disabled]="loading" #searchInput>
              <button class="btn btn-light" (click)="search()" [disabled]="!userInput.trim() || loading">
                <i class="bi" [ngClass]="loading ? 'bi-hourglass-split' : 'bi-search'"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container py-4">
      <div class="row">

        <!-- LEFT: Suggestions + Search History -->
        <div class="col-md-3">
          <div class="suggestions-panel">
            <h6 class="suggestions-title">Popular Searches</h6>
            <button *ngFor="let s of suggestions" class="suggestion-item"
                    (click)="quickSearch(s.text)">
              <i class="bi" [ngClass]="s.icon"></i>
              <span>{{ s.text }}</span>
            </button>

            <div *ngIf="searchHistory.length > 0" class="mt-4">
              <h6 class="suggestions-title">Your Searches</h6>
              <button *ngFor="let h of searchHistory" class="suggestion-item history-item"
                      (click)="quickSearch(h)">
                <i class="bi bi-clock-history"></i>
                <span>{{ h }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT: Results area -->
        <div class="col-md-9">
          <!-- Welcome state (before any search) -->
          <div *ngIf="!currentResult && !loading" class="welcome-search text-center py-5">
            <div class="welcome-icon mb-3">
              <i class="bi bi-search-heart"></i>
            </div>
            <h4>What can I help you find?</h4>
            <p class="text-muted mb-4">Search our entire inventory in real time — matching vehicles,<br>stacking incentives, and calculating your best price in seconds.</p>
            <div class="welcome-features mb-4">
              <span><i class="bi bi-speedometer2"></i> 500+ vehicles</span>
              <span><i class="bi bi-tags"></i> Live incentives</span>
              <span><i class="bi bi-arrow-left-right"></i> Trade-in values</span>
            </div>
            <!-- Quick search chips for mobile -->
            <div class="d-md-none d-flex flex-wrap gap-2 justify-content-center">
              <button *ngFor="let s of suggestions" class="suggestion-chip"
                      (click)="quickSearch(s.text)">
                <i class="bi" [ngClass]="s.icon"></i> {{ s.text }}
              </button>
            </div>
          </div>

          <!-- Loading state -->
          <div *ngIf="loading" class="search-loading">
            <div class="loading-card">
              <div class="loading-shimmer"></div>
              <div class="loading-text">
                <i class="bi bi-search"></i> Searching inventory and checking incentives...
              </div>
            </div>
          </div>

          <!-- Search result -->
          <div *ngIf="currentResult && !loading" class="search-result-card">
            <div class="result-header">
              <span class="result-query">
                <i class="bi bi-search"></i> {{ currentResult.query }}
              </span>
              <button class="btn btn-sm btn-outline-secondary" (click)="clearResults()">
                <i class="bi bi-x-lg"></i> Clear
              </button>
            </div>
            <div class="result-body">
              {{ currentResult.response }}
            </div>
            <div class="result-footer">
              <span class="text-muted small">
                <i class="bi bi-lightning-charge"></i> Results from live inventory search
              </span>
              <button class="btn btn-sm btn-primary rounded-pill" (click)="focusSearch()">
                <i class="bi bi-search"></i> Search again
              </button>
            </div>
          </div>

          <!-- Previous results -->
          <div *ngIf="previousResults.length > 0 && !loading" class="mt-4">
            <h6 class="text-muted small">Previous searches</h6>
            <div *ngFor="let prev of previousResults" class="previous-result-card">
              <div class="d-flex justify-content-between align-items-start">
                <span class="result-query small">
                  <i class="bi bi-search"></i> {{ prev.query }}
                </span>
              </div>
              <div class="result-body small">{{ prev.response }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class ChatComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;

  userInput = '';
  loading = false;
  currentResult: SearchResult | null = null;
  previousResults: SearchResult[] = [];
  searchHistory: string[] = [];

  suggestions = [
    { text: 'Mid-size SUV with AWD under $45K', icon: 'bi-truck-front' },
    { text: 'Electric vehicles available', icon: 'bi-lightning-charge' },
    { text: 'Trucks with towing packages', icon: 'bi-truck' },
    { text: 'Current incentives & deals', icon: 'bi-tag' },
    { text: 'Trade-in value for 2021 Malibu', icon: 'bi-arrow-left-right' },
  ];

  constructor(private api: CustomerApiService) {}

  quickSearch(text: string) {
    this.userInput = text;
    this.search();
  }

  search() {
    const query = this.userInput.trim();
    if (!query) return;

    // Save to history (no duplicates, max 5)
    this.searchHistory = [query, ...this.searchHistory.filter(h => h !== query)].slice(0, 5);

    // Move current result to previous
    if (this.currentResult) {
      this.previousResults = [this.currentResult, ...this.previousResults].slice(0, 3);
    }

    this.loading = true;
    this.currentResult = null;
    this.userInput = '';

    this.api.chat(query).subscribe({
      next: (res) => {
        this.currentResult = { query, response: res.response, timestamp: new Date() };
        this.loading = false;
      },
      error: () => {
        this.currentResult = {
          query,
          response: 'Unable to search right now. Please make sure the backend is running and Elasticsearch has data loaded.',
          timestamp: new Date()
        };
        this.loading = false;
      },
    });
  }

  clearResults() {
    this.currentResult = null;
    this.previousResults = [];
    this.focusSearch();
  }

  focusSearch() {
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 100);
  }
}