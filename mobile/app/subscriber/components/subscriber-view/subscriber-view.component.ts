import { Component, ViewEncapsulation, ViewChild, trigger, state, animate, transition, style } from '@angular/core';
import { Router } from '@angular/router';
import { BbImageUploader } from '../../../shared/components/bb-image-uploader';
import { SubscriberViewService } from './subscriber-view.service';
import { CookieService } from 'angular2-cookie/core';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { CountryService, CustomCookieService } from '../../../shared/services';

import 'style-loader!./subscriber.scss';

@Component({
    selector: 'subscriber-view',
    providers: [SubscriberViewService, CookieService],
    animations: [
        trigger('stateChange', [
            state('show', style({ opacity: 1, transform: 'scale(1.0)' })),
            state('hide', style({ opacity: 0, transform: 'scale(0.0)' })),
            transition('show => hide', animate('500ms')),
            transition('hide => show', animate('500ms'))
        ])
    ],
    templateUrl: './subscriber-view.html',
    encapsulation: ViewEncapsulation.None
})

export class SubscriberViewComponent {

    public districts: any = [];
    public thanas: any = [];
    public subscriber: any = {};
    public currentShippingAddress: any = {};
    public isAddressAvailable: boolean = false;
    public otherShippingAddress: any;
    @ViewChild('imageUploader') _fileUpload: BbImageUploader;
    public hasImage: boolean;
    public isChange: boolean = true;
    public isAddressChange: boolean = false;
    public profile: any = {};
    public hasMore: boolean = true;
    public hasPrevious: boolean = true;
    public otheraddress_index: number = 0;
    public isFirst: boolean = true;
    public isPrimary: boolean = true;
    public primaryAddress: any;
    addressStateExpression: string;
    profileStateExpression: string;
    public message: string;
    public validation: any = {};
    public viewAddress: any = {};
    public isChangePass: boolean;

    constructor(private subscriberViewService: SubscriberViewService,
        private countryService: CountryService,
        private router: Router, private _customCookieService: CustomCookieService,
        private _cookieService: CookieService,
        private pubSubService: PubSubService) {
        this.addressStateExpression = 'show';
        this.profileStateExpression = 'show';
    }

    ngOnInit() {
        this.subscriberViewService.getDistrict().subscribe(districts => {
            this.districts = districts;
            this.getSubscriber();
        })
        this.pubSubService.AuthStatusStream.subscribe(result => {
            if (result.redirectToHome === true) {
                this.router.navigate(['/',]);
            }
        })
    }

    getSubscriber() {
        this.subscriberViewService.get().subscribe(result => {
            this.subscriber = result;
            this.setImage(result);
            this.separateAddress(result.addresses);
        })
    }

    selectDistrict() {
        this.subscriberViewService.getThana(this.currentShippingAddress.district).subscribe(thanas => {
            this.thanas = thanas;
        })
    }

    getDistrictName() {
        return this.districts.find(dist => { return dist.DISTRICT_NO == this.currentShippingAddress.district }).DISTRICTT_NAME;
    }

    getDistrictObject(district) {
        return this.districts.find(dist => { return dist.DISTRICTT_NAME === district })
    }

    validate(field) {
        if (field != 'phone_number') {
            this.validation[field] = { required_error: false, length_error: false }
            if (!this.currentShippingAddress[field] && this.currentShippingAddress[field] != "") {
                this.validation[field].required_error = true;
            } else {
                if (this.currentShippingAddress[field].length < 4) {
                    this.validation[field].required_error = false;
                    this.validation[field].length_error = true;
                } else {
                    this.validation[field].required_error = false;
                    this.validation[field].length_error = false;
                }
            }
        } else {
            this.validation[field] = { required_error: false, invalid: false }
            if (!this.currentShippingAddress[field] && this.currentShippingAddress[field] != "") {
                this.validation[field].required_error = true;
            } else {
                var result = '' + this.currentShippingAddress[field];
                if (result.length != 11) {
                    this.validation[field].required_error = false;
                    this.validation[field].invalid = true;
                    this.currentShippingAddress.phone_number = this.currentShippingAddress[field];

                } else {
                    this.validation[field].required_error = false;
                    this.validation[field].invalid = false;
                }
            }
        }
    }

    public defaultPicture = 'assets/images/icon-user.png';
    public uploaderOptions: any = {
        url: 'subscriber-upload',
    };

    isImageChosen(status: boolean) { this.hasImage = status }

    setNow() {
        // this.currentShippingAddress = { district: {}, thana: {} }
        this.isAddressChange = true;
        this.isPrimary = true;
        this.isAddressAvailable = true;
        this.animateAddress();
    }

    changePass() {
        this.isChangePass = true;
    }

    cancelPassChng() {
        this.isChangePass = false;
    }

    change() {
        this.isChange = false;
        this.animateProfile();
    }

    changeAddress() {
        let dObj = this.getDistrictObject(this.viewAddress.district);
        this.subscriberViewService.getThana(dObj.DISTRICT_NO).subscribe(thanas => {
            this.thanas = thanas;
            this.viewAddress.district = dObj.DISTRICT_NO;
            this.currentShippingAddress = this.viewAddress;
            this.isAddressChange = true;
            this.isPrimary = true;
            this.isAddressAvailable = true;
            this.animateAddress();
        })
    }

