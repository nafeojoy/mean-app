
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  private limit: number;
  private trail: string;
  
  transform(value: string, limit: number, trail: string): string {
    this.limit = limit > 0 ? limit : 15;
    this.trail = trail.length > 1 ? trail : '...';

    return value.length > this.limit ? value.substring(0, this.limit) + this.trail : value;
  }
}