import { Component, ViewEncapsulation } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { RoleService } from "./role.service";
import { AuthManager } from "../../../../authManager";

import 'style-loader!./role.scss';

@Component({
    selector: 'role-list',
    templateUrl: './role.list.html',
})
export class RoleListComponent {
    public roles: any = [];

    constructor(private roleService: RoleService,
        public checker: AuthManager, meta: Meta, title: Title) {
        title.setTitle('Role List');

        meta.addTags([
            { name: 'author', content: 'Coursetro.com' },
            { name: 'keywords', content: 'angular seo, angular 4 universal, etc' },
            { name: 'description', content: 'This is my Angular SEO-based App, enjoy it!' }
        ]);

    }

    ngOnInit() {
        this.roleService.getAll().subscribe((res) => {
            this.roles = res;
        })
    }

    ifConfirmToDelete() {
        console.log("ifConfirmToDelete");
    }

    deleteRole(roleId) {
        this.roleService.delete(roleId).subscribe(result => {
            if (Array.isArray(result)) {
                this.roles = result;
            }
            else {
                console.log("ERROR")
            }
        })
    }

}