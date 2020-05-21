import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Location } from '@angular/common';
import { ModalDirective } from 'ng2-bootstrap';

// import { BbImageUploader } from '../../../../shared/components/bb-image-uploader';
import { Subject } from 'rxjs/Subject';
// import { PubSubService } from '../../../../shared/services/pub-sub-service';
import { ProductService } from "./products.service";
import { ProductModelService } from "./products.model.service";
import { AuthorService } from "../authors/authors.service";
import { PublisherService } from "../publishers/publisher.service";
import { CategoryService } from "../categories/category.service";
import { AttributesService } from "../attribute/attributes.service";

import 'style-loader!./products.scss';

@Component({
	selector: 'products-add',
	templateUrl: './products.add.html',
})

export class ProductAddComponent {

	public form: FormGroup;
	public ckeditorContent: any;
	@ViewChild('optionModal') optionModal: ModalDirective;
	public update_res_massege: string;
	authors: any;
	translators: any;
	composers: any;
	editors: any;
	bundleItems: any;
	publishers: any;
	categories: any;
	public hasImage: boolean = false;
	public authorList: any = [];
	public translatorList: any = [];
	public editorList: any = [];
	public composerList: any = [];
	public bundleItemsList: any = [];
	public publisherList: any = [];
	public categoryList: any = [];
	public attributeList: any = [];
	public newAttribute: any;
	public selectedAttributeList: any = [];
	public selectedCategories: any = [];
	public selectedAuthors: any = [];
	public selectedTranslators: any = [];
	public selectedComposers: any = [];
	public selectedEditors: any = [];
	public selectedBundleItems: any = [];
	public offers: any = [];
	public subMessageStatusStream: any;
	public res_pending: boolean;
	searchTerm$ = new Subject<string>();
	public config;
	private saved_id: string;


	// @ViewChild('imageUploader') public _fileUpload: BbImageUploader;

	constructor(
		private modelService: ProductModelService,
		private productService: ProductService,
		private authorService: AuthorService,
		private publisherService: PublisherService,
		private categoryService: CategoryService,
		private attributesService: AttributesService,
		private location: Location,
		private router: Router
		// private pubSubService: PubSubService
	) { }

	ngOnInit() {
		this.config = {
			uiColor: '#F0F3F4',
			height: '400'
		};
		this.form = this.modelService.getFormModel();
		this.categories = this.categoryService.categories;
		this.categoryService.getAll();
		this.productService.getOffers().subscribe(offers => {
			this.offers = offers;
		})

		this.productService.getSearch(this.searchTerm$)
			.subscribe(result => {
				this.bundleItemsList = result.items;
			});

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
		this.selectedAttributeList = default_lang_att.concat(other_lang_att);
	}

	getCategories(categories) {
		this.selectedCategories = categories.map(obj => {
			return obj._id;
		})
	}

	getAuthors(authors) {
		this.selectedAuthors = authors.map(obj => {
			return obj._id;
		})
	}

	getTranslators(translators) {
		this.selectedTranslators = translators.map(obj => {
			return obj._id;
		})
	}

	getEditors(editors) {
		this.selectedEditors = editors.map(obj => {
			return obj._id;
		})
	}

	getComposers(composers) {
		this.selectedComposers = composers.map(obj => {
			return obj._id;
		})
	}

	getBundleItems(bundleItems) {
		this.selectedBundleItems = bundleItems.map(obj => {
			return obj._id;
		})
	}


	addProduct() {
		let product = this.modelService.getFormValue(this.form);
		product.authors_are='author';
		if(this.selectedAuthors.length<1){
			if(this.selectedEditors.length>0){
				product.authors_are='editor';
				this.selectedAuthors=this.selectedEditors;
			}
			if(this.selectedComposers.length>0 && this.selectedEditors.length<1){
				product.authors_are='composer';
				this.selectedAuthors=this.selectedComposers;
			}
		}
		product.attributes = this.selectedAttributeList;
		product.category = this.selectedCategories;
		product.author = this.selectedAuthors;
		product.translator = this.selectedTranslators;
		product.editor = this.selectedEditors;
		product.composer = this.selectedComposers;
		product.bundle_items = this.selectedBundleItems;
		product.is_bundle = product.bundle_items && Array.isArray(product.bundle_items) && product.bundle_items.length > 0;
		product.price = product.discount_rate ? (product.previous_price-(product.previous_price*product.discount_rate)/100) : product.previous_price;
		product.previous_price = product.previous_price ? product.previous_price : 0;
		product.price =product.price?product.price :0;
		if (Array.isArray(product.author) && Array.isArray(product.category) && product.author.length > 0 && product.category.length > 0) {
		this.res_pending = true;
		this.productService.add(product).subscribe(result => {
		this.res_pending = false;
		if (result._id) {
			this.saved_id = result._id;
			this.update_res_massege = "Product Save Success!";
			this.optionModal.show();
		} else {
			alert("Product Save Failed!");
			}
		})
		} else {
			alert("You may missed category or author");
		}
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

	searchEditor(text) {
		this.authorService.getSearch(text).subscribe((result) => {
			this.editorList = result.items;
		})
	}

	searchComposer(text) {
		this.authorService.getSearch(text).subscribe((result) => {
			this.composerList = result.items;
		})
	}
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

	saveNewAttribute(item) {
		delete item._id;
		item.is_enabled = true;
		this.attributesService.addAttribute(item).subscribe((result) => {
			if (result._id) {
				this.newAttribute = result;
			}
		})
	}

	ridirectToImageUpPanel() {
		this.router.navigateByUrl('/pages/catalog/product-image/edit/' + this.saved_id);
	}

	redirectToList() {
		this.location.back();
	}

}
