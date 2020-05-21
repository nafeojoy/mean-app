import { Routes, RouterModule } from '@angular/router';
import { AuthManager } from '../authManager';

import { ProductDetailComponent } from './product.details.component';


const routes: Routes = [
  {
    path: ':slug',
    component: ProductDetailComponent,
    canActivate: [AuthManager]
  }
];

export const routing = RouterModule.forChild(routes);