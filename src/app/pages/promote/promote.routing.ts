import { Routes, RouterModule } from '@angular/router';

import { PromoteComponent } from "./promote.component";
import { GenerationSmsComponent } from "./components/generation-sms/generation-sms.componenet";
import { GenerationSmsEditComponent } from "./components/generation-sms/generation-sms.edit.component";
import { GenerationSmsListComponent } from "./components/generation-sms/generation-sms.list.component";
import { MessageTemplateComponent } from "./components/message-template/message-template.component";

import { AuthManager } from '../../authManager'
import { DiscountPanelComponent } from './components/discount-panel';

const routes: Routes = [
  {
    path: '',
    component: PromoteComponent,
    children: [
      { path: 'sms-generation', component: GenerationSmsListComponent },
      { path: 'sms-generation/add', component: GenerationSmsComponent },
      { path: 'sms-generation/edit/:id', component: GenerationSmsEditComponent },
      { path: 'message-template', component: MessageTemplateComponent },
      { path: 'discount-panel', component: DiscountPanelComponent, canActivate:[AuthManager] }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
