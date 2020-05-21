import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { LanguageService } from './language.service';

@Component({
    selector: 'language-list',
    templateUrl: './language.list.html',
})
export class LanguageListComponent {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    languages: any;
    selectedLanguage: any;

    constructor(private languageService: LanguageService) { }

    ngOnInit() {
        this.languages = this.languageService.getAll();
    }

    showDeleteModal(language) {
        this.selectedLanguage = language;
        this.deleteModal.show();
    }

    deleteLanguage() {
        this.languageService.delete(this.selectedLanguage._id).subscribe(() => {
            this.deleteModal.hide();
        });
    }

    showViewModal(language) {}
}