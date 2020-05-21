import { Routes, RouterModule } from '@angular/router';
import { AuthManager } from '../authManager';

import { PublisherListComponent } from './publishers.component';

const routes: Routes = [
  {
    path: '', component: PublisherListComponent, canActivate: [AuthManager]
  }
];

export const routing = RouterModule.forChild(routes);