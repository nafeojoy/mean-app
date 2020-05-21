import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';
import { Observable } from 'rxjs';

@Injectable()
export class BookToBuyService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
    }

    getItemSearched(pageNo, terms: Observable<string>) {
        return terms.debounceTime(1000)
            .distinctUntilChanged()
            .switchMap(term => this.getAll(pageNo, term));
    }

    getAll(pageNo, orderNo) {
        return this.http.get(this.apiBaseUrl + 'order/book-list/required-purchase?pageNo='+pageNo+'&orderNo='+orderNo).map(res => res.json());
    }

    updateStatus(data) {
        return this.http.put(this.apiBaseUrl + 'order/book-list/required-purchase', JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }
}