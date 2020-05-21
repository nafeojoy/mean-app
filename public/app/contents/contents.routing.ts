import { Routes, RouterModule } from '@angular/router';
import { ContentsComponent } from './contents.component';
import { ReviewListComponent} from "./components/review-list";
import { TestimonialListComponent} from "./components/testimonial-list";
import { NewsListComponent, NewsDetailComponent } from "./components/news";
import { ArticlesListComponent, ArticlesDetailComponent } from "./components/articles";

import { PurchaseListComponent} from "./components/purchase-list";
// import { ArticleListComponent } from 'app/pages/dynamic-page/components/article';
const routes: Routes = [
  {
    path: '',
    component: ContentsComponent,
    children: [
      { path: 'review-list', component: ReviewListComponent },
      { path: 'testimonial-list', component: TestimonialListComponent },
      { path: 'news', component: NewsListComponent },
      { path: 'news/detail/:id', component: NewsDetailComponent },
      { path: 'dynamic-page', component: ArticlesListComponent},
      { path: 'dynamic-page/detail/:id', component: ArticlesDetailComponent },
      { path: 'purchase-list', component: PurchaseListComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);