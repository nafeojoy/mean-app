import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { EmailValidator, EqualPasswordsValidator } from '../../../../theme/validators';
import { RoleService } from "../role/role.service";
import { Location } from '@angular/common';

import { UserService } from './users.service';

import 'style-loader!./users.scss';

@Component({
    selector: 'user-edit',
    templateUrl: './users.edit.html',
})
export class UserEditComponent {

    public form: FormGroup;
    public alerts: any = [];

    public user_id: string;
    public first_name: AbstractControl;
    public last_name: AbstractControl;
    public name: AbstractControl;
    public email: AbstractControl;
    public role: AbstractControl;

    public user: any = {};
    public roles = [];

    constructor(private fb: FormBuilder, private roleService: RoleService,
        private userService: UserService, private location: Location, private route: ActivatedRoute) {
        this.user_id = this.route.snapshot.params['id'];

        this.form = fb.group({
            'first_name': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
            'last_name': ['', Validators.required],
            'name': [{ value: '', disabled: true }, Validators.compose([Validators.required, Validators.minLength(4)])],
            'email': [{ value: '', disabled: true }, Validators.compose([Validators.required, EmailValidator.validate])],
            'role': ['', Validators.required]
        });

        this.first_name = this.form.controls['first_name'];
        this.last_name = this.form.controls['last_name'];
        this.name = this.form.controls['name'];
        this.email = this.form.controls['email'];
        this.role = this.form.controls['role'];

        this.userService.get(this.user_id).subscribe(result => {
            this.user = result.user;
            this.roles = result.roles;
            this.first_name.setValue(this.user.first_name);
            this.last_name.setValue(this.user.last_name);
            this.name.setValue(this.user.local.username);
            this.email.setValue(this.user.local.email);
            this.role.setValue(this.user.role);
        })
    }

    editUser(values) {
        //this.submitted = true;
        if (this.form.valid) {
            let newUser = {
                _id: this.user_id,
                first_name: values.first_name,
                last_name: values.last_name,
                role: values.role,
            }
            this.userService.update(newUser).subscribe(res => {
                if (res._id) {
                    this.alerts.push({
                        type: 'info',
                        msg: "User updated successfully",
                        timeout: 4000
                    });

                    this.form.reset();
                    setTimeout(() => {
                        this.location.back();
                    }, 2000);
                } else {
                    this.alerts.push({
                        type: 'danger',
                        msg: 'Update failed, Login first and try again!',
                        timeout: 4000
                    });
                }
            })
        }
    }
}