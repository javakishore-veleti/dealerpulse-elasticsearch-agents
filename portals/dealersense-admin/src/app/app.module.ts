import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AgentRunnerComponent } from './pages/agent-runner/agent-runner.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { LeadsComponent } from './pages/leads/leads.component';
import { ServiceOrdersComponent } from './pages/service-orders/service-orders.component';
import { DevopsComponent } from './pages/devops/devops.component';
import { SettingsComponent } from './pages/settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HeaderComponent,
    DashboardComponent,
    AgentRunnerComponent,
    InventoryComponent,
    LeadsComponent,
    ServiceOrdersComponent,
    DevopsComponent,
    SettingsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    AppRoutingModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
