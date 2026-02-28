import { Component } from '@angular/core';
import { CustomerApiService } from '../../services/customer-api.service';

@Component({
  selector: 'app-test-drive',
  template: `
    <div class="hero-sm">
      <div class="container">
        <h2><i class="bi bi-calendar-check"></i> Schedule a Test Drive</h2>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="row g-4 justify-content-center">
          <!-- Form -->
          <div class="col-md-5">
            <div class="vehicle-card p-4" style="cursor: default;">
              <h5 class="mb-3">Pick Your Vehicle & Time</h5>

              <div class="mb-3">
                <label class="form-label small fw-bold">Vehicle</label>
                <select class="form-select" [(ngModel)]="selectedVehicle">
                  <option value="">Choose a vehicle...</option>
                  <option *ngFor="let v of vehicles" [value]="v">{{ v }}</option>
                </select>
                <small class="text-muted">Or type a specific stock # or description</small>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Or describe what you want</label>
                <input type="text" class="form-control" [(ngModel)]="customVehicle"
                       placeholder="e.g. Any red Blazer EV, a Silverado with the Z71 package...">
              </div>

              <hr>
              <h6 class="text-muted small">YOUR INFO</h6>

              <div class="mb-3">
                <label class="form-label small fw-bold">Full Name</label>
                <input type="text" class="form-control" [(ngModel)]="name" placeholder="Sarah Martinez">
              </div>

              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label small fw-bold">Phone</label>
                  <input type="tel" class="form-control" [(ngModel)]="phone" placeholder="(704) 555-0199">
                </div>
                <div class="col-6">
                  <label class="form-label small fw-bold">Email</label>
                  <input type="email" class="form-control" [(ngModel)]="email" placeholder="sarah@email.com">
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Preferred Date & Time</label>
                <div class="row g-2">
                  <div class="col-7">
                    <input type="date" class="form-control" [(ngModel)]="preferredDate">
                  </div>
                  <div class="col-5">
                    <select class="form-select" [(ngModel)]="preferredTime">
                      <option value="">Time...</option>
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="1:00 PM">1:00 PM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="3:00 PM">3:00 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                      <option value="5:00 PM">5:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <button class="btn btn-primary w-100 rounded-pill py-2 mt-2"
                      (click)="schedule()" [disabled]="!isValid() || loading">
                <i class="bi bi-calendar-plus"></i>
                {{ loading ? 'Scheduling...' : 'Request Test Drive' }}
              </button>
            </div>
          </div>

          <!-- Confirmation / Result -->
          <div class="col-md-5">
            <div *ngIf="response" class="price-breakdown">
              <div class="text-center mb-3">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
              </div>
              <h5 class="text-center mb-3">Request Submitted!</h5>
              <div style="white-space: pre-wrap; line-height: 1.8; font-size: 0.95rem;">
                {{ response }}
              </div>
            </div>

            <div *ngIf="!response" class="text-center py-5">
              <i class="bi bi-car-front" style="font-size: 3rem; color: #cbd5e1;"></i>
              <p class="text-muted mt-3 small">Pick a vehicle and time.<br>We'll have it ready when you arrive.</p>
            </div>

            <!-- What to expect -->
            <div class="vehicle-card p-3 mt-3" style="cursor: default;">
              <h6 class="small fw-bold mb-2">What to Expect</h6>
              <div class="d-flex align-items-start gap-2 mb-2">
                <i class="bi bi-clock text-primary"></i>
                <small class="text-muted">Test drives typically last 20-30 minutes</small>
              </div>
              <div class="d-flex align-items-start gap-2 mb-2">
                <i class="bi bi-file-earmark text-primary"></i>
                <small class="text-muted">Bring your driver's license and insurance card</small>
              </div>
              <div class="d-flex align-items-start gap-2">
                <i class="bi bi-chat-dots text-primary"></i>
                <small class="text-muted">A specialist will walk through all the features with you</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TestDriveComponent {
  selectedVehicle = '';
  customVehicle = '';
  name = '';
  phone = '';
  email = '';
  preferredDate = '';
  preferredTime = '';
  response = '';
  loading = false;

  vehicles = [
    '2025 Chevrolet Equinox EV',
    '2025 Chevrolet Blazer EV',
    '2025 Chevrolet Silverado 1500',
    '2025 Chevrolet Tahoe',
    '2025 Chevrolet Traverse',
    '2025 Chevrolet Equinox',
    '2025 Chevrolet Trax',
    '2025 Chevrolet Colorado',
    '2025 Chevrolet Corvette',
  ];

  constructor(private api: CustomerApiService) {}

  isValid(): boolean {
    return (!!this.selectedVehicle || !!this.customVehicle) && !!this.name && !!this.phone;
  }

  schedule() {
    const vehicle = this.customVehicle || this.selectedVehicle;
    const dateTime = [this.preferredDate, this.preferredTime].filter(Boolean).join(' at ') || 'earliest available';
    this.loading = true;
    this.response = '';
    this.api.scheduleTestDrive(vehicle, this.name, this.phone, dateTime).subscribe({
      next: (res) => { this.response = res.response; this.loading = false; },
      error: () => { this.response = 'Unable to submit right now. Please call (704) 555-0100.'; this.loading = false; },
    });
  }
}
