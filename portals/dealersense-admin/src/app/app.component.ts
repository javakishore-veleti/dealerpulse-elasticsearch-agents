import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-sidebar></app-sidebar>
    <div class="main-content">
      <app-header></app-header>
      <div class="page-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class AppComponent { }
