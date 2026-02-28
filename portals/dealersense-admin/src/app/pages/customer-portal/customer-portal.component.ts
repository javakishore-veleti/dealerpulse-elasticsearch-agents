import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-customer-portal',
  template: `
    <!-- Header -->
    <div class="card stat-card p-3 mb-3">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-1 fw-bold"><i class="bi bi-chat-dots text-danger"></i> Customer Portal</h5>
          <small class="text-muted">Chat with our AI assistant to find your perfect vehicle</small>
        </div>
        <button *ngIf="messages.length" class="btn btn-outline-secondary btn-sm" (click)="clearChat()">
          <i class="bi bi-arrow-clockwise"></i> New Chat
        </button>
      </div>
    </div>

    <!-- Chat Window -->
    <div class="card stat-card p-0 mb-3" style="min-height: 500px; display: flex; flex-direction: column;">

      <!-- Messages -->
      <div class="p-3 flex-grow-1" style="max-height: 500px; overflow-y: auto;" #chatWindow>
        <!-- Welcome -->
        <div *ngIf="!messages.length" class="text-center text-muted py-5">
          <i class="bi bi-robot fs-1 d-block mb-3"></i>
          <h6>Welcome to Prestige Motors</h6>
          <p>I'm Sarah, your personal vehicle assistant. Tell me what you're looking for and I'll find the perfect match from our inventory.</p>
          <div class="d-flex flex-wrap justify-content-center gap-2 mt-3">
            <button class="btn btn-outline-primary btn-sm" (click)="sendQuick('Im looking for a mid-size SUV with AWD, budget around $40,000')">
              <i class="bi bi-car-front"></i> SUV under $40K
            </button>
            <button class="btn btn-outline-success btn-sm" (click)="sendQuick('What EV options do you have? I want to take advantage of the tax credit.')">
              <i class="bi bi-lightning-charge"></i> EV Options
            </button>
            <button class="btn btn-outline-warning btn-sm" (click)="sendQuick('I need a truck for towing. What Summit 1500 trims do you have in stock?')">
              <i class="bi bi-truck"></i> Trucks
            </button>
            <button class="btn btn-outline-info btn-sm" (click)="sendQuick('I have a family of 5 and need a spacious vehicle with safety features under $50K')">
              <i class="bi bi-people"></i> Family Vehicle
            </button>
          </div>
        </div>

        <!-- Message Bubbles -->
        <div *ngFor="let msg of messages" class="mb-3" [class.text-end]="msg.role === 'user'">
          <div class="d-inline-block p-3 rounded-3" style="max-width: 85%;"
               [style.background]="msg.role === 'user' ? '#e3f2fd' : '#f8f9fa'"
               [class.text-start]="true">
            <div class="d-flex align-items-center gap-2 mb-1">
              <i class="bi" [ngClass]="msg.role === 'user' ? 'bi-person-circle text-primary' : 'bi-robot text-danger'"></i>
              <strong class="small">{{ msg.role === 'user' ? 'You' : 'Sarah (Vehicle Assistant)' }}</strong>
              <small class="text-muted ms-auto">{{ msg.timestamp | date:'shortTime' }}</small>
            </div>
            <div style="white-space: pre-wrap;">{{ msg.text }}</div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div *ngIf="loading" class="mb-3">
          <div class="d-inline-block p-3 rounded-3" style="background: #f8f9fa;">
            <i class="bi bi-robot text-danger"></i>
            <span class="text-muted ms-2">Sarah is finding your matches...</span>
            <span class="spinner-border spinner-border-sm text-danger ms-2"></span>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="p-3 border-top">
        <div class="input-group">
          <input type="text" class="form-control" [(ngModel)]="userInput"
                 placeholder="Tell me what you're looking for..."
                 (keyup.enter)="send()" [disabled]="loading">
          <button class="btn btn-danger" (click)="send()" [disabled]="!userInput || loading">
            <i class="bi bi-send-fill"></i>
          </button>
        </div>
        <div *ngIf="conversationId" class="mt-2 d-flex flex-wrap gap-2">
          <small class="text-muted me-2">Quick follow-ups:</small>
          <button class="btn btn-outline-secondary btn-sm" style="font-size: 0.75rem;" (click)="sendQuick('What incentives or discounts are available on those?')">
            <i class="bi bi-tags"></i> Incentives?
          </button>
          <button class="btn btn-outline-secondary btn-sm" style="font-size: 0.75rem;" (click)="sendQuick('Can I schedule a test drive this weekend?')">
            <i class="bi bi-calendar"></i> Test Drive
          </button>
          <button class="btn btn-outline-secondary btn-sm" style="font-size: 0.75rem;" (click)="sendQuick('I have a trade-in, a 2020 Honda CR-V with 45,000 miles. How does that change the pricing?')">
            <i class="bi bi-arrow-left-right"></i> Trade-In
          </button>
          <button class="btn btn-outline-secondary btn-sm" style="font-size: 0.75rem;" (click)="sendQuick('What financing options do you offer?')">
            <i class="bi bi-bank"></i> Financing
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CustomerPortalComponent {
  userInput = '';
  messages: ChatMessage[] = [];
  loading = false;
  conversationId = '';

  constructor(private api: ApiService) {}

  send() {
    if (!this.userInput.trim() || this.loading) return;
    const text = this.userInput.trim();
    this.userInput = '';

    this.messages.push({ role: 'user', text, timestamp: new Date() });
    this.loading = true;

    this.api.v2Chat('dealerpulse-consumer-agent', text, this.conversationId).subscribe({
      next: (res) => {
        this.messages.push({
          role: 'agent',
          text: res.response || res.error || 'No response',
          timestamp: new Date(),
        });
        this.conversationId = res.conversation_id || '';
        this.loading = false;
      },
      error: (err) => {
        this.messages.push({
          role: 'agent',
          text: `Sorry, I'm having trouble connecting. Please try again in a moment.`,
          timestamp: new Date(),
        });
        this.loading = false;
      },
    });
  }

  sendQuick(text: string) {
    this.userInput = text;
    this.send();
  }

  clearChat() {
    this.messages = [];
    this.conversationId = '';
    this.userInput = '';
  }
}