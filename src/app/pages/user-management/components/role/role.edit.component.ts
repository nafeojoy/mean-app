import { Component, ViewEncapsulation, Injectable, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { RoleService } from "./role.service";
import { MenuService } from "../menu/menu.service";
import 'style-loader!./role.scss';

import * as _ from 'lodash';
import {
    TreeviewI18n, TreeviewItem, TreeviewConfig, TreeviewHelper, TreeviewComponent,
    TreeviewEventParser, OrderDownlineTreeviewEventParser, DownlineTreeviewItem
} from '../../../../tree';

@Injectable()
export class ProductTreeviewConfig extends TreeviewConfig {
    isShowAllCheckBox = true;
    isShowFilter = true;
    isShowCollapseExpand = false;
    maxHeight = 500;

}

@Component({
    selector: 'role-edit',
    templateUrl: './role.edit.html',
    providers: [
        RoleService,
        { provide: TreeviewEventParser, useClass: OrderDownlineTreeviewEventParser },
        { provide: TreeviewConfig, useClass: ProductTreeviewConfig }
    ]
})

export class RoleEditComponent {

    @ViewChild(TreeviewComponent) treeviewComponent: TreeviewComponent;

    public items: any[];
    public rows: string[];
    public role: any = {};
    public previous_menus: any[];
    public checked_id = [];
    public selected_items = [];
    public alerts:any=[];

    constructor(private route: ActivatedRoute, private location: Location, private roleService: RoleService, private menuService: MenuService) { }

    ngOnInit() {
        let role_id = this.route.snapshot.params['id'];
        this.roleService.get(role_id).subscribe(result => {
            this.role = result;
            this.checked_id = result.menu.map(obj => { return obj._id });
            this.previous_menus = result.menu;
            this.selected_items = this.previous_menus;
            this.getMenuTree();
        })
    }

    onChange(item: TreeviewItem) {
        if (item.checked) {
            let item_index = this.checked_id.indexOf(item._id)
            if (item_index > -1) {
                this.checked_id.splice(item_index, 1);
                item.permissions.map(obj => {
                    obj.status = false;
                    return obj;
                });
            }
        }
    }


    onSelectedChange(downlineItems: DownlineTreeviewItem[]) {
        this.rows = [];
        let items_array = [];
        downlineItems.forEach(downlineItem => {
            let selected_item: any = {};
            const item = downlineItem.item;
            const _id = item._id;
            const name = item.name;
            const hasChildren = item.hasChildren;
            const parent = item.parent;
            const path = item.path;

            if (this.checked_id.indexOf(_id) == -1) {
                const permissions = item.permissions.map(obj => {
                    obj.status = true;
                    return obj;
                });
                selected_item._id = _id;
                selected_item.name = name;
                selected_item.path = path;
                selected_item.permissions = permissions;
            } else {
                selected_item._id = _id;
                selected_item.name = name;
                selected_item.path = path;
                selected_item.permissions = item.permissions;
            }
            items_array.push(selected_item);
            this.checked_id.push(_id);
            const data = item.data;
            const texts = [item.text];
            let parent1 = downlineItem.parent1;
            while (!_.isNil(parent)) {
                texts.push(parent1.item.text);
                parent1 = parent1.parent1;
            }
            const reverseTexts = _.reverse(texts);
            const row = `${reverseTexts.join(' -> ')} : ${_id}`;
            this.rows.push(row);
        });

        this.selected_items = items_array;
    }


    allItems: any = [];
    rootParent: any = {};
    arrangedItems: any = {};
    getMenuTree() {
        this.menuService.getAll().subscribe(result => {
            this.allItems = result;
            this.rootParent = result.filter(obj => {
                return !obj.parent;
            }).map(data => {
                const rootMenu = {
                    text: data.text,
                    _id: data._id,
                    hasChildren: data.hasChildren,
                    name: data.name,
                    path: data.path,
                    parent: null,
                    permissions: data.permissions,
                    data: data.data
                }
                return rootMenu;
            })[0];

            this.arrangedItems = this.makeChildren(this.rootParent);
            this.items = [
                new TreeviewItem(
                    {
                        text: this.arrangedItems.text,
                        _id: this.arrangedItems._id,
                        hasChildren: this.arrangedItems.hasChildren,
                        name: this.arrangedItems.name,
                        path: this.arrangedItems.path,
                        parent: null,
                        permissions: this.arrangedItems.permissions,
                        data: this.arrangedItems.data,
                        children: this.arrangedItems.children
                    }
                )
            ]
        })
    }
    makeChildren(root) {
        var children = this.findChildren(root._id);
        if (children.length > 0) {
            root.children = new Array<TreeviewItem>(children.length);
            for (var j = 0; j < children.length; j++) {
                if (children[j].hasChildren) {
                    var items = this.makeChildren(children[j]);
                    root.children[j] = items;
                } else {
                    var items = children[j]
                    root.children[j] = items;
                }
            }
        }
        return root;
    }

    findChildren(id) {
        let childs: any = [];
        for (var i = 0; i < this.allItems.length; i++) {
            if (this.allItems[i].parent == id) {
                let is_chacked: boolean;
                let exist_permission: any;
                let exist_menu = this.previous_menus.filter(obj => {
                    return this.allItems[i]._id == obj._id;
                })
                if (exist_menu.length > 0) {
                    is_chacked = true;
                    exist_permission = exist_menu[0].permissions;
                } else {
                    is_chacked = false;
                    exist_permission = this.allItems[i].permissions;
                }
                const item = new TreeviewItem(
                    {
                        text: this.allItems[i].text,
                        _id: this.allItems[i]._id,
                        hasChildren: this.allItems[i].hasChildren,
                        name: this.allItems[i].name,
                        path: this.allItems[i].path,
                        parent: null,
                        permissions: exist_permission,
                        data: this.allItems[i].data,
                        checked: is_chacked
                    })

                childs.push(item);
            }
        }
        return childs;
    }



    saveRole() {
        this.role.menu = this.selected_items;
        this.selected_items.map(itm => {
            this.myitms.push(itm._id);
            this.getParents(itm._id)
        })

        this.role.full_generation = this.myitms;
        this.roleService.update(this.role).subscribe(result => {
            if (result._id) {
                this.location.back();
            } else {
                this.alerts.push({
                    type: 'danger',
                    msg: 'Role save failed,Try again!',
                    timeout: 4000
                });
            }
        })
    }

    myitms = [];
    getParents(id) {
        let currentObj = this.allItems.filter(itms => {
            return itms._id == id;
        })[0]

        if (currentObj.parent) {
            if (this.myitms.indexOf(currentObj.parent) == -1) {
                this.myitms.push(currentObj.parent);
                this.getParents(currentObj.parent);
            }
        }
        return this.myitms;
    }
}