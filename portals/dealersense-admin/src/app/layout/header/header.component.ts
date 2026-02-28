import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-header',
  template: `
    <div class="top-header">
      <h5 class="mb-0">{{ pageTitle }}</h5>
      <div class="d-flex align-items-center gap-3">
        <span class="badge" [ngClass]="esHealthy ? 'bg-success' : 'bg-danger'">
          <i class="bi bi-database"></i> ES {{ esHealthy ? 'Connected' : 'Down' }}
        </span>
      <span class="badge bg-secondary">
        <i class="bi bi-building"></i> Demo Dealership
      </span>
      </div>
    </div>
  `,
})
export class HeaderComponent implements OnInit {
  pageTitle = 'Dashboard';
  esHealthy = false;

  private titleMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/agent-runner': 'Agent Runner',
    '/inventory': 'Inventory Browser',
    '/leads': 'Lead Manager',
    '/service-orders': 'Service Orders',
    '/devops': 'DevOps Console',
    '/settings': 'Settings',
  };

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit() {
    // Update title on route change
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.pageTitle = this.titleMap[e.urlAfterRedirects] || 'DealerSense';
    });
    // Check ES health
    this.api.healthCheck().subscribe({
      next: (res) => this.esHealthy = res.elasticsearch === 'green' || res.elasticsearch === 'yellow',
      error: () => this.esHealthy = false,
    });
  }
}
