import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/map';

export class PaginationBase {

    public totalItems: Observable<number>;
    public currentPage: number = 1;
    public itemsPerPage = 10;
    public maxSize = 5;

    protected pageStream = new Subject<number>();
    protected pageSource: any;

    constructor() {
        this.pageSource = this.pageStream
            .map(pageNum => {
                this.currentPage = pageNum;
                return { page: pageNum, limit: this.itemsPerPage }
            });
    }

    public pageChanged(event: any): void {
        this.pageStream.next(event.page);
    };
}