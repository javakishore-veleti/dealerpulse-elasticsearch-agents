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
        <h2><i class="bi bi-chat-dots-fill"></i> AI Shopping Assistant</h2>
        <span class="badge bg-primary bg-opacity-25 text-light">Powered by DealerPulse</span>
      </div>
    </div>

    <div class="container">
      <div class="chat-container">
        <!-- Messages -->
        <div class="chat-messages" #scrollContainer>
          <div *ngFor="let msg of messages"
               class="chat-bubble" [ngClass]="msg.role">
            {{ msg.content }}
          </div>

          <!-- Suggested prompts (show only at start) -->
          <div *ngIf="messages.length === 1" class="d-flex flex-wrap gap-2 mt-3">
            <button *ngFor="let s of suggestions" class="btn btn-outline-primary btn-sm rounded-pill"
                    (click)="sendMessage(s)">
              {{ s }}
            </button>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input-bar">
          <input type="text" [(ngModel)]="userInput"
                 placeholder="Ask me anything about vehicles, pricing, trade-ins..."
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
  messages: ChatMessage[] = [
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI shopping assistant at Prestige Chevrolet. I can help you find vehicles, calculate pricing with incentives, estimate your trade-in value, and more.\n\nWhat are you looking for today?'
    }
  ];

  suggestions = [
    'I need a mid-size SUV with AWD under $45K',
    'What EV options do you have?',
    'Show me trucks with towing packages',
    'What incentives are available right now?',
    'I have a 2021 Malibu to trade in — what\'s it worth?',
  ];

  constructor(private api: CustomerApiService) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage(text?: string) {
    const message = text || this.userInput.trim();
    if (!message) return;

    // Add user message
    this.messages.push({ role: 'user', content: message });
    this.userInput = '';
    this.loading = true;

    // Show typing indicator
    this.messages.push({ role: 'typing', content: 'Searching inventory and checking incentives...' });

    // Call backend
    this.api.chat(message).subscribe({
      next: (res) => {
        // Remove typing indicator
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
