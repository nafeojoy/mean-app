import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, PaginationModule, AlertModule } from "ng2-bootstrap";
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgaModule } from '../../theme/nga.module';
import { TreeModule } from 'angular-tree-component';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

import { AuthManager } from "../../authManager";
import { SharedModule } from '../../shared/shared.module';
import { DropdownTreeviewModule } from '../../tree/dropdown-treeview.module';
import { routing } from "./user-management.routing";

import { UserManagement } from "./user-management.component";
import { MenuCreateComponent } from "./components/menu/menu.create.component";
import { MenuListComponent } from "./components/menu/menu.list.component";
import { MenuEditComponent } from "./components/menu/menu.edit.component";

import { RoleCreateComponent } from "./components/role/role.create.component";
import { RoleListComponent } from "./components/role/role.list.component";
import { RoleEditComponent } from "./components/role/role.edit.component";

import { UserAddComponent } from "./components/user/users.add.component";
import { UserListComponent } from "./components/user/users.list.component";
import { UserEditComponent } from "./components/user/users.edit.component";

import { RoleService } from "./components/role/role.service";
import { MenuService } from "./components/menu/menu.service";
import { UserService } from "./components/user/users.service";

import {PasswordUpdateComponent, PasswordUpdateService} from "./components/password-update";

// import { DropdownTreeviewModule } from 'ng2-dropdown-treeview';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgaModule,
        SharedModule,
        routing,
        UiSwitchModule,
        TreeModule,
        ModalModule.forRoot(), PaginationModule.forRoot(), AlertModule.forRoot(),
        MultiselectDropdownModule,
        DropdownTreeviewModule.forRoot()
    ],
    declarations: [
        UserManagement,

        MenuCreateComponent,
        MenuListComponent,
        MenuEditComponent,

        RoleCreateComponent,
        RoleListComponent,
        RoleEditComponent,

        UserAddComponent,
        UserListComponent,
        UserEditComponent,

        PasswordUpdateComponent

    ],
    providers: [
        MenuService, RoleService, UserService, AuthManager, PasswordUpdateService ]
})
export class UserManagementModule { }
