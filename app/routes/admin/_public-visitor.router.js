import PublicVisit from '../../models/public-visitor.model';
export default (app, router, auth) => {
  router.route('/visitor-report')
    .post((req, res) => {
      let params = new Object();
      let count = 0;
      let total_visited = 0;
      let pageNum = req.body.pageNum ? parseInt(req.body.pageNum) : 1
      if (req.body.from_date && req.body.to_date) {
        var lte_date = req.body.from_date ? new Date(req.body.from_date) : new Date();
        lte_date.setHours(0, 0, 0, 0);
        var gte_date = req.body.to_date ? new Date(req.body.to_date) : new Date();
        gte_date.setHours(23, 59, 59, 999);

        params = {
          'visiting_history.visited_at': {
            $gte: new Date(lte_date),
            $lt: new Date(gte_date)
          }
        }
      }

      let agg_pipes = [{
          $unwind: "$visiting_history"
        },
        {
          $match: params
        },
        {
          $group: {
            _id: {
              _id: "$_id",
              ip: "$visiting_history.visiting_ip"
            },
            visited: {
              $push: "$visiting_history"
            },
            count: {
              $sum: 1
            }
          }
        },
        {
          $group: {
            _id: "$_id._id",
            history: {
              $push: {
                ip: "$_id.ip",
                visted: "$visited",
                ip_num: "$count"
              }
            },
            total_ip_used: {
              $sum: 1
            },
            total_visited: {
              $sum: "$count"
            }
          }
        }
      ]

      PublicVisit.aggregate([{
          $unwind: "$visiting_history"
        }, {
          $match: params
        }])
        .exec()
        .then(result => {
          if (result && Array.isArray(result) && result.length > 0) {
            total_visited = result.length;
            PublicVisit.aggregate(agg_pipes)
              .exec()
              .then(count => {
                count = count.length;
                PublicVisit.aggregate(agg_pipes)
                  .skip(20 * (pageNum - 1))
                  .limit(20)
                  .exec()
                  .then(data => {
                    res.json({
                      success: true,
                      data: data,
                      total_visited: total_visited,
                      count: count
                    });
                  })
                  .catch(err => {
                    res.json({
                      success: false,
                      err: err
                    })
                  })
              })
          } else {
            res.json({
              success: false
            });
          }
        })
    })
}
