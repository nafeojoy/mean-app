import {Component} from '@angular/core';
import { AuthManager } from '../../authManager';

@Component({
  selector: 'system',
  template: `<router-outlet></router-outlet>`
})
export class System {
  constructor() {
  }
}
