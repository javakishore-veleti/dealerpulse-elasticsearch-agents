# DealerSense App — Customer Portal

> Customer-facing portal for vehicle shopping, lead submission, service status, and trade-in estimates.

## Status: Planned

This portal will be built after the admin portal is functional.

### Planned Pages

| Page | Description |
|------|-------------|
| Vehicle Search | Browse inventory with AI-powered recommendations |
| My Lead | Track lead status, scheduled test drives |
| Service Status | Real-time RO tracking for vehicles in service |
| Trade-In Estimator | AI-powered trade-in value with market data |

### Key Differences from Admin Portal

- **Layout**: Consumer-friendly, no sidebar — top nav with hero sections
- **Auth**: Customer login (email/phone verification)
- **Data**: Read-only, no agent runner or DevOps access
- **Tone**: Warm, personal — matches Cox Automotive "Sarah" persona

### Tech Stack (same as admin)

- Angular 17
- Bootstrap 5 + ng-bootstrap
- Connects to same Python FastAPI backend
- Port: 4201 (admin runs on 4200)
