import { Component} from "@angular/core";
import { TreeNode, TREE_ACTIONS, KEYS, IActionMapping } from 'angular-tree-component';
import { Meta, Title } from "@angular/platform-browser";
import { AuthManager } from "../../../../authManager";
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
    selector: 'menu-list',
    templateUrl: './menu.list.html',
})

export class MenuListComponent extends UserManagementStore {

    public menu: any = { data: { menu: { selected: false, expanded: false } } };
    public nodes: any = [];
    public alerts: any = [];
    public selectedParent: any = {};
    public selectedPermission: {};
    public optionsModel: any[]
    public isShowDetail: boolean;
    public detail: any = {};
    public permissions: any = [];
    public data: any = {};

    constructor(private menuService: MenuService, public checker: AuthManager,  meta: Meta, title: Title) {
        super();
        title.setTitle('Menu List');
    }

    ngOnInit() {
        this.menu.is_enabled = true;
        this.isShowDetail = false;
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
        this.isShowDetail = true;
        let id = ev.node.data._id;
        this.menuService.get(id).subscribe(result => {
            this.permissions = result.permissions;
            this.data = result.data.menu;
            this.detail = result;
        })
    }

    DeleteMenu(menuId) {
        this.menuService.delete(menuId).subscribe(result => {
            this.nodes = result;
        })
    }

}