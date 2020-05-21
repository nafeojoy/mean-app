import { Routes, RouterModule } from '@angular/router';
import { SupportComponent } from './support.component';

import { HelpAndSupportComponent } from "./components/help-and-support";
import { FaqComponent } from "./components/faq";
import { HelpDeskComponent } from "./components/help-desk";

const routes: Routes = [
    {
        path: '',
        component: SupportComponent,
        children: [
            { path: 'faq', component: FaqComponent },
            { path: 'help-and-support', component: HelpAndSupportComponent },
            { path: 'help-desk', component: HelpDeskComponent },
        ]
    }
];

export const routing = RouterModule.forChild(routes);