import { Routes, RouterModule } from '@angular/router';

import { PublicPageComponent } from "./public-page.component";

import { FeatureCategoryListComponent } from "./components/feature-category";
import { FeatureAuthorListComponent } from "./components/feature-authors";
import { FeaturePublisherListComponent } from "./components/feature-publishers";
import { FeatureAttributeListComponent } from "./components/feature-attributes";
import { FeatureCategorysListComponent } from "./components/feature-categorys";

import { TestimonialAddComponent, TestimonialEditComponent, TestimonialListComponent } from "./components/testimonial";
import { NewsAddComponent, NewsEditComponent, NewsListComponent } from "./components/news";
import { StaticContentAddComponent, StaticContentEditComponent, StaticContentListComponent } from './components/static-content';
import { BannerEditComponent, BannerAddComponent, BannerListComponent } from "./components/banner";
import { PromotionalImageAddComponent, PromotionalImageEditComponent, PromotionalImageListComponent } from "./components/promotional-image";
import { PromotionalCodeAddComponent, PromotionalCodeEditComponent, PromotionalCodeListComponent } from "./components/promotional-code";
import { ReviewListComponent } from './components/review';
import { AuthManager } from '../../authManager';
import { VideoListComponent, VideoAddComponent, VideoEditComponent } from './components/video';
import { BlogListComponent, BlogAddComponent, BlogEditComponent } from './components/blog';
import { HomeblockListComponent, HomeblockAddComponent, HomeblockEditComponent } from './components/homeblock';

const routes: Routes = [
  {
    path: '',
    component: PublicPageComponent,
    children: [
      { path: 'feature-category', component: FeatureCategoryListComponent, canActivate: [AuthManager] },
      { path: 'feature-authors', component: FeatureAuthorListComponent, canActivate: [AuthManager] },
      { path: 'feature-publishers', component: FeaturePublisherListComponent, canActivate: [AuthManager] },
      { path: 'feature-attributes', component: FeatureAttributeListComponent, canActivate: [AuthManager] },
      { path: 'feature-categorys', component: FeatureCategorysListComponent, canActivate: [AuthManager] },
      

      { path: 'testimonial', component: TestimonialListComponent, canActivate: [AuthManager] },
      { path: 'testimonial/add', component: TestimonialAddComponent, canActivate: [AuthManager] },
      { path: 'testimonial/edit/:id', component: TestimonialEditComponent, canActivate: [AuthManager] },

      { path: 'static-content', component: StaticContentListComponent, canActivate: [AuthManager] },
      { path: 'static-content/add', component: StaticContentAddComponent, canActivate: [AuthManager] },
      { path: 'static-content/edit/:id', component: StaticContentEditComponent, canActivate: [AuthManager] },

      { path: 'news', component: NewsListComponent, canActivate: [AuthManager] },
      { path: 'news/add', component: NewsAddComponent, canActivate: [AuthManager] },
      { path: 'news/edit/:id', component: NewsEditComponent, canActivate: [AuthManager] },

      { path: 'banner', component: BannerListComponent, canActivate: [AuthManager] },
      { path: 'banner/add', component: BannerAddComponent, canActivate: [AuthManager] },
      { path: 'banner/edit/:id', component: BannerEditComponent, canActivate: [AuthManager] },

      { path: 'video', component: VideoListComponent, canActivate: [AuthManager] },
      { path: 'video/add', component: VideoAddComponent, canActivate: [AuthManager] },
      { path: 'video/edit/:id', component: VideoEditComponent, canActivate: [AuthManager] },

      { path: 'blog', component: BlogListComponent, canActivate: [AuthManager] },
      { path: 'blog/add', component: BlogAddComponent, canActivate: [AuthManager] },
      { path: 'blog/edit/:id', component: BlogEditComponent, canActivate: [AuthManager] },

      
      { path: 'homeblock', component: HomeblockListComponent, canActivate: [AuthManager] },
      { path: 'homeblock/add', component: HomeblockAddComponent, canActivate: [AuthManager] },
      { path: 'homeblock/edit/:id', component: HomeblockEditComponent, canActivate: [AuthManager] },

      { path: 'promotional-image', component: PromotionalImageListComponent, canActivate: [AuthManager] },
      { path: 'promotional-image/add', component: PromotionalImageAddComponent, canActivate: [AuthManager] },
      { path: 'promotional-image/edit/:id', component: PromotionalImageEditComponent, canActivate: [AuthManager] },

      { path: 'promotional-code', component: PromotionalCodeListComponent, canActivate: [AuthManager] },
      { path: 'promotional-code/add', component: PromotionalCodeAddComponent, canActivate: [AuthManager] },
      { path: 'promotional-code/edit/:id', component: PromotionalCodeEditComponent, canActivate: [AuthManager] },

      { path: 'review', component: ReviewListComponent, canActivate: [AuthManager] },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
