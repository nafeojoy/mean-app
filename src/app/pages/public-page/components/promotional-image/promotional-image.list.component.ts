import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { PromotionalImageService } from './promotional-image.service';

@Component({
    selector: 'promotional-image-list',
    templateUrl: './promotional-image.list.html',
})
export class PromotionalImageListComponent {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    promotionalImages: any =[];
    selectedPromotionalImage: any;

    constructor(private promotionalImageService: PromotionalImageService) { }

    ngOnInit() {
        this.promotionalImages = this.promotionalImageService.getAll();
    }

    showDeleteModal(promotionalImages) {
        this.selectedPromotionalImage = promotionalImages;
        this.deleteModal.show();
    }

    deletePromotionalImage() {
        this.promotionalImageService.delete(this.selectedPromotionalImage._id).subscribe(() => {
            this.deleteModal.hide();
        });
    }

    showViewModal(promotionalImages) {}
}