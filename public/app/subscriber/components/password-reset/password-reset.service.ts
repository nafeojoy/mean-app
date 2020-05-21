import { Injector, Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base-service';


@Injectable()
export class PasswordResetService extends BaseService {
    private apiPath = this.apiBaseUrl + 'subscriber/password-forget/';

    constructor(injector: Injector) {
        super(injector);
    }

    updatePassword(data) {
        return this.http.put(this.apiPath + data.token, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

}

