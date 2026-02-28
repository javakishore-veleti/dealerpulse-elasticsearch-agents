import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { ChatComponent } from './pages/chat/chat.component';
import { SearchComponent } from './pages/search/search.component';
import { PriceCalculatorComponent } from './pages/price-calculator/price-calculator.component';
import { TradeInComponent } from './pages/trade-in/trade-in.component';
import { ServiceTrackerComponent } from './pages/service-tracker/service-tracker.component';
import { TestDriveComponent } from './pages/test-drive/test-drive.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    ChatComponent,
    SearchComponent,
    PriceCalculatorComponent,
    TradeInComponent,
    ServiceTrackerComponent,
    TestDriveComponent,
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
