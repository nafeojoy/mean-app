import { Routes, RouterModule } from '@angular/router';

import { SpecialOfferComponent } from './';

const routes: Routes = [
  {
    path: '', component: SpecialOfferComponent
  }
];

export const routing = RouterModule.forChild(routes);