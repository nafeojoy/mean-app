import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';

import { WeightClassService } from './weight-class.service';

@Component({
    selector: 'weight-class-list',
    templateUrl: './weight-class.list.html',
})
export class WeightClassListComponent {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    weightClasses: any;
    selectedWeightClass: any;

    constructor(private weightClassService: WeightClassService) { }

    ngOnInit() {
        this.weightClasses = this.weightClassService.getAll();
    }

    showDeleteModal(weightClass) {
        this.selectedWeightClass = weightClass;
        this.deleteModal.show();
    }

    deleteWeightClass() {
        this.weightClassService.delete(this.selectedWeightClass._id).subscribe(() => {
            this.deleteModal.hide();
        });
    }

    showViewModal(weightClass) { }
}