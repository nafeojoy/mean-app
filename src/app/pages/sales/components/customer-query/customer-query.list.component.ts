import { Component, ViewEncapsulation } from "@angular/core";

import { QueryService } from "./customer-query.service";
import 'style-loader!./customer-query.scss';

@Component({
    selector: 'query-list',
    templateUrl: './customer-query.list.html'
})

export class QueryListComponent {

    public queries: any = [];
    showComment: boolean;
    newComment: string;
    public totalItems: number = 0;
    public currentPage: number = 1;
    public maxSize: number = 5;
    public itemsPerPage: number = 10;
    public search_text: number;
    public current_status: string = "Pending";
    public count_obj: any = { total: 0 };

    constructor(private _queryService: QueryService) {

    }

    ngOnInit() {
        this.getQueries();
    }

    getQueries() {
        this.count_obj = { total: 0 };
        let status = this.current_status === 'Answered';
        this._queryService.getAll({ status: status, page_no: this.currentPage }).subscribe(result => {
            this.queries = result.queries;
            result.count_result.map(countObj => {
                this.count_obj.total += countObj.count;
                if (countObj._id)
                    this.count_obj.answred = countObj.count;
                else
                    this.count_obj.pending = countObj.count;
            })
            this.totalItems = this.current_status === 'Answered' ? this.count_obj.answred : this.count_obj.pending;
        })
    }

    showComments(c_qry) {
        c_qry.showComment = c_qry.showComment ? false : true;
        this._queryService.getComments(c_qry._id).subscribe(output => {
            if (output && output.comment && Array.isArray(output.comment)) {
                c_qry.comments = output.comment;
            } else {
                c_qry.comments = [];
            }
        })
    }


    search() {
        if (!isNaN(this.search_text)) {
            this._queryService.getSearch(this.search_text).subscribe(result => {
                if(result && result.length>0){
                   this.queries=result; 
                }
            })
        }
    }

    addComment(c_qry) {
        this.newComment = this.newComment.trim();
        if (this.newComment.length > 1) {
            let comment_data = {
                id: c_qry._id,
                comment: this.newComment
            }
            this._queryService.addComment(comment_data).subscribe(output => {
                if (output.success) {
                    c_qry.comments = output.comment;
                    this.newComment = '';
                }
            })
        }
    }

    changeStatus(status) {
        this.current_status = status;
        this.getQueries();
    }

    pageChanged(page_info) {
        this.currentPage = page_info.page;
        this.getQueries();
    }

    updateStatus(query) {
        if (query.comments && query.comments.length > 0) {
            this._queryService.update(query._id).subscribe(result => {
                if (result.success) {
                    this.getQueries();
                    alert('Succesfull mark qury as done.');
                } else {
                    alert(result.message);
                }
            })
        } else {
            alert('Mark as done is not possible without any comment');
        }
    }

}
