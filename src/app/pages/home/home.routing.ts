import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { Home } from './home.component';
import { AuthManager } from '../../authManager';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    canActivate: [AuthManager]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
