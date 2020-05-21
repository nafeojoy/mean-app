import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { BannerService } from './banner.service';

@Component({
    selector: 'banner-list',
    templateUrl: './banner.list.html',
    styleUrls: ['./banner.scss']
})
export class BannerListComponent {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    banners: any = [];
    selectedBanner: any;
    banner: any = {};
    curr_stat: any;

    constructor(private bannerService: BannerService) { }

    ngOnInit() {
        this.changeStatus('active');
    }

    changeStatus(status) {
        this.banner = {};
        this.banner[status] = true;
        if (status != 'all')
            this.curr_stat = status == 'active'
        else
            this.curr_stat = 'all';

        this.banners = this.bannerService.getAll(this.curr_stat);
    }

    showDeleteModal(banner) {
        this.selectedBanner = banner;
        this.deleteModal.show();
    }

    deleteBanner() {
        this.bannerService.delete(this.selectedBanner._id).subscribe(() => {
            this.deleteModal.hide();
        });
    }

    showViewModal(banner) { }

    delete(id) {
        let sure = confirm("Are you sure to delete?")
        if (sure) {
            this.bannerService.delete(id).subscribe(result => {
                if (result.status) {
                    this.banners = this.bannerService.getAll(this.curr_stat);
                }
            })
        }
    }


    redisFlush(){
        this.bannerService.cacheClear().subscribe((result) => {
            if(result.success){
                alert("Cache cleared")
            } else {
                alert("Failed")
            }
            
        })
    }
}