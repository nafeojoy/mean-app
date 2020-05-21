
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'rating'})
export class RatingConversionPipe implements PipeTransform {
  transform(value: number): any {
  
    if (!value) return value;

    let ratingStr = (value * 100 / 5 ) + '%';

    return ratingStr;
  }
}