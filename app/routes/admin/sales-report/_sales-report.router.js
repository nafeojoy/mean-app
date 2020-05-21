import Order from '../../../models/order.model';
import Product from '../../../models/product.model';


export default (app, router, auth) => {
    router.route('/sales/bkash-to-orderid/:transactionId')
        .get((req, res) => {

            Order.aggregate([{
                    $match: {
                        $or: [
                            { "payment_collection.collection_info.transaction_id": req.params.transactionId },
                            { "payment_information.bank_tran_id": req.params.transactionId }
                        ]

                    }
                },
                {
                    $project: {
                        order_no: 1,
                        'payment_information.bank_tran_id': 1,
                        'payment_collection.collection_info.transaction_id': 1,
                        _id: 0
                    }
                }

            ]).then(transectionDetails => {

                res.json({ data: transectionDetails });

            }).catch(err => {

                res.send(err)

            });
        })

    router.route('/product-analysis/:search_key')
        .get((req, res) => {

            let param = req.params.search_key;

            Product.aggregate([

                {
                    $match: {
                        '$or': [
                            { 'import_id': Number(param) },
                            { 'seo_url': param }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "orders",
                        localField: "_id",
                        foreignField: "products.product_id",
                        as: "order_info"
                    }
                },
                {
                    $lookup: {
                        from: "publishers",
                        localField: "publisher",
                        foreignField: "_id",
                        as: "publisher_info"
                    }
                },
                {
                    $lookup: {
                        from: "authors",
                        localField: "author",
                        foreignField: "_id",
                        as: "author_info"
                    }
                },
                {
                    $lookup: {
                        from: "stocksummaries",
                        localField: "_id",
                        foreignField: "product_id",
                        as: "stocksummarie_info"
                    }
                },
                {
                    $project: {
                        import_id: 1,
                        name : 1,
                        price: 1,
                        lang : 1,
                        accessories : 1,
                        'stocksummarie': "$stocksummarie_info",
                        'publisher_name': '$publisher_info.name',
                        'order_state': '$order_info.current_order_status.status_name',
                        'author_name': '$author_info.name'
                    }
                },
                { $limit : 1}

            ]).then(analysis_data => {

                let preorder = 0;
                let pending = 0;
                let confirmed = 0;
                let dispatched = 0;
                let inshipment = 0;
                let delevered = 0;
                let order_closed = 0;
                let back_order = 0;
                let return_request = 0;
                let cancelled = 0;
                let returned = 0;


                for (var item of analysis_data[0].order_state) {
                    if (item == "PreOrder") preorder++;
                    if (item == "Pending") pending++;
                    if (item == "Confirmed") confirmed++;
                    if (item == "Dispatch") dispatched++;
                    if (item == "Inshipment") inshipment++;
                    if (item == "Delivered") delevered++;
                    if (item == "OrderClosed") order_closed++;
                    if (item == "ReturnRequest") return_request++;
                    if (item == "Cancelled") cancelled++;
                    if (item == "Returned") returned++;
                    if (item == "BackOrder") back_order++;
                }

                let current_demand_sum = Number(preorder) + Number(pending) + Number(confirmed);
                let current_stock_sum = (analysis_data[0].stocksummarie.length > 0) ?
                    Number(analysis_data[0].stocksummarie[0].opening_stock != null ? analysis_data[0].stocksummarie[0].opening_stock : "0") +
                    Number(analysis_data[0].stocksummarie[0].total_purchase != null ? analysis_data[0].stocksummarie[0].total_purchase : "0") -
                    Number(analysis_data[0].stocksummarie[0].total_sales != null ? analysis_data[0].stocksummarie[0].total_sales : "0") +
                    Number(analysis_data[0].stocksummarie[0].total_return != null ? analysis_data[0].stocksummarie[0].total_return : "0") : 0;

                let stock_value_sum = (analysis_data[0].stocksummarie.length > 0) ?
                    Number(analysis_data[0].stocksummarie[0].purchase_rate != null ? analysis_data[0].stocksummarie[0].purchase_rate : "0") * current_stock_sum : "N/A";

                let required_quantity_cal = Math.max(Number(current_demand_sum) - Number(current_stock_sum), 0);

                let purchase_price_info = (analysis_data[0].stocksummarie.length > 0) ? analysis_data[0].stocksummarie[0].purchase_rate : "N/A";

                let previous_demand_sum = dispatched + inshipment + delevered + order_closed + back_order; 

                let total_sales_count_sum = previous_demand_sum + current_demand_sum - returned - return_request - cancelled; 

                let total_sales_amount_sum = total_sales_count_sum * analysis_data[0].price;

                let value_of_C_D_sum = analysis_data[0].price * current_demand_sum;

                let analysis_return = {

                    import_id: analysis_data[0].import_id,
                    //book_name : analysis_data[0].name,
                    
                    book_name: (analysis_data[0].lang[0].content.name != null) ? 
                    analysis_data[0].lang[0].content.name : "Bangla name not found!",
                    //author : analysis_data[0].author_name,
                    
                    author: (analysis_data[0].accessories.authors_bn[0].name  != null) ? 
                    analysis_data[0].accessories.authors_bn[0].name : analysis_data[0].accessories.authors_en[0].name,
                    
                    publisher: (analysis_data[0].accessories.publisher_bn.name != null) ? 
                    analysis_data[0].accessories.publisher_bn.name : analysis_data[0].accessories.publisher_en.name, 
                    //publisher: analysis_data[0].publisher_name,
                    purchase_price: purchase_price_info,
                    sales_price: analysis_data[0].price,
                    PreOrder: preorder,
                    Pending: pending,
                    Confirmed: confirmed,

                    current_demand: current_demand_sum,
                    value_of_C_D : value_of_C_D_sum,
                    current_stock: current_stock_sum,
                    stock_value: stock_value_sum,

                    required_quantity: required_quantity_cal,

                    Dispatch: dispatched,
                    Inshipment: inshipment,
                    Delivered: delevered,
                    OrderClosed: order_closed,
                    ReturnRequest: return_request,
                    Cancelled: cancelled,
                    Returned: returned,
                    BackOrder: back_order,

                    previous_demand : previous_demand_sum,

                    total_sales_count : total_sales_count_sum,
                    total_sales_amount : total_sales_amount_sum,
                }
                res.json({ data: [ analysis_return ] })

            }).catch(error => {

                res.send(error);
            })
        });

    router.route('/product-analysis')
        .get((req, res) => {
            Order.aggregate([

                {
                    $match: {
                        '$or': [
                            { 'current_order_status.status_name': 'PreOrder' },
                            { 'current_order_status.status_name': 'Pending' },
                            { 'current_order_status.status_name': 'Confirmed' },
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "products.product_id",
                        foreignField: "_id",
                        as: "product_info"
                    }
                },
                {
                    $group: {
                        _id: {
                            _id: "$product_info._id",
                            import_id: "$product_info.import_id",
                            seo_url: "$product_info.seo_url",
                            name: "$product_info.name",
                        },
                        orders: {
                            $addToSet: "$order_no"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                { $limit: 30 }

            ]).then(analysis_data => {

                res.json({ analysis_data })

            }).catch(error => {

                res.send(error);

            })
        })

}