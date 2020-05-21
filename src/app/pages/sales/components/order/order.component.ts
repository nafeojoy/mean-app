import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ModalDirective } from 'ng2-bootstrap';
import { OrderService } from './order.service';

import 'style-loader!./order.scss';

@Component({
	selector: 'order',
	templateUrl: './order.html',
})
export class OrderComponent {

	@ViewChild('orderViewModal') orderViewModal: ModalDirective;
	@ViewChild('invoiceModal') invoiceModal: ModalDirective;
	@ViewChild('returnInvoiceModal') returnInvoiceModal: ModalDirective;

	public set_returned: boolean = false;
	public current_date: any;
	public current_user: any = {};
	public orders: any = [];
	public statuses: Array<any> = [];
	public order_statuses: Array<any> = [];
	public apiBaseUrl: any;
	public selectedStatus: string;
	public resMessage: string;
	public selectedOrder: any = {};
	public res_pending: boolean;
	public res_pending1: boolean;
	public res_pending2: boolean;
	public is_success: boolean;
	public comment: string = '';

	public totalItems: number;
	public currentPage: number = 1;
	public maxSize: number = 5;
	public purchase_pending: number = 0;
	public purchase_inprogress: number = 0;

	public IndianBooksCount: number;
	public OutStockCount: number;
	public OutPrintCount: number;
	public EmergencyCount: number;


	order_no: any = '';
	cus_name: any = '';
	cus_mobile: any = '';
	from_date: any = '';
	to_date: any = '';
	carrier: any;
	carriers: Array<any> = [];
	gifts: Array<any> = [];
	inship_filter: any = {};
	age_data: any = {};

	public selectedReturns: Array<any> = [];


	constructor(private orderService: OrderService, private router: Router) {
		this.apiBaseUrl = this.orderService.apiBaseUrl;
	}

	ngOnInit() {

		this.newOrder();
		this.orderService.getCarriersList().subscribe(outpt => {
			this.carriers = outpt.data;
		});
		this.orderService.getGifts().subscribe(outpt => {
			this.gifts = outpt;
		});
		this.current_date = new Date();
		this.current_user = JSON.parse(window.localStorage.getItem('user'));
		//console.log(this.current_user)
	}


