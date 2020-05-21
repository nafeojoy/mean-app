
import { Directive, forwardRef } from "@angular/core";
import { NG_ASYNC_VALIDATORS, Validator, AbstractControl } from "@angular/forms";
import { Observable } from "rxjs/Rx";
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/first';

import { PublisherService } from "./publisher.service";

@Directive({
  selector: "[asyncValidator][formControlName], [asyncValidator][formControl], [asyncValidator][ngModel]",
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => PublisherAsyncValidator), multi: true
    }
  ]
})

export class PublisherAsyncValidator implements Validator {
  constructor(private publisherService: PublisherService) { }

  validate(c: AbstractControl): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> {
    return this.publisherPageExistsObservable(c.value).debounceTime(1000).distinctUntilChanged().first();
  }

  publisherPageExistsObservable(text: string) {


    return new Observable(observer => {
      this.publisherService.checkExists(text).subscribe((pageFound) => {
        if (pageFound && pageFound.exist) {
          observer.next({ exist: true });
        } else {
          observer.next(null)
        }
      })
    });
  }
}