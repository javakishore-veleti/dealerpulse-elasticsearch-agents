import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AgentRunnerComponent } from './pages/agent-runner/agent-runner.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { LeadsComponent } from './pages/leads/leads.component';
import { ServiceOrdersComponent } from './pages/service-orders/service-orders.component';
import { DevopsComponent } from './pages/devops/devops.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'agent-runner', component: AgentRunnerComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'leads', component: LeadsComponent },
  { path: 'service-orders', component: ServiceOrdersComponent },
  { path: 'devops', component: DevopsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
