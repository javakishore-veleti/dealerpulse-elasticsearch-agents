import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="container">
        <div class="row">
          <div class="col-md-4 mb-3">
            <div class="footer-brand mb-2">
                <i class="bi bi-search-heart"></i> MyNextAutoSearch
            </div>
            <p class="small">AI-powered vehicle shopping experience.</p>
          </div>
          <div class="col-md-2 mb-3">
            <h6 class="text-white mb-2">Shop</h6>
            <a routerLink="/search" class="d-block small mb-1">Browse Vehicles</a>
            <a routerLink="/price-calculator" class="d-block small mb-1">Your Price</a>
            <a routerLink="/trade-in" class="d-block small mb-1">Trade-In Value</a>
          </div>
          <div class="col-md-2 mb-3">
            <h6 class="text-white mb-2">Services</h6>
            <a routerLink="/service-tracker" class="d-block small mb-1">Service Status</a>
            <a routerLink="/test-drive" class="d-block small mb-1">Schedule Test Drive</a>
            <a routerLink="/chat" class="d-block small mb-1">AI Assistant</a>
          </div>
          <div class="col-md-4 mb-3">
            <h6 class="text-white mb-2">Contact</h6>
            <p class="small mb-1"><i class="bi bi-geo-alt"></i> Demo Dealership Location</p>
            <p class="small mb-1"><i class="bi bi-telephone"></i> (555) 000-0000</p>
            <p class="small"><i class="bi bi-clock"></i> Mon-Sat 9AM-8PM</p>
          </div>
        </div>
        <hr style="border-color: #334155;">
        <p class="small text-center mb-0">
          Powered by MyNextAutoSearch AI · &copy; 2026
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent { }
