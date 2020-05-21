import { Routes, RouterModule } from '@angular/router';
import { AuthManager } from '../authManager';

import { CategoryListComponent } from './categories.component';

const routes: Routes = [
  { path: '', component: CategoryListComponent , canActivate: [AuthManager]}
];

export const routing = RouterModule.forChild(routes);