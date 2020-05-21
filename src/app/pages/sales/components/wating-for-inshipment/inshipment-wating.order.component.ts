import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';


import { ModalDirective } from 'ng2-bootstrap';
import { InshipmentWaitingOrderService } from './inshipment-wating.order.service';

import 'style-loader!../../datepick.css';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'inshipment-wating.order',
	templateUrl: './inshipment-wating.order.html',
	styleUrls: ['./inshipment-wating.order.scss'],
	providers: [DatePipe]
})
export class InshipmentWaitingOrderComponent {

	@ViewChild('orderViewModal') orderViewModal: ModalDirective;
	public orders: any = [];
	public nextStatus: any = {};
	public apiBaseUrl: any;
	public resMessage: string;
	public selectedOrder: any = {};
	public res_pending: boolean;
	public carrier: any = {};
	public carriers: Array<any> = [];
	public courier_sts: Array<any> = [];
	public isSubmitted: boolean;
	public current_date = new Date();
	public current_user: any = {};
	public selected_courier: string;
	public totalItems: number;
	public currentPage: number = 1;
	public maxSize: number = 5;
	searchObj: any = {};
	criteria: any = {}
	dtRange: any = {};
	public start_date: Date;
	public end_date: Date;
	public waiting: boolean;

	selected_payment_method = 'COD';
	private payment_methods = [
		{
			_id: 'COD',
			name: 'Cash On Delivery'
		},
		{
			_id: 'MPAY',
			name: 'mPayment'
		},
		{
			_id: 'CCRD',
			name: 'Credit Card'
		},
		{
			_id: 'POS',
			name: 'POS'
		},
	]

	constructor(private inshipmentWaitingorderService: InshipmentWaitingOrderService, private router: Router
		, private datePipe: DatePipe
	) {
		this.apiBaseUrl = this.inshipmentWaitingorderService.apiBaseUrl;
	}

	ngOnInit() {
		this.current_user = JSON.parse(window.localStorage.getItem('user'))
		this.newOrder({ pageNo: this.currentPage });
		this.inshipmentWaitingorderService.getCarriers().subscribe(outpt => {
			this.carriers = outpt.data;
		});
		this.inshipmentWaitingorderService.getStatus("Inshipment").subscribe(status => {
			if (status._id) {
				this.nextStatus = status;
			} else {
				alert("Something went wrong!");
				this.router.navigateByUrl("/home");
			}
		})
	}

	getOrdersByCourier(id) {
		this.currentPage = 1;
		this.criteria.pageNo = this.currentPage;
		this.criteria.courier = id;
		this.newOrder(this.criteria);
	}

	newOrder(criteria) {
		this.waiting = true;
		this.inshipmentWaitingorderService.get(criteria).subscribe(output => {
			this.waiting = false;
			if (output.success) {
				this.totalItems = output.count;
				this.orders = output.data;
				this.courier_sts = output.courier;
			}
		})
	}

	search() {
		this.currentPage = 1;
		this.criteria = { pageNo: this.currentPage };
		if (this.searchObj.order_no) {
			this.criteria.order_no = this.searchObj.order_no;
		}
		if (this.start_date && this.end_date) {
			this.criteria.start_date = this.start_date;
			this.criteria.end_date = this.end_date;
		}
		this.newOrder(this.criteria);
	}

	reset() {
		this.searchObj = {};
		this.dtRange = {};
		this.start_date = undefined;
		this.end_date = undefined;
		this.currentPage = 1;
		this.criteria = { pageNo: this.currentPage };
		this.newOrder(this.criteria);
	}

	dateChanged() {
		this.start_date = new Date(this.dtRange[0]);
		this.end_date = new Date(this.dtRange[1]);
	}

	setPage(pageNum): void {
		this.currentPage = pageNum;
		this.criteria.pageNo = this.currentPage;
		this.newOrder(this.criteria);
	}

	showOrder(info, i) {
		this.carrier = {};

		let weight_sum = 0;


		info.products.forEach(element => {
			if (element.product_id.purchase_history) weight_sum = weight_sum + (element.product_id.purchase_history.weight * element.quantity);
			else {
				weight_sum = 0;
				return;
			}
		});
		info.weight_sum = weight_sum;


		this.selectedOrder = info;
		if (info.carrier) {
			this.carrier.carrier_id = info.carrier._id
		}
		this.orderViewModal.show();
	}

