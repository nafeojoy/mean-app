import ShippingAddress from '../../models/shipping-address.model';
import config from '../../../config/config.json';

export default (app, router, auth) => {

  router.route('/shipping')
    .post((req, res) => {
      ShippingAddress.create({
        is_primary: true,
        contact_name: req.body.contact_name,
        district: req.body.district,
        thana: req.body.thana,
        address: req.body.address,
        phone_number: req.body.phone_number,
        alter_phone: req.body.alter_phone,
        created_by: req.body.created_by
      }, (err, address) => {
        if (err) {
          res.json({
            success: false,
            message: "Address save failed!"
          });
        } else {
          res.json({
            success: true,
            data: address,
            message: "Address save success"
          })
        }
      })
    })

  router.route('/shipping/:id')
    .put((req, res) => {
      ShippingAddress.findOne({
          _id: req.params.id
        })
        .exec()
        .then(address => {
          address.is_primary = true;
          address.contact_name = req.body.contact_name;
          address.district = req.body.district;
          address.thana = req.body.thana;
          address.address = req.body.address;
          address.phone_number = req.body.phone_number;
          address.alter_phone = req.body.alter_phone;
          address.created_by = req.body.created_by;
          address.save(err => {
            if (!err) {
              res.json({
                success: true,
                data: address,
                message: "Address save success"
              })
            } else {
              res.json({
                success: false,
                message: "Address save failed!"
              });
            }
          })
        })
        .catch(err => {
          res.json({
            success: false,
            message: "Address save failed!"
          });
        })
    })

    .get((req, res) => {
      ShippingAddress.findOne({
          created_by: req.params.id,
          is_primary: true
        })
        .exec()
        .then(address => {
          if (address && address._id) {
            res.json({
              exist: true,
              data: address
            });
          } else {
            res.json({
              exist: false
            });
          }
        })
    })


  router.route('/shipping-address/search/:terms')
    .get((req, res) => {
      let expression = '.*' + req.params.terms + '.*';
      ShippingAddress.aggregate([{
            $match: {
              "phone_number": {
                $regex: expression,
                $options: 'i'
              }
            }
          },
          {
            $lookup: {
              from: "subscribers",
              localField: "created_by",
              foreignField: "_id",
              as: "subscriber"
            }
          },
          {
            $project: {
              name: {
                $concat: ["$phone_number", "( ", "$contact_name", " )"]
              },
              phone_number: "$phone_number",
              country: "$country",
              contact_name: "$contact_name",
              district: "$district",
              address: "$address",
              thana: "$thana",
              subscriber: {
                $arrayElemAt: ["$subscriber", 0]
              },
              created_by: "$created_by"
            }
          },
          {
            $group:{
              _id: "$phone_number",
              name: {$first:"$name"},
              phone_number: {$first:"$phone_number"},
              country: {$first:"$country"},
              contact_name: {$first:"$contact_name"},
              district: {$first:"$district"},
              address: {$first:"$address"},
              thana: {$first:"$thana"},
              subscriber: {$first:"$subscriber"},
              created_by: {$first:"$created_by"},
            }
          }
        ])
        .exec()
        .then(address => {
          res.json({
            data: address
          })
        })
    })



}
