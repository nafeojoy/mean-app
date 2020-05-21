import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';

import { AuthManager } from "../../../../authManager";
import { CategoryService } from './category.service';
import { PaginationSearchBase } from '../../../../shared/classes/pagination-search-base';

import 'style-loader!./category.scss';

@Component({
    selector: 'category-list',
    templateUrl: './category.list.html',
})
export class CategoryListComponent extends PaginationSearchBase {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    categories: any;
    selectedCategory: any;

    constructor(private categoryService: CategoryService, public authManager: AuthManager) {
        super();
        this.categories = this.categoryService.categories;
        this.totalItems = this.categoryService.count;
        this.dataSource
        .mergeMap((params: { search: string, page: number, limit: number }) => {
            if (params.search && params.search.length) {
                this.categoryService.search(params.search, params.page, params.limit);
            } else {
                this.categoryService.getPaged(params.page, params.limit);
            }
            return this.categoryService.categories;
        })
        .subscribe();
    }

    ngOnInit() {
        this.categoryService.getAll();
        for (var key in localStorage) {
            if (key.length == 24) {
                localStorage.removeItem(key);
            }
        }
    }

    showDeleteModal(category) {
        this.selectedCategory = category;
        this.deleteModal.show();
    }

    deleteCategory() {
        this.categoryService.delete(this.selectedCategory._id);
    }

    set(data) {
        window.localStorage.setItem(data._id, JSON.stringify(data));
    }
}