import { Routes, RouterModule } from '@angular/router';
import { InfoPagesComponent } from './info-pages.component';
import { AuthManager } from '../authManager';

import { AboutUsComponent } from './components/about-us';
import { ReturnPolicyComponent } from "./components/return-policy";
import { ContactUsComponent } from './components/contact-us';
import { NewsComponent } from './components/news';
import { MailVerifyComponent } from "./components/mail-verify";
import { PayAfterComponent } from "./components/pay-after";


const routes: Routes = [
  {
    path: '',
    component: InfoPagesComponent,
    children: [
      { path: 'about-us', component: AboutUsComponent, canActivate: [AuthManager] },
      { path: 'return-policy', component: ReturnPolicyComponent, canActivate: [AuthManager] },
      { path: 'contact-us', component: ContactUsComponent, canActivate: [AuthManager] },
      { path: 'news', component: NewsComponent, canActivate: [AuthManager] },
      { path: 'pay-after', component: PayAfterComponent },      
      { path: 'subscriber-verify/:token', component: MailVerifyComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);