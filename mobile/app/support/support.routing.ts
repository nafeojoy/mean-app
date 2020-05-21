import { Routes, RouterModule } from '@angular/router';
import { SupportComponent } from './support.component';
import { AuthManager } from '../authManager';

import { HelpAndSupportComponent } from "./components/help-and-support";
import { FaqComponent } from "./components/faq";
import { HelpDeskComponent } from "./components/help-desk";

const routes: Routes = [
    {
        path: '',
        component: SupportComponent,
        children: [
            { path: 'faq', component: FaqComponent, canActivate: [AuthManager] },
            { path: 'help-and-support', component: HelpAndSupportComponent, canActivate: [AuthManager] },
            { path: 'help-desk', component: HelpDeskComponent, canActivate: [AuthManager] },
        ]
    }
];

export const routing = RouterModule.forChild(routes);