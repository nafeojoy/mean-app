import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { UploadedImagesService } from './uploaded-images.service';

@Component({
    selector: 'uploaded-images-list',
    templateUrl: './uploaded-images.list.html',
})
export class UploadedImagesListComponent {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    uploaded_images: any = [];
    selectedUploadedImages: any;

    constructor(private uploadedImagesService: UploadedImagesService) { }

    ngOnInit() {
        this.uploaded_images = this.uploadedImagesService.getAll();
    }

    showDeleteModal(uploaded_images) {
        this.selectedUploadedImages = uploaded_images;
        this.deleteModal.show();
    }

    deleteUploadedImages() {
        this.uploadedImagesService.delete(this.selectedUploadedImages._id).subscribe(() => {
            this.deleteModal.hide();
        });
    }

    showViewModal(uploaded_images) { }

    delete(id) {
        let sure = confirm("Are you sure to delete?")
        if (sure) {
            this.uploadedImagesService.delete(id).subscribe(result=>{
                if(result.status){
                    this.uploaded_images = this.uploadedImagesService.getAll(); 
                }
            })
        }
    }
}