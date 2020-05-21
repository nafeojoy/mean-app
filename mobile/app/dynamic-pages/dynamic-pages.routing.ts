import { Routes, RouterModule } from '@angular/router';
import { DynamicPagesComponent } from './dynamic-pages.component';
import { AuthManager } from '../authManager';


const routes: Routes = [
  {
    path: '',
    component: DynamicPagesComponent,
    canActivate: [AuthManager]
  }
];

export const routing = RouterModule.forChild(routes);