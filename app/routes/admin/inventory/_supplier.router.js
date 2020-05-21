import Supplier from '../../../models/inventory-models/supplier.model';
import SupplierArea from '../../../models/inventory-models/supplier-area.model';


export default (app, router, auth, isPermitted) => {
    router.route('/supplier')
        .get((req, res) => {
            let pageNo = req.query.pageNo ? parseInt(req.query.pageNo) : 1;
            let cond = new Object();
            if (req.query.area) {
                cond['area'] = req.query.area
            }
            if (req.query.phone) {
                let expression = '.*' + req.query.phone + '.*';
                cond['phone'] = {
                    $regex: expression,
                    $options: 'i'
                }
            }
            if (req.query.name) {
                let expression = '.*' + req.query.name + '.*';
                cond['name'] = {
                    $regex: expression,
                    $options: 'i'
                }
            }
            let result = new Object();
            Supplier.count(cond)
                .exec()
                .then(count => {
                    result.count = count;
                    return Supplier.find(cond)
                        .populate({ path: 'area' })
                        .skip(10 * (pageNo - 1))
                        .limit(10)
                })
                .then(supplier => {
                    result.data = supplier;
                    result.success = true;
                    res.json(result);
                })
                .catch(err => {
                    result.success = false;
                    res.json(result);
                })
        })

        .post(auth, (req, res) => {
            Supplier.create({
                name: req.body.name,
                address: req.body.address,
                area: req.body.area,
                cell: req.body.cell,
                fax: req.body.fax,
                email: req.body.email,
                website: req.body.website,
                contact_persion: req.body.contact_persion,
                account_code: req.body.account_code,
                is_enabled: req.body.is_enabled,
                created_by: req.user._id,
                updated_by: req.user._id
            }, (err, supplier) => {
                if (err) {
                    res.json({ success: false, err: err, message: "Internal Server Error!" });
                } else {
                    res.json({ success: true, data: supplier });
                }
            });
        });

    router.route('/supplier/area/list')
        .get((req, res) => {
            SupplierArea.find({})
                .exec()
                .then(area => {
                    res.json(area);
                })
                .catch(err => {
                    let arr = [];
                    res.json(arr);
                })
        })

    router.route('/supplier/:id')
        .get((req, res) => {
            Supplier.findOne({ _id: req.params.id })
                .exec()
                .then(supplier => {
                    if (supplier && supplier._id) {
                        res.json({ success: true, data: supplier });
                    } else {
                        res.json({ success: false, err: "Invalid parameter" });
                    }
                })
                .catch(err => {
                    res.json({ success: false, err: err });
                })
        })

        .put(auth, (req, res) => {
            Supplier.findOne({ "_id": req.params.id })
                .exec((err, supplier) => {
                    if (err) {
                        //console.log(err)
                    } else {
                        supplier.name = req.body.name;
                        supplier.address = req.body.address;
                        supplier.cell = req.body.cell;
                        supplier.fax = req.body.fax;
                        supplier.email = req.body.email;
                        supplier.website = req.body.website;
                        supplier.contact_persion = req.body.contact_persion;
                        supplier.account_code = req.body.account_code;
                        supplier.is_enabled = req.body.is_enabled;
                        supplier.updated_by = req.user._id;
                        return supplier.save(err => {
                            if (err)
                                res.json({ success: false });

                            return res.json({ success: true, data: supplier });
                        })
                    }

                })
        })


    router.route('/supplier/search/:terms')
        .get((req, res) => {
            let expression = '.*' + req.params.terms + '.*';
            Supplier.aggregate(
                [
                    {
                        $match: {
                            "is_enabled": { $eq: true },
                            $or: [
                                { name: req.params.terms },
                                { name: { $regex: expression, $options: 'i' } }
                            ]
                        }
                    },
                    {
                        $project: {
                            name: "$name",
                            authorObj: {
                                name: "$address"
                            }
                        }
                    }
                ]
            )
                .limit(50)
                .exec((err, supplier) => {
                    if (err)
                        res.send(err);
                    else
                        res.json({ 'supplier': supplier });
                })
        })

}
