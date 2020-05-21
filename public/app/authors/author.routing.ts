import { Routes, RouterModule } from '@angular/router';

import { AuthorListComponent } from './authors.component';

const routes: Routes = [
  {
    path: '', component: AuthorListComponent
  }
];

export const routing = RouterModule.forChild(routes);