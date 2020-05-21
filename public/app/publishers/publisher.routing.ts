import { Routes, RouterModule } from '@angular/router';

import { PublisherListComponent } from './publishers.component';

const routes: Routes = [
  {
    path: '', component: PublisherListComponent
  }
];

export const routing = RouterModule.forChild(routes);