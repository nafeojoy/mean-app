import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class DiscountPanelService extends BaseService {
	constructor(injector: Injector) {
		super(injector);
	}

	init() {
		super.init();
		this.apiPath = 'attributes';
	}


	getAttribute() {
		this.apiPath = 'attributes';
		return this.http.get(this.apiUrl).map(res => res.json())
	}

	getAvailableStatus(data){
		return this.http.get(this.apiBaseUrl+'product/check-availability/'+data.discount_on+'?seo_url='+data.seo_url).map(res=>res.json())
	}

	update(data) {
		return this.http.post(this.apiBaseUrl+'product/bulk-update/price', JSON.stringify(data), { headers: this.headers })
			.map(res => res.json());
	}

}
