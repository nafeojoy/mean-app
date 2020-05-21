import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { HomeblockService } from './homeblock.service';

@Component({
    selector: 'homeblock-list',
    templateUrl: './homeblock.list.html',
    styleUrls: ['./homeblock.scss']
})
export class HomeblockListComponent {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    homeblocks: any = [];
    selectedHomeblock: any;
    homeblock: any = {};
    curr_stat: any;

    constructor(private homeblockService: HomeblockService) { }

    ngOnInit() {
        this.changeStatus('active');
    }

    changeStatus(status) {
        this.homeblock = {};
        this.homeblock[status] = true;
        if (status != 'all')
            this.curr_stat = status == 'active'
        else
            this.curr_stat = 'all';

        this.homeblocks = this.homeblockService.getAll(this.curr_stat);
    }

    showDeleteModal(homeblock) {
        this.selectedHomeblock = homeblock;
        this.deleteModal.show();
    }

    deleteHomeblock() {
        this.homeblockService.delete(this.selectedHomeblock._id).subscribe(() => {
            this.deleteModal.hide();
        });
    }

    showViewModal(homeblock) { }

    delete(id) {
        let sure = confirm("Are you sure to delete?")
        if (sure) {
            this.homeblockService.delete(id).subscribe(result => {
                if (result.status) {
                    this.homeblocks = this.homeblockService.getAll(this.curr_stat);
                }
            })
        }
    }
}