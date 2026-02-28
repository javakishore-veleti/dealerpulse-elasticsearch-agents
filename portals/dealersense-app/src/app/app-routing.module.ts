import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ChatComponent } from './pages/chat/chat.component';
import { SearchComponent } from './pages/search/search.component';
import { PriceCalculatorComponent } from './pages/price-calculator/price-calculator.component';
import { TradeInComponent } from './pages/trade-in/trade-in.component';
import { ServiceTrackerComponent } from './pages/service-tracker/service-tracker.component';
import { TestDriveComponent } from './pages/test-drive/test-drive.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'search', component: SearchComponent },
  { path: 'price-calculator', component: PriceCalculatorComponent },
  { path: 'trade-in', component: TradeInComponent },
  { path: 'service-tracker', component: ServiceTrackerComponent },
  { path: 'test-drive', component: TestDriveComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
