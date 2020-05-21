import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
// import { NotificationsService } from 'angular2-notifications';
import { BbImageUploader } from '../../../../shared/components/bb-image-uploader';
import { AuthorService } from "./authors.service";
import { AuthorModelService } from './authors.model.service';
import { NationalityService } from "./nationality.service";

import 'style-loader!./authors.scss';

@Component({
  selector: 'authors-add',
  templateUrl: './authors.add.html',
})
export class AuthorsAddComponent {
  public form: FormGroup;
  nationalities: any;
  defaultNationality: String = "Bangladeshi";
  public hasImage: boolean = false;
  public res_pending: boolean;  

  @ViewChild('imageUploader') public _fileUpload: BbImageUploader;

  constructor(private authorService: AuthorService, private modelService: AuthorModelService,
    private nationalityService: NationalityService, private location: Location) {
  }

  ngOnInit() {
    this.form = this.modelService.getFormModel();
    this.form.controls['nationality'].setValue(this.defaultNationality);
    this.nationalities = this.nationalityService.getNationality();
  }

  public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
  public profile: any = {
    picture: 'assets/img/theme/book-no-photo.jpg'
  };
  public uploaderOptions: any = {
    url: 'author-upload',
  };

  isImageChosen(status: boolean) { this.hasImage = status }

  addAuthor() {
    this.res_pending = true;        
    let author = this.modelService.getFormValue(this.form);
    
    if (this.hasImage) {
      this._fileUpload.uploadToServer().then((images) => {
        author.image = images;
        this.authorService.add(author).subscribe(result => {
          this.res_pending = false;          
          if (result._id) {
            alert("Author Save Success!");
            this.location.back();
          } else {
            alert("Author Save Failed!");
          }
        })
      });
    } else {
      this.authorService.add(author).subscribe(result => {
        this.res_pending = false;        
        if (result._id) {
          alert("Author Save Success!");
          this.location.back();
        } else {
          alert("Author Save Failed!");
        }
      })
    }
  }

  addAwards() {
    const control = <FormArray>this.form.controls['awards'];
    // const control = <FormArray>this.form.get('awards');
    control.push(this.modelService.initAwards());
  }

  removeAwards(i: number) {
    const control = <FormArray>this.form.get('awards');
    control.removeAt(i);
  }

  getAwards(awardForm) {
    return awardForm.get('awards').controls;
  }
}