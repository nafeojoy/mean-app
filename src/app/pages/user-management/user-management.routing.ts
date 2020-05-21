import { Routes, RouterModule } from '@angular/router';

import { AuthManager } from '../../authManager';


import { UserManagement } from "./user-management.component";
import { MenuCreateComponent } from "./components/menu/menu.create.component";
import { MenuListComponent } from "./components/menu/menu.list.component";
import { MenuEditComponent } from "./components/menu/menu.edit.component";

import { RoleListComponent } from "./components/role/role.list.component";
import { RoleCreateComponent } from "./components/role/role.create.component";
import { RoleEditComponent } from "./components/role/role.edit.component";

import { UserAddComponent } from "./components/user/users.add.component";
import { UserListComponent } from "./components/user/users.list.component";
import { UserEditComponent } from "./components/user/users.edit.component";

import {PasswordUpdateComponent} from "./components/password-update";

const routes: Routes = [
    {
        path: '',
        component: UserManagement,
        children: [
            { path: 'menus', component: MenuListComponent, canActivate: [AuthManager] },
            { path: 'menus/add', component: MenuCreateComponent, canActivate: [AuthManager] },
            { path: 'menus/edit/:id', component: MenuEditComponent, canActivate: [AuthManager] },

            { path: 'roles', component: RoleListComponent, canActivate: [AuthManager] },
            { path: 'roles/add', component: RoleCreateComponent, canActivate: [AuthManager] },
            { path: 'roles/edit/:id', component: RoleEditComponent, canActivate: [AuthManager] },

            { path: 'users', component: UserListComponent, canActivate: [AuthManager] },
            { path: 'users/add', component: UserAddComponent, canActivate: [AuthManager] },
            { path: 'users/edit/:id', component: UserEditComponent, canActivate: [AuthManager] },

            { path: 'password-update', component: PasswordUpdateComponent, canActivate: [AuthManager] },
        ]
    }
];

export const routing = RouterModule.forChild(routes);
