import { Component, ViewChild, Input, Output, EventEmitter, ElementRef, Renderer, Inject } from '@angular/core';
import { NgUploaderModule } from 'ngx-uploader';

import { BbImageUploaderService } from './bbImageUploader.service';

import 'style-loader!./bbImageUploader.scss';

@Component({
    selector: 'bb-image-uploader',
    templateUrl: './bbImageUploader.html',
    providers: [NgUploaderModule]
})
export class BbImageUploader {

    private hasImage: boolean = false;
    filesToUpload: Array<File>;
    public errors: any = [];
    public uploadInProgress: boolean = false;  //**
    @ViewChild('fileUpload') public _fileUpload: ElementRef;//***
    @Input() defaultPicture: any = '';//***
    @Input() picture: any = '';//****
    @Input() uploaderOptions;

    @Output()
    isImageChosen: EventEmitter<any> = new EventEmitter();

    constructor(private renderer: Renderer, private service: BbImageUploaderService, private elRef: ElementRef) {
        this.filesToUpload = [];
    }

    ngOnInit() { }

    fileChangeEvent(fileInput: any) {
        this.filesToUpload = <Array<File>>fileInput.target.files;
        let files = this._fileUpload.nativeElement.files;
        const file = files[0];
        this._changePicture(file);
        var img = document.getElementById('uploadFile');
    }


    uploadToServer() {
        this.uploadInProgress = true;
        return this.makeFileRequest(this.service.uploadApiBaseUrl + this.uploaderOptions.url, [], this.filesToUpload).then(result => {
            this.uploadInProgress = false;
            return result;
        });
    }

    makeFileRequest(url: string, params: Array<String>, files: Array<File>) {
        return new Promise((resolve, reject) => {
            var formData: any = new FormData();
            var xhr = new XMLHttpRequest();
            for (var i = 0; i < files.length; i++) {
                formData.append("uploads[]", files[i], files[i].name);
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(xhr.response);
                    }
                }
            }
            xhr.open("POST", url, true);
            xhr.send(formData);
        });
    }

    public bringFileSelector(): boolean {
        this.errors = [];
        this.renderer.invokeElementMethod(this._fileUpload.nativeElement, 'click');
        return false;
    }

    public removePicture(): boolean {
        this.picture = '';
        return false;
    }

    protected _changePicture(file: File): void {
        const reader = new FileReader();
        reader.addEventListener('load', (event: Event) => {
            this.picture = (<any>event.target).result;
            let img = new Image;
            img.src = this.picture;
            let valid_image_types = ['png', 'jpg', 'jpeg'];
            let selected_image_type = this.picture.substring("data:image/".length, this.picture.indexOf(";base64"));
            let isImageTypeValid = valid_image_types.indexOf(selected_image_type) > -1 ? true : false;
            if (!isImageTypeValid) {
                let err_object = { 'title': "Image Type Error", 'message': "Image Type must be png, jpeg or jpg" };
                this.errors.push(err_object);
            }

            if (this.errors.length > 0) {
                this.isImageChosen.emit(false);
            } else {
                this.isImageChosen.emit(true);
            }
        }, false);
        reader.readAsDataURL(file);
    }
}
