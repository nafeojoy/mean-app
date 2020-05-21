import { Injectable, Inject } from '@angular/core';
// import { ElementRef, Renderer } from '@angular/core';

import { Title, Meta, DOCUMENT } from '@angular/platform-browser';

@Injectable()
export class SeoContentLoaderService {
    constructor( private titleService: Title, private metaService: Meta, @Inject(DOCUMENT) private document) {
    }

    setContent(title: string, description: string, keywords: string, update = true) {
        title = title && title != '' && update ? title : "Boibazar Largest Online Book Store in Bangladesh";
        description = description && description != '' && update ? description : "Buy Books & Get Home Delivery anywhere in Bangladesh";
        keywords = keywords && keywords != '' && update ? keywords : "Books, Boibazar, Boimela, Book, Bangladesh, Largest, Big, Boro, Bishal, Online, Shop, Place";

        this.titleService.setTitle(title);
        this.metaService.updateTag({ name: 'description', content: description });
        this.metaService.updateTag({ name: 'keywords', content: keywords });
    }
}