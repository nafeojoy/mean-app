import { Routes, RouterModule } from '@angular/router';
import { AuthManager } from '../authManager';

import { AuthorListComponent } from './authors.component';

const routes: Routes = [
  {
    path: '', component: AuthorListComponent, canActivate: [AuthManager]
  }
];

export const routing = RouterModule.forChild(routes);