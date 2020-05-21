import {Pipe, PipeTransform, Injectable} from "@angular/core";

@Pipe({
  name: 'filter',
  pure: false
})

@Injectable()
export class FilterPipe implements PipeTransform {
  transform(items: any[], field: string, args: any): any {
    return items.filter(item => item[field].toLowerCase().indexOf(args.toLowerCase()) !== -1);
  }
}
