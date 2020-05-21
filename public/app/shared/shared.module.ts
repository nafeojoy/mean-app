import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsModule, ModalModule, CarouselModule, PaginationModule, TypeaheadModule } from "ngx-bootstrap";
import { BusyModule, BUSY_CONFIG_DEFAULTS } from './busy';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';

import { TypeaheadComponent } from './components/typeahead/typeahead.component';
import { StarRatingComponent } from './components/star-rating/star-rating.component';
import { BbImageUploader, BbImageUploaderService } from './components/bb-image-uploader';



import {
    BaseService,
    AuthorService,
    AuthService,
    CategoryService,
    PublisherService,
    ProductService,
    StaticPagesService,
    CountryService,
    SeoContentLoaderService,
    CustomCookieService,
} from './services';

import { TRANSLATION_PROVIDERS, TranslatePipe, TranslateService } from './translate';
import { RatingConversionPipe } from './pipes/rating-conversion.pipe';
import { NumberConversionPipe } from './pipes/number-conversion.pipe';
import { PriceConversionPipe } from './pipes/price-conversion.pipe';
import { PriceService } from './pipes/price-conversion.service';
import { TruncatePipe } from './pipes/truncate.pipe';

import { NgInputComponent } from './components/ng-input/input.component';
import { OnlyNumber } from './directives/number-field.directive';

@NgModule({
    imports: [
        RouterModule, CommonModule, FormsModule,
        TabsModule.forRoot(), ModalModule.forRoot(), CarouselModule.forRoot(),
        TypeaheadModule.forRoot(), PaginationModule.forRoot(),
        BusyModule.forRoot(BUSY_CONFIG_DEFAULTS),
        InfiniteScrollModule

    ],
    declarations: [
        TypeaheadComponent,
        StarRatingComponent,
        RatingConversionPipe,
        NumberConversionPipe,
        PriceConversionPipe,
        BbImageUploader,
        TranslatePipe,
        TruncatePipe,
        NgInputComponent,
        OnlyNumber
    ],
    exports: [
        RouterModule, CommonModule, FormsModule,
        TabsModule, ModalModule, TypeaheadModule, PaginationModule, CarouselModule,
        BusyModule,
        InfiniteScrollModule,
        TypeaheadComponent,
        StarRatingComponent,
        RatingConversionPipe,
        NumberConversionPipe,
        PriceConversionPipe,
        BbImageUploader,
        TranslatePipe,
        TruncatePipe,
        NgInputComponent,
        OnlyNumber
    ],

    providers: [BaseService, AuthService, AuthorService, CategoryService, CustomCookieService,
        PublisherService, ProductService, StaticPagesService, CountryService, SeoContentLoaderService,
        TranslateService, PriceService, BbImageUploaderService, TRANSLATION_PROVIDERS]
})
export class SharedModule { }