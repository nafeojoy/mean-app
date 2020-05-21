import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { TreeNode, TREE_ACTIONS, KEYS, IActionMapping } from 'angular-tree-component';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';

import { UserManagementStore } from "../../user-management.store";
import { MenuService } from "./menu.service";
import 'style-loader!./menu.scss';


const actionMapping: IActionMapping = {
    mouse: {
        click: TREE_ACTIONS.FOCUS
    },
    keys: {
        [KEYS.ENTER]: (tree, node, $event) => alert(`This is ${node.data.name}`)
    }
}

@Component({
    selector: 'menu-create',
    templateUrl: './menu.create.html',
})

export class MenuCreateComponent extends UserManagementStore {

    public menu: any = { data: { menu: { selected: false, expanded: false } } };
    public nodes: any = [];
    public alerts: any = [];
    public selectedParent: any = {};
    public selectedPermission: {};
    public optionsModel: any[]


    constructor(private menuService: MenuService) { super(); }

    ngOnInit() {
        this.optionsModel = [3, 4];
        this.menu.is_enabled = true;
        this.menuService.getRoot().subscribe(result => {
            this.nodes = result;
        })
    }

    options = {
        actionMapping,
        getChildren: (node: TreeNode) => {
            return this.childTree(node.data._id).then(res => {
                return res;
            });
        }
    };

    childTree(id: any) {
        return new Promise((resolve, reject) => {
            this.menuService.getChild(id).subscribe((res) => {
                resolve(res);
            });
        })
    }

    onEvent(ev: any) {
        let id = ev.node.data._id;
        this.selectedParent = ev.node.data;
        this.menu.parent = ev.node.data;
    }

    createMenu() {

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
        this.menuService.add(this.menu).subscribe(result => {
            if (result._id) {
                this.menuService.getRoot().subscribe(result => {
                    this.nodes = result;
                })
                this.menu = { is_enabled: true, data: { menu: { selected: false, expanded: false } } };
                this.optionsModel = [];
                this.selectedParent = {};
                this.alerts.push({
                    type: 'info',
                    msg: 'New Menu Saved',
                    timeout: 4000
                });
            } else {
                this.alerts.push({
                    type: 'danger',
                    msg: 'Please Login first and try again',
                    timeout: 4000
                });
            }
        })
    }

    onChange(test) {
        console.log(test);
    }  
}