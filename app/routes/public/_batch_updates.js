// router.route("/batch-update/category-product-disable")
  //   .get((req, res) => {

  //     const XLSX = require('xlsx');
  //     const workbook = XLSX.readFile('Deletion List.xlsb');
  //     const mylist = workbook.SheetNames;
  //     var myJson = (XLSX.utils.sheet_to_json(workbook.Sheets[mylist[0]]));

  //     //console.log(myJson);
  //     myJson.forEach(element => {

  //       Category.find({
  //         _id: element._id
  //       })
  //       .exec()
  //       .then(info => {
  //         info.forEach(element => {
  //           //console.log("Cat")
  //           element.is_enabled = false;
  //           element.save();
  //         });
  //       });

  //       Product.find({
  //           category: element._id
  //         })
  //         .exec()
  //         .then(info => {
  //           //console.log("Prod")

  //           info.forEach(element => {
  //             element.is_enabled = false;
  //             element.save();
  //           });
  //         });

  //     });

  //     res.json("Success");

  //   });

  // router.route("/batch-update/cat-pub-con")
  //   .get((req, res) => {

  //     Product.find({
  //         publisher: ObjectId("5a825b792142349467918ed9")
  //       })
  //       .exec()
  //       .then(info => {
  //         info.forEach(element => {
  //           element.category.push(ObjectId("5bcc46b4631eaa2a781e172e"));
  //           element.save();
  //         });
  //         res.json("Success");

  //       });

  //   });



  // var Excel = require('exceljs');
  // var workbook = new Excel.Workbook();
  
  // workbook.xlsx.readFile('old.xlsx')
  //     .then(function() {
  //         var worksheet = workbook.getWorksheet(1);
  //         var row = worksheet.getRow(5);
  //         row.getCell(1).value = 5; // A5's value set to 5
  //         row.commit();
  //         return workbook.xlsx.writeFile('new.xlsx');
  //     })

  // router.route("/batch-update/soundex-update")
  //   .get((req, res) => {

  //     for (let i = 300000; i < 350000; i++) {
  //       Product.findOne({
  //           import_id: i
  //         }, {
  //           soundex_code: 1
  //         })
  //         .exec()
  //         .then(res => {
  //           ////console.log(res.soundex_code);
  //           if (res.soundex_code) {
  //             let soundex = res.soundex_code;

  //             var indexes_for_a = [];
  //             var oldCodes_for_a = [];
  //             var newCodes_for_a = [];

  //             var indexes_for_o = [];
  //             var oldCodes_for_o = [];
  //             var newCodes_for_o = [];

  //             var indexes_for_i = [];
  //             var oldCodes_for_i = [];
  //             var newCodes_for_i = [];

  //             var indexes_for_e = [];
  //             var oldCodes_for_e = [];
  //             var newCodes_for_e = [];

  //             for (var i = 0; i < soundex.length; i++) {
  //               if (soundex[i] === "A") {
  //                 indexes_for_a.push(i);
  //               }
  //               if (soundex[i] === "O") {
  //                 indexes_for_o.push(i);
  //               }
  //               if (soundex[i] === "I") {
  //                 indexes_for_i.push(i);
  //               }
  //               if (soundex[i] === "E") {
  //                 indexes_for_e.push(i);
  //               }
  //             }

  //             indexes_for_a.forEach(function (element, i) {
  //               oldCodes_for_a.push(soundex.substring(element, element + 4));
  //               if (!soundex.match(oldCodes_for_a[i].replace("A", "O"))) {
  //                 newCodes_for_a.push(oldCodes_for_a[i].replace("A", "O"));
  //                 soundex += ", " + newCodes_for_a[i];
  //               }

  //             });

  //             indexes_for_o.forEach(function (element, i) {
  //               oldCodes_for_o.push(soundex.substring(element, element + 4));

  //               if (!soundex.match(oldCodes_for_o[i].replace("O", "A"))) {
  //                 newCodes_for_o.push(oldCodes_for_o[i].replace("O", "A"));
  //                 soundex += ", " + newCodes_for_o[i];
  //               }
  //             });

  //             indexes_for_i.forEach(function (element, i) {
  //               oldCodes_for_i.push(soundex.substring(element, element + 4));

  //               if (!soundex.match(oldCodes_for_i[i].replace("I", "E"))) {
  //                 newCodes_for_i.push(oldCodes_for_i[i].replace("I", "E"));
  //                 soundex += ", " + newCodes_for_i[i];
  //               }
  //             });

  //             indexes_for_e.forEach(function (element, i) {
  //               oldCodes_for_e.push(soundex.substring(element, element + 4));

  //               if (!soundex.match(oldCodes_for_e[i].replace("E", "I"))) {
  //                 newCodes_for_e.push(oldCodes_for_e[i].replace("E", "I"));
  //                 soundex += ", " + newCodes_for_e[i];
  //               }
  //             });

  //             res.soundex_code = soundex;
  //             res.save();
  //           }

  //         });

  //     }
  //     res.json("Loop Done");

  //   });

  // router.route("/batch-update/parcentage-change").get((req, res) => {
  //   Category.findOne({
  //       seo_url: "muktodesh-prokason"
  //     })
  //     .select({
  //       children: 1,
  //       _id: 1
  //     })
  //     .exec()
  //     .then(data => {

  //       let chid_cat = data.children;
  //       chid_cat.push(data._id);
  //       ////console.log(chid_cat[0])
  //       chid_cat.forEach(function (element, i) {
  //         Product.find({
  //             category: element
  //           })
  //           .exec()
  //           .then(res => {
  //             res.forEach(element => {
  //               if (element) {
  //                 let newPrice = Math.round((element.previous_price / 100) * 80);
  //                 ////console.log(element.previous_price);
  //                 element.price = newPrice;
  //                 element.save();
  //               }
  //             });
  //           });
  //       });
  //       res.json("SUCC")
  //     });
  // });

  // router.route("/batch-update/partial-order")
  //   .get((req, res) => {

  //     Orders.find({
  //         is_partially_processed: true,
  //         is_guest_order: false
  //       })
  //       .select({
  //         _id: 1,
  //         partially_processed_siblings: 1,
  //         created_by:1
  //       })
  //       .exec()
  //       .then(info => {
  //         info.forEach(element => {
  //           element.partially_processed_siblings.forEach(child => {
  //            // //console.log("asd")

  //             Orders.update({
  //               "_id": child
  //             }, {
  //               $set: {
  //                 "created_by": element.created_by,
  //                 "is_guest_order": false
  //               }
  //             })
  //             .exec()
  //           });
  //         });
  //         res.json("SuccessSSS");
  //       });
  //   });


  // router.route("/book-description/update")
  //   .put((req, res) => {
  //     var import_ids = req.body.import_ids;
  //     var descriptions = req.body.descriptions;

  //     //console.log(import_ids);
  //     for (let i = 0; i <= 5; i++) {
  //       Product.findOne({
  //           "import_id": import_ids[i]
  //         })
  //         .exec((err, product) => {
  //           if (product) {
  //             product.lang[0].content.description = descriptions[i];
  //             product.save();
  //           }
  //         })
  //     }
  //     res.json({
  //       status: true,
  //       message: "Successfully Updated"
  //     });
  //   });



  
  // router.route("/batch-update/priority-set")
  //   .get((req, res) => {

  //     workbook.xlsx.readFile('priority.xlsx')
  //     .then(function() {
  //         var worksheet = workbook.getWorksheet(1);

  //         //for(let i =1; i<4000; i++){
  //          // for(let i =4000; i<8000; i++){
  //             for(let i =8000; i<12000; i++){
  //            //for(let i =12000; i<14980; i++){
            
  //           var row = worksheet.getRow(i);
  //           imports[i-1] = row.getCell(1).value;
  //           priorities[i-1] = row.getCell(2).value;

           

  //           // //console.log(row.getCell(1).value)
  //           // //console.log("-----------")
  //           // //console.log(row.getCell(2).value)
  //         }


  //         //for(let i =1; i<4000; i++){
  //         //  for(let i =4000; i<8000; i++){
  //             for(let i =8000; i<12000; i++){
  //           //  for(let i =12000; i<14980; i++){

  //         Product.findOne({
  //           import_id:imports[i-1]
  //         })
  //         .exec()
  //         .then(product=>{
  //           if(product){
  //             product.priority = priorities[i-1];
  //             product.save();
  //           }
  //         })
  //       }


  //         // //console.log(imports)
  //         // //console.log(priorities)
         
  //     })
  //     res.json("OK");
  //   });