import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ModalDirective } from 'ng2-bootstrap';

import { BbImageUploader } from '../../../../shared/components/bb-image-uploader';

import { ProductService } from "./products.service";
import { ProductModelService } from "./products.model.service";
import { AuthorService } from "../authors/authors.service";
import { PublisherService } from "../publishers/publisher.service";
import { CategoryService } from "../categories/category.service";
import { AttributesService } from "../attribute/attributes.service";
import { Subject } from 'rxjs/Subject';


import 'style-loader!./products.scss';

@Component({
    selector: 'products-edit',
    templateUrl: './products.edit.html',
})

export class ProductEditComponent {

    public form: FormGroup;
    public profile: any = {};
    public hasImage: boolean = false;
    @ViewChild('optionModal') optionModal: ModalDirective;

    private product_id: string;
    product_name: any = {};
    product_description: any = {};
    product_meta_tag_title: any = {};
    product_meta_tag_description: any = {};
    product_meta_tag_keywords: any = {};
    product_seo_url: any = {};
    product_image: string;
    product: any = {};

    public selectedAuthor: any = {};
    public selectedTranslator: any = {};
    public selectedEditor: any = {};
    public selectedComposer: any = {};
    public selectedBundleItems: any = {};
    public selectedPublisher: any = {};
    public selectedCategory: any = {};

    public authorList: any = [];
    public translatorList: any = [];
    public composerList: any = [];
    public editorList: any = [];
    public bundleItemsList: any = [];

    public publisherList: any = [];
    public categoryList: any = [];
    public newAttribute: any;
    public attributeList: any = [];
    public previousAttributes: any = [];
    public updatedAttributes: any = [];

    public previousAuthors: any = [];
    public updatedAuthors: any = [];

    public previousTranslators: any = [];
    public updatedTranslators: any = [];

    public previousEditors: any = [];
    public updatedEditors: any = [];

    public previousComposers: any = [];
    public updatedComposers: any = [];

    public previousBundleItems: any = [];
    public updatedBundleItems: any = [];

    public previousCategory: any = [];
    public updatedCategory: any = [];
    public offers: any = [];
    public moreValid: boolean;

    public uploaderOptions: any = {};
    public res_pending: boolean;
    searchTerm$ = new Subject<string>();

    public update_res_massege: string;

    constructor(
        private productService: ProductService,
        private modelService: ProductModelService,
        private authorService: AuthorService,
        private publisherService: PublisherService,
        private categoryService: CategoryService,
        private route: ActivatedRoute,
        private attributesService: AttributesService,
        private location: Location
    ) { }

    ngOnInit() {

        this.productService.getSearch(this.searchTerm$)
            .subscribe(result => {
                this.bundleItemsList = result.items;
            });

        this.form = this.modelService.getFormModel();
        let defaultLanguageCode = this.modelService.defaultLanguageCode;
        this.product_id = this.route.snapshot.params['id'];

        let imageSize = '120X175';

        let result: any = JSON.parse(window.localStorage.getItem(this.product_id));
        this.product = result;
        this.updatedAttributes = result.attributes;

        this.previousAttributes = result.attributes.map(name => {
            return { 'name': name, '_id': '' }
        });

        if (result.authors_are == 'author') {
            this.updatedAuthors = result.author.map(obj => {
                return obj._id;
            })

            this.previousAuthors = result.author;
        }

        this.updatedTranslators = result.translator.map(obj => {
            return obj._id;
        })

        this.previousTranslators = result.translator;


        this.updatedEditors = result.editor.map(obj => {
            return obj._id;
        })
        this.previousEditors = result.editor;


        this.updatedComposers = result.composer.map(obj => {
            return obj._id;
        })
        this.previousComposers = result.composer;


        this.updatedBundleItems = result.bundle_items.map(obj => {
            return obj._id;
        })


        this.previousBundleItems = result.bundle_items;


        this.updatedCategory = result.category.map(obj => {
            return obj._id;
        })

        this.previousCategory = result.category;

        this.product_image = result.image;
        this.profile.picture = result.image == undefined || '' ? 'assets/img/theme/book-no-photo.jpg' : result.image[imageSize];

        this.form.controls['published_at'].setValue(result.published_at);
        this.form.controls['isbn'].setValue(result.isbn);
        this.form.controls['number_of_pages'].setValue(result.number_of_pages);
        this.form.controls['free_delivery'].setValue(result.free_delivery);
        this.form.controls['is_enabled'].setValue(result.is_enabled);
        this.form.controls['is_out_of_stock'].setValue(result.is_out_of_stock);
        this.form.controls['is_out_of_print'].setValue(result.is_out_of_print);
        this.form.controls['is_bundle'].setValue(result.is_bundle);
        this.form.controls['current_offer'].setValue(result.current_offer);
        this.form.controls['previous_price'].setValue(result.previous_price);
        this.form.controls['price'].setValue(result.price);
        this.form.controls['discount_rate'].setValue(result.discount_rate);
        this.form.controls['quantity'].setValue(result.quantity);
        this.form.controls['priority'].setValue(result.priority);

        this.selectedAuthor = result.author;
        this.selectedTranslator = result.translator;
        this.selectedEditor = result.editor;
        this.selectedComposer = result.composer;
        this.selectedBundleItems = result.bundle_items;

        this.selectedPublisher = result.publisher;
        this.selectedCategory = result.category;

        this.product_name[defaultLanguageCode] = result.name;
        this.product_description[defaultLanguageCode] = result.description;
        this.product_meta_tag_title[defaultLanguageCode] = result.meta_tag_title;
        this.product_meta_tag_description[defaultLanguageCode] = result.meta_tag_description;
        this.product_meta_tag_keywords[defaultLanguageCode] = result.meta_tag_keywords;
        this.product_seo_url[defaultLanguageCode] = result.seo_url

        let languages = result.lang;

        for (var i in languages) {
            this.product_name[languages[i].code] = languages[i].content.name;
            this.product_description[languages[i].code] = languages[i].content.description;
            this.product_meta_tag_title[languages[i].code] = languages[i].content.meta_tag_title;
            this.product_meta_tag_description[languages[i].code] = languages[i].content.meta_tag_description;
            this.product_meta_tag_keywords[languages[i].code] = languages[i].content.meta_tag_keywords;
            this.product_seo_url[languages[i].code] = languages[i].content.seo_url;
        }

        this.productService.getOffers().subscribe(offers => {
            this.offers = offers;
        })
    }

