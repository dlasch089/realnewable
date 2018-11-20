import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ResultsComponent } from './components/results/results.component';
import { HomeComponent } from './pages/home/home.component';
import { ResultPageComponent } from './pages/result-page/result-page.component';
import { UserInputComponent } from './components/user-input/user-input.component';

@NgModule({
  declarations: [
    AppComponent,
    ResultsComponent,
    HomeComponent,
    ResultPageComponent,
    UserInputComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
