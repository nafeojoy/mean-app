import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class FilterDataService {

    public searchData: any = {};
    public breadcrumbData: any = {};
    public checkBoxData: any = {};


    setSearchData(type: string, typeId: number, ) {
        this.searchData = {};
        this.searchData[type] = [];
        this.searchData[type].push(typeId);
        window.localStorage.removeItem('filter');
        window.localStorage.setItem('filter', JSON.stringify(this.searchData));
    };

    getSearchData() {
        this.searchData = JSON.parse(window.localStorage.getItem('filter'));
        return this.searchData;
    }

    setCheckBoxData(type: string, typeId: string) {
        this.checkBoxData.type = type;
        this.checkBoxData.typeId = typeId;

        window.localStorage.removeItem('cbData');
        window.localStorage.setItem('cbData', JSON.stringify(this.checkBoxData));
    }

    getCheckBoxData() {
        this.checkBoxData = JSON.parse(window.localStorage.getItem('cbData')) == null ? {} : JSON.parse(window.localStorage.getItem('cbData'));
        return this.checkBoxData;
    }

    removeCheckBoxData() {
        this.checkBoxData = {};
        window.localStorage.removeItem('cbData')
    }

    setBreadcrumbData(type: string, typeId: string, paramUrl: string) {
        this.breadcrumbData.type = type;
        this.breadcrumbData.typeId = typeId;
        this.breadcrumbData.url = paramUrl;

        window.localStorage.removeItem('bcData');
        window.localStorage.setItem('bcData', JSON.stringify(this.breadcrumbData));
    };

    getBreadcrumbData() {
        this.breadcrumbData = JSON.parse(window.localStorage.getItem('bcData')) == null ? {} : JSON.parse(window.localStorage.getItem('bcData'));
        return this.breadcrumbData;
    }

    removeBreadcrumbData() {
        this.breadcrumbData = {};
        window.localStorage.removeItem('bcData')
    }
}