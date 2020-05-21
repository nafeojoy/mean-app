
import { Pipe, PipeTransform } from '@angular/core';
import { PriceService } from './price-conversion.service'; // our translate service


@Pipe({ name: 'numberConvert' })

export class NumberConversionPipe implements PipeTransform {

  constructor(private _priceService: PriceService) { }

  transform(value: number): any {
    if (!value) return;
    return this._priceService.convertNumber(value);
  }
}
