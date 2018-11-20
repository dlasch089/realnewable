import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSelectModule} from '@angular/material/select';

// Components
import { AppComponent } from './app.component';
import { ResultsComponent } from './components/results/results.component';
import { HomeComponent } from './pages/home/home.component';
import { ResultPageComponent } from './pages/result-page/result-page.component';
import { UserInputComponent } from './components/user-input/user-input.component';

// Routes
const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'results', component: ResultPageComponent}
];

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
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MatSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
