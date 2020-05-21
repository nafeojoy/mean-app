import Callrecord from '../../../models/crm-models/call-record.model';
import Subscriber from '../../../models/subscriber.model';
import Customerquery from '../../../models/customer-query.model';
import { getNextSequence } from '../../public/api.service';


export default (app, router, auth, logger) => {
    router.route('/call-record/:phone_number')
        .get((req, res) => {
            var pageNum = req.query.pageNum ? parseInt(req.query.pageNum) : 1;
            let result = new Object();
            Callrecord.count({ phone_number: req.params.phone_number })
                .exec()
                .then(count => {
                    result.count = count;
                    return Callrecord.aggregate([
                        {
                            $match: {
                                phone_number: req.params.phone_number
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: 'customer_executive',
                                foreignField: "_id",
                                as: "executive"
                            }
                        },
                        { $unwind: "$executive" },
                        {
                            $group: {
                                _id: '$phone_number',
                                name: { $first: "$customer_info.name" },
                                email: { $first: "$customer_info.email" },
                                district: { $first: "$customer_info.district" },
                                thana: { $first: "$customer_info.thana" },
                                address: { $first: "$customer_info.address" },
                                phone_number: { $first: "$phone_number" },
                                contact_info: {
                                    $push: {
                                        called_at: "$called_at",
                                        call_duration: "$call_duration",
                                        query_type: "$query_info.query_type",
                                        comment: "$comment",
                                        customer_executive: { $concat: ['$executive.first_name', ' ', '$executive.last_name'] },
                                    }
                                }
                            }
                        },
                        {
                            $sort: {
                                called_at: -1
                            }
                        }
                    ])
                        .skip((pageNum - 1) * 5)
                        .limit(5)
                })
                .then(record => {
                    result.data = record;
                    return Subscriber.findOne(
                        { phone_number: req.params.phone_number }
                    )
                        .select({ username: 1, phone_number: 1, first_name: 1, email: 1 })
                })
                .then(subscr => {
                    if (subscr && subscr._id) {
                        result.is_subscriber = true;
                        result.subscr_info = subscr;
                    } else {
                        result.is_subscriber = false;
                    }
                    res.json(result)
                })
                .catch(err => {
                    //console.log(err);
                    res.json({ count: 0, data: [] })
                })
        })

    router.route('/call-record')
        .post(auth, (req, res) => {
            Callrecord.create({
                phone_number: req.body.phone_number,
                called_at: req.body.called_at,
                call_duration: req.body.call_duration,
                comment: req.body.comment,
                customer_info: req.body.customer_info,
                query_info: req.body.query_info,
                is_subscriber: req.body.subscriber ? true : false,
                subscriber: req.body.subscriber,
                customer_executive: req.user._id
            }, (err, record) => {
                if (err) {
                    res.json({ success: false });
                }
                res.json({ success: true, data: record });
            });
        });

    router.route('/call-record/customer/book-query')
        .post(auth, (req, res) => {
            Callrecord.create({
                phone_number: req.body.phone_number,
                called_at: req.body.called_at,
                call_duration: req.body.call_duration,
                comment: req.body.message,
                customer_info: req.body.customer_info,
                query_info: req.body.query_info,
                is_subscriber: false,
                customer_executive: req.user._id
            })
                .then(result => {
                    return getNextSequence('customer_query_no')
                })
                .then(seq => {
                    return Customerquery.create({
                        name: req.body.name,
                        query_no: seq,
                        phone_number: req.body.phone_number,
                        message: req.body.message,
                        answered: false,
                        query: {
                            book_name: req.body.book,
                            author: req.body.author
                        },
                        created_from: req.body.from,
                        query_at: new Date()
                    })
                })
                .then(result => {
                    res.json({ success: true });
                })
                .catch(err => {
                    res.json({ success: false, message: err });
                })
        });

}