	getDelaySinceLastStatusChange(status_update_date) {

		let update_date: any = new Date(status_update_date);
		let date_now: any = new Date();

		let seconds = Math.floor((date_now - (update_date)) / 1000);
		let minutes = Math.floor(seconds / 60);
		let hours = Math.floor(minutes / 60);
		let days = Math.floor(hours / 24);

		hours = hours - (days * 24);
		minutes = minutes - (days * 24 * 60) - (hours * 60);
		seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);
		return `${days} Days ${hours} Hours`
	}

	newOrder() {
		//console.log('newOrder')

		this.selectedStatus = "Pending";
		this.getOrderWithAgeByStatus(this.selectedStatus)
		this.orderService.getUnprocessedOrders(this.currentPage).subscribe((result) => {
			if (result.orders && Array.isArray(result.orders)) {

				this.totalItems = result.count;
				this.orderService.getAllStatuses().subscribe(out => {

					this.order_statuses = out;
					this.orders = result.orders;
					let totalOrder = 0;


					this.statuses = out.map(eStatus => {
						let exStatus = result.summary.find(sm => { return sm._id.name == eStatus.name });
						let sts: any = {};
						if (exStatus) {
							totalOrder += exStatus.count;
							sts.name = exStatus._id.name;
							sts.count = exStatus.count;
							sts.id = exStatus._id.id;
						} else {
							sts.name = eStatus.name;
							sts.count = 0;
							sts.id = eStatus._id;
						}
						return sts;
					})


					this.statuses.push({
						name: 'All',
						count: totalOrder
					})
					this.statuses.push({
						name: 'IndianBooks'
					})
					this.statuses.push({
						name: 'OutStock'
					})
					this.statuses.push({
						name: 'OutPrint'
					})
					this.statuses.push({
						name: 'Emergency'
					})
				})
			}
		})
	}

	filterOrder(inship_filter, pageNum) {
		this.currentPage = pageNum;
		inship_filter.status_name = "Inshipment";
		inship_filter.pageNum = pageNum;
		this.orderService.getFilteredInshipment(inship_filter).subscribe(result => {
			this.orders = result.data;
			this.totalItems = result.count;
		})
	}

	clearFilter() {
		this.inship_filter = {};
		this.getSelectedType({ name: 'Inshipment' });
	}

	typed(type, text) {
		if (type == 'order_no') {
			this.order_no = text;
			if (text.length > 0) {
				$("#cus_name").prop('disabled', true);
				$("#cus_mobile").prop('disabled', true);
				$("#fromDate").prop('disabled', true);
				$("#toDate").prop('disabled', true);
			} else {
				$("#cus_name").prop('disabled', false);
				$("#cus_mobile").prop('disabled', false);
				$("#fromDate").prop('disabled', false);
				$("#toDate").prop('disabled', false);
			}

		} else if (type == 'cus_name') {
			this.cus_name = text;
			if (text.length > 0) {
				$("#order_no").prop('disabled', true);
			} else if (text.length < 1 && this.cus_mobile.length < 1) {
				$("#order_no").prop('disabled', false);
			}
		} else if (type == 'cus_mobile') {
			this.cus_mobile = text;
			if (text.length > 0) {
				$("#order_no").prop('disabled', true);
			} else if (text.length < 1 && this.cus_name.length < 1) {
				$("#order_no").prop('disabled', false);
			}
		} else if (type == 'fromDate') {
			this.from_date = text;
			if (text.length > 0) {
				$("#order_no").prop('disabled', true);
			} else if (text.length < 1 && this.cus_mobile.length < 1) {
				$("#order_no").prop('disabled', false);
			}

		} else if (type == 'toDate') {
			this.to_date = text;
			if (text.length > 0) {
				$("#order_no").prop('disabled', true);
			} else if (text.length < 1 && this.cus_mobile.length < 1) {
				$("#order_no").prop('disabled', false);
			}
		}
		this.orderService
			.searchOrders(this.selectedStatus, this.order_no, this.cus_name, this.cus_mobile, this.from_date, this.to_date, this.currentPage)
			.subscribe(out => {
				this.orders = out.data;
				this.totalItems = out.count;
				if (this.order_no.length == 0 && this.cus_name.length == 0 && this.cus_mobile.length == 0 && this.from_date.length == 0 && this.to_date.length == 0) {
					this.getMoreOrder(this.selectedStatus, this.currentPage)
				}
			})
	}
	setPage(): void {
		if (this.selectedStatus == "Pending") {
			this.newOrder();
		} else {
			this.getMoreOrder(this.selectedStatus, this.currentPage)
		}
	}

	getMoreOrder(status, page_num) {
		if (this.inship_filter && ((this.inship_filter.delay_day && this.inship_filter.delay_day != '') || (this.inship_filter.carrier && this.inship_filter.carrier != ''))) {
			this.filterOrder(this.inship_filter, this.currentPage);
		} else {
			this.orderService
				.searchOrders(this.selectedStatus, this.order_no, this.cus_name, this.cus_mobile, this.from_date, this.to_date, page_num)
				.subscribe(out => {
					this.orders = out.data;
					this.totalItems = out.count;
				})

		}
	}

	getSelectedType(info) {
		this.currentPage = 1;
		this.totalItems = 0;
		this.selectedStatus = info.name;
		this.inship_filter = {};
		this.getOrderWithAgeByStatus(info.name)
		this.orderService.getOrderByStatus(this.selectedStatus, this.currentPage).subscribe(output => {
			this.orders = output.data;
			this.totalItems = output.count;

			if (this.selectedStatus == 'IndianBooks') {
				this.IndianBooksCount = this.totalItems;
			} else if (this.selectedStatus == 'OutStock') {
				this.OutStockCount = this.totalItems;
			} else if (this.selectedStatus == 'OutPrint') {
				this.OutPrintCount = this.totalItems;
			} else if (this.selectedStatus == 'Emergency') {
				this.EmergencyCount = this.totalItems;
			}

		})
	}

	getOrderWithAgeByStatus(status_name) {

		this.orderService.getOrderWithAge(status_name).subscribe(result => {
			if (result && Array.isArray(result)) {

				result.map(obj => {
					this.age_data[obj._id] = obj.count
				})
			}
		})
	}

	getPurchasePendings() {
		this.orderService.getConfirmedwithPurchaseStatus({ is_purchase_order_created: false }).subscribe(result => {
			if (result.success) {
				this.orders = result.data;
			}
		})
	}

	getPurchaseProgress() {
		this.orderService.getConfirmedwithPurchaseStatus({ is_purchase_order_created: true }).subscribe(result => {
			if (result.success) {
				this.orders = result.data;
			}
		})
	}

	rowSelected(info, i) {
		if (info.view.is_unread) {
			this.orderService.updateOrderViewStatus(info._id).subscribe(output => {
				if (output.ok) {
					this.orders[i].view = { is_unread: false };
				}
			})
		}
		if (!info.carrier) {
			info.carrier = {};
		}
		this.orderService.getOrderDetailWithStockInfo(info._id).subscribe(result => {
			this.orderViewModal.show();
			this.selectedOrder = info;
			
			// console.log(this.selectedOrder)
			// console.log('------------')
			// console.log(result)


			this.selectedOrder.products = result.products;
			this.selectedOrder.wallet_amount = result.wallet_amount || 0;
			this.orderViewModal.show();
		})
	}

	goToUpdate() {
		this.orderViewModal.hide();
		this.router.navigateByUrl('edit' + this.selectedOrder._id);
	}

	confirmWithComment() {

		// console.log(new Date(this.selectedOrder.emergency_date))

		// console.log('----------');
		// console.log(this.selectedOrder.emergency_delivery);



		let cencelObj = this.order_statuses.find(st => { return st.name == "Confirmed" });

		let detectContactName = "Sir/Madam";
		if (this.selectedOrder.delivery_address.contact_name.charCodeAt(0) < 2000) {
			var tempName = this.selectedOrder.delivery_address.contact_name;
			var temp = tempName.split(" ");
			detectContactName = temp[temp.length - 1];
		}


		let data = {
			order_id: this.selectedOrder._id,
			comment: this.comment,
			gift_id: this.selectedOrder.gift_id == '' ? undefined : this.selectedOrder.gift_id,
			carrier: this.selectedOrder.carrier._id,
			has_comment: true,
			selectedStatus: {
				_id: cencelObj._id,
				name: cencelObj.name
			},
			send_message: true,
			is_emergency: this.selectedOrder.emergency_delivery,
			emergency_date: this.selectedOrder.emergency_date,
			phone_number: this.selectedOrder.delivery_address.phone_number,
			text_message: `Dear ${detectContactName}, Your order# ${this.selectedOrder.order_no} is received. We started processing your order. Incase of book unavailability or any issue arises, we will contact you soon.`
		}
		this.res_pending1 = true;
		this.comment = this.comment.trim();
		this.is_success = false;
		this.resMessage = '';
		if (this.comment && this.comment != '' && data.carrier) {
			this.orderService.confirmOrder(data).subscribe(output => {
				this.res_pending1 = false;
				if (output.success) {
					this.newOrder();
					this.res_pending1 = false;
					this.is_success = true;
					this.comment = '';
					this.resMessage = "Order updated successfully!";
					setTimeout(() => {
						this.orderViewModal.hide();
						this.resMessage = '';
						this.is_success = false;
					}, 1000)
				} else {
					this.resMessage = "Order updated failed!";
					setTimeout(() => {
						this.resMessage = '';
						this.is_success = false;
					}, 3000)
				}
			})
		} else {
			this.res_pending1 = false;
			this.resMessage = "Courier and Comment is mandatory.";
			setTimeout(() => {
				this.resMessage = '';
			}, 4000)
		}
	}

	commentOnly() {
		this.is_success = false;
		this.resMessage = '';
		this.res_pending = true;
		this.comment = this.comment.trim();
		if (this.comment && this.comment != '') {
			this.orderService.commentOnly({ id: this.selectedOrder._id, comment: this.comment }).subscribe(output => {
				this.res_pending = false;
				if (output.success) {
					this.newOrder();
					this.res_pending1 = false;
					this.is_success = true;
					this.comment = '';
					this.resMessage = "Order updated successfully!";
					setTimeout(() => {
						this.orderViewModal.hide();
						this.resMessage = '';
						this.is_success = false;
					}, 1000)
				} else {
					this.resMessage = "Order updated failed!";
					setTimeout(() => {
						this.resMessage = '';
						this.is_success = false;
					}, 3000)
				}
			})
		} else {
			this.resMessage = "Comment box can't be empty!";
			this.res_pending = false;
			setTimeout(() => {
				this.resMessage = '';
			}, 4000)
		}
	}

	returnWithComment() {
		this.is_success = false;
		let statusObj = this.order_statuses.find(st => { return st.name == "ReturnRequest" });
		let data = {
			order_id: this.selectedOrder._id,
			comment: this.comment,
			has_comment: true,
			selectedStatus: {
				_id: statusObj._id,
				name: statusObj.name
			}
		}
		this.res_pending2 = true;
		this.comment = this.comment.trim();
		this.is_success = false;
		this.resMessage = '';
		if (this.comment && this.comment != '') {
			this.orderService.requestToReturn(data).subscribe(output => {
				this.res_pending2 = false;
				if (output.success) {
					this.newOrder();
					this.res_pending2 = false;
					this.is_success = true;
					this.comment = '';
					this.resMessage = "Order updated successfully!";
					setTimeout(() => {
						this.orderViewModal.hide();
						this.resMessage = '';
						this.is_success = false;
					}, 100)
				} else {
					this.resMessage = "Order return failed!";
					setTimeout(() => {
						this.resMessage = '';
						this.is_success = false;
					}, 3000)
				}
			})
		} else {
			this.res_pending2 = false;
			this.resMessage = "Comment box can't be empty!";
			setTimeout(() => {
				this.resMessage = '';
			}, 4000)
		}
	}

	partiallyReturn() {
		this.router.navigateByUrl('/pages/miscellaneous/partially-return/' + this.selectedOrder._id);
	}

	cancelWithComment() {


		let detectContactName = "Sir/Madam";
		if (this.selectedOrder.delivery_address.contact_name.charCodeAt(0) < 2000) {
			var tempName = this.selectedOrder.delivery_address.contact_name;
			var temp = tempName.split(" ");
			detectContactName = temp[temp.length - 1];
		}


		let cencelObj = this.order_statuses.find(st => { return st.name == "Cancelled" });
		let data = {
			order_id: this.selectedOrder._id,
			comment: this.comment,
			has_comment: true,
			selectedStatus: {
				_id: cencelObj._id,
				name: cencelObj.name
			},
			send_message: true,
			phone_number: this.selectedOrder.delivery_address.phone_number,
			text_message: `Dear ${detectContactName}. Your order ID ${this.selectedOrder.order_no} is cancelled. We hope, soon we will get the opportunity to provide you with our proper service. See you soon. Thank you.`
		}
		this.res_pending2 = true;
		this.comment = this.comment.trim();
		this.is_success = false;
		this.resMessage = '';

		if (this.comment && this.comment != '') {
			this.orderService.cancelledOrder(data).subscribe(output => {
				this.res_pending2 = false;
				if (output.success) {
					this.newOrder();
					this.res_pending2 = false;
					this.is_success = true;
					this.comment = '';
					this.resMessage = "Order updated successfully!";
					setTimeout(() => {
						this.orderViewModal.hide();
						this.resMessage = '';
						this.is_success = false;
					}, 100)
				} else {
					this.resMessage = "Order updated failed!";
					setTimeout(() => {
						this.resMessage = '';
						this.is_success = false;
					}, 3000)
				}
			})
		} else {
			this.res_pending2 = false;
			this.resMessage = "Comment box can't be empty!";
			setTimeout(() => {
				this.resMessage = '';
			}, 4000)
		}
	}

	closeWithComment() {
		if (this.selectedOrder.payment_collection && this.selectedOrder.payment_collection.is_full_collected) {
			let closeObj = this.order_statuses.find(st => { return st.name == "OrderClosed" });
			let data = {
				order_id: this.selectedOrder._id,
				comment: this.comment,
				has_comment: true,
				selectedStatus: {
					_id: closeObj._id,
					name: closeObj.name
				},
			}

			this.res_pending2 = true;
			this.is_success = false;
			this.resMessage = '';

			if (this.comment && this.comment != '') {
				this.orderService.closeOrder(data).subscribe(output => {
					this.res_pending2 = false;
					if (output.success) {
						this.newOrder();
						this.res_pending2 = false;
						this.is_success = true;
						this.comment = '';
						this.resMessage = "Order updated successfully!";
						setTimeout(() => {
							this.orderViewModal.hide();
							this.resMessage = '';
							this.is_success = false;
						}, 1000)
					} else {
						this.resMessage = "Order updated failed!";
						setTimeout(() => {
							this.resMessage = '';
							this.is_success = false;
						}, 3000)
					}
				})
			} else {
				this.res_pending2 = false;
				this.resMessage = "Comment box can't be empty!";
				setTimeout(() => {
					this.resMessage = '';
				}, 4000)
			}
		} else {
			this.router.navigateByUrl('/pages/sales/payment-collect');
		}
	}

	cancel() {
		this.orderViewModal.hide();
	}

	reconfirmReturnOrder(order) {
		let sure = confirm("Are you sure to confirm again?");
		if (sure) {
			order.performed_order_statuses = order.performed_order_statuses.filter(sts => {
				return sts.status_name == "Pending" || sts.status_name == "Confirmed" || sts.status_name == "Dispatch"
			});
			let current_status = order.performed_order_statuses.find(sts => {
				return sts.status_name == "Dispatch"
			});
			order.current_order_status = {
				status_id: current_status.status_id,
				status_name: current_status.status_name,
				updated_at: new Date(),
				updated_by: JSON.parse(localStorage.getItem('user')).id
			}
			this.orderService.reconfirm(order).subscribe(result => {
				if (result.success) {
					this.newOrder();
				}
			})
		}
	}

	acceptReturnOrder(order) {

		if (JSON.parse(localStorage.getItem('user')).role == 'Account Receivable' || JSON.parse(localStorage.getItem('user')).role == 'Admin' || JSON.parse(localStorage.getItem('user')).role == 'Development') {
			this.is_success = false;
			let statusObj = this.order_statuses.find(st => { return st.name == "Returned" });
			let cost: any = prompt("Enter total return cost", '0');
			let data = {
				order_id: order._id,
				comment: this.comment,
				has_comment: true,
				returned_cost: cost,
				selectedStatus: {
					_id: statusObj._id,
					name: statusObj.name
				},
				products: order.products.map(prd => {
					return {
						product_id: prd.product_id._id,
						product_name: prd.name,
						return_order_id: order._id,
						return_qty: prd.quantity,
						created_at: new Date(),
						created_by: JSON.parse(localStorage.getItem('user')).id
					}
				})
			}
			this.res_pending2 = true;
			this.comment = this.comment.trim();
			this.is_success = false;
			this.resMessage = '';
			if (!isNaN(cost)) {
				this.orderService.orderReturned(data).subscribe(output => {
					this.res_pending2 = false;
					if (output.success) {
						this.newOrder();
						this.res_pending2 = false;
						this.is_success = true;
						this.comment = '';
						this.resMessage = "Order updated successfully!";
						setTimeout(() => {
							this.orderViewModal.hide();
							this.resMessage = '';
							this.is_success = false;
						}, 100)
					} else {
						this.resMessage = "Order return failed!";
						setTimeout(() => {
							this.resMessage = '';
							this.is_success = false;
						}, 3000)
					}
				})
			}

		} else {
			alert("You cannot Accept this Return Request!")
		}

	}

	viewInvoice(data) {

		data.products = data.products.map(prdct => {
			prdct.publisher = prdct.publisher.name ? prdct.publisher.name : prdct.publisher;
			return prdct;
		})
		this.selectedOrder = data;
		this.invoiceModal.show();
	}

	viewReturnInvoice(data) {
		//this.selectedOrder = data;

		if (this.selectedReturns.length > 2) {
			alert("Cannot select more than 2")
		} else {
			this.returnInvoiceModal.show();

		}

	}
	returnClose() {
		this.returnInvoiceModal.hide();

		if (confirm('PRINT DONE?')) {
			this.orderService.updateReturnPrint(this.selectedReturns).subscribe(resutt => {
				this.getSelectedType({ name: this.selectedStatus });
			})
		}
	}

	printStatusUpdate(order) {
		let orders = [order];

		if (confirm('Is it printed?')) {
			this.orderService.updateReturnPrint(orders).subscribe(res => {
				this.getSelectedType({
					name: this.selectedStatus
				})
			})
		}
		//console.log(order)
	}

	selectReturnInvoices(checked, order) {
		if (checked) {
			this.selectedReturns.push(order);
		} else {
			this.selectedReturns.splice(this.selectedReturns.indexOf(order), 1)
		}
		//this.returnInvoiceModal.show();
		//console.log(this.selectedReturns)

	}

	updateFlags(flag_value, flag_type) {


		let data = {};
		if (flag_type == 'carrier') {
			data = {
				order_id: this.selectedOrder._id,
				carrier: flag_value,
				flag_type: flag_type
			}
		} else if (flag_type == 'indian_book_available') {
			data = {
				order_id: this.selectedOrder._id,
				indian_book_available: flag_value,
				flag_type: flag_type
			}
		} else if (flag_type == 'corporate_sale') {
			data = {
				order_id: this.selectedOrder._id,
				corporate_sale: flag_value,
				flag_type: flag_type
			}
		}


		this.orderService.updateFlags(data).subscribe(output => {
			if (output.success) {
				alert("Order updated successfully!");
				this.getSelectedType({ name: this.selectedStatus });
			} else {
				alert("Order update failed!");
				this.getSelectedType({ name: this.selectedStatus });
			}
		})

	}


	printEnvelop(type): void {
		this.current_date = new Date();

		if(type == 'return'){
			setTimeout(() => {
				let printContents, popupWin;
				printContents = document.getElementById('print-section-return').innerHTML;
				popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
				popupWin.document.open();
				popupWin.document.write(`
				<html>
				<head>
					<style>
						@media print
							{ 
								table{ width:100%;}
								.copy-for{
									text-align: center !important;
									font-size: 8px !important;
								}
								.vl {
									border-left: 1px solid;
									height: 20px;
								}
	
								.t111{
									width: 12% !important;
								}
	
								.logo-image img{
									width: 75% !important;
									height: auto !important ;
									border-radius: 0% !important;
								}
	
								.t113{
									line-height: 3px;
								}
	
								.t113 p{
									font-size: 11px;
								}
	
	
								.t114{
									text-align: right;
									line-height: 3px;
								}
	
								.t114 p{
									font-size: 11px;
								}
	
								.order-details{
									width: 38%
								}
	
								.qr-code{
									width: 20%
								}
	
								.delivery-details{
									width: 42%
								}
	
								.main-info{
									background: #eceeefc9;
								}
	
								.t2h{
									width: 29%;
									font-size: 11px;
								}
	
								.t2c{
									width: 1%;
									font-size: 11px;
								}
	
								.t2i{
									width: 70%;
									font-size: 11px;
								}
	
	
								.product-table{
									width: 100%;
								}
	
								.item-head{
									background: #eceeefc9;
								}
	
								.item-head tr th{
									padding: 4px;
									font-size: 11px;
								}
	
								.ih0{
									width: 1%;
								}
	
								.ih1{
									width: 50%;
								}
								
								.ihp{
									width: 29%;
								}
	
								.ih2{
									width: 5%;
								}
	
								.ih3{
									width: 5%;
								}
	
								.ih4{
									width: 5%;
								}
	
								.item-body tr td{
									font-size: 11px;
									border-bottom: 1px dotted #808075;
								}
	
								.id0{
									text-align: left;
								}
	
								.id0{
									text-align: left;
								}
	
								.id1{
									text-align: left;
								}
	
								.idp{
									text-align: left;
								}
	
								.id2{
									text-align: center;
								}
	
								.id3{
									text-align: center;
								}
	
								.id4{
									text-align: center;
								}
	
								.summary-table{
									width: 100%;
								}
	
								.si0{
									width: 35%;
								}
	
								.si1{
									width: 35%;
								}
	
								.si2{
									width: 30%;
								}
	
								.summary-data{
									width: 100%;
								}
	
								.summary-data tbody tr td{
									font-size: 11px;
									border-bottom: 1px dotted #808075;
								}
	
								.sd0{
									width: 69%;
								}
	
								.sd1{
									width: 1%;
								}
	
								.sd2{
									width: 30%;
									text-align: right;
								}
								.decliration01{
									line-height: 8px;
									margin-bottom: -60px;
									font-size:11px;
								}
	
								.decliration02{
									line-height: 8px;
									margin-bottom: -60px;
									font-size:11px;
								}
					</style>
				</head>
			<body onload="window.print();window.close()">${printContents}</body>
			</html>`
				);
				popupWin.document.close();
			}, 500)

		} else if(type== 'usual'){
			setTimeout(() => {
				let printContents, popupWin;
				printContents = document.getElementById('print-section').innerHTML;
				popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
				popupWin.document.open();
				popupWin.document.write(`
				<html>
				<head>
					<style>
						@media print
							{ 
								table{ width:100%;}
								.copy-for{
									text-align: center !important;
									font-size: 8px !important;
								}
								.vl {
									border-left: 1px solid;
									height: 20px;
								}
	
								.t111{
									width: 12% !important;
								}
	
								.logo-image img{
									width: 75% !important;
									height: auto !important ;
									border-radius: 0% !important;
								}
	
								.t113{
									line-height: 3px;
								}
	
								.t113 p{
									font-size: 11px;
								}
	
	
								.t114{
									text-align: right;
									line-height: 3px;
								}
	
								.t114 p{
									font-size: 11px;
								}
	
								.order-details{
									width: 38%
								}
	
								.qr-code{
									width: 20%
								}
	
								.delivery-details{
									width: 42%
								}
	
								.main-info{
									background: #eceeefc9;
								}
	
								.t2h{
									width: 29%;
									font-size: 11px;
								}
	
								.t2c{
									width: 1%;
									font-size: 11px;
								}
	
								.t2i{
									width: 70%;
									font-size: 11px;
								}
	
	
								.product-table{
									width: 100%;
								}
	
								.item-head{
									background: #eceeefc9;
								}
	
								.item-head tr th{
									padding: 4px;
									font-size: 11px;
								}
	
								.ih0{
									width: 1%;
								}
	
								.ih1{
									width: 50%;
								}
								
								.ihp{
									width: 29%;
								}
	
								.ih2{
									width: 5%;
								}
	
								.ih3{
									width: 5%;
								}
	
								.ih4{
									width: 5%;
								}
	
								.item-body tr td{
									font-size: 11px;
									border-bottom: 1px dotted #808075;
								}
	
								.id0{
									text-align: left;
								}
	
								.id0{
									text-align: left;
								}
	
								.id1{
									text-align: left;
								}
	
								.idp{
									text-align: left;
								}
	
								.id2{
									text-align: center;
								}
	
								.id3{
									text-align: center;
								}
	
								.id4{
									text-align: center;
								}
	
								.summary-table{
									width: 100%;
								}
	
								.si0{
									width: 35%;
								}
	
								.si1{
									width: 35%;
								}
	
								.si2{
									width: 30%;
								}
	
								.summary-data{
									width: 100%;
								}
	
								.summary-data tbody tr td{
									font-size: 11px;
									border-bottom: 1px dotted #808075;
								}
	
								.sd0{
									width: 69%;
								}
	
								.sd1{
									width: 1%;
								}
	
								.sd2{
									width: 30%;
									text-align: right;
								}
								.decliration01{
									line-height: 8px;
									margin-bottom: -60px;
									font-size:11px;
								}
	
								.decliration02{
									line-height: 8px;
									margin-bottom: -60px;
									font-size:11px;
								}
					</style>
				</head>
			<body onload="window.print();window.close()">${printContents}</body>
			</html>`
				);
				popupWin.document.close();
			}, 500)

		}

		

	}
}
