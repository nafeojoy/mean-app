import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { GiftService } from './gift.service';

import 'style-loader!./gift.scss';

@Component({
    selector: 'gift-list',
    templateUrl: './gift.list.html',
})
export class GiftListComponent {
    
    giftes: any;
    constructor(private giftService: GiftService) {
    }

    ngOnInit() {
        this.giftes = this.giftService.getAll();
    }

}