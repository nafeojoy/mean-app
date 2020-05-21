import { Routes, RouterModule } from '@angular/router';

import { DynamicPageComponent } from "./dynamic-page.component";
import { ArticleAddComponent, ArticleEditComponent, ArticleListComponent, ArticleService} from "./components/article";
import { UploadedImagesAddComponent, UploadedImagesEditComponent, UploadedImagesListComponent, UploadedImagesService} from "./components/uploaded-images";


import { AuthManager } from '../../authManager';

const routes: Routes = [
  {
    path: '',
    component: DynamicPageComponent,
    children: [
     
      { path: 'article', component: ArticleListComponent, canActivate: [AuthManager] },
      { path: 'article/add', component: ArticleAddComponent, canActivate: [AuthManager] },
      { path: 'article/edit/:id', component: ArticleEditComponent, canActivate: [AuthManager] },
      { path: 'uploaded-images', component: UploadedImagesListComponent, canActivate: [AuthManager] },
      { path: 'uploaded-images/add', component: UploadedImagesAddComponent, canActivate: [AuthManager] },
      { path: 'uploaded-images/edit/:id', component: UploadedImagesEditComponent, canActivate: [AuthManager] },

    ]
  }
];

export const routing = RouterModule.forChild(routes);
