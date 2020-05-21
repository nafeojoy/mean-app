import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { ProductService } from "./products.service";

import 'style-loader!./products.scss';
import { ModalDirective } from 'ngx-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'image-uploader',
  templateUrl: './image-uploader.html',
})

export class ImageUploaderComponent {

  public import_id: number;
  public selected_item: any = {};
  private product_id: string;
  public image_type: string = "preview";
  public is_preview: boolean = false;
  public sendImageType: Subject<any> = new Subject();
  public show_preview_replace: boolean;
  public page_num: number = 1;
  public replacing_img_type: string;
  public frame_src: any;
  @ViewChild('optionModal') optionModal: ModalDirective;


  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {
    this.product_id = this.route.snapshot.params['id'];
    this.productService.getById(this.product_id).subscribe(output => {
      if (output._id) {
        this.import_id = output.import_id;
        let frm_path = `http://admin.boibazar.com/upload-cropped-image-to-server.html?import_id=${this.import_id}`;
        this.frame_src = this.sanitizer.bypassSecurityTrustResourceUrl(frm_path);
        this.selected_item = {
          name: output.name,
          sngImage: output.image ? output.image['250X360'] : undefined,
          back_image: output.back_cover_image ? output.back_cover_image['250X360'] : undefined,
          preview_images: output.preview_images
        };
      }
    })
  }


  updateImage(output) {
    this.selected_item = {
      name: 'name',
      sngImage: 'front_image',
      back_image: 'back_image',
      preview_images: []
    };
    setTimeout(() => {
      let newImageDataObj: any = {};
      newImageDataObj.name = output.item.name;
      newImageDataObj.back_image = output.item.back_cover_image ? output.item.back_cover_image['250X360'] : undefined;
      newImageDataObj.sngImage = output.item.image['250X360'];
      newImageDataObj.preview_images = output.item.preview_images
      this.selected_item = newImageDataObj;
    }, 500)
  }

  selectToreplace(type, page_num) {
    this.replacing_img_type = type;
    this.page_num = page_num;
    setTimeout(() => {
      this.sendImageType.next({ image_type: type, option: page_num });
    }, 10)
  }

  disabledPage(page, state) {
    let update_data = {
      id: this.product_id,
      page: page,
      state: state
    }
    this.productService.updatePreviewPageState(update_data).subscribe(result => {
      if (result.success) {
        alert("Update Success.");
      } else {
        alert("Update failed!");
      }
    })
  }

  openUploader() {
    this.optionModal.show();
  }

  cancel() {
    this.optionModal.hide();
    window.location.reload();
  }

}