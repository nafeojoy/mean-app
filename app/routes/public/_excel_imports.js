  // router.route("/excel-isbn")
  //   .get((req, res) => {

  //     xlsxtojson({
  //       input: "./isbn.xlsx", // input xls
  //       output: "output.json", // output json
  //       lowerCaseHeaders: true
  //     }, function (err, result) {
  //       if (err) {
  //         res.json(err);
  //       } else {

  //         result.forEach(element => {
  //           let importId = element.import_id;
  //           let isbn = element.isbn;

  //           Product.findOne({
  //               "import_id": importId
  //             })
  //             .exec((err, product) => {
  //               product.isbn = isbn;
  //               product.save();
  //             })
  //         });

  //         // result.forEach(element => {

  //         // });
  //         res.json("DONE");
  //       }
  //     });
  //   });








  


  // router.route("/excel-book-info")
  // .get((req, res) => {
  //   //console.log("YYY")


  //   workbook.xlsx.readFile('book_info.xlsx')
  //     .then(function () {
  //       var worksheet = workbook.getWorksheet(1);
  //       var rows = worksheet._rows;
  //       var importId = new Array();
  //       rows.forEach(function (value, i) {
  //         var row = worksheet.getRow(i + 1);
  //         importId[i] = row.getCell(1).value;
  //       });

  //     //  //console.log(importId)

  //       Product.aggregate([{
  //             $match: {
  //               "import_id": { $in:importId} 
  //             },
  //           },
  //           {
  //             $unwind: "$lang"
  //           },
  //           {
  //             $unwind: "$accessories"
  //           },
  //           {
  //             $project: {
  //               import_id: "$import_id",
  //               name_en: "$name",
  //               name_bn: "$lang.content.name",
  //               author_en: {
  //                 $arrayElemAt: ["$accessories.authors_en.name", 0]
  //               },
  //               author_bn: {
  //                 $arrayElemAt: ["$accessories.authors_bn.name", 0]
  //               },
  //               publisher: "$accessories.publisher_bn.name",
  //               book_language: "$book_language",
  //               previous_price: "$previous_price",
  //               price: "$price",
  //               description: "$lang.content.description",
  //               priority: "$priority",
  //               preview_images: {
  //                 $size: "$preview_images"
  //               }
  //             }
  //           }
  //         ])
  //         .exec((err, product) => {

  //           product.forEach(function (element, i) {
  //             var row = worksheet.getRow(i + 1);


  //             row.getCell(1).value = element.import_id;
  //             row.getCell(2).value = element.name_en;
  //             row.getCell(3).value = element.name_bn;
  //             row.getCell(4).value = element.author_en;
  //             row.getCell(5).value = element.author_bn;
  //             row.getCell(6).value = element.publisher;
  //             row.getCell(7).value = element.book_language;
  //             row.getCell(8).value = element.previous_price;
  //             row.getCell(9).value = element.price;
  //             row.getCell(10).value = element.preview_images;

  //             if (element.description) {
  //               row.getCell(11).value = "Yes";
  //             } else {
  //               row.getCell(11).value = "No";
  //             }
  //             row.getCell(12).value = element.priority;

  //             row.commit();
  //           });

       
  //            //console.log("AAAA");
  //            return workbook.xlsx.writeFile('new_prod.xlsx');
  //         });

  //     })

  //   res.json("I amBACK")
  // });







  
  // router.route("/batch-update/book-list").get((req, res) => {
  //   Category.find({
  //       _id: "5a6896008f9d62c857a01227"
  //     })
  //     .select({
  //       name: 1
  //     })
  //     .exec()
  //     .then(data => {
  //       // res.json(data);
  //       getProductInfo(data).then(rslt => {
  //         res.json({
  //           success: true
  //         });
  //       });
  //     });
  // });









  // router.route("/excel-book-info")
  // .get((req, res) => {
  //   //console.log("YYY")


  //   workbook.xlsx.readFile('SetP.xlsx')
  //     .then(function () {
  //       var worksheet = workbook.getWorksheet(1);
  //       var rows = worksheet._rows;
  //       var importId = new Array();
  //       rows.forEach(function (value, i) {
  //         var row = worksheet.getRow(i + 1);
  //         importId[i] = row.getCell(1).value;
  //       });

  //     //  //console.log(importId)

  //       Product.aggregate([{
  //             $match: {
  //               "import_id": { $in:importId} 
  //             },
  //           },
  //           {
  //             $unwind: "$lang"
  //           },
  //           {
  //             $unwind: "$accessories"
  //           },
  //           {
  //             $project: {
  //               import_id: "$import_id",
  //               name_en: "$name",
  //               name_bn: "$lang.content.name",
  //               seo_url: "$seo_url",
  //               author_en: {
  //                 $arrayElemAt: ["$accessories.authors_en.name", 0]
  //               },
  //               author_bn: {
  //                 $arrayElemAt: ["$accessories.authors_bn.name", 0]
  //               },
  //               publisher: "$accessories.publisher_bn.name",

  //               category_one: {
  //                 $arrayElemAt: ["$accessories.categories_en.name", 0]
  //               },
  //               category_two: {
  //                 $arrayElemAt: ["$accessories.categories_en.name", 1]
  //               },
  //               book_language: "$book_language",
  //               previous_price: "$previous_price",
  //               price: "$price",
  //               description: "$lang.content.description",
  //               priority: "$priority",
  //               preview_images: {
  //                 $size: "$preview_images"
  //               }
  //             }
  //           }
  //         ])
  //         .exec((err, product) => {

  //           product.forEach(function (element, i) {
  //             var row = worksheet.getRow(i + 1);


  //             row.getCell(1).value = element.import_id;
  //             row.getCell(2).value = element.name_en;
  //             row.getCell(3).value = element.name_bn;
  //             row.getCell(4).value = element.seo_url;
  //             row.getCell(5).value = element.author_en;
  //             row.getCell(6).value = element.author_bn;
  //             row.getCell(7).value = element.publisher;
  //             row.getCell(8).value = element.category_one;
  //             row.getCell(9).value = element.category_two;
  //             row.getCell(10).value = element.book_language;
  //             row.getCell(11).value = element.previous_price;
  //             row.getCell(12).value = element.price;
  //             row.getCell(13).value = element.preview_images;

  //             if (element.description) {
  //               row.getCell(14).value = "Yes";
  //             } else {
  //               row.getCell(14).value = "No";
  //             }
  //             row.getCell(15).value = element.priority;

  //             row.commit();
  //           });

       
  //            //console.log("AAAA");
  //            return workbook.xlsx.writeFile('newinfo.xlsx');
  //         });

  //     })

  //   res.json("I amBACK")
  // });





  // router.route("/excel-book-info")
  // .get((req, res) => {
  //   //console.log("YYY")


  //   workbook.xlsx.readFile('Priority.xlsx')
  //     .then(function () {
  //       var worksheet = workbook.getWorksheet(4);
  //       var rows = worksheet._rows;
  //       var importId = new Array();
  //       rows.forEach(function (value, i) {
  //         var row = worksheet.getRow(i + 1);
  //         importId[i] = row.getCell(1).value;
  //       });

  //     //  //console.log(importId)

  //       Product.aggregate([{
  //             $match: {
  //               "import_id": { $in:importId} 
  //             },
  //           },
  //           {
  //             $unwind: "$lang"
  //           },
  //           {
  //             $unwind: "$accessories"
  //           },
  //           {
  //             $project: {
  //               import_id: "$import_id",
  //               name_en: "$name",
  //               name_bn: "$lang.content.name",
  //               seo_url: "$seo_url",
  //               author_en: {
  //                 $arrayElemAt: ["$accessories.authors_en.name", 0]
  //               },
  //               author_bn: {
  //                 $arrayElemAt: ["$accessories.authors_bn.name", 0]
  //               },
  //               publisher: "$accessories.publisher_bn.name",

  //               category_one: {
  //                 $arrayElemAt: ["$accessories.categories_en.name", 0]
  //               },
  //               category_two: {
  //                 $arrayElemAt: ["$accessories.categories_en.name", 1]
  //               },
  //               book_language: "$book_language",
  //               previous_price: "$previous_price",
  //               price: "$price",
  //                description: "$lang?.content?.description",
  //               priority: "$priority",
  //               preview_images: {
  //                 $size: "$preview_images"
  //               }
  //             }
  //           }
  //         ])
  //         .exec((err, product) => {

            

  //           product.forEach(function (element, i) {
  //             var row = worksheet.getRow(i + 1);


  //             row.getCell(1).value = element.import_id;
  //             row.getCell(2).value = element.name_en;
  //             row.getCell(3).value = element.name_bn;
  //             row.getCell(4).value = element.seo_url;
  //             row.getCell(5).value = element.author_en;
  //             row.getCell(6).value = element.author_bn;
  //             row.getCell(7).value = element.publisher;
  //             row.getCell(8).value = element.category_one;
  //             row.getCell(9).value = element.category_two;
  //             row.getCell(10).value = element.book_language;
  //             row.getCell(11).value = element.previous_price;
  //             row.getCell(12).value = element.price;
  //             row.getCell(13).value = element.preview_images;

  //             if (element.description) {
  //               row.getCell(14).value = "Yes";
  //             } else {
  //               row.getCell(14).value = "No";
  //             }
  //             row.getCell(15).value = element.priority;

  //             row.commit();
  //           });

       
  //            //console.log("AAAA");
  //            return workbook.xlsx.writeFile('combined.xlsx');
  //         });

  //     })

  //   res.json("I amBACK")
  // });


  // router.route("/excel-book-info").get((req, res) => {
  //   //console.log("YYY");

  //   workbook.xlsx.readFile("Priority.xlsx").then(function() {
  //     for (let k = 1; k <= 47; k++) {
  //       setTimeout(function() {
  //         var worksheet = workbook.getWorksheet(k);
  //         var rows = worksheet._rows;
  //         var importId = new Array();
  //         rows.forEach(function(value, i) {
  //           var row = worksheet.getRow(i + 1);
  //           importId[i] = row.getCell(1).value;
  //         });

  //         ////console.log(importId)

  //         Product.aggregate([
  //           {
  //             $match: {
  //               import_id: {
  //                 $in: importId
  //               }
  //             }
  //           },
  //           {
  //             $unwind: "$lang"
  //           },
  //           {
  //             $unwind: "$accessories"
  //           },
  //           {
  //             $project: {
  //               import_id: "$import_id",
  //               name_en: "$name",
  //               name_bn: "$lang.content.name",
  //               seo_url: "$seo_url",
  //               author_en: {
  //                 $arrayElemAt: ["$accessories.authors_en.name", 0]
  //               },
  //               author_bn: {
  //                 $arrayElemAt: ["$accessories.authors_bn.name", 0]
  //               },
  //               publisher_en: "$accessories.publisher_en.name",
  //               publisher_bn: "$accessories.publisher_bn.name",

  //               category_one: {
  //                 $arrayElemAt: ["$accessories.categories_bn.name", 0]
  //               },
  //               category_two: {
  //                 $arrayElemAt: ["$accessories.categories_bn.name", 1]
  //               },
  //               category_three: {
  //                 $arrayElemAt: ["$accessories.categories_bn.name", 2]
  //               },
  //               book_language: "$book_language",
  //               previous_price: "$previous_price",
  //               price: "$price",
  //               description: "$lang.content.description",
  //               priority: "$priority",
  //               preview_images: {
  //                 $size: "$preview_images"
  //               }
  //             }
  //           }
  //         ]).exec((err, product) => {
  //           product.forEach(function(element, i) {
  //             var row = worksheet.getRow(i + 1);

  //             row.getCell(1).value = element.import_id;
  //             row.getCell(2).value = element.name_en;
  //             row.getCell(3).value = element.name_bn;
  //             row.getCell(4).value = element.author_en;
  //             row.getCell(5).value = element.author_bn;
  //             row.getCell(6).value = element.publisher_en;
  //             row.getCell(7).value = element.publisher_bn;
  //             row.getCell(8).value = element.category_one;
  //             row.getCell(9).value = element.category_two;
  //             row.getCell(10).value = element.category_three;
  //             row.getCell(11).value = element.previous_price;
  //             row.getCell(12).value = element.price;
  //             row.getCell(13).value = element.priority;

  //             row.getCell(14).value = element.seo_url;
  //             row.getCell(15).value = element.preview_images;

  //             if (element.description) {
  //               row.getCell(16).value = "Yes";
  //             } else {
  //               row.getCell(16).value = "No";
  //             }
  //             row.getCell(17).value = element.book_language;

  //             row.commit();
  //           });
  //           //console.log("AAAA");

  //           //  return workbook.xlsx.writeFile(k+'.xlsx');
  //         });
  //       }, 5000);
  //     }
  //   });

  //   res.json("I amBACK");
  // });


  // router.route("/excel-book-info")
  // .get((req, res) => {
  //   //console.log("YYY")


  //   workbook.xlsx.readFile('Only_Combined.xlsx')
  //     .then(function () {
  //       var worksheet = workbook.getWorksheet(1);
  //       var rows = worksheet._rows;
  //       var importId = new Array();
  //       var row;
  //       var x;
  //       var count = 0;
  //       rows.forEach(function (value, i) {
  //         row = worksheet.getRow(i + 1);
  //         importId[i] = row.getCell(1).value;
  //       });
  //       //console.log(importId.length)

    


  // router.route("/excel-book-info")
  //   .get((req, res) => {
  //     //console.log("YYY")


  //     workbook.xlsx.readFile('Rest.xlsx')
  //       .then(function () {
  //         var worksheet = workbook.getWorksheet(1);
  //         var rows = worksheet._rows;
  //         var importId = new Array();
  //         var row;
  //         var x;
  //         var count = 0;
  //         rows.forEach(function (value, i) {
  //           row = worksheet.getRow(i + 1);
  //           importId[i] = parseFloat(row.getCell(1).value);
  //         });
  



  //         Product.aggregate([{
  //               $match: {
  //                 "import_id": 
  //                 {$in:importId}

                  
  //               },
  //             },
  //             {
  //               $unwind: {
  //                 "path": "$lang",
  //                 "preserveNullAndEmptyArrays": true
  //               }
  //             },
  //             {
  //               $unwind: {
  //                 "path": "$accessories",
  //                 "preserveNullAndEmptyArrays": true
  //               }
  //             },
  //             {
  //               $project: {
  //                 import_id: "$import_id",
  //                 name_en: "$name",
  //                 name_bn: "$lang.content.name",
  //                 seo_url: "$seo_url",
  //                 author_en: {
  //                   $arrayElemAt: ["$accessories.authors_en.name", 0]
  //                 },
  //                 author_bn: {
  //                   $arrayElemAt: ["$accessories.authors_bn.name", 0]
  //                 },
  //                 publisher_en: "$accessories.publisher_en.name",
  //                 publisher_bn: "$accessories.publisher_bn.name",

  //                 category_one: {
  //                   $arrayElemAt: ["$accessories.categories_bn.name", 0]
  //                 },
  //                 category_two: {
  //                   $arrayElemAt: ["$accessories.categories_bn.name", 1]
  //                 },
  //                 category_three: {
  //                   $arrayElemAt: ["$accessories.categories_bn.name", 2]
  //                 },
  //                 book_language: "$book_language",
  //                 previous_price: "$previous_price",
  //                 price: "$price",
  //                 description: {
  //                                     $cond: [{
  //                                         $ifNull: ['$lang.content.description', false]
  //                                       }, // if
  //                                       true, // then
  //                                       false // else
  //                                     ]
  //                                   },
  //                 priority: "$priority",
  //                 preview_images: {
  //                   $size: "$preview_images"
  //                 }
  //               }
  //             }

  //           ])
  //           .exec((err, product) => {

  //             //console.log(product.length)


  //             product.forEach(function (element, i) {
  //               var row = worksheet.getRow(i + 1);


  //               row.getCell(1).value = element.import_id;
  //               row.getCell(2).value = element.name_en;
  //               row.getCell(3).value = element.name_bn;
  //               row.getCell(4).value = element.author_en;
  //               row.getCell(5).value = element.author_bn;
  //               row.getCell(6).value = element.publisher_en;
  //               row.getCell(7).value = element.publisher_bn;
  //               row.getCell(8).value = element.category_one;
  //               row.getCell(9).value = element.category_two;
  //               row.getCell(10).value = element.category_three;
  //               row.getCell(11).value = element.previous_price;
  //               row.getCell(12).value = element.price;
  //               row.getCell(13).value = element.priority;

  //               row.getCell(14).value = element.seo_url;
  //               row.getCell(15).value = element.preview_images;

  //               if (element.description) {
  //                 row.getCell(16).value = "Yes";
  //               } else {
  //                 row.getCell(16).value = "No";
  //               }
  //               row.getCell(17).value = element.book_language;

  //               row.commit();
  //             });


  //             //console.log("AAAA");
  //             return workbook.xlsx.writeFile('Restchange.xlsx');
  //           });

  //       })

  //     res.json("I amBACK")
  //   });







