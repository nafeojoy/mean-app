import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './pages.routing';
import { NgaModule } from '../theme/nga.module';

import { Pages } from './pages.component';
import { AuthManager } from '../authManager';

@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    routing,
  ],
  declarations: [Pages],
  providers: [AuthManager]
})
export class PagesModule { }
