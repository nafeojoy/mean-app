import { Routes, RouterModule } from '@angular/router';

import { CrmComponent } from './crm.component';


const routes: Routes = [
  {
    path: '', component: CrmComponent
  }
];

export const routing = RouterModule.forChild(routes);