//Shamim  

//   var fs = require('fs'),
//   request = require('request');

// function download(uri, filename) {
//   return new Promise((resolve, reject) => {
//     request.head(uri, function (err, res, body) {

//       request(uri).pipe(fs.createWriteStream(filename))
//         .on('close', respons => {
//           resolve(respons);
//         })
//     });
//   })
// };

// var createDir = function (uri, filename, callback) {
//   request.head(uri, function (err, res, body) {
//     //console.log('content-type:', res.headers['content-type']);
//     //console.log('content-length:', res.headers['content-length']);

//     request(uri).pipe(fs.mkdirSync(filename)).on('close', callback);
//   });
// };

// //Needed for excel import from local
// var Excel = require("exceljs");
// var workbook = new Excel.Workbook();


// router.route('/download-image-import')
// .get((req, res) => {


//   workbook.xlsx.readFile('Only_Combined.xlsx')
//     .then(function () {
//       var worksheet = workbook.getWorksheet(1);
//       var rows = worksheet._rows;
//       var importId = new Array();
//       var row;
//       var x;
//       var count = 0;
//       rows.forEach(function (value, i) {
//         row = worksheet.getRow(i + 1);
//         importId[i] = parseFloat(row.getCell(1).value);
//       });

//       //console.log(importId.length)