	cancel() {
		this.orderViewModal.hide();
	}


	save() {

		this.isSubmitted = true;
		this.res_pending = true;
		if (this.carrier.carrier_id && this.carrier.parcel_wight && this.carrier.parcel_wight > 0) {

			this.isSubmitted = false;

			let detectContactName = "Sir/Madam";
			let isPaid = '(Unpaid)';
			let carrierName = this.carriers.find(crr => { return this.carrier.carrier_id == crr._id })['name'];

			if (this.selectedOrder.delivery_address.contact_name.charCodeAt(0) < 2000) {
				var tempName = this.selectedOrder.delivery_address.contact_name;
				var temp = tempName.split(" ");
				detectContactName = temp[temp.length - 1];
			}
			if (this.selectedOrder.payment_collection.total_paid) {
				isPaid = '';
			}



			let data = {};
			if (this.selectedOrder.current_order_status.status_name == "Dispatch" && carrierName == "E-Courier") {
				let tomorrow = new Date()
				tomorrow.setDate(tomorrow.getDate() + 1)
				let requestedDate = JSON.stringify(this.datePipe.transform(tomorrow, 'yyyy-MM-dd'));

				data = {
					order_id: this.selectedOrder._id,
					carrier: this.carrier.carrier_id,
					carrier_name: carrierName,
					parcel_wight: this.carrier.parcel_wight,
					received: this.selectedOrder.payment_collection.total_paid,
					carrier_charge: this.selectedOrder.payment_collection.carrier_cost,
					transaction_charge: this.selectedOrder.payment_collection.transaction_cost,
					phone_number: this.selectedOrder.delivery_address.phone_number,
					selectedStatus: {
						_id: this.nextStatus._id,
						name: this.nextStatus.name,
					},
					send_message: true,
					text_message: `Dear ${detectContactName}, Your order ID ${this.selectedOrder.order_no} valued TK ${this.selectedOrder.payable_amount} ${isPaid} is on the way to your location by ${carrierName}. If not delivered by 5 days, please call us: 09611-262020`,
					recipient_name: this.selectedOrder.delivery_address.contact_name,
					recipient_city: this.selectedOrder.delivery_address.district,
					recipient_area: this.selectedOrder.delivery_address.thana,
					recipient_address: this.selectedOrder.delivery_address.address,
					parcel_weight: this.selectedOrder.parcel_wight,
					product_price: this.selectedOrder.payable_amount,
					payment_method: this.selected_payment_method,
					requested_delivery_time: requestedDate,
					delivery_hour: "any",
					product_id: this.selectedOrder.order_no,
					pick_address: this.selectedOrder.delivery_address.address,
					comments: this.selectedOrder.delivery_address.address,
					number_of_item: this.selectedOrder.total_book,
					actual_product_price: this.selectedOrder.total_price
				}
			} else {
				data = {
					order_id: this.selectedOrder._id,
					carrier: this.carrier.carrier_id,
					carrier_name: carrierName,
					parcel_wight: this.carrier.parcel_wight,
					received: this.selectedOrder.payment_collection.total_paid,
					carrier_charge: this.selectedOrder.payment_collection.carrier_cost,
					transaction_charge: this.selectedOrder.payment_collection.transaction_cost,
					phone_number: this.selectedOrder.delivery_address.phone_number,
					selectedStatus: {
						_id: this.nextStatus._id,
						name: this.nextStatus.name,
					},
					send_message: true,
					text_message: `Dear ${detectContactName}, Your order ID ${this.selectedOrder.order_no} valued TK ${this.selectedOrder.payable_amount} ${isPaid} is on the way to your location by ${carrierName}. If not delivered by 5 days, please call us: 09611-262020`,
				}
			}
			this.inshipmentWaitingorderService.inshipment(data).subscribe((res) => {
				this.res_pending = false;
				if (res.success) {
					this.resMessage = "Order shipping Success!";
					setTimeout(() => {
						this.resMessage = "";
						this.newOrder(this.criteria);
						this.orderViewModal.hide();
					}, 2000);
				}
			})
		} else {
			this.res_pending = false;
		}
	}

	printEnvelop(info): void {
		console.log(info)
		this.selectedOrder = info;
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
						text-align: left;
						width: 50%;
					}
					
					.ihp{
						text-align: left;
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
		}, 1000)
	}

}
