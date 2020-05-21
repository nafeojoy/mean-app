import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class VideoService extends BaseService {
    constructor(injector: Injector) {
        super(injector)
    }

    init() {
        super.init();
        this.apiPath = 'video';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll(status) {
        return this.http.get(this.apiBaseUrl + 'video?status=' + status, { headers: this.headers }).map(res => res.json());
    }

    add(video) {
        return this.http.post(this.apiUrl, JSON.stringify(video), { headers: this.headers })
            .map(res => res.json());
    }

    update(video) {
        return this.http.put(this.apiUrl + video._id, JSON.stringify(video), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