//       Product.aggregate([{
//             $match: {
//               "import_id": {
//                 $in: importId
//               }
//             },
//           },

//           {
//             $project: {
//               import_id: "$import_id",
//               name_en: "$name",
//               image: "$image.250X360",

//             }
//           }

//         ])
//         .exec()
//         .then(products => {
//           return getProductImages(products)
//         })
//         .then(images => {

//         })
//         .catch(err => {

//         })

//     })

//   res.json("I Download")

// });
// function getProductImages(products) {
// let downloadedImages = products.map(product => {
//   return new Promise((resolve, reject) => {
//     var first = product.image;
//     if (first) {
//       var second = first.split('250X360/')[1];

//       //Create Directories
//       // let value = second.substring(0, second.length - 4);
//       // let p = parseInt(value / 1000);
//       // let q = value % 1000;
//       // let folder = q > 0 ? (p * 1000) + 1000 : (p - 1) * 1000 + 1000;
//       // let path = 'import-images/' + String(folder) + '';

//       //Download Images
//       var img = 'https://d1jpltibqvso3j.cloudfront.net' + first + '';
//       var image = img.replace('250X360', 'image');
//       // var file = 'import-images/'+ folder +'/' + second + '';
//       var file = 'import-images/' + second + '';

//       // //console.log(image);

