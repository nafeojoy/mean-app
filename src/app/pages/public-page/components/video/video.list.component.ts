import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { VideoService } from './video.service';

@Component({
    selector: 'video-list',
    templateUrl: './video.list.html',
    styleUrls: ['./video.scss']
})
export class VideoListComponent {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    videos: any = [];
    selectedVideo: any;
    video: any = {};
    curr_stat: any;

    constructor(private videoService: VideoService) { }

    ngOnInit() {
        this.changeStatus('active');
    }

    changeStatus(status) {
        this.video = {};
        this.video[status] = true;
        if (status != 'all')
            this.curr_stat = status == 'active'
        else
            this.curr_stat = 'all';

        this.videos = this.videoService.getAll(this.curr_stat);
    }

    showDeleteModal(video) {
        this.selectedVideo = video;
        this.deleteModal.show();
    }

    deleteVideo() {
        this.videoService.delete(this.selectedVideo._id).subscribe(() => {
            this.deleteModal.hide();
        });
    }

    showViewModal(video) { }

    delete(id) {
        let sure = confirm("Are you sure to delete?")
        if (sure) {
            this.videoService.delete(id).subscribe(result => {
                if (result.status) {
                    this.videos = this.videoService.getAll(this.curr_stat);
                }
            })
        }
    }
}