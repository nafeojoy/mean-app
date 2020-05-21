import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { LengthClassService } from './length-class.service';

import 'style-loader!./length-class.scss';

@Component({
    selector: 'length-class-list',
    templateUrl: './length-class.list.html',
})
export class LengthClassListComponent {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    lengthClasses: any;
    selectedLengthClass: any;

    constructor(private lengthClassService: LengthClassService) { }

    ngOnInit() {
        this.lengthClasses = this.lengthClassService.getAll();
    }

    showDeleteModal(lengthClass) {
        this.selectedLengthClass = lengthClass;
        this.deleteModal.show();
    }

    deleteLengthClass() {
        this.lengthClassService.delete(this.selectedLengthClass._id).subscribe(() => {
            this.deleteModal.hide();
        });
    }

    showViewModal(lengthClass) { }
}