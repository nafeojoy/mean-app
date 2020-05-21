import { Routes, RouterModule } from '@angular/router';
import { Catalog } from "./catalog.component";
import { AuthManager } from '../../authManager';

import { AuthorsAddComponent, AuthorsEditComponent, AuthorsListComponent } from "./components/authors";
import { PublisherAddComponent, PublisherEditComponent, PublisherListComponent } from "./components/publishers";
import { ProductAddComponent, ProductEditComponent, ProductListComponent, ImageUploaderComponent } from "./components/products";
import { CategoryAddComponent, CategoryEditComponent, CategoryListComponent } from "./components/categories";

import { AttributesListComponent, AttributesAddComponent, AttributesEditComponent } from "./components/attribute";

const routes: Routes = [
  {
    path: '',
    component: Catalog,
    children: [
      { path: 'authors', component: AuthorsListComponent, canActivate: [AuthManager] },
      { path: 'authors/add', component: AuthorsAddComponent, canActivate: [AuthManager] },
      { path: 'authors/edit/:id', component: AuthorsEditComponent, canActivate: [AuthManager] },

      { path: 'publishers', component: PublisherListComponent, canActivate: [AuthManager] },
      { path: 'publishers/add', component: PublisherAddComponent, canActivate: [AuthManager] },
      { path: 'publishers/edit/:id', component: PublisherEditComponent, canActivate: [AuthManager] },

      { path: 'products', component: ProductListComponent, canActivate: [AuthManager] },
      { path: 'products/add', component: ProductAddComponent, canActivate: [AuthManager] },
      { path: 'products/edit/:id', component: ProductEditComponent, canActivate: [AuthManager] },

      { path: 'categories', component: CategoryListComponent, canActivate: [AuthManager] },
      { path: 'categories/add', component: CategoryAddComponent, canActivate: [AuthManager] },
      { path: 'categories/add/:id', component: CategoryAddComponent, canActivate: [AuthManager] },
      { path: 'categories/edit/:id', component: CategoryEditComponent, canActivate: [AuthManager] },

      { path: 'attributes', component: AttributesListComponent, canActivate: [AuthManager] },
      { path: 'attributes/add', component: AttributesAddComponent, canActivate: [AuthManager] },
      { path: 'attributes/edit/:id', component: AttributesEditComponent, canActivate: [AuthManager] },

      { path: 'product-image/edit/:id', component: ImageUploaderComponent, canActivate: [AuthManager] },

    ]
  }
];

export const routing = RouterModule.forChild(routes);
