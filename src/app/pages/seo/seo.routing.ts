import { Routes, RouterModule } from '@angular/router';
import { SeoComponent } from "./seo.component";
import { AuthManager } from '../../authManager';

import { ProductEditComponent, ProductListComponent } from "./components/products";

import { AuthorEditComponent, AuthorListComponent } from "./components/author";
import { CategoryEditComponent, CategoryListComponent,} from "./components/category";
import { PublisherEditComponent, PublisherListComponent} from "./components/publisher";

const routes: Routes = [
  {
    path: '',
    component: SeoComponent,
    children: [
      { path: 'product', component: ProductListComponent, canActivate: [AuthManager] },
      { path: 'product/edit/:id', component: ProductEditComponent, canActivate: [AuthManager] },

      { path: 'author', component: AuthorListComponent, canActivate: [AuthManager] },
      { path: 'author/edit/:id', component: AuthorEditComponent, canActivate: [AuthManager] },

      { path: 'category', component: CategoryListComponent, canActivate: [AuthManager] },
      { path: 'category/edit/:id', component: CategoryEditComponent, canActivate: [AuthManager] },

      { path: 'publisher', component: PublisherListComponent, canActivate: [AuthManager] },
      { path: 'publisher/edit/:id', component: PublisherEditComponent, canActivate: [AuthManager] }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
