import { Component, ViewChild, Input, Output, EventEmitter, ElementRef, Renderer, Inject } from '@angular/core';
import { ImageCropperComponent, CropperSettings, Bounds } from '../bb-cropper';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { BaseService } from '../../services/base-service';
import { BulkImageUploaderService } from './bulk-image-uploader.service';

@Component({
  selector: 'bulk-image-uploader',
  templateUrl: './bulk-image-uploader.html',
  styleUrls: ['./bulk-image-uploader.scss'],

})
export class BulkImageUploadComponent {

  name: string;
  data1: any;
  cropperSettings1: CropperSettings;
  croppedWidth: number;
  croppedHeight: number;

  image_type: string;
  private _import_id = new BehaviorSubject<number>(0);

  private imp_id: number;
  private uploader_url: '';
  public alerts: any[] = [];
  private page_num: number = 0;
  loadNextImage: Subject<any> = new Subject();
  public selectedFilesLenth: number = 0;
  private total_uploaded: number = 0;
  public is_all_uploaded: boolean;
  public is_uploading: boolean;

  @Input()
  set importid(value) {
    this._import_id.next(value);
    this._import_id.value
    if (this._import_id.value > 0) {
      this.imp_id = this._import_id.value;
    }
  }

  get importid() {
    return this._import_id.getValue();
  }

  @Output()
  uploaded: EventEmitter<any> = new EventEmitter();

  @ViewChild('cropper', undefined) cropper: ImageCropperComponent;


  constructor(private _bulkImageUploaderService: BulkImageUploaderService) {
    this.initCropper();
  }

  initCropper() {
    this.name = 'Angular2'
    this.cropperSettings1 = new CropperSettings();

    this.cropperSettings1.width = 200;
    this.cropperSettings1.height = 300;

    this.cropperSettings1.croppedWidth = 600;
    this.cropperSettings1.croppedHeight = 900;

    this.cropperSettings1.canvasWidth = 500;
    this.cropperSettings1.canvasHeight = 300;

    this.cropperSettings1.minWidth = 10;
    this.cropperSettings1.minHeight = 10;


    this.cropperSettings1.rounded = false;
    this.cropperSettings1.keepAspect = false;

    this.cropperSettings1.showCenterMarker = true;

    this.cropperSettings1.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
    this.cropperSettings1.cropperDrawSettings.strokeWidth = 2;

    this.data1 = {};
  }

  cropped(bounds: Bounds) {
    this.croppedHeight = bounds.bottom - bounds.top;
    this.croppedWidth = bounds.right - bounds.left;
  }


  fileChangeListener($event) {
    var image: any = new Image();
    var file: File = $event.target.files[0];
    var myReader: FileReader = new FileReader();
    var that = this;
    myReader.onloadend = function (loadEvent: any) {
      image.src = loadEvent.target.result;
      that.cropper.setImage(image);
    };
    myReader.readAsDataURL(file);
  }

  getSelectedImageIndex(indx) {
    // this.page_num = indx;
  }

  getFilesLength(count) {
    this.page_num = 0;
    this.is_all_uploaded = false;
    this.total_uploaded = 0;
    this.selectedFilesLenth = count;
    console.log(this.selectedFilesLenth);
    if (count == 0) {
      this.alerts.push({
        type: 'danger',
        msg: "No image file exist in selected directory!",
        timeout: 2000
      });
    }
  }

  up() {
    if (this.data1.image) {
      var block = this.data1.image.split(";");
      var contentType = block[0].split(":")[1];
      var realData = block[1].split(",")[1];
      var blob = this.b64toBlob(realData, contentType, 512);
      var formDataToUpload = new FormData();
      formDataToUpload.append("image", blob);
      let uploadUrl: string;
      if (this.page_num < (this.selectedFilesLenth - 1)) {
        uploadUrl = `${this._bulkImageUploaderService.uploadApiBaseUrl}product-preview/update?import_id=${this.imp_id}&page_num=${(this.page_num + 1)}`;
      }
      if (this.page_num == (this.selectedFilesLenth - 1)) {
        uploadUrl = `${this._bulkImageUploaderService.uploadApiBaseUrl}product-back-cover/update?import_id=${this.imp_id}`;
      }
      this.is_uploading = true;
      this.makeFileRequest(uploadUrl, formDataToUpload).then((result: any) => {
        if (result.success) {
          this.is_uploading = false;
          this.page_num++;
          this.loadNextImage.next();
          this.uploaded.emit(result);
          this.total_uploaded++;
          this.is_all_uploaded = this.total_uploaded == this.selectedFilesLenth;
          this.data1 = {};
          this.alerts.push({
            type: 'info',
            msg: "Image uploaded",
            timeout: 2000
          });
        } else {
          this.alerts.push({
            type: 'danger',
            msg: "Internal server error. Try again latter",
            timeout: 2000
          });
        }
      });
    }
  }

  makeFileRequest(url: string, formData) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
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
      xhr.setRequestHeader('admin_token', this.getCookie('admin_token'));
      xhr.send(formData);
    });
  }

  getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }

  b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
}