    saveNewAttribute(value) {
        this.updatedAttributes.push(value.name)
    }


    getAttributes(attributes) {
        let other_lang_att = [];
        let default_lang_att = attributes.map(obj => {
            if (obj.lang && obj.lang.length > 0) {
                for (var i in obj.lang) {
                    other_lang_att.push(obj.lang[i].content.name)
                }
            }
            return obj.name;
        });
        this.updatedAttributes = default_lang_att.concat(other_lang_att);
    }

    getCategory(categories) {
        this.updatedCategory = categories.map(obj => {
            return obj._id;
        })
    }

    getAuthors(authors) {
        this.updatedAuthors = authors.map(obj => {
            return obj._id;
        })
    }

    getTranslators(translators) {
        this.updatedTranslators = translators.map(obj => {
            return obj._id;
        })
    }

    getEditors(editors) {
        this.updatedEditors = editors.map(obj => {
            return obj._id;
        })
    }


    getComposers(composers) {
        this.updatedComposers = composers.map(obj => {
            return obj._id;
        })
    }

    getBundleItems(bunddleItems) {
        this.updatedBundleItems = bunddleItems.map(obj => {
            return obj._id;
        })
    }

    update() {
        this.res_pending = true;
        this.moreValid = false;
        let product = this.modelService.getFormValue(this.form);
        product._id = this.product_id;
        product.editor = this.updatedEditors;
        product.composer = this.updatedComposers;
        product.authors_are = 'author';
        product.author = this.updatedAuthors;

        if (this.updatedAuthors.length < 1) {
            if (this.updatedEditors.length > 0) {
                product.authors_are = 'editor';
                product.author = this.updatedEditors;
            }
            if (this.updatedComposers.length > 0 && this.updatedEditors.length < 1) {
                product.authors_are = 'composer';
                product.author = this.updatedComposers;
            }
        }


        product.attributes = this.updatedAttributes;
        product.translator = this.updatedTranslators;
        this.updatedBundleItems = product.is_bundle ? this.updatedBundleItems : [];
        product.bundle_items = this.updatedBundleItems;
        product.is_bundle = product.bundle_items && Array.isArray(product.bundle_items) && product.bundle_items.length > 0;
        product.category = this.updatedCategory;
        product.price = (product.previous_price - (product.previous_price * product.discount_rate) / 100);
        if ((this.updatedAuthors.length > 0 || this.updatedComposers.length > 0 || this.updatedEditors.length > 0) && this.updatedCategory.length > 0) {
            product.image = this.product_image
            this.productService.update(product).subscribe(result => {
                this.res_pending = false;
                if (result._id) {
                    this.update_res_massege = "Product Update Success!";
                    this.optionModal.show();
                } else {
                    alert("Product Update Failed!");
                }
            })

        } else {
            this.res_pending = false;
            alert("Validation failed! You missed Category or Author field");
        }
    }

    redirectToList() {
        this.location.back();
    }


    ridirectToImageUploadPanel() {

    }

    searchAttributes(text) {
        this.attributesService.getSearch(text).subscribe((result) => {
            this.attributeList = result.items;
        })
    }

    searchAuthor(text) {
        this.authorService.getSearch(text).subscribe((result) => {
            this.authorList = result.items;
        })
    }


    searchTranslator(text) {
        this.authorService.getSearch(text).subscribe((result) => {
            this.translatorList = result.items;
        })
    }

    searchComposer(text) {
        this.authorService.getSearch(text).subscribe((result) => {
            this.composerList = result.items;
        })
    }

    searchEditor(text) {
        this.authorService.getSearch(text).subscribe((result) => {
            this.editorList = result.items;
        })
    }

    // searchBundleItems(text) {
    // this.productService.getSearch(text).subscribe((result) => {
    // this.bundleItemsList = result.items;
    // })
    // }


    searchPublisher(text) {
        this.publisherService.getSearch(text).subscribe((result) => {
            this.publisherList = result.items;
        })
    }

    searchCategory(text) {
        this.categoryService.getSearch(text).subscribe((result) => {
            this.categoryList = result.items;
        })
    }
}
