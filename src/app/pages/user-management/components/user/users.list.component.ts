import { Component, ViewEncapsulation } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';

import { UserService } from "./users.service";
import { AuthManager } from "../../../../authManager";


import 'style-loader!./users.scss';

@Component({
    selector: 'users-list',
    templateUrl: './users.list.html',
})

export class UserListComponent {
    public users: any = [];

    constructor(private userService: UserService,
        public checker: AuthManager) { }

    ngOnInit() {
        this.userService.getAll().subscribe(result => {
            this.users = result;
        })
    }

    ifConfirmToDelete() {
        console.log("ifConfirmToDelete");
    }

    deleteUser(userId) {
        this.userService.delete(userId).subscribe(result => {
            this.users = result;
        })
    }
}