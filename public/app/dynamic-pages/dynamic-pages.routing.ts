import { Routes, RouterModule } from '@angular/router';
import { DynamicPagesComponent } from './dynamic-pages.component';



const routes: Routes = [
  {
    path: '',
    component: DynamicPagesComponent,
  
  }
];

export const routing = RouterModule.forChild(routes);