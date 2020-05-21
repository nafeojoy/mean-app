import SiteSubscriberSchema from '../../models/site-subscriber.model';


export default (app, router, jwt) => {
  router.route('/site-subscriber')
    .post((req, res) => {

     //   //console.log("DATA")
     //   //console.log(req.body)
        
      SiteSubscriberSchema.create({
        name: req.body.name,
        email: req.body.email,
        phone_number: req.body.phone_number,
        created_date: new Date()
      }, (err, query) => {
        if (err)
          res.json({
            success: false
          });
        else
          res.json({
            success: true
          });
      })
    })
}
