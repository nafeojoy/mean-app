import {Component} from '@angular/core';
import { AuthManager } from '../../authManager';

@Component({
  selector: 'inventory-app',
  template: `<router-outlet></router-outlet>`
})
export class InventoryComponent {
  constructor() {
  }
}