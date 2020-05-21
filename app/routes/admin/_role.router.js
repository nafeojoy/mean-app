import Role from '../../models/role.model';
import User from '../../models/user.model';
export default (app, router, auth) => {

  router.route('/role')
    .get(auth, (req, res) => {
      getRoles(req)
        .then(restRoles => {
          res.json(restRoles);
        })
        .catch(err => {
          res.send(err);
        })
    })

    .post(auth, (req, res) => {
      Role.create({
        name: req.body.name,
        description: req.body.description,
        is_enabled: req.body.is_enabled,
        menu: req.body.menu,
        full_generation: req.body.full_generation,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user._id,
        updated_by: req.user._id
      }, (err, role) => {
        if (err)
          res.send(err);
        res.json(role);
      });
    })


  router.route('/role/:role_id')
    .get((req, res) => {
      Role.findOne({
          '_id': req.params.role_id
        })
        .populate({
          path: 'menu._id',
          select: 'name path '
        })
        .then((role) => {
          let viewRole = {
            _id: role._id,
            created_at: role.created_at,
            full_generation: role.full_generation,
            name: role.name,
            updated_at: role.updated_at,
            menu: role.menu.map(mnu => {
              return {
                _id: mnu._id._id,
                name: mnu._id.name,
                path: mnu._id.path,
                permissions: mnu.permissions
              }
            })
          };
          res.json(viewRole);
        })
    })


    .put(auth, (req, res) => {
      Role.findOne({
        '_id': req.params.role_id
      }, (err, role) => {
        if (err)
          res.send(err);
        if (req.body._id) {
          role.name = req.body.name;
          role.menu = req.body.menu;
          role.full_generation = req.body.full_generation;
          role.description = req.body.description;
          role.is_enabled = req.body.is_enabled;
          role.updated_by = req.user._id;
          role.updated_at = new Date();
        }
        return role.save((err) => {
          if (err)
            res.send(err);
          return res.send(role);
        });
      })
    })

    .delete((req, res) => {
      deleteUserRefOfThisRole(req.params.role_id)
        .then(result => {
          return Role.remove({
            _id: req.params.role_id
          })
        })
        .then(role => {
          return getRoles()
        })
        .then(restRoles => {
          res.json(restRoles);
        })
        .catch(err => {
          res.send(err);
        })
    });

  function getRoles(req) {
    return new Promise((resolve, reject) => {
      let filterParam = {};
      getDeveloper(req).then(roleRes => {
        if (roleRes.status) {
          filterParam = {
            _id: {
              $ne: roleRes.role._id
            }
          }
        }
        Role.find(filterParam)
          .exec((err, roles) => {
            if (err) {
              reject(err);
            } else {
              resolve(roles);
            }
          });
      });
    });
  }

  function getDeveloper(req) {
    return new Promise((resolve, reject) => {
      Role.findOne({
          name: "Development"
        })
        .select({
          name: 1
        })
        .exec()
        .then(role => {
          if (role && role._id) {
            if (role._id == req.user.role._id) {
              resolve({
                status: false
              })
            } else {
              resolve({
                status: true,
                role: role
              })
            }
          } else {
            resolve({
              status: false
            })
          }
        })
        .catch(err => {
          resolve({
            status: false
          })
        })
    })
  }

  function deleteUserRefOfThisRole(roleId) {
    return new Promise((resolve, reject) => {
      User.remove({
        role: roleId
      }, (err) => {
        if (err)
          reject(err);
        else
          resolve({});
      });
    });
  }
}
