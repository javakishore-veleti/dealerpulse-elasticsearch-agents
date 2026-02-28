import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  template: `
    <nav class="sidebar d-flex flex-column">
      <!-- Brand -->
      <div class="sidebar-brand">
        <h5><i class="bi bi-speedometer2"></i> DealerPulse</h5>
        <small>Operations Console</small>
      </div>

      <!-- Main nav -->
      <div class="nav-section">Operations</div>
      <a *ngFor="let item of mainNav" [routerLink]="item.route" routerLinkActive="active" class="nav-link">
        <i class="bi" [ngClass]="item.icon"></i>
        {{ item.label }}
      </a>

      <div class="nav-section">Intelligence</div>
      <a *ngFor="let item of agentNav" [routerLink]="item.route" routerLinkActive="active" class="nav-link">
        <i class="bi" [ngClass]="item.icon"></i>
        {{ item.label }}
      </a>

      <div class="nav-section">System</div>
      <a *ngFor="let item of systemNav" [routerLink]="item.route" routerLinkActive="active" class="nav-link">
        <i class="bi" [ngClass]="item.icon"></i>
        {{ item.label }}
      </a>
      <div class="nav-section">HACKATHON</div>
      <a class="nav-link" routerLink="/data-console" routerLinkActive="active">
        <i class="bi bi-database-gear"></i> Data Console
      </a>
      <a class="nav-link" routerLink="/architecture" routerLinkActive="active">
        <i class="bi bi-diagram-3"></i> Architecture
      </a>

      <!-- Footer -->
      <div class="mt-auto p-3 border-top">
        <small class="text-muted">DealerPulse v0.1.0</small>
      </div>
    </nav>
  `,
})
export class SidebarComponent {
  mainNav = [
    { label: 'Dashboard',      route: '/dashboard',       icon: 'bi-grid-1x2' },
    { label: 'Inventory',      route: '/inventory',       icon: 'bi-car-front' },
    { label: 'Leads',          route: '/leads',           icon: 'bi-people' },
    { label: 'Service Orders', route: '/service-orders',  icon: 'bi-wrench-adjustable' },
  ];
  agentNav = [
    { label: 'Agent Runner',   route: '/agent-runner',    icon: 'bi-robot' },
  ];
  systemNav = [
    { label: 'DevOps',         route: '/devops',          icon: 'bi-hdd-rack' },
    { label: 'Settings',       route: '/settings',        icon: 'bi-gear' },
  ];
}
