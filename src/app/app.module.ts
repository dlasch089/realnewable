import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';

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
    MatSelectModule,
    MatExpansionModule
  ],
  exports: [
    MatExpansionModule,
    MatSelectModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