//       // if (!fs.existsSync(path)) {
//       //   fs.mkdirSync(path);
//       // }

//       download(image, file).then(imgs => {
//         resolve(imgs);
//       })
//     }
//   })
// })
// return Promise.all(downloadedImages);
// }












//Nafeo 

// var fs = require('fs'),
//   request = require('request');

// var download = function (uri, filename, callback) {
//   request.head(uri, function (err, res, body) {
//     // //console.log('content-type:', res.headers['content-type']);
//     // //console.log('content-length:', res.headers['content-length']);

//     request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
//   });
// };

// var createDir = function (uri, filename, callback) {
//   request.head(uri, function (err, res, body) {
//     //console.log('content-type:', res.headers['content-type']);
//     //console.log('content-length:', res.headers['content-length']);

//     request(uri).pipe(fs.mkdirSync(filename)).on('close', callback);
//   });
// };

// //Needed for excel import from local
// var Excel = require("exceljs");
// var workbook = new Excel.Workbook();


// router.route('/download-image-import')
// .get((req, res) => {


//   workbook.xlsx.readFile('Only_Combined.xlsx')
//     .then(function () {
//       var worksheet = workbook.getWorksheet(1);
//       var rows = worksheet._rows;
//       var importId = new Array();
//       var row;
//       var x;
//       var count = 0;
//       rows.forEach(function (value, i) {
//         row = worksheet.getRow(i + 1);
//         importId[i] = parseFloat(row.getCell(1).value);
//       });

