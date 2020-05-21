import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, PaginationModule, TabsModule, AlertModule } from "ngx-bootstrap";
import { SimpleNotificationsModule } from 'angular2-notifications';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgaModule } from '../../theme/nga.module';
import { SharedModule } from '../../shared/shared.module';
import { SpinnerModule } from 'angular2-spinner/dist';


import { routing } from './crm.routing';
import { CrmComponent } from './crm.component';
import { CRMService } from './crm.service';


@NgModule({

  declarations: [
    CrmComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    UiSwitchModule,
    SharedModule,
    ModalModule.forRoot(), PaginationModule.forRoot(), TabsModule.forRoot(), AlertModule.forRoot(),
    ReactiveFormsModule,
    SimpleNotificationsModule,
    SpinnerModule,
    routing
  ],
  providers: [
    CRMService
  ]
})
export class CrmModule { }
