import { Component, ViewEncapsulation } from "@angular/core";
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';

import { EmailValidator, EqualPasswordsValidator } from '../../../../theme/validators';
import { UserService } from "./users.service";
import { RoleService } from "../role/role.service";

import 'style-loader!./users.scss';

@Component({
    selector: 'users',
    templateUrl: './users.add.html',
})
export class UserAddComponent {

    public form: FormGroup;
    public passwords: FormGroup;
    
    //public submitted: boolean = false;    
    public alerts: any = [];
    
    public first_name: AbstractControl;
    public last_name: AbstractControl;
    public name: AbstractControl;
    public email: AbstractControl;
    public password: AbstractControl;
    public repeatPassword: AbstractControl;
    public role: AbstractControl;

    public roles = [];

    //options = { timeOut: 5000, showProgressBar: true, pauseOnHover: false, clickToClose: true, maxLength: 50 };
    //selectedDesignation: String;
    //selectedRoleObject = { name: '', _id: '' };

    constructor(fb: FormBuilder, private roleService: RoleService,
        private userService: UserService, private location: Location) {

        this.form = fb.group({
            'first_name': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
            'last_name': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
            'role': ['', Validators.required],
            'name': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
            'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
            'passwords': fb.group({
                'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
                'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
            }, { validator: EqualPasswordsValidator.validate('password', 'repeatPassword') })
        });

        this.first_name = this.form.controls['first_name'];
        this.last_name = this.form.controls['last_name'];
        this.role = this.form.controls['role'];
        this.name = this.form.controls['name'];
        this.email = this.form.controls['email'];
        this.passwords = <FormGroup>this.form.controls['passwords'];
        this.password = this.passwords.controls['password'];
        this.repeatPassword = this.passwords.controls['repeatPassword'];
    }

    ngOnInit() {
        this.roleService.getAll().subscribe((res) => {
            this.roles = res;
        });
    }


    registerMessage = "";
    public onSubmit(values): void {
        //this.submitted = true;
        if (this.form.valid) {
            let newUser = {
                first_name: values.first_name,
                last_name: values.last_name,
                role: values.role,
                username: values.name,
                password: values.passwords.password,
                email: values.email,
                is_enabled: true
            }

            this.userService.add(newUser).subscribe(res => {
                if (res._id) {
                    this.alerts.push({
                        type: 'info',
                        msg: res.message,
                        timeout: 4000
                    });
                    this.form.reset();
                    setTimeout(() => {
                        this.location.back();
                    }, 2000);
                } else {
                    this.alerts.push({
                        type: 'danger',
                        msg: res.message,
                        timeout: 4000
                    });
                }
            })
        }
    }
}