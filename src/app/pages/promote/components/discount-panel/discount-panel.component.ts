import { Component } from '@angular/core';
import { DiscountPanelService } from './discount-panel.service';

@Component({
	selector: 'discount-panel',
	templateUrl: './discount-panel.html',
	styleUrls:['./discount-panel.scss']
})

export class DiscountPanelComponent {

	discount: any = {};
	message:string;
	res_pending:boolean;

	constructor(private _discountPanelService: DiscountPanelService) { }

    onSelectOption(){
        this.discount={discount_on: this.discount.discount_on};
    }

	checkAvailableStatus(){
		this.message='';
		this.discount.total_item=0;
		this.discount.seo_url=this.discount.seo_url? this.discount.seo_url.trim(): undefined;
		if(this.discount.seo_url && this.discount.seo_url!=''){
            this.message='Checking..'
			this._discountPanelService.getAvailableStatus(this.discount).subscribe(result=>{
				if(result.success){
					this.discount.total_item=result.count;
                    this.discount.cond=result.cond;
                    this.message='';
				}else{
					this.message='No item available to update';
				}
			})
		}else{
			this.message='Enter seo url first.';
		}
	}

	updatePrice() {
		if (confirm("Are you sure about this updating?")) {
			this.res_pending=true;
			this._discountPanelService.update(this.discount).subscribe(result => {
				this.res_pending=false;
				if(result.success){
					alert('Updated successfully!');
					this.discount={};
				}else{
					alert('Failed! Internal server error.');
				}
			})
		}
	}

}
