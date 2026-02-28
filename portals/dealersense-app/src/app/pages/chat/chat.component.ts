import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CustomerApiService } from '../../services/customer-api.service';

interface ChatMessage {
  role: 'user' | 'assistant' | 'typing';
  content: string;
}

@Component({
  selector: 'app-chat',
  template: `
    <!-- Mini hero -->
    <div class="hero-sm">
      <div class="container d-flex align-items-center justify-content-between">
        <h2><i class="bi bi-search-heart"></i> Smart Search Assistant</h2>
        <span class="badge bg-primary bg-opacity-25 text-light">Live Inventory · Instant Matching · Best Price</span>
      </div>
    </div>

    <div class="container">
      <div class="chat-container">
        <div class="chat-messages" #scrollContainer>

          <!-- Welcome card (disappears after first message) -->
          <div *ngIf="showWelcome" class="welcome-card text-center">
            <div class="welcome-icon">
              <i class="bi bi-search-heart"></i>
            </div>
            <h4>What can I help you find?</h4>
            <p class="text-muted">I search our entire inventory in real time — matching vehicles, stacking incentives, and calculating your best price in seconds.</p>
            <div class="welcome-features">
              <span><i class="bi bi-speedometer2"></i> 500+ vehicles</span>
              <span><i class="bi bi-tags"></i> Live incentives</span>
              <span><i class="bi bi-arrow-left-right"></i> Trade-in values</span>
            </div>
            <hr class="my-4" style="border-color: #e0e7ff;">
            <p class="text-muted small mb-3">Popular searches:</p>
            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <button *ngFor="let s of suggestions" class="suggestion-chip"
                      (click)="sendMessage(s.text)">
                <i class="bi" [ngClass]="s.icon"></i> {{ s.text }}
              </button>
            </div>
          </div>

          <!-- Chat messages (appear after first message) -->
          <div *ngFor="let msg of messages"
               class="chat-bubble" [ngClass]="msg.role">
            {{ msg.content }}
          </div>

        </div>

        <!-- Input -->
        <div class="chat-input-bar">
          <input type="text" [(ngModel)]="userInput"
                 placeholder="Search for your perfect vehicle..."
                 (keyup.enter)="sendMessage()" [disabled]="loading">
          <button (click)="sendMessage()" [disabled]="!userInput.trim() || loading">
            <i class="bi bi-send-fill"></i>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  userInput = '';
  loading = false;
  showWelcome = true;
  messages: ChatMessage[] = [];

  suggestions = [
    { text: 'I need a mid-size SUV with AWD under $45K', icon: 'bi-truck-front' },
    { text: 'What EV options do you have?', icon: 'bi-lightning-charge' },
    { text: 'Show me trucks with towing packages', icon: 'bi-truck' },
    { text: 'What incentives are available right now?', icon: 'bi-tag' },
    { text: 'I have a 2021 Malibu to trade in', icon: 'bi-arrow-left-right' },
  ];

  constructor(private api: CustomerApiService) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage(text?: string) {
    const message = text || this.userInput.trim();
    if (!message) return;

    this.showWelcome = false;
    this.messages.push({ role: 'user', content: message });
    this.userInput = '';
    this.loading = true;

    this.messages.push({ role: 'typing', content: 'Searching inventory and checking incentives...' });

    this.api.chat(message).subscribe({
      next: (res) => {
        this.messages = this.messages.filter(m => m.role !== 'typing');
        this.messages.push({ role: 'assistant', content: res.response });
        this.loading = false;
      },
      error: (err) => {
        this.messages = this.messages.filter(m => m.role !== 'typing');
        this.messages.push({
          role: 'assistant',
          content: 'I\'m having trouble connecting right now. Please make sure the backend is running (npm run start:backend) and Elasticsearch has data loaded (npm run data:load).'
        });
        this.loading = false;
      },
    });
  }

  private scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}