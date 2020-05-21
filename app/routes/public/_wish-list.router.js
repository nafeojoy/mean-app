import Subscriber from '../../models/subscriber.model';
import config from '../../../config/config.json'
import mongoose from 'mongoose';

export default (app, router, auth) => {

  router.route('/wish-list-all/:id')
    .get((req, res) => {
      Subscriber.aggregate([{
            $match: {
              '_id': mongoose.Types.ObjectId(req.params.id)
            }
          },
          {
            $lookup: {
              from: "products",
              localField: "wish_list",
              foreignField: "_id",
              as: "wish_list"
            }
          },
          {
            $project: {
              wish_list: "$wish_list",
            }
          }
        ])
        .exec()
        .then(wish_list => {
          res.json(wish_list);

        })
        .catch(err => {
          res.json(err);
        })

    });
  router.route('/wish-list/:id')
    .get((req, res) => {

      Subscriber.aggregate([{
            $match: {
              '_id': mongoose.Types.ObjectId(req.params.id)
            }
          },
          {
            $project: {
              wish_list: "$wish_list",
            }
          }
        ])
        .exec()
        .then(wish_list => {
          res.json(wish_list);

        })
        .catch(err => {
          res.json(err);
        })

    })

    .put((req, res) => {
      var product_id = req.body.product_id;

      if (req.body.action == 'add') {
        Subscriber.findOne({
            "_id": req.params.id
          })
          .exec((err, subscriber) => {
            let check_exist = contains((subscriber.wish_list), product_id);
            if (!check_exist) {
              subscriber.wish_list.push(product_id);
              return subscriber.save((err) => {
                if (err)
                  res.send(err)
                res.json({
                  status: true,
                  message: "Successfully Added to wishlist"
                });
              })
            } else {
              res.json({
                status: false,
                message: "Already Added"
              });
            }
          })
      } else if (req.body.action == 'delete') {

        Subscriber.findOne({
            "_id": req.params.id
          })
          .exec((err, subscriber) => {
            let check_exist = contains((subscriber.wish_list), product_id);
            if (check_exist) {
              deleteElem((subscriber.wish_list), product_id);
              return subscriber.save((err) => {
                if (err)
                  res.send(err)
                res.json({
                  status: true,
                  message: "Successfully Deleted from wishlist"
                });
              })
            } else {
              res.json({
                status: false,
                message: "Already Deleted"
              });
            }
          })

      }


    });
}


function contains(arr, element) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == element) {
      return true;
    }
  }
  return false;
}

function deleteElem(arr, element) {

  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == element) {
      arr.splice(i, 1);
      return arr;
    }
  }
  return arr;
}
