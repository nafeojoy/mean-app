import { Component } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { Routes } from '@angular/router';

import { BaMenuService } from '../../theme';
import { PAGES_MENU } from '../pages.menu';

import { LoginService } from "./login.service";
import { AppState } from "../../app.service";


import 'style-loader!./login.scss';

@Component({
    selector: 'login',
    templateUrl: './login.html',
})
export class Login {

    loginMessage = '';
    isAuthenticate: boolean = false;

    allItems: any = [];
    rootParent: any = {};
    arrangedItems: any = {};
    menuPermission: any = [];

    user = {
        username: '',
        password: ''
    }

    constructor(private loginService: LoginService,
        private router: Router,
        private appState: AppState,
        private _menuService: BaMenuService) { }


    ngOnInit() {
        let token = window.localStorage.getItem('auth_key');
        let menu_permission = window.localStorage.getItem('menu_permission');
        let languages = JSON.parse(window.localStorage.getItem('languages'));
        let menu = window.localStorage.getItem('menu');

        let isLoggedIn = token && token != '' && menu_permission && menu_permission != '' && languages && Array.isArray(languages) && languages.length > 0 && menu && menu != '';
        if (isLoggedIn) {
            this.router.navigateByUrl('/pages/dashboard');
        }
    }


    submit(data) {
        this.loginService.login(data).subscribe((res) => {
            if (res.admin_token != undefined) {
                window.localStorage.setItem('auth_key', res.admin_token);
                window.localStorage.setItem('menu_permission', JSON.stringify(res.user.role.menu));
                window.localStorage.setItem('languages', JSON.stringify(res.user.languages));
                let user = { name: res.user.first_name + ' ' + res.user.last_name, id: res.user._id, role: res.user.role.name };
                window.localStorage.setItem('user', JSON.stringify(user));
                let result = res.user.role.full_generation;
                this.allItems = result.map(itm => {
                    let childs = result.filter(obj => {
                        return itm._id == obj.parent;
                    })
                    if (childs.length > 0) {
                        itm['hasChildren'] = true;
                        return itm;
                    } else {
                        itm['hasChildren'] = false;
                        return itm;
                    }
                });

                this.getMenuTree();
            } else {
                this.loginMessage = res.message;
            }
        })
    }


    getMenuTree() {
        this.rootParent = this.allItems.filter(obj => {
            return !obj.parent;
        }).map(data => {
            const rootMenu = {
                _id: data._id,
                hasChildren: data.hasChildren,
                path: data.path,
                parent: null
            }
            return rootMenu;
        })[0];

        this.arrangedItems = this.makeChildren(this.rootParent);
        let menu = [this.arrangedItems];
        window.localStorage.setItem('menu', JSON.stringify(this.arrangedItems));
        this._menuService.updateMenuByRoutes(<Routes>menu);
        this.isAuthenticate = true;
        this.router.navigateByUrl('/pages/dashboard');
    }


    makeChildren(root) {
        var children = this.findChildren(root._id);
        if (children.length > 0) {
            root.children = [];
            for (var j = 0; j < children.length; j++) {
                if (children[j].hasChildren) {
                    var items = this.makeChildren(children[j]);
                    root.children.push(items);
                } else {
                    var items = children[j]
                    root.children.push(items);
                }
            }
        }
        return root;
    }

    findChildren(id) {
        let childs: any = [];
        for (var i = 0; i < this.allItems.length; i++) {
            if (this.allItems[i].parent == id) {
                const item =
                    {
                        _id: this.allItems[i]._id,
                        hasChildren: this.allItems[i].hasChildren,
                        'path': this.allItems[i].path,
                        parent: null,
                        data: this.allItems[i].data
                    }

                childs.push(item);
            }
        }
        return childs;
    }
}
