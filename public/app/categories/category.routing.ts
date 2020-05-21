import { Routes, RouterModule } from '@angular/router';

import { CategoryListComponent } from './categories.component';

const routes: Routes = [
  { path: '', component: CategoryListComponent }
];

export const routing = RouterModule.forChild(routes);