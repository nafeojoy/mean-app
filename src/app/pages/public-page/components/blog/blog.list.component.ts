import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { BlogService } from './blog.service';

@Component({
    selector: 'blog-list',
    templateUrl: './blog.list.html',
    styleUrls: ['./blog.scss']
})
export class BlogListComponent {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    blogs: any = [];
    selectedBlog: any;
    blog: any = {};
    curr_stat: any;

    constructor(private blogService: BlogService) { }

    ngOnInit() {
        this.changeStatus('active');
    }

    changeStatus(status) {
        this.blog = {};
        this.blog[status] = true;
        if (status != 'all')
            this.curr_stat = status == 'active'
        else
            this.curr_stat = 'all';

        this.blogs = this.blogService.getAll(this.curr_stat);
    }

    showDeleteModal(blog) {
        this.selectedBlog = blog;
        this.deleteModal.show();
    }

    deleteBlog() {
        this.blogService.delete(this.selectedBlog._id).subscribe(() => {
            this.deleteModal.hide();
        });
    }

    showViewModal(blog) { }

    delete(id) {
        let sure = confirm("Are you sure to delete?")
        if (sure) {
            this.blogService.delete(id).subscribe(result => {
                if (result.status) {
                    this.blogs = this.blogService.getAll(this.curr_stat);
                }
            })
        }
    }
}