import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { JsonpModule } from '@angular/http';

import { Home } from './home.component';
import { routing } from './home.routing';
import { HomeService } from './home.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    routing,
    JsonpModule
  ],
  declarations: [
    Home
  ],
  providers: [
    HomeService
  ]
})
export class HomeModule { }
