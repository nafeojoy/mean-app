import {Component} from '@angular/core';
import { AuthManager } from '../../authManager';

@Component({
  selector: 'catalog',
  template: `<router-outlet></router-outlet>`
})
export class Catalog {
  constructor() {
  }
}
