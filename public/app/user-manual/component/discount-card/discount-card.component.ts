import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';


@Component({
    selector: 'discount-card',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './discount-card.html'
})

export class DiscountCardComponent {
    pdfSrcBn: string = '/assets/images/umBangla.pdf';
    pdfSrcEn: string = '/assets/images/umEnglish.pdf';
    pdfLang: string;
    banglaImages: any = [];
    englishImages: any = [];
    
    ngOnInit(){
        this.banglaImages = ["/assets/images/Bangla/1.jpg" ];
        this.englishImages = ["/assets/images/English/1.jpg"];
    }

    @ViewChild('imageModal') imageModal: ModalDirective;

    showPdf(lang) {
        this.pdfLang = lang;
        this.imageModal.show();
    }
}