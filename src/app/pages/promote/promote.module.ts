import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  ModalModule,
  PaginationModule,
  TabsModule,
  AlertModule
} from "ngx-bootstrap";
import { SimpleNotificationsModule } from "angular2-notifications";
import { UiSwitchModule } from "ng2-ui-switch";
import { NgaModule } from "../../theme/nga.module";
import { SharedModule } from "../../shared/shared.module";
import { SpinnerModule } from 'angular2-spinner/dist';

import { PromoteComponent } from "./promote.component";

import { GenerationSmsComponent } from "./components/generation-sms/generation-sms.componenet";
import { GenerationSmsEditComponent } from "./components/generation-sms/generation-sms.edit.component";
import { GenerationSmsListComponent } from "./components/generation-sms/generation-sms.list.component";
import { MessageTemplateComponent } from "./components/message-template/message-template.component";
import { GenerationSmsService } from "./components/generation-sms/generation-sms.service";
import { MessageService } from "./components/generation-sms/message.service";

import { routing } from "./promote.routing";
import { DiscountPanelService, DiscountPanelComponent } from './components/discount-panel';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    routing,
    UiSwitchModule,
    SharedModule,
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    AlertModule.forRoot(),
    ReactiveFormsModule,
    SimpleNotificationsModule,
    SpinnerModule
  ],
  declarations: [
    PromoteComponent,
    GenerationSmsComponent,
    GenerationSmsListComponent,
    GenerationSmsEditComponent,
    MessageTemplateComponent,
    DiscountPanelComponent
  ],
  providers: [MessageService, GenerationSmsService, DiscountPanelService]
})
export class PromoteModule {}
