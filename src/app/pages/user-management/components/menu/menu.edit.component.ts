import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { UserManagementStore } from "../../user-management.store";
import { MenuService } from "./menu.service";

@Component({
    selector: 'menu-edit',
    templateUrl: './menu.edit.html',
})
export class MenuEditComponent extends UserManagementStore {

    public menu: any = { parent: {}, data: { menu: { selected: false, expanded: false } } };
    public optionsModel: any[]
    public alerts: any = [];
    constructor(private menuService: MenuService, private route: ActivatedRoute, private location: Location, ) { super() }

    ngOnInit() {
        this.optionsModel = [2, 3];
        let menu_id = this.route.snapshot.params['id'];
        this.menuService.get(menu_id).subscribe(result => {
            this.menu = result;
            let selected_permissions = result.permissions.map(obj => {
                return obj.value;
            })
            this.optionsModel = this.permissions.filter(obj => {
                return selected_permissions.indexOf(obj.value) > -1
            }).map(itm => {
                return itm.id;
            })
        })
    }


    updateMenu() {
        if (Array.isArray(this.optionsModel) && this.optionsModel.length > 0) {
            var selectedPermission = this.permissions.filter(obj => {
                return this.optionsModel.indexOf(obj.id) > -1;
            }).map(selectedObj => {
                var newObj = {};
                newObj['name'] = selectedObj.name;
                newObj['value'] = selectedObj.value;
                newObj['status'] = false;
                return newObj;
            })

            this.menu.permissions = selectedPermission;
        }
        this.menu.permissions = this.menu.permissions ? this.menu.permissions : [];

        this.menuService.update(this.menu).subscribe(result => {
            if (result._id) {
                this.location.back();
            } else {
                this.alerts.push({
                    type: 'danger',
                    msg: 'You may not loggedIn, Please Login first and try again.',
                    timeout: 4000
                });
            }
        })

    }


    onChange(test) {
         // console.log(test);
    }
}