    update() {
        if (this.hasImage) {
            this._fileUpload.uploadToServer().then((images) => {
                this.subscriber.image = images;
                this.subscriberViewService.updatePrimaryInfo(this.subscriber).subscribe(result => {
                    this.resultInquery(result);
                })
            });
        } else {
            this.subscriberViewService.updatePrimaryInfo(this.subscriber).subscribe(result => {
                this.resultInquery(result);
            })
        }
    }

    cancelAddress() {
        this.isAddressChange = false;
        this.isPrimary = true;
        this.isAddressAvailable = true;
        this.animateAddress();
    }

    saveAddress() {
        let dataAddress = this.currentShippingAddress;
        dataAddress.district = this.getDistrictName();
        if (dataAddress._id) {
            this.subscriberViewService.updateAddressInfo(dataAddress).subscribe(result => {
                this.currentShippingAddress = {}
                this.getSubscriber();
                alert(result.msg);
                this.isAddressChange = false;
                this.isAddressAvailable = true;
                this.animateAddress();
            })
        } else {
            this.subscriberViewService.saveAddress(dataAddress).subscribe(result => {
                this.currentShippingAddress = {}
                this.getSubscriber();
                alert(result.msg);
                this.isAddressChange = false;
                this.isPrimary = true;
                this.isAddressAvailable = true;
                this.animateAddress();
            })
        }
    }

    resultInquery(result) {
        if (result.status) {
            this.message = result.message;
            setTimeout(() => {
                this.message = null;
            }, 4000)
        } else {
            this.isChangePass = false;
            this._customCookieService.setCookie('token', result.token, 500)
            this.setImage(result.subscriber);
            this.isChange = true;
            this.animateProfile();
            delete this.subscriber.old_password;
            delete this.subscriber.new_password;
        }
    }

    setImage(param) {
        if (param.image) {
            this.profile = { 'picture': param.image['250X360'] }
        } else {
            this.profile = { 'picture': 'assets/images/icon-user.png' }
        } this.currentShippingAddress = {};
    }


    separateAddress(addressArray) {
        if (addressArray.length > 0) {
            this.primaryAddress = addressArray.filter(function (obj) {
                return obj.is_primary == true;
            });
            var otherAddress = addressArray.filter(function (obj) {
                return obj.is_primary == false;
            });
            this.viewAddress = new Object({
                _id: this.primaryAddress[0]._id,
                contact_name: this.primaryAddress[0].contact_name,
                district: this.primaryAddress[0].district,
                thana: this.primaryAddress[0].thana,
                address: this.primaryAddress[0].address,
                phone_number: this.primaryAddress[0].phone_number,
                alter_phone: this.primaryAddress[0].alter_phone
            })
            let prymrAddress = this.primaryAddress[0];
            let distObject = this.getDistrictObject(prymrAddress.district);
            prymrAddress.district = distObject.DISTRICT_NO;
            this.subscriberViewService.getThana(distObject.DISTRICT_NO).subscribe(thanas => {
                this.thanas = thanas;
                let thanaObj = thanas.find(thana => { return thana.THANA_NAME == prymrAddress.thana })
                prymrAddress.thana = thanaObj.THANA_NAME;
                this.currentShippingAddress = prymrAddress;
            })
            this.otherShippingAddress = otherAddress;
            if (this.otherShippingAddress.length > 0) {
                this.hasMore = false;
            }
            this.isAddressAvailable = true;
        } else {
            this.isAddressChange = false;
            this.isAddressAvailable = false;
        }
    }


    more() {
        this.isPrimary = false;
        if (this.isFirst) {
            this.viewAddress = this.otherShippingAddress[this.otheraddress_index];
            this.otheraddress_index++;
            this.hasMore = this.otheraddress_index == this.otherShippingAddress.length ? true : false;
            this.isFirst = false;
            this.hasPrevious = false;
            this.animateAddress();
        } else {
            this.viewAddress = this.otherShippingAddress[this.otheraddress_index];
            this.otheraddress_index++;
            this.hasMore = this.otheraddress_index == this.otherShippingAddress.length ? true : false;
            this.otheraddress_index = this.hasMore ? this.otheraddress_index - 1 : this.otheraddress_index;
            this.hasPrevious = false;
            this.animateAddress();
        }
    }

    previous() {
        this.addressStateExpression = 'hide';
        this.isPrimary = false;
        this.hasMore = false;
        this.otheraddress_index--;
        this.viewAddress = this.otherShippingAddress[this.otheraddress_index];
        this.hasPrevious = this.otheraddress_index < 1 ? true : false;
        this.otheraddress_index++;
        this.animateAddress();
    }

    showPrimary() {
        this.isPrimary = true;
        this.currentShippingAddress = this.primaryAddress[0];
        this.animateAddress();
    }

    makePrimary(address) {
        address.is_primary = true;
        this.subscriberViewService.updateAddress(address).subscribe(result => {
            this.primaryAddress[0].is_primary = false;
            this.otherShippingAddress.push(this.primaryAddress[0]);
            this.separateAddress(this.otherShippingAddress);
            this.isPrimary = true;
            this.currentShippingAddress = result;
        })
    }

    animateAddress() {
        this.addressStateExpression = 'hide';
        setTimeout(() => {
            this.addressStateExpression = 'show';
        }, 500)
    }

    animateProfile() {
        this.profileStateExpression = 'hide';
        setTimeout(() => {
            this.profileStateExpression = 'show';
        }, 500)
    }
}