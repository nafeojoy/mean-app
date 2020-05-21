import Permission from '../../models/permission.model';
export default (app, router, auth) => {

  router.route('/permission')

    .post((req, res) => {
      Permission.create({
        resource_name: req.body.resource_name,
        resource_url: req.body.resource_url
      }, (err, property) => {
        if (err)
          res.send(err);
        res.json(property);
      });
    })

    .get((req, res) => {
      Permission.find((err, property) => {
        if (err)
          res.send(err);
        else
          res.json(property);
      });
    })

}
