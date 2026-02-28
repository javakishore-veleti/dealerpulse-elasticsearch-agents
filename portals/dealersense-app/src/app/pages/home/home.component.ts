import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <!-- Hero -->
    <div class="hero">
      <div class="container">
        <h1>Find Your Perfect Vehicle</h1>
        <p>AI-powered shopping experience. Tell us what you want, we'll find the match.</p>
        <div class="d-flex justify-content-center gap-3">
          <a routerLink="/chat" class="btn btn-primary btn-lg rounded-pill px-4">
            <i class="bi bi-chat-dots-fill"></i> Talk to Our AI Assistant
          </a>
          <a routerLink="/search" class="btn btn-outline-light btn-lg rounded-pill px-4">
            <i class="bi bi-search"></i> Browse Vehicles
          </a>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4" *ngFor="let action of quickActions">
            <div class="vehicle-card text-center p-4" [routerLink]="action.route">
              <i class="bi fs-1 text-primary" [ngClass]="action.icon"></i>
              <h5 class="mt-3 mb-2">{{ action.title }}</h5>
              <p class="text-muted small mb-0">{{ action.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- How It Works -->
    <div class="section" style="background: white;">
      <div class="container text-center">
        <h3 class="section-title">How DealerPulse AI Works</h3>
        <div class="row g-4">
          <div class="col-md-3" *ngFor="let step of steps; let i = index">
            <div class="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                 style="width: 48px; height: 48px; font-weight: 700;">{{ i + 1 }}</div>
            <h6>{{ step.title }}</h6>
            <p class="text-muted small">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured CTA -->
    <div class="section">
      <div class="container">
        <div class="p-5 rounded-4 text-center text-white" style="background: linear-gradient(135deg, #2563eb, #06b6d4);">
          <h3 class="fw-bold mb-2">Ready to find your next vehicle?</h3>
          <p class="mb-3 opacity-75">Our AI knows every vehicle on our lot, every incentive available, and can calculate your exact price in seconds.</p>
          <a routerLink="/chat" class="btn btn-light btn-lg rounded-pill px-5 fw-bold">
            Start Chatting <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {
  quickActions = [
    { title: 'AI Assistant', description: 'Tell us what you want in plain English. Our AI finds the best match.', icon: 'bi-robot', route: '/chat' },
    { title: 'Your Price', description: 'See the real price with incentives, trade-in, and financing.', icon: 'bi-calculator', route: '/price-calculator' },
    { title: 'Trade-In Value', description: 'Get an instant estimate with recall check included.', icon: 'bi-arrow-left-right', route: '/trade-in' },
  ];

  steps = [
    { title: 'Tell Us What You Want', desc: 'Chat with our AI or browse — SUV, truck, EV, budget, features.' },
    { title: 'AI Finds Matches', desc: 'Searches our entire inventory and calculates incentives in real time.' },
    { title: 'See Your Price', desc: 'MSRP minus incentives minus trade-in = your actual out-the-door price.' },
    { title: 'Schedule Test Drive', desc: 'Pick a time, show up, drive. No surprises, no haggling.' },
  ];
}
