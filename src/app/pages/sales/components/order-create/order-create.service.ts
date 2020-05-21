import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';
import { Observable } from 'rxjs';

@Injectable()
export class OrderCreateService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'order';
    }

    getOrderByStatus(status) {
        this.apiPath = 'order';
        return this.http.get(this.apiUrl + status)
            .map(res => res.json())
    }

    add(data) {
        this.apiPath = 'order';
        return this.http.post(this.apiUrl, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    saveAddress(shipping) {
        return this.http.post('/admin/api/shipping/', JSON.stringify(shipping), { headers: this.headers })
            .map(res => res.json());
    }

    updateAddress(shipping) {
        return this.http.put('/admin/api/shipping/' + shipping._id, JSON.stringify(shipping), { headers: this.headers })
            .map(res => res.json());
    }

    getSearchedSubscriber(terms: Observable<string>) {
        return terms.debounceTime(1000)
            .distinctUntilChanged()
            .switchMap(term => this.getSubscriber(term));
    }

    getSubscriber(criteria) {
        return this.http.get('/admin/api/subscriber/search/' + criteria).map(res => res.json());
    }

    getShipingAddress(id){
        return this.http.get('/admin/api/shipping/' + id).map(res => res.json());
    }

    getItemByUrl(seo_url){
        return this.http.get('/admin/api/product/order-create/search-by-seo/' + seo_url).map(res => res.json());
    }

    // Using Public API
    // getSearched(criteria) {
    //     let url=this.apiBaseUrl+'product/order-create/search/' + criteria.text;
    //     if(criteria.author){
    //         url=url.concat(`?author=${criteria.author}`)
    //     }
    //     console.log(url);
    //     return this.http.get(url).map(res => res.json());
    // }

    getSearchedAuthor(criteria){
        return this.http.get(this.apiBaseUrl+'author/order-create/author-search/' + criteria).map(res => res.json());
    }

    getProductSearched(terms: Observable<string>) {
        return terms.debounceTime(1000)
            .distinctUntilChanged()
            .switchMap(term => this.getSearched(term));
    }

    getSearched(criteria) {
        return this.http.get(this.apiBaseUrl+'product/soundex-enabled-search/' + criteria).map(res => res.json());
    }

    signup(item: any) {
        return this.http.post('/api/auth/signup', JSON.stringify(item), { headers: this.headers })
            .map(res => res.json());
    }


    getDistrict() {
        return this.http.get('/api/district').map(res => res.json())
    }

    getThana(district) {
        return this.http.get('/api/thana/' + district).map(res => res.json())
    }

}