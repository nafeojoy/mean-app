import Subscriber from '../../models/subscriber.model';
import Order from '../../models/order.model';

export default (app, router, auth) => {
  router.route('/subscriber')
    .get(auth, (req, res) => {
      let pageNum = req.query.pageNum ? parseInt(req.query.pageNum) : 1;
      let itemPerPage = req.query.itemPerPage ? parseInt(req.query.itemPerPage) : 10;
      let result = {};
      Subscriber.count()
        .exec()
        .then(count => {
          result.count = count;
          return Subscriber.find({})
            .select({
              first_name: 1,
              username: 1,
              email: 1,
              phone_number: 1,
              provider: 1,
              success_order_info: 1
            })
            .sort({
              'success_order_info.total_order': -1
            })
            .skip((pageNum - 1) * itemPerPage)
            .limit(itemPerPage)
        })
        .then(subscribers => {
          result.data = subscribers;
          res.json(result);
        })
    })

    .put((req, res) => {
      Subscriber.find({})
        .exec()
        .then(subscribers => {
          return getOrderInfo(subscribers)
        })
        .then(updates => {
          res.json(updates);
        })
    })


  router.route('/subscriber/download')
    .get(auth, (req, res) => {
      return Subscriber.aggregate([{
        $project: {
          first_name: '$first_name',
          email: '$email',
          phone_number: '$phone_number',
          provider: '$provider',
          total_order: '$success_order_info.total_order',
          order_value: '$success_order_info.order_value',
        }
      },
      {
        $sort: {
          total_order: -1
        }
      }
      ])
        .exec()
        .then(subscribers => {
          res.json(subscribers);
        })
    })

  router.route('/subscriber/search/:terms')
    .get((req, res) => {
      let expression = '.*' + req.params.terms + '.*';
      Subscriber.aggregate([{
        $match: {
          "phone_number": {
            $regex: expression,
            $options: 'i'
          }
        }
      },
      {
        $project: {
          name: {
            $concat: ["$phone_number", "( ", "$first_name", " )"]
          },
          first_name: "$first_name",
          phone_number: "$phone_number",
          email: "$email"
        }
      }
      ])
        .exec()
        .then(subscriber => {
          res.json({
            data: subscriber
          })
        })
    })

  function getOrderInfo(subscribes) {
    let updatedSubscribers = subscribes.map(subscriber => {
      return new Promise((resolve, reject) => {
        Order.aggregate([{
          $match: {
            created_by: subscriber._id,
            'current_order_status.status_name': 'OrderClosed'
          }
        },
        {
          $group: {
            _id: '',
            total_order: {
              $sum: 1
            },
            order_value: {
              $sum: '$payable_amount'
            }
          }
        }
        ])
          .exec()
          .then(result => {
            let obj = {}
            if (result && result.length > 0) {
              obj = {
                _id: subscriber._id,
                success_order_info: {
                  total_order: result[0].total_order,
                  order_value: result[0].order_value,
                }
              }
            } else {
              obj = {
                _id: subscriber._id,
                success_order_info: {
                  total_order: 0,
                  order_value: 0,
                }
              }
            }
            return Subscriber.update({
              _id: obj._id
            }, {
                $set: {
                  success_order_info: obj.success_order_info
                }
              })
          })
          .then(updates => {
            resolve(updates)
          })
          .catch(err => {
            reject(err)
          })
      })
    })
    return Promise.all(updatedSubscribers);
  }
}
