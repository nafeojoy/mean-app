import { Routes, RouterModule } from '@angular/router';

import { SubscriberComponent } from "./subscriber.component";
import { SubscriberViewComponent } from "./components/subscriber-view";
import { PasswordForgetComponent } from "./components/password-forget";
import { PasswordResetComponent } from "./components/password-reset";

const routes: Routes = [
  {
    path: '',
    component: SubscriberComponent,
    children: [
      { path: 'view', component: SubscriberViewComponent },
      { path: 'password-forget', component: PasswordForgetComponent },
      { path: 'password-reset/:token', component: PasswordResetComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);