import {Component} from '@angular/core';
import { AuthManager } from '../../authManager';

@Component({
  selector: 'user-management',
  template: `<router-outlet></router-outlet>`
})
export class UserManagement {
  constructor() {
  }
}
