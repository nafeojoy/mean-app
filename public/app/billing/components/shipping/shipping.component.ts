import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from "@angular/router";

import { ShippingService } from './shipping.service';
import { AuthService } from '../../../shared/services/auth.service';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { CountryService } from '../../../shared/services/country.service';

import 'style-loader!./shipping.scss';

@Component({
  selector: 'shipping-process',
  providers: [ShippingService],
  templateUrl: './shipping.html',
  encapsulation: ViewEncapsulation.None
})
export class ShippingComponent {

  public countries: any = [];
  shipping: any = { contact_name: "" };
  public districts: any = [];
  public thanas: any = [];
  public countryObj: any = {};
  public addresses: any = [];
  public primaryAddress: any = {};
  public validation: any = {};

  public otherAddresses: any = [];
  public hasPrimaryAddress: boolean;
  constructor(
    private countryService: CountryService,
    private shippingService: ShippingService,
    private router: Router,
    private pubSubService: PubSubService, private authService: AuthService) {
  }

  ngOnInit() {
    this.shippingService.getDistrict().subscribe(districts => {
      this.districts = districts;
    })
    this.getAddresses();

    this.pubSubService.AuthStatusStream.subscribe((result) => {
      if (result.redirectToHom === true) {
        this.router.navigate(['/',]);
      }
    });
  }

  selectDistrict() {
    this.shippingService.getThana(this.shipping.district).subscribe(thanas => {
      this.thanas = thanas;
    })
  }
  selectDistrictAgain(){
    this.shipping.thana = "";
    this.shippingService.getThana(this.shipping.district).subscribe(thanas => {
      this.thanas = thanas;
    })
  }

  getAddresses() {
    this.shippingService.getAddresses().subscribe(results => {
      if (results.success) {
        this.addresses = results.address;
        if (this.addresses.length < 1) {
          this.hasPrimaryAddress = false;
          this.shipping.is_primary = true;
        } else {
          this.hasPrimaryAddress = true;
          this.shipping.is_primary = false;
        }
      } else {
        this.hasPrimaryAddress = false;
        this.shipping.is_primary = true;
      }

      for (var i in this.addresses) {
        if (this.addresses[i].is_primary) {
          this.primaryAddress = this.addresses[i];
        } else {
          this.otherAddresses.push(this.addresses[i]);
        }
      }
    })
  }


  getDistrictName() {
    return this.districts.find(dist => { return dist.DISTRICT_NO == this.shipping.district }).DISTRICTT_NAME;
  }


  changeAddress(otherAddress) {
    this.primaryAddress = otherAddress;
  }

  newAddress() {
    this.hasPrimaryAddress = false;
  }

  validate(field) {
    // this.initial = false;
    if (field != 'phone_number') {
      this.validation[field] = { required_error: false, length_error: false }
      if (!this.shipping[field] && this.shipping[field] != "") {
        this.validation[field].required_error = true;
      } else {
        if (this.shipping[field].length < 4) {
          this.validation[field].required_error = false;
          this.validation[field].length_error = true;
        } else {
          this.validation[field].required_error = false;
          this.validation[field].length_error = false;
        }
      }
    } else {
      this.validation[field] = { required_error: false, invalid: false }
      if (!this.shipping[field] && this.shipping[field] != "") {
        this.validation[field].required_error = true;
      } else {
        var result = '' + this.shipping[field];

        if (result.length != 10) {
          this.validation[field].required_error = false;
          this.validation[field].invalid = true;
          this.shipping.phone_number = parseInt(this.shipping[field]);

        } else {
          this.validation[field].required_error = false;
          this.validation[field].invalid = false;
        }
      }
    }
  }


  save(shipping) {
    shipping.district = this.getDistrictName();
    if (this.authService.isLoggedIn() === true) {
      this.shippingService.saveAddress(shipping).subscribe((address) => {
        this.saveAndGo(address._id);
      })
    } else {
      window.localStorage.setItem('tempAddress', JSON.stringify(shipping));
      this.router.navigateByUrl('/billing/payment');
    }
  }

  useAsPresentAddress(choosenAddress) {
    this.saveAndGo(choosenAddress._id);
  }

  saveAndGo(value) {
    window.localStorage.setItem('presentAddress', value);
    this.router.navigateByUrl('/billing/payment');
  }
}


