import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { EmailValidator, EqualPasswordsValidator } from '../../../../theme/validators';


import { PasswordUpdateService } from './password-update.service';

@Component({
  selector: 'password-update-user',
  encapsulation: ViewEncapsulation.None,
  // providers: [HeaderService],
  templateUrl: './password-update.html',
  styleUrls: ['./password-update.scss']
})

export class PasswordUpdateComponent {
  // @ViewChild('childModal') public childModal: ModalDirective;

  public alerts: any = [];

  public form: FormGroup;
  public isDisabled: boolean = true;
  public old_password: AbstractControl;
  public password: AbstractControl;
  public repeatPassword: AbstractControl;
  public passwords: FormGroup;



  constructor(private router: Router, fb: FormBuilder, private profileService: PasswordUpdateService) {

    this.form = fb.group({
      'old_password': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'passwords': fb.group({
        'password': ['', Validators.compose([Validators.required,  Validators.minLength(6)])],
        'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
      }, { validator: EqualPasswordsValidator.validate('password', 'repeatPassword') })

    });

    this.old_password = this.form.controls['old_password'];
    this.passwords = <FormGroup>this.form.controls['passwords'];
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
  }



  onSubmit(form: any) {
    form.password = form.old_password;
    this.profileService.changePassword(form).subscribe(res => {
      this.alerts.push({
        type: 'info',
        msg: res.message,
        timeout: 5000
      });
      this.form.reset();
    })

  }





}
