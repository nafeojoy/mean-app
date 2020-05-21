import { Injector, Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base-service';


@Injectable()
export class PasswordForgetService extends BaseService {
    private apiPath = this.apiBaseUrl + 'subscriber/password-forget/';

    constructor(injector: Injector) {
        super(injector);
    }

    sendMail(mail) {
        return this.http.get(this.apiPath + mail).map(res => res.json());
    }

    updatePassword(data) {
        return this.http.put(this.apiBaseUrl + 'subscriber/password-forget/'+data.signup_info.user._id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

}

