import { Component, ViewEncapsulation, ElementRef } from '@angular/core';

import GoogleMapsLoader from 'google-maps';
import { google } from 'google-maps';
import { Subscription } from 'rxjs';
import { SeoContentLoaderService } from '../../../shared/services';
import { StaticPagesService } from '../../../shared/services/static-pages.service';
import { PubSubService } from '../../../shared/services/pub-sub-service';



import 'style-loader!./contact.scss';

@Component({
  selector: 'contact-us',
  templateUrl: './contact-us.html',
  encapsulation: ViewEncapsulation.None
})
export class ContactUsComponent {

  public busy: Subscription;
  public content_object: any = {};

  public CustomerFB: any = {};
  public validation: any = {};
  constructor(private staticPagesService: StaticPagesService, private pubSubService: PubSubService, private _elementRef: ElementRef, private seoContentLoaderService: SeoContentLoaderService) { }

  ngOnInit() {
    window.scrollTo(0, 0);

    this.seoContentLoaderService.setContent("Contact Us", "Contact BoiBazar", "Contact BoiBazar");
  }


  ngAfterViewInit() {
    let el = this._elementRef.nativeElement.querySelector('.contact-us');

    GoogleMapsLoader.KEY = 'AIzaSyC9J5AeFjpLKQfg82F6XJoWgLsoH7jEwxM ';
    GoogleMapsLoader.load((google) => {
      let myLatlng = new google.maps.LatLng(23.7360931, 90.4132438);

      let map = new google.maps.Map(el, {
        center: new google.maps.LatLng(23.7360931, 90.4132438),
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      this.seoContentLoaderService.setContent("", "", "");

      let marker = new google.maps.Marker({
        draggable: false,
        animation: google.maps.Animation.DROP,
        position: myLatlng,
        map: map,
        title: "Level: 14, Sattar Center 30/A VIP Road, Naya Paltan, Dhaka"
      });
    });
  }


  feedback(CustomerFB) {
    if (Object.keys(CustomerFB).length < 4 || CustomerFB.name.length < 4 || CustomerFB.message.length < 10 || CustomerFB.subject.length < 5) {
      alert("Name OR message is too short!");
    } else
      this.staticPagesService.postFeedback(CustomerFB).subscribe((response) => {
        this.CustomerFB = {};
        if (response.success) {
          alert("Thanks for your feedback!");
        } else {
          alert("Feedback submission failed. Please try again latter!");
        }
      });
  }

  validate(field) {
    if (field != 'email') {
      this.validation[field] = { required_error: false, length_error: false }
      if (!this.CustomerFB[field] && this.CustomerFB[field] != "") {
        this.validation[field].required_error = true;
      } else {
        this.validation[field].required_error = false;
        this.validation[field].length_error = false;
      }
    } else {
      this.validation[field] = { required_error: false, invalid: false }
      if (!this.CustomerFB[field] && this.CustomerFB[field] != "") {
        this.validation[field].required_error = true;
      } else {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var result = re.test(this.CustomerFB[field]);
        if (!result) {
          this.validation[field].required_error = false;
          this.validation[field].invalid = true;
        } else {
          this.validation[field].required_error = false;
          this.validation[field].invalid = false;
        }
      }
    }
  }

}
