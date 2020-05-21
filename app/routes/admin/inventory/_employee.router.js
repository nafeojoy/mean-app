import Employee from '../../../models/inventory-models/employee.model';


export default (app, router, auth, isPermitted) => {
    router.route('/employee')
        .get((req, res) => {
            var pageNum = req.query.pageNum ? parseInt(req.query.pageNum) : 1;
            let result = new Object();
            Employee.count()
                .exec()
                .then(count => {
                    result.count = count;
                    return Employee.find()
                        .sort({ order_no: -1 })
                        .skip((pageNum - 1) * 10)
                        .limit(10)
                })
                .then(order => {
                    result.data = order;
                    res.json(result)
                })
                .catch(err => {
                    //console.log(err);
                    res.json({ count: 0, data: [] })
                })
        })

        .post(auth, (req, res) => {
            Employee.create({
                name: req.body.name,
                employee_id: req.body.employee_id,
                phone: req.body.phone,
                email: req.body.email,
                designation: req.body.designation,
                is_enabled: req.body.is_enabled,
                created_by: req.user._id,
                updated_by: req.user._id
            }, (err, employee) => {
                if (err) {
                    //console.log(err);
                    res.json({ success: false });
                }
                res.json({ success: true, data: employee });
            });
        });

    router.route('/employee/:id')
        .get((req, res) => {
            Employee.findOne({ "_id": req.params.id })
                .exec((err, employee) => {
                    if (err)
                        //console.log(err)
                    res.json(employee);
                })
        })

        .put(auth, (req, res) => {
            Employee.findOne({ "_id": req.params.id })
                .exec((err, employee) => {
                    if (err) {
                        //console.log(err)
                    } else {
                        employee.name = req.body.name;
                        employee.employee_id = req.body.employee_id;
                        employee.phone = req.body.phone;
                        employee.designation = req.body.designation;
                        employee.email = req.body.email;
                        employee.is_enabled = req.body.is_enabled;
                        employee.updated_by = req.user._id;
                        return employee.save(err => {
                            if (err)
                                res.json({ success: false });

                            return res.json({ success: true, data: employee });
                        })
                    }

                })
        })


    router.route('/employee/search/:terms')
        .get((req, res) => {
            let expression = '.*' + req.params.terms + '.*';
            Employee.aggregate(
                [
                    {
                        $match: {
                            "is_enabled": { $eq: true },
                            $or: [
                                { name: req.params.terms },
                                { phone: req.params.terms },
                                { employee_id: req.params.terms },
                                { name: { $regex: expression, $options: 'i' } }
                            ]
                        }
                    },
                    {
                        $project: {
                            name: "$name",
                            authorObj: {
                                name: "$employee_id"
                            }
                        }
                    }
                ]
            )
                .limit(50)
                .exec((err, employee) => {
                    if (err)
                        res.send(err);
                    else
                        res.json({ 'employee': employee });
                })
        })

}