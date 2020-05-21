import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, PaginationModule } from "ngx-bootstrap";
import { SimpleNotificationsModule } from 'angular2-notifications';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgaModule } from '../../theme/nga.module';
import { SharedModule } from '../../shared/shared.module'
import { CKEditorModule } from 'ng2-ckeditor';
import { CookieService } from 'angular2-cookie/core';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { PublicPageComponent } from "./public-page.component";

import { AlertModule } from 'ngx-bootstrap/alert';
import { DndModule } from 'ng2-dnd';

import { FeatureCategoryListComponent, FeatureCategoryService } from "./components/feature-category";
import { FeatureAuthorListComponent, FeatureAuthorService } from "./components/feature-authors";
import { FeaturePublisherListComponent, FeaturePublisherService } from "./components/feature-publishers";
import { FeatureAttributeListComponent, FeatureAttributeService } from "./components/feature-attributes";
import { FeatureCategorysListComponent, FeatureCategorysService } from "./components/feature-categorys";
import { BannerService, BannerEditComponent, BannerAddComponent, BannerListComponent } from "./components/banner";
import { VideoAddComponent, VideoListComponent, VideoEditComponent, VideoService } from './components/video';
import { BlogAddComponent, BlogListComponent, BlogEditComponent, BlogService } from './components/blog';
import { HomeblockAddComponent, HomeblockListComponent, HomeblockEditComponent, HomeblockService } from './components/homeblock';
import { PromotionalImageAddComponent, PromotionalImageEditComponent, PromotionalImageListComponent, PromotionalImageService } from "./components/promotional-image";
import { PromotionalCodeAddComponent, PromotionalCodeEditComponent, PromotionalCodeListComponent, PromotionalCodeService } from "./components/promotional-code";
import { ReviewListComponent, ReviewService } from './components/review';
import { ProductService } from '../catalog/components/products/products.service'

import { TestimonialAddComponent, TestimonialEditComponent, TestimonialListComponent, TestimonialService } from "./components/testimonial";
import { NewsAddComponent, NewsEditComponent, NewsListComponent, NewsService } from "./components/news";
import { StaticContentAddComponent, StaticContentEditComponent, StaticContentListComponent, StaticContentService } from './components/static-content';

import { LanguageService } from '../system/components/languages/language.service'

import { routing } from "./public-page.routing";





@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        SharedModule,
        routing,
        UiSwitchModule,
        CKEditorModule,
        ModalModule.forRoot(),
         PaginationModule.forRoot(),
          AlertModule.forRoot(),
        ReactiveFormsModule,
        // Ng2DragDropModule,
        DndModule.forRoot(),
        BsDatepickerModule.forRoot(),
        SimpleNotificationsModule
    ],

    declarations: [
        PublicPageComponent,

        FeatureCategoryListComponent, // For Tabs
        FeatureAuthorListComponent,
        FeaturePublisherListComponent,
        FeatureCategorysListComponent,
        FeatureAttributeListComponent,

        TestimonialListComponent,
        TestimonialAddComponent,
        TestimonialEditComponent,

        StaticContentAddComponent,
        StaticContentListComponent,
        StaticContentEditComponent,

        NewsAddComponent,
        NewsEditComponent,
        NewsListComponent,

        BannerEditComponent,
        BannerAddComponent,
        BannerListComponent,

        VideoAddComponent,
        VideoListComponent,
        VideoEditComponent,

        BlogAddComponent,
        BlogListComponent,
        BlogEditComponent,

        HomeblockAddComponent,
        HomeblockListComponent,
        HomeblockEditComponent,

        PromotionalImageAddComponent,
        PromotionalImageEditComponent,
        PromotionalImageListComponent,

        PromotionalCodeAddComponent,
        PromotionalCodeEditComponent,
        PromotionalCodeListComponent,
        ReviewListComponent
    ],
    providers: [
        VideoService,BlogService,HomeblockService,
        FeatureCategoryService, FeatureAuthorService, FeaturePublisherService, TestimonialService, StaticContentService, FeatureAttributeService,
        LanguageService, CookieService, NewsService, BannerService, PromotionalImageService, PromotionalCodeService, ReviewService, FeatureCategorysService, ProductService
    ]
})

export class PublicPageModule { }