//       //console.log(importId.length)

//       Product.aggregate([{
//             $match: {
//               "import_id": {
//                 $in: importId
//               }
//             },
//           },

//           {
//             $project: {
//               import_id: "$import_id",
//               name_en: "$name",
//               image: "$image.250X360",

//             }
//           }

//         ])
//         .exec((err, product) => {

//           //console.log(product.length)

//           product.forEach(function (element, i) {

//             var first = element.image;

//             if (first) {

//               var second = first.split('250X360/')[1];
              


//               //Create Directories
//               // let value = second.substring(0, second.length - 4);
//               // let p = parseInt(value / 1000);
//               // let q = value % 1000;
//               // let folder = q > 0 ? (p * 1000) + 1000 : (p - 1) * 1000 + 1000;
//               // let path = 'import-images/' + String(folder) + '';

//               //Download Images
//               var img = 'https://d1jpltibqvso3j.cloudfront.net' + first + '';
//               var image =  img.replace('250X360','image');
//               // var file = 'import-images/'+ folder +'/' + second + '';
//               var file = 'import-images/' + second + '';

//              // //console.log(image);


//               // if (!fs.existsSync(path)) {
//               //   fs.mkdirSync(path);
//               // }


//               download(image, file, function () {
//               //  //console.log('done');
//               });
//             }


//           });
//           //console.log("AAAA");



//         });

//     })

//   res.json("I Download")

// });
