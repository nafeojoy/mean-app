import { Routes, RouterModule } from '@angular/router';
import { MiscellaneousComponent } from './miscellaneous.component';
import { PartialOrderReturnComponent } from './components/partial-return/partial-return.component';

const routes: Routes = [
  {
    path: '',
    component: MiscellaneousComponent,
    children: [
      { path: 'partially-return/:id', component: PartialOrderReturnComponent
     }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
