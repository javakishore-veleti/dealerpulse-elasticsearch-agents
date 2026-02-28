import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar-consumer">
      <div class="container d-flex align-items-center justify-content-between">
        <!-- Brand -->
        <a class="navbar-brand text-decoration-none" routerLink="/">
          <i class="bi bi-car-front"></i>
          Prestige <span class="brand-accent">Chevrolet</span>
        </a>

        <!-- Nav links -->
        <div class="d-flex align-items-center gap-1">
          <a class="nav-link" routerLink="/search" routerLinkActive="active">
            <i class="bi bi-search"></i> Vehicles
          </a>
          <a class="nav-link" routerLink="/price-calculator" routerLinkActive="active">
            <i class="bi bi-calculator"></i> Your Price
          </a>
          <a class="nav-link" routerLink="/trade-in" routerLinkActive="active">
            <i class="bi bi-arrow-left-right"></i> Trade-In
          </a>
          <a class="nav-link" routerLink="/service-tracker" routerLinkActive="active">
            <i class="bi bi-wrench"></i> Service
          </a>
          <a class="nav-link" routerLink="/test-drive" routerLinkActive="active">
            <i class="bi bi-calendar-check"></i> Test Drive
          </a>
        </div>

        <!-- Chat CTA -->
        <a routerLink="/chat" class="btn-chat text-decoration-none">
          <i class="bi bi-chat-dots-fill"></i> AI Assistant
        </a>
      </div>
    </nav>
  `,
})
export class NavbarComponent { }
