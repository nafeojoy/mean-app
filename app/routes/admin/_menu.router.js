import Menu from '../../models/menu.model';
import Role from '../../models/role.model';
import config from '../../../config/config.json';
export default (app, router, auth) => {

  router.route('/menu')
    .get(auth, (req, res) => {
      var root = {};
      Menu.findOne({
          parent: {
            $exists: false
          }
        })
        .exec()
        .then(parentMenu => {
          root = parentMenu;
          return Menu.find({
            parent: parentMenu._id
          })
        })
        .then(childs => {
          if (childs.length > 0) {
            var menues = [];
            var newRoot = {
              _id: root._id,
              name: root.name,
              hasChildren: true
            }
            menues.push(newRoot);
            res.json(menues);
          } else {
            var menues = [];
            var newRoot = {
              _id: root._id,
              name: root.name,
              hasChildren: false
            }
            menues.push(newRoot);
            res.json(menues);
          }
        })
        .catch(err => {
          req.log.info(err);
          res.send(err);
        })
    })

    .post(auth, (req, res) => {
      if (req.body.parent._id) {
        Menu.count()
          .exec((err, total) => {
            if (!err) {
              var newMenu = new Menu();
              var nextPosition = total + 1;
              newMenu.path = req.body.path;
              newMenu.parent = req.body.parent._id;
              newMenu.name = req.body.data.menu.title;
              newMenu.permissions = req.body.permissions;
              newMenu.is_enabled = req.body.is_enabled;
              newMenu.position = req.body.position ? req.body.position : nextPosition;
              newMenu.data = req.body.data;
              newMenu.created_at = new Date();
              newMenu.updated_at = new Date();
              newMenu.created_by = req.user._id;
              newMenu.updated_by = req.user._id
              newMenu.save(err => {
                if (!err) {
                  res.json(newMenu);
                }
              })
            }
          })
      }
    });

  router.route('/menu/detail/:id')
    .get((req, res) => {
      Menu.findOne({
          '_id': req.params.id
        })
        .populate({
          path: 'parent'
        })
        .exec((err, menue) => {
          if (err)
            res.send(err);
          else {
            res.json(menue);
          }
        })
    })


  router.route('/menu/:id')
    .get((req, res) => {
      Menu.find({
          'parent': req.params.id
        })
        .select({
          name: 1
        })
        .exec((err, menues) => {
          if (err)
            res.send(err);
          else {
            checkHasChildren(menues).then(newParents => {
              res.json(newParents);
            })
          }
        })
    })

    .put(auth, (req, res) => {
      Menu.findOne({
        '_id': req.params.id
      }, (err, newMenu) => {
        if (err)
          res.send(err);
        if (req.body._id) {
          newMenu.path = req.body.path;;
          newMenu.name = req.body.data.menu.title;
          newMenu.permissions = req.body.permissions;
          newMenu.is_enabled = req.body.is_enabled;
          newMenu.data = req.body.data;
          newMenu.created_at = new Date();
          newMenu.updated_at = new Date();
          newMenu.created_by = req.user._id;
          newMenu.updated_by = req.user._id
        }
        return newMenu.save((err) => {
          if (err)
            res.send(err);

          return res.send(newMenu);
        });
      })
    })

    .delete(auth, (req, res) => {
      Menu.find({
          '_id': req.params.id
        })
        .exec()
        .then(menu => {
          return deleteMenuRecursively(menu)
        })
        .then(status => {
          res.json({
            is_delete: true
          });
        })
        .catch(err => {
          res.json({
            status: false
          });
        })
    });


  router.route('/menu/root/childs')
    .get(auth, (req, res) => {
      let user = req.user;
      if (user.role.name == 'Development') {
        Menu.find()
          .exec()
          .then(menu => {
            checkHasChildren(menu).then(newParents => {
              res.json(newParents);
            })
          })

      } else {
        Role.findOne({
            '_id': user.role._id
          })
          .populate({
            path: 'full_generation'
          })
          .exec()
          .then(role => {
            let ids = role.full_generation;
            checkHasChildren(ids).then(newParents => {
              res.json(newParents);
            })
          })
      }

    });


  function checkHasChildren(list) {
    var newMenus = list.map(listObj => {
      return new Promise((resolve, reject) => {
        Menu.find()
          .where('parent').equals(listObj._id)
          .exec()
          .then((childs, err) => {
            if (!err) {
              if (childs && Array.isArray(childs) && childs.length > 0) {
                var newObj = {
                  name: listObj.name,
                  text: listObj.name,
                  path: listObj.path,
                  parent: listObj.parent,
                  data: listObj.data,
                  permissions: listObj.permissions,
                  _id: listObj._id,
                  left: listObj.left,
                  right: listObj.right,
                  hasChildren: true
                }
                resolve(newObj);
              } else {
                var newObj = {
                  name: listObj.name,
                  text: listObj.name,
                  path: listObj.path,
                  parent: listObj.parent,
                  data: listObj.data,
                  permissions: listObj.permissions,
                  _id: listObj._id,
                  left: listObj.left,
                  right: listObj.right,
                  hasChildren: false
                }
                resolve(newObj);
              }
            } else {
              ////console.log(err);
              reject(err);
            }
          })
      })
    })
    return Promise.all(newMenus);
  }

  function deleteMenuRecursively(menus) {
    var menu_list = menus.map(mnu => {
      return new Promise((resolve, reject) => {
        Role.find()
          .exec()
          .then(roles => {
            return deleteMenuRefFromRole(roles, mnu._id)
          })
          .then(status => {
            return Menu.remove({
              _id: mnu._id
            })
          })
          .then(menu => {
            return Menu.find({
              parent: mnu._id
            })
          })
          .then(childMenus => {
            if (childMenus.length > 0) {
              deleteMenuRecursively(childMenus);
              resolve({
                status: true
              });
            } else {
              resolve({
                status: true
              });
            }
          })
          .catch(err => {
            //console.log(err);
            reject(err);
          })
      })
    })

    return Promise.all(menu_list);
  }


  function deleteMenuRefFromRole(roles, menu_id) {
    var data_roles = roles.map(role => {
      return new Promise((resolve, reject) => {
        Role.update({
            _id: role._id
          }, {
            $pull: {
              'menu': {
                _id: menu_id
              },
              'full_generation': menu_id
            }
          })
          .exec((err, restRole) => {
            if (err) {
              reject(err);
            } else {
              resolve(restRole);
            }
          });
      })
    })
    return Promise.all(data_roles);
  }


}
