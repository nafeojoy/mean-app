import { Component, Input } from '@angular/core';

import 'style-loader!./star-rating.scss';

@Component({
    selector: 'star-rating',
    templateUrl: './star-rating.html'
})

export class StarRatingComponent {
    private _rating: number;
    private _viewSize: string;
    
    @Input() 
    set rating(value) {
        this._rating = value ? value : 3.5;
    }

    get rating() {
        return this._rating;
    }

    @Input()
    set viewSize(value) {
        this._viewSize = value;
        
    }

    get viewSize() {
        
        return this._viewSize;
    }
}
