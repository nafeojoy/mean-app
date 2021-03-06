import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class UploadedImagesService extends BaseService {
    constructor(injector: Injector) {
        super(injector)
    }

     init() {
        super.init();
        this.apiPath = 'uploaded-images';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll() {
        return this.http.get(this.apiUrl, { headers: this.headers }).map(res => res.json());
    }

    add(uploaded_images) {
        return this.http.post(this.apiUrl, JSON.stringify(uploaded_images), { headers: this.headers })
            .map(res => res.json());
    }

    update(uploaded_images) {
        return this.http.put(this.apiUrl + uploaded_images._id, JSON.stringify(uploaded_images), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
