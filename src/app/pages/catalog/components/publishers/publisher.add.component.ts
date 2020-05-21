import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { BbImageUploader } from '../../../../shared/components/bb-image-uploader';
import { PublisherService } from "./publisher.service";
import { PublisherModelService } from './publisher.model.service';
import { AuthorService } from "../authors/authors.service";

import 'style-loader!./publisher.scss';

@Component({
  selector: 'add-publisher',
  templateUrl: './publisher.add.html',
})


export class PublisherAddComponent {

  public form: FormGroup;
  public hasImage: boolean = false;
  @ViewChild('imageUploader') public _fileUpload: BbImageUploader;
  public res_pending: boolean;
  public authorList: any = [];

  constructor(
    private publisherService: PublisherService,
    private modelService: PublisherModelService,
    private location: Location,
    private authorService: AuthorService
  ) { }


  ngOnInit() {
    this.form = this.modelService.getFormModel();
    this.form.controls['is_enabled'].setValue(true);
  }

  public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
  public profile: any = {
    picture: 'assets/img/theme/book-no-photo.jpg'
  };
  public uploaderOptions: any = {
    url: 'publisher-upload',
  };
  isImageChosen(status: boolean) { this.hasImage = status }

  searchAuthor(text) {
    this.authorService.getSearch(text).subscribe((result) => {
      this.authorList = result.items;
    })
  }

  savePublisher() {
    this.res_pending = true;
    let publisher = this.modelService.getFormValue(this.form);
    if (publisher.is_author) {
      publisher.author = publisher.author ? publisher.author._id : undefined;
    }
    if (this.hasImage) {
      this._fileUpload.uploadToServer().then((images) => {
        publisher.logo = images;
        this.publisherService.add(publisher).subscribe(result => {
          this.res_pending = false;
          if (result._id) {
            alert("Publisher Save Success!");
            this.location.back();
          } else {
            alert("Publisher Save Failed!");
          }
        })
      });
    } else {
      this.publisherService.add(publisher).subscribe(result => {
        this.res_pending = false;
        if (result._id) {
          alert("Publisher Save Success!");
          this.location.back();
        } else {
          alert("Publisher Save Failed!");
        }
      })
    }
  }

  back() {
    this.location.back();
  }
}
