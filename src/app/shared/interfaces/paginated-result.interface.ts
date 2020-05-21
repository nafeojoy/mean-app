import { Observable } from 'rxjs/Observable';

export interface PaginatedResult<T> {
    items: Observable<T[]>,
    
    count: number
}