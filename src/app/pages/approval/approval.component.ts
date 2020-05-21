import { Component } from '@angular/core';
import { AuthManager } from '../../authManager';

@Component({
  selector: 'approval-app',
  template: `<router-outlet></router-outlet>`
})
export class ApprovalComponent {
  constructor() {
  }
}
