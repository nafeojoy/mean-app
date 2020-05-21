import { Injectable } from '@angular/core'
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { UserManagementStore } from './pages/user-management/user-management.store';
import { CookieService } from 'angular2-cookie/core';

@Injectable()
export class AuthManager extends UserManagementStore implements CanActivate {
    menu_permission: any = [];
    constructor(private router: Router, private _cookieService: CookieService) {
        super();
        this.menu_permission = JSON.parse(window.localStorage.getItem('menu_permission'));
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        let key = window.localStorage.getItem('auth_key');
        let admin_token = this._cookieService.get('admin_token');
        let menu_permission = window.localStorage.getItem('menu_permission');
        let languages = JSON.parse(window.localStorage.getItem('languages'));
        let menu = window.localStorage.getItem('menu');
        let isLoggedIn = admin_token && admin_token != '' && menu_permission && menu_permission != '' && languages && Array.isArray(languages) && languages.length > 0 && menu && menu != '';
        if (!isLoggedIn) {
            this.router.navigateByUrl('/login');
            return false;
        }

        let urls = state.url.split('/');
        let last_segment = urls[urls.length - 1];
        if (last_segment.indexOf('?') > -1) {
            last_segment = last_segment.split('?')[0];
        }
        let values = this.allPermissionValue;
        let current_permission: string;
        let last_path: string;

        if (last_segment.length == 24) {
            current_permission = urls[urls.length - 2];
            last_path = urls[urls.length - 3];
        } else if (values.indexOf(last_segment) > -1) {
            current_permission = last_segment;
            last_path = urls[urls.length - 2];
        } else {
            current_permission = "view";
            last_path = last_segment;
        }

        let isPermitted = this.hasPermission(last_path, current_permission)
        if (key != undefined && isPermitted)
            return true;

        this.router.navigateByUrl('/login');

        return false;
    }

    hasPermission(last_path, permission) {
        let visiting_menu = this.menu_permission.filter(obj => {
            return obj.path == last_path;
        });
        if (visiting_menu.length > 0) {
            let permited_operations = visiting_menu[0].permissions.map(obj => {
                if (obj.status) {
                    return obj.value;
                }
            })
            if (permited_operations.indexOf(permission) > -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    get canAdd() {
        let urls = this.router.url.split('/');
        let last_segment = urls[urls.length - 1];
        let visiting_menu = this.menu_permission.filter(obj => {
            return obj.path == last_segment;
        });
        if (visiting_menu.length > 0) {
            let permited_operations = visiting_menu[0].permissions.map(obj => {
                if (obj.status) {
                    return obj.value;
                }
            })
            if (permited_operations.indexOf('add') > -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    get canEdit() {
        let urls = this.router.url.split('/');
        let last_segment = urls[urls.length - 1];
        let visiting_menu = this.menu_permission.filter(obj => {
            return obj.path == last_segment;
        });
        if (visiting_menu.length > 0) {
            let permited_operations = visiting_menu[0].permissions.map(obj => {
                if (obj.status) {
                    return obj.value;
                }
            })
            if (permited_operations.indexOf('edit') > -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    get canDelete() {
        let urls = this.router.url.split('/');
        let last_segment = urls[urls.length - 1];
        let visiting_menu = this.menu_permission.filter(obj => {
            return obj.path == last_segment;
        });
        if (visiting_menu.length > 0) {
            let permited_operations = visiting_menu[0].permissions.map(obj => {
                if (obj.status) {
                    return obj.value;
                }
            })
            if (permited_operations.indexOf('delete') > -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}