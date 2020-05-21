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
import { DynamicPageComponent } from "./dynamic-page.component";

import { AlertModule } from 'ngx-bootstrap/alert';
import { LanguageService } from '../system/components/languages/language.service'

import { routing } from "./dynamic-page.routing";
import { ArticleAddComponent, ArticleEditComponent, ArticleListComponent, ArticleService} from "./components/article";
import { UploadedImagesAddComponent, UploadedImagesEditComponent, UploadedImagesListComponent, UploadedImagesService} from "./components/uploaded-images";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        SharedModule,
        routing,
        UiSwitchModule,
        CKEditorModule,
        ModalModule.forRoot(), PaginationModule.forRoot(), AlertModule.forRoot(),
        ReactiveFormsModule,
        SimpleNotificationsModule
    ],

    declarations: [
        DynamicPageComponent,
        ArticleAddComponent,
        ArticleEditComponent,
        ArticleListComponent,
        UploadedImagesAddComponent, 
        UploadedImagesEditComponent,
        UploadedImagesListComponent


     
    ],
    providers: [
        LanguageService, CookieService, ArticleService, UploadedImagesService
    ]
})

export class DynamicPageModule { }
