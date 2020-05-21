import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../services/base-service';

@Injectable()
export class BbImageUploaderService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
    }
}