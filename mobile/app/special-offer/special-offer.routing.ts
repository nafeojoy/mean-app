import { Routes, RouterModule } from '@angular/router';
import { AuthManager } from '../authManager';

import { SpecialOfferComponent } from './';

const routes: Routes = [
  {
    path: '', component: SpecialOfferComponent, canActivate: [AuthManager]
  }
];

export const routing = RouterModule.forChild(routes);