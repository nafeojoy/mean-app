import Dashboard from '../../models/dashboard.model';
import VisitorBrowserCounter from '../../models/visitors-browser-counter.model';
import PublicVisit from '../../models/public-visitor.model';


import Order from '../../models/order.model';
import Subscriber from '../../models/subscriber.model';
import OrderHistory from '../../models/order-history.model';

import Purchase from '../../models/inventory-models/purchase.model';
import StockSummary from '../../models/inventory-models/stock-summary.model';
import PurchaseOrder from '../../models/inventory-models/purchase-order.model';

import {
  getNextSequence,
  getCurrentSeq
} from './sequence.service';

import {
  getDateOfSevenDayAgo,
  getDateOfThirtyDayAgo,
  getDateCriteria,
  getDatesOfRange
} from './admin-api.service';

const DASHBOARD_SEQ = 'dashboard_update_seq';

export default (app, router, auth, log4js, dateRangeCond) => {
  router.route('/dashboard-refresh/rDewVdscxEq')
    .get((req, res) => {
      updateDashBoard();
      res.status(204).send();
    })

  router.route('/dashboard/today-order-summary')
    .get((req, res) => {
      var lte_date = new Date();
      lte_date.setHours(0, 0, 0, 0);
      var gte_date = new Date();
      gte_date.setHours(23, 59, 59, 999);

      getCustomerOrderSummary({
        to_date: new Date(gte_date),
        from_date: lte_date
      })
        .then(result => {
          res.json(result);
        })
    })

  router.route('/dashboard/visiting-info')
    .get(dateRangeCond('visited_at'), (req, res) => {
      let result = new Object();
      let crt_obj = getDateCriteria('order_at', req.query.from_date, req.query.to_date);
      getVisitorDataInSpecificDateRange(req.current_cond)
        .then(current_data => {
          result.current_visit_data = current_data;
          return getVisitorDataInSpecificDateRange(req.prior_cond)
        })
        .then(proir_data => {
          result.proir_visit_data = proir_data;
          return getOrderStatistics(crt_obj.current_cond);
        })
        .then(curr_order_statistics => {
          result.curr_order_statistics = curr_order_statistics;
          return getOrderStatistics(crt_obj.prior_cond);
        })
        .then(prior_order_statistics => {
          result.prior_order_statistics = prior_order_statistics;
          res.json(result);
        })
        .catch(err => {
          res.send(err);
        })
    })

  function getOrderStatistics(query_cond) {
    // query_cond['current_order_status.status_name'] = { $ne: 'BackOrder' }
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $match: query_cond
        },
        {
          $group: {
            _id: '$current_order_status.status_name',
            total_book: { $sum: '$total_book' },
            total_order_value: { $sum: "$payable_amount" },
            count: { $sum: 1 }
          }
        }
      ])
        .exec()
        .then(orders => {
          resolve(orders)
        })
        .catch(err => {
          reject(err);
        })
    })
  }

  function getVisitorDataInSpecificDateRange(date_range_cond) {
    return new Promise((resolve, reject) => {
      let resolve_data = new Object();
      PublicVisit.count(date_range_cond)
        .exec()
        .then(visited => {
          resolve_data.total_visitors = visited;
          return PublicVisit.aggregate([
            {
              $match: date_range_cond
            },
            {
              $group: {
                _id: '$fingerprint',
                count: { $sum: 1 }
              }
            }
          ])
        })
        .then(unq_visited => {
          resolve_data.unq_visited = unq_visited.length;
          resolve(resolve_data)
        })
        .catch(err => {
          reject(err);
        })
    })
  }


  router.route('/dashboard/quick-overview')
    .get(dateRangeCond('order_at'), (req, res) => {
      let result = new Object();
      let crt_obj = getDateCriteria('purchase_date', req.query.from_date, req.query.to_date);
      getSalesQuickView(req.current_cond)
        .then(current_sales_data => {
          result.current_sales_data = current_sales_data[0] ? current_sales_data[0] : { "total_sales": 0, "paid_amount": 0, "carrier_cost": 0, "due_amount": 0, "transaction_cost": 0, "customer_order": 0, "total_book": 0 };
          return getSalesQuickView(req.prior_cond)
        })
        .then(proir_data => {
          result.proir_sales_data = proir_data[0] ? proir_data[0] : { "total_sales": 0, "paid_amount": 0, "carrier_cost": 0, "due_amount": 0, "transaction_cost": 0, "customer_order": 0, "total_book": 0 };
          return getPurchaseQuickView(crt_obj.current_cond);
        })
        .then(curr_purchase_statistics => {
          result.curr_purchase_statistics = curr_purchase_statistics[0] ? curr_purchase_statistics[0] : { "_id": "", "total_purchase_cost": 0, "total_book": 0 };
          return getPurchaseQuickView(crt_obj.prior_cond);
        })
        .then(prior_purchase_statistics => {
          result.prior_purchase_statistics = prior_purchase_statistics[0] ? prior_purchase_statistics[0] : { "_id": "", "total_purchase_cost": 0, "total_book": 0 };
          return getCurrentStockValue()
        })
        .then(current_stock => {
          result.current_stock = current_stock[0];
          res.json(result);
        })
        .catch(err => {
          res.send(err);
        })
    })

  router.route('/dashboard/daily-sales-purchase')
    .get(dateRangeCond('order_at'), (req, res) => {
      let result = new Object();
      let crt_obj = getDateCriteria('purchase_date', req.query.from_date, req.query.to_date);
      getDailySales(req.current_cond)
        .then(daily_sales => {
          result.daily_sales = daily_sales
          return getDailyPurchase(crt_obj.current_cond);
        })
        .then(daily_purchase => {
          result.daily_purchase = daily_purchase;
          let all_days = getDatesOfRange(req.current_cond.order_at['$gte'], req.current_cond.order_at['$lte']);
          result.all_days = all_days.map(day => {
            let dt = new Date(day);
            return `${dt.getFullYear()}-${(dt.getMonth() + 1)}-${dt.getDate()}`
          })
          res.json(result);
        })
        .catch(err => {
          res.send(err);
        })
    })


  router.route('/dashboard/order-processing-and-new-customer')
    .get(dateRangeCond('order_at'), (req, res) => {
      let crt_obj = getDateCriteria('created_at', req.query.from_date, req.query.to_date);
      let result = new Object();
      getOrderProcessingTime(req.current_cond)
        .then(processing_obj => {
          result.order_process_statistics = processing_obj;
          return getNewCustomerCount(crt_obj);
        })
        .then(new_customer => {
          result.customer_statistics = new_customer;
          res.json(result);
        })
    })

  function getNewCustomerCount(cond_obj) {
    return new Promise((resolve, reject) => {
      Subscriber.count(cond_obj)
        .exec()
        .then(count => {
          resolve(count)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  function getOrderProcessingTime(query_cond) {
    query_cond['current_order_status.status_name'] = 'OrderClosed'
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $match: query_cond
        },
        {
          $project: {
            consumed: {
              $subtract: ["$current_order_status.updated_at", "$order_at"]
            }
          }
        },
        {
          $group: {
            _id: '',
            minumum: { $min: '$consumed' },
            maximum: { $max: '$consumed' },
            average: { $avg: '$consumed' }
          }
        }
      ])
        .exec()
        .then(values => {
          let result = values[0];
          let processing_obj = {
            minimum_val: result ? (result.minumum / 3600000).toFixed(2) : 0,
            maximum_val: result ? (result.maximum / 3600000).toFixed(2) : 0,
            average_val: result ? (result.average / 3600000).toFixed(2) : 0
          }
          resolve(processing_obj)
        })
        .catch(err => {
          reject(err);
        })
    })
  }


  function getDailyPurchase(query_cond) {
    return new Promise((resolve, reject) => {
      Purchase.aggregate([
        {
          $match: query_cond
        },
        {
          $project: {
            year: { $year: "$purchase_date" },
            month: { $month: "$purchase_date" },
            day: { $dayOfMonth: "$purchase_date" },
            purchase_cost: "$purchase_cost"
          }
        },
        {
          $group: {
            _id: {
              year: "$year",
              month: "$month",
              day: "$day"
            },
            purchase_cost: { $sum: "$purchase_cost" }
          }
        }
      ])
        .exec()
        .then(purchase => {
          resolve(purchase)
        })
        .catch(err => {
          reject(err);
        })
    })
  }


  function getDailySales(query_cond) {
    query_cond['current_order_status.status_name'] = { $in: ["OrderClosed", "Delivered", "Inshipment", "Dispatch", "ReturnRequest", "Confirmed"] }
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $match: query_cond
        },
        {
          $group: {
            _id: '$order_string_date',
            total_sales: { $sum: "$payable_amount" }
          }
        }
      ])
        .exec()
        .then(orders => {
          resolve(orders)
        })
        .catch(err => {
          reject(err);
        })
    })
  }

  function getCurrentStockValue() {
    return new Promise((resolve, reject) => {
      StockSummary.aggregate([
        {
          $project: {
            purchase_rate: {
              '$cond': {
                if: { '$gt': ['$purchase_rate', 0] }, then: '$purchase_rate', else: 0
              }
            },
            opening_stock: {
              '$cond': {
                if: { '$gt': ['$opening_stock', 0] }, then: '$opening_stock', else: 0
              }
            },
            total_purchase: {
              '$cond': {
                if: { '$gt': ['$total_purchase', 0] }, then: '$total_purchase', else: 0
              }
            },
            total_sales: {
              '$cond': {
                if: { '$gt': ['$total_sales', 0] }, then: '$total_sales', else: 0
              }
            },
            total_cancel: {
              '$cond': {
                if: { '$gt': ['$total_cancel', 0] }, then: '$total_cancel', else: 0
              }
            },
            total_return: {
              '$cond': {
                if: { '$gt': ['$total_return', 0] }, then: '$total_return', else: 0
              }
            }
          }
        },
        {
          $project: {
            purchase_rate: '$purchase_rate',
            stock_qty: { $subtract: [{ $sum: ['$opening_stock', '$total_purchase', '$total_cancel', '$total_return'] }, '$total_sales'] },
          }
        },
        {
          $match: { stock_qty: { $gt: 0 } }
        },
        {
          $group: {
            _id: '',
            net_price: { $sum: { $multiply: ["$stock_qty", "$purchase_rate"] } }
          }
        }
      ])
        .exec()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        })
    })
  }


  function getPurchaseQuickView(query_cond) {
    return new Promise((resolve, reject) => {
      Purchase.aggregate([
        {
          $match: query_cond
        },
        {
          $unwind: '$products'
        },
        {
          $group: {
            _id: "$_id",
            sub_purchase_cost: { $first: "$purchase_cost" },
            sub_total_book: { $sum: "$products.quantity" }
          }
        },
        {
          $group: {
            _id: '',
            total_purchase_cost: { $sum: "$sub_purchase_cost" },
            total_book: { $sum: "$sub_total_book" }
          }
        }
      ])
        .exec()
        .then(orders => {
          resolve(orders)
        })
        .catch(err => {
          reject(err);
        })
    })
  }

  function getSalesQuickView(query_cond) {
    query_cond['current_order_status.status_name'] = { $in: ["OrderClosed", "Delivered", "Inshipment", "Dispatch", "ReturnRequest", "Confirmed"] }
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $match: query_cond
        },
        {
          $group: {
            _id: '',
            total_sales: { $sum: "$payable_amount" },
            paid_amount: { $sum: '$payment_collection.total_paid' },
            carrier_cost: { $sum: '$payment_collection.carrier_cost' },
            due_amount: { $sum: { $subtract: ['$payable_amount', '$payment_collection.total_paid'] } },
            transaction_cost: { $sum: '$payment_collection.transaction_cost' },
            customer_order: { $sum: 1 },
            total_book: { $sum: "$total_book" }
          }
        }
      ])
        .exec()
        .then(orders => {
          resolve(orders)
        })
        .catch(err => {
          reject(err);
        })
    })
  }


  router.route('/dashboard/order-process-flow')
    .get((req, res) => {
      var lte_date = getDateOfThirtyDayAgo();
      var gte_date = new Date();
      gte_date.setHours(23, 59, 59, 999);
      let duration = {
        to_date: new Date(gte_date),
        from_date: lte_date
      }
      let status = ["Pending", "OrderClosed"];
      let res_result = [];
      getOrderFlowAverageTime(duration, status)
        .then(pend_conf => {
          //   res_result.push(pend_conf[0]);
          //   status = ["Confirmed", "Inshipment"];
          //   return getOrderFlowAverageTime(duration, status)
          // })
          // .then(conf_inship => {
          //   res_result.push(conf_inship[0]);
          //   status = ["Inshipment", "Delivered"];
          //   return getOrderFlowAverageTime(duration, status)
          // })
          // .then(inship_delv => {
          //   res_result.push(inship_delv[0]);
          //   status = ["Delivered", "OrderClosed"];
          //   return getOrderFlowAverageTime(duration, status)
          // })
          // .then(delv_close => {
          //   res_result.push(delv_close[0]);
          res.json(pend_conf);
        })
        .catch(err => {
          res.send(err);
        })
    })

  router.route('/dashboard')
    .post(auth, (req, res) => {
      let criteria = req.body;
      let cond = new Object();
      criteria.from_date = criteria.from_date ? criteria.from_date : getDateOfSevenDayAgo();
      var lte_date = new Date(criteria.from_date);
      lte_date.setHours(0, 0, 0, 0);
      var gte_date = criteria.to_date ? new Date(criteria.to_date) : new Date();
      gte_date.setHours(23, 59, 59, 999);

      cond['updated_at'] = {
        $lte: new Date(gte_date),
        $gte: new Date(lte_date)
      }
      Dashboard.aggregate([{
        $match: cond
      }])
        .exec()
        .then(dashboard => {
          res.json(dashboard);
        })
    })

  function getOrderFlowAverageTime(duration, steps) {
    return new Promise((resolve, reject) => {
      let cond = new Object();
      cond['created_at'] = {
        $lt: new Date(duration.to_date),
        $gte: new Date(duration.from_date)
      }
      cond['order_status.status_name'] = {
        $in: steps
      }
      OrderHistory.aggregate([{
        $match: cond
      },
      {
        $group: {
          _id: "$order_no",
          count: {
            $sum: 1
          },
          state: {
            $push: {
              status_name: "$order_status.status_name",
              updated_at: "$order_status.updated_at"
            }
          }
        }
      },
      {
        $match: {
          count: 2
        }
      },
      {
        $project: {
          date1: {
            $arrayElemAt: ["$state.updated_at", 0]
          },
          date2: {
            $arrayElemAt: ["$state.updated_at", 1]
          },
        }
      },
      {
        $group: {
          _id: '',
          count: {
            $sum: 1
          },
          avg_time: {
            $avg: {
              $subtract: ["$date2", "$date1"]
            }
          }
        }
      },
      {
        $project: {
          type: {
            $concat: [steps[0], ' to ', steps[1]]
          },
          count: "$count",
          avg_time: {
            $divide: ["$avg_time", 3600000]
          }
        }
      }
      ])
        .exec()
        .then(ordrs => {
          resolve(ordrs);
        })
        .catch(err => {
          reject(err)
        })
    })
  }
  // ======================Update dashboard Data Manually======================
  // router.route('/dashboard-temp')
  //     .post((req, res) => {
  //         let dataArray = req.body;
  //         saveArray(dataArray)
  //             .then(outpt => {
  //                 res.json(outpt);
  //             })
  //             .catch(err => {
  //                 res.send(err);
  //             })
  //     })

  // function saveArray(data) {
  //     let dta = data.map((dt, i) => {
  //         return new Promise((resolve, reject) => {
  //             let sq = (i + 1);
  //             Dashboard.findOne({ update_sq: sq })
  //                 .exec()
  //                 .then(dash => {
  //                     dash.sales_summary = {
  //                         order: dt.customer_orders.total_order,
  //                         price: dt.customer_orders.order_price,
  //                         book: dt.customer_orders.order_book,
  //                         delivery: dt.customer_orders.delivery_charge,
  //                         discount: dt.customer_orders.discount,
  //                         wrapping: dt.customer_orders.wrapping_charge,
  //                         carrier: dt.customer_orders.carrier_cost,
  //                         net: dt.customer_orders.net
  //                     }
  //                     dash.save(err => {
  //                         if (err) {
  //                             reject(err);
  //                         } else {
  //                             resolve(dash);
  //                         }
  //                     })
  //                 })
  //         })
  //     })
  //     return Promise.all(dta);
  // }
  // ================================================

  // var j = schedule.scheduleJob({ hour: 10, minute: 20 }, function () {
  //     updateDashBoard();
  // })

  function updateDashBoard() {
    getDashboardInformation().then(info => {
      if (info.success) {
        Dashboard.create({
          update_sq: info.nextSeq,
          updated_at: info.updated_at,
          order_summary: info.order_summary,
          sales_summary: info.sales_summary,
          inventory_summary: info.inventory_summary
        }, (err, dashboard) => {
          let file_name = 'logs/dashboard-success-info.log';
          log4js.configure({
            appenders: {
              everything: {
                type: 'dateFile',
                filename: file_name,
                pattern: '.yyyy-MM-dd-hh',
                compress: false
              }
            },
            categories: {
              default: {
                appenders: ['everything'],
                level: 'debug'
              }
            }
          });
          let logger = log4js.getLogger();
          logger.info("Dashboard data updated");
        })
      } else {
        let file_name = 'logs/dashboard-failed-info.log';
        log4js.configure({
          appenders: {
            everything: {
              type: 'dateFile',
              filename: file_name,
              pattern: '.yyyy-MM-dd-hh',
              compress: false
            }
          },
          categories: {
            default: {
              appenders: ['everything'],
              level: 'debug'
            }
          }
        });
        let logger = log4js.getLogger();
        logger.info("Dashboard data update failed");
      }
    })
  }

  function getDashboardInformation() {
    return new Promise((resolve, reject) => {
      let duration = new Object();
      let inventory_summary = new Object();
      let order_summary = new Object();
      let sales_summary = new Object();
      let nextSeq;

      getCurrentSeq(DASHBOARD_SEQ)
        .then(seq => {
          return Dashboard.findOne()
            .where("update_sq").equals(seq)
            .select({
              updated_at: 1
            })
        })
        .then(update_info => {
          duration = {
            from_date: update_info.updated_at,
            to_date: new Date()
          };
          return getNextSequence(DASHBOARD_SEQ)
        })
        .then(seq => {
          nextSeq = seq;
          return getPurchaseInfo(duration)
        })
        .then(purchase => {
          let info = {
            purchase: 0,
            purchase_book: 0,
            purchase_price: 0
          }
          purchase.map(pur => {
            info.purchase += pur.purchase;
            info.purchase_book += pur.purchase_book;
            info.purchase_price += pur.purchase_price;
          })
          inventory_summary = info;
          return getPurchaseOrderInfo(duration)
        })
        .then(pOrder => {
          let info = {
            order: 0,
            order_book: 0
          }
          pOrder.map(pur => {
            info.order += pur.order;
            info.order_book += pur.order_book
          })
          inventory_summary.p_order = info.order;
          inventory_summary.p_order_book = info.order_book;

          return getCustomerOrderInfo(duration)
        })
        .then(cOrder => {
          let info = {
            c_order: 0,
            c_order_book: 0,
            c_order_price: 0
          }
          cOrder.map(ord => {
            info.c_order += ord.c_order;
            info.c_order_book += ord.c_order_book;
            info.c_order_price += ord.c_order_price
          })
          inventory_summary.c_order = info.c_order;
          inventory_summary.c_order_book = info.c_order_book;
          inventory_summary.c_order_price = info.c_order_price;
          return getCustomerOrderSummary(duration)
        })
        .then(summary => {
          let order_sum = {
            Pending: 0,
            Confirmed: 0,
            Inshipment: 0,
            Delivered: 0,
            ReturnRequest: 0,
            OrderClosed: 0,
            Cancelled: 0,
            total_order: 0,
            total_book: 0
          };
          if (Array.isArray(summary) && summary.length > 0) {
            summary.map(sum => {
              sum.order.map(ord => {
                order_sum[ord.status] += ord.total
              })
              order_sum.total_order += sum.count;
              order_sum.total_book += sum.total_book;
            })
          }
          order_summary = order_sum;
          return getSalesSummary(duration)
        })
        .then(sales => {
          let sales_sum = {
            carrier: 0,
            delivery: 0,
            discount: 0,
            order: 0,
            price: 0,
            book: 0,
            wrapping: 0,
            net: 0
          };
          sales.map(sell => {
            sales_sum.carrier += sell.carrier_cost;
            sales_sum.delivery += sell.delivery_charge;
            sales_sum.discount += sell.discount;
            sales_sum.order += sell.total_order;
            sales_sum.price += sell.total_price;
            sales_sum.book += sell.total_book;
            sales_sum.wrapping += sell.wrapping_charge;
            sales_sum.net += (sell.total_price + sell.wrapping_charge + sell.delivery_charge - sell.discount - sell.carrier_cost);
          })
          resolve({
            success: true,
            updated_at: new Date(),
            nextSeq: nextSeq,
            order_summary: order_summary,
            inventory_summary: inventory_summary,
            sales_summary: sales_sum
          })
        })
        .catch(err => {
          reject({
            success: false
          })
        })
    })
  }

  function getPurchaseInfo(duration) {
    return new Promise((resolve, reject) => {
      let cond = new Object();
      cond['created_at'] = {
        $lte: duration.to_date,
        $gt: duration.from_date
      }
      Purchase.aggregate([{
        $match: cond
      },
      {
        $project: {
          year: {
            $year: "$created_at"
          },
          month: {
            $month: "$created_at"
          },
          day: {
            $dayOfMonth: "$created_at"
          },
          total_book: "$total_book",
          purchase_cost: "$purchase_cost"
        }
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            day: "$day"
          },
          purchase: {
            $sum: 1
          },
          purchase_book: {
            $sum: "$total_book"
          },
          purchase_price: {
            $sum: "$purchase_cost"
          }
        }
      }
      ])
        .exec()
        .then(purchase => {
          resolve(purchase);
        })
    })
  }

  function getPurchaseOrderInfo(duration) {
    return new Promise((resolve, reject) => {
      let cond = new Object();
      cond['created_at'] = {
        $lte: duration.to_date,
        $gt: duration.from_date
      }
      PurchaseOrder.aggregate([{
        $match: cond
      },
      {
        $project: {
          year: {
            $year: "$created_at"
          },
          month: {
            $month: "$created_at"
          },
          day: {
            $dayOfMonth: "$created_at"
          },
          total_book: "$total_book"
        }
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            day: "$day"
          },
          order: {
            $sum: 1
          },
          order_book: {
            $sum: "$total_book"
          }
        }
      }
      ])
        .exec()
        .then(pOrder => {
          resolve(pOrder);
        })
    })
  }

  function getCustomerOrderInfo(duration) {
    return new Promise((resolve, reject) => {
      let cond = new Object();
      cond['performed_order_statuses.status_name'] = "Confirmed";
      cond['order_at'] = {
        $lte: duration.to_date,
        $gt: duration.from_date
      }
      Order.aggregate([{
        $match: cond
      },
      {
        $project: {
          year: {
            $year: "$order_at"
          },
          month: {
            $month: "$order_at"
          },
          day: {
            $dayOfMonth: "$order_at"
          },
          total_book: "$total_book",
          total_price: "$total_price"
        }
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            day: "$day"
          },
          c_order: {
            $sum: 1
          },
          c_order_book: {
            $sum: "$total_book"
          },
          c_order_price: {
            $sum: "$total_price"
          }
        }
      }
      ])
        .exec()
        .then(pOrder => {
          resolve(pOrder);
        })
    })
  }

  function getCustomerOrderSummary(duration) {
    return new Promise((resolve, reject) => {
      let cond = new Object();
      cond['order_at'] = {
        $lte: duration.to_date,
        $gt: duration.from_date
      }

      Order.aggregate([{
        $match: cond
      },
      {
        $project: {
          year: {
            $year: "$order_at"
          },
          month: {
            $month: "$order_at"
          },
          day: {
            $dayOfMonth: "$order_at"
          },
          total_book: "$total_book",
          total_price: '$total_price',
          current_order_status: "$current_order_status"
        }
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            day: "$day",
            current_order_status: "$current_order_status.status_name"
          },
          total_book: {
            $sum: "$total_book"
          },
          total_price: {
            $sum: "$total_price"
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day"
          },
          order: {
            $push: {
              status: "$_id.current_order_status",
              total: "$count"
            }
          },
          total_book: {
            $sum: "$total_book"
          },
          total_price: {
            $sum: "$total_price"
          },
          count: {
            $sum: "$count"
          }
        }
      }
      ])
        .exec()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        })
    })
  }

  function getSalesSummary(duration) {
    return new Promise((resolve, reject) => {
      let cond = new Object();

      cond['$and'] = [{
        "performed_order_statuses.status_name": "Confirmed"
      },
      {
        "performed_order_statuses.status_name": {
          $ne: "Cancelled"
        }
      }
      ];
      cond['order_at'] = {
        $lte: duration.to_date,
        $gt: duration.from_date
      }

      Order.aggregate([{
        $match: cond
      },
      {
        $project: {
          year: {
            $year: "$order_at"
          },
          month: {
            $month: "$order_at"
          },
          day: {
            $dayOfMonth: "$order_at"
          },
          wrapping_charge: "$wrapping_charge",
          delivery_charge: "$delivery_charge",
          discount: "$discount",
          carrier_cost: "$carrier_cost",
          total_price: "$total_price",
          total_book: "$total_book"
        }
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            day: "$day"
          },
          total_price: {
            $sum: "$total_price"
          },
          carrier_cost: {
            $sum: "$carrier_cost"
          },
          delivery_charge: {
            $sum: "$delivery_charge"
          },
          discount: {
            $sum: "$discount"
          },
          wrapping_charge: {
            $sum: "$wrapping_charge"
          },
          total_order: {
            $sum: 1
          },
          total_book: {
            $sum: "$total_book"
          }
        }
      }
      ])
        .exec()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          //console.log(err);
          reject(err);
        })
    })
  }

}
