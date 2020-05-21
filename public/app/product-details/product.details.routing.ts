import { Routes, RouterModule } from '@angular/router';

import { ProductDetailComponent } from './product.details.component';
// import { DetailsComponent } from './details.component';
// import { AuthorDetailsComponent } from './components/author-details';

const routes: Routes = [
  {
    path: ':slug',
    component: ProductDetailComponent,
    // children: [
    //   { path: ':slug', component: ProductDetailComponent },
    // ]
  }
];

export const routing = RouterModule.forChild(routes);