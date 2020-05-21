import { Routes, RouterModule } from '@angular/router';

import { UserManualComponent } from "./user.manual.component";
import { DiscountCardComponent } from "./component/discount-card"
const routes: Routes = [
  {
    path: '',
    component: UserManualComponent,
    children: [
      { path: 'discount-card', component: DiscountCardComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);