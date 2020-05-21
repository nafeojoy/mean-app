import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatepickerModule } from "ng2-bootstrap";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ng2-img-cropper';
import { AlertModule } from "ng2-bootstrap";
import { NgxSpinnerModule } from 'ngx-spinner';

import { MultiLanguageInputComponent } from './components/multi-language-input/multi-language-input.component';
import { BbImageUploader, BbImageUploaderService } from './components/bb-image-uploader';
import { TypeaheadComponent } from './components/typeahead';
import { SearchTypeaheadComponent } from './components/search-typeahead';
import { ArobilDatepickerComponent } from './components/aro-datepicker';
import { InputTypeaheadComponent } from './components/input-typeahead';
import { CKEditorModule } from 'ng2-ckeditor';
import { ResizeImageUploadComponent, RszImageUploaderService } from './components/rsz-image-uploader';
import { ImageCropperComponent } from './components/bb-cropper';
import { BulkImageUploadComponent, BulkImageUploaderService } from './components/bulk-image-uploader';
import { ExcelService } from './services/excel-export.service';
import { BusyModule, BUSY_CONFIG_DEFAULTS } from './components/busy';
import { SpinnerModule } from 'angular2-spinner/dist';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CKEditorModule,
        DatepickerModule.forRoot(),
        ImageCropperModule,
        AlertModule.forRoot(),
        BusyModule.forRoot(BUSY_CONFIG_DEFAULTS),
        SpinnerModule
    ],
    declarations: [
        MultiLanguageInputComponent,
        BbImageUploader,
        TypeaheadComponent,
        SearchTypeaheadComponent,
        ArobilDatepickerComponent,
        InputTypeaheadComponent,
        ResizeImageUploadComponent,
        ImageCropperComponent,
        BulkImageUploadComponent
    ],
    exports: [
        MultiLanguageInputComponent,
        BbImageUploader,
        TypeaheadComponent,
        SearchTypeaheadComponent,
        ArobilDatepickerComponent,
        InputTypeaheadComponent,
        ResizeImageUploadComponent,
        BulkImageUploadComponent,
        BusyModule
    ],
    providers: [
        BbImageUploaderService,
        BulkImageUploaderService,
        RszImageUploaderService,
        ExcelService
    ]
})
export class SharedModule { }