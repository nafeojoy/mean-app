function splitLev() {
  if (product.length < 1) {
   // //console.log(params.expression);
    let mainStr = params.expression;
    let splitStr = mainStr.split(" ");

    if (splitStr.length == 1) {
     // //console.log(splitStr);
      let size = splitStr[0].length;
      let div = Math.ceil(size / 2);

      var search_string = [];
      search_string[0] = (splitStr[0].substr(0, div));
      search_string[1] = (splitStr[0].substr(div, splitStr[0].length));
    }


   // //console.log(search_string);
    Product.aggregate([{
          $match: {
            "is_enabled": {
              $eq: true
            },
            $or: [{
                "name": {
                  $regex: search_string[j],
                  $options: 'i'
                }
              },
              {
                "lang.content.name": {
                  $regex: search_string[j],
                  $options: 'i'
                }
              },
              {
                "search_text": {
                  $regex: search_string[j],
                  $options: 'i'
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "authors",
            localField: "author",
            foreignField: "_id",
            as: "author"
          }
        },
        {
          $project: {
            image: params.imageSize,
            previous_price: "$previous_price",
            price: "$price",
            name: "$name",
            seo_url: "$seo_url",
            click_url: "book",
            authorObj: {
              name: {
                $arrayElemAt: ["$author.name", 0]
              },
            }
          }
        },
        {
          $sort: {
            priority: 1,
            name: 1
          }
        },
      ])
      .exec()
      .then(restProduct => {
        product = product.concat(restProduct);
      //  //console.log(product.length);

        if (j == 1) {
          let myprod = [];
          product.forEach(element => {
            let p = levenshteinDistance(x, element.name);
            if (Math.abs(p) < 5) {
              myprod = myprod.concat(element)
            }
            if (!myprod) {
              if (Math.abs(p) < 10) {
                myprod = myprod.concat(element)
              }
              if (!myprod) {
                if (Math.abs(p) < 20) {
                  myprod = myprod.concat(element)
                }
                if (!myprod) {
                  if (Math.abs(p) < 1000) {
                    myprod = myprod.concat(element)
                  }

                }
              }
            }
          });
          // //console.log(myprod)
          resolve(myprod);
        }
      })
      .catch(err => {
        //console.log(err_data)
        let err_data = [];
        resolve(err_data)
      })
  } else {
    resolve(product);
  }
}

function def() {

  if (product.length < 12) {
    let lmt = 12 - product.length;
    let ids = product.map(prd => {
      return prd._id
    });
    Product.aggregate([{
          $match: {
            "is_enabled": {
              $eq: true
            },
            "_id": {
              $nin: ids
            },
            $or: [{
                "name": {
                  $regex: params.expression,
                  $options: 'i'
                }
              },
              {
                "lang.content.name": {
                  $regex: params.expression,
                  $options: 'i'
                }
              },
              {
                "search_text": {
                  $regex: params.expression,
                  $options: 'i'
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "authors",
            localField: "author",
            foreignField: "_id",
            as: "author"
          }
        },
        {
          $project: {
            image: params.imageSize,
            previous_price: "$previous_price",
            price: "$price",
            name: "$name",
            seo_url: "$seo_url",
            click_url: "book",
            authorObj: {
              name: {
                $arrayElemAt: ["$author.name", 0]
              },
            }
          }
        },
        {
          $sort: {
            priority: 1,
            name: 1
          }
        },
      ])
      .skip(lmt * (params.pagenum - 1))
      .limit(8)
      .exec()
      .then(restProduct => {
        product = product.concat(restProduct);
        resolve(product);
      })
      .catch(err => {
        let err_data = [];
        resolve(err_data)
      })
  } else {
    resolve(product);
  }
}



//Lev IMplemented

// var words = ["Sho Borner Bangladesh", "Sho Print", "Sho-Nirbacito Sherosto Upponas", "Shob E Miraz O Shob E Barat: Koroniyo Ki?", "Shob E Miraz O Shob E Barat: Koroniyo Ki?"]

// var input = "Borner";

// words.forEach(element => {
//     let p = levenshteinDistance(input, element);
//     if (Math.abs(p) < 100) {
//         //console.log(element);
//         //console.log(Math.abs(p));
//     }
// });

// //console.log(words.length);

// function levenshteinDistance(a, b) {
//     if (a.length === 0) return b.length;
//     if (b.length === 0) return a.length;

//     var matrix = [];

//     // increment along the first column of each row
//     var i;
//     for (i = 0; i <= b.length; i++) {
//         matrix[i] = [i];
//     }

//     // increment each column in the first row
//     var j;
//     for (j = 0; j <= a.length; j++) {
//         matrix[0][j] = j;
//     }

//     // Fill in the rest of the matrix
//     for (i = 1; i <= b.length; i++) {
//         for (j = 1; j <= a.length; j++) {
//             if (b.charAt(i - 1) == a.charAt(j - 1)) {
//                 matrix[i][j] = matrix[i - 1][j - 1];
//             } else {
//                 matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
//                     Math.min(matrix[i][j - 1] + 1, // insertion
//                         matrix[i - 1][j] + 1)); // deletion
//             }
//         }
//     }

//     return matrix[b.length][a.length];
// }



//Soundex Implemented
// var SEPARATOR = " ";
// var GROUPSEPARATOR = " ";
// let s = 'Sorisriper Muktinama';
// //console.log(soundexa(s));

// function soundexa(MyStr) {

//     // replace certain text in strings with a slash
//     var re = / v | v\. | vel | aka | f | f. | r | r. | false | recte | on zhe /gi;
//     MyStr = MyStr.replace(re, '/');

//     // append soundex of each individual word
//     var result = "";
//     var MyStrArray = MyStr.split(/[\s|,]+/); // use space or comma as token delimiter
//     for (var i in MyStrArray) {
//         if (MyStrArray[i].length > 0) { // ignore null at ends of array (due to leading or trailing space)
//             if (i != 0) {
//                 result += GROUPSEPARATOR;
//             }
//             result += soundex(MyStrArray[i]);
//         }
//     }
//     return result;
// }



// function soundex(s) {
//     var a = s.toLowerCase().split(''),
//         f = a.shift(),
//         r = '',
//         codes = {
//             a: '', e: '', i: '', o: '', u: '',
//             b: 1, f: 1, p: 1, v: 1,
//             c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
//             d: 3, t: 3,
//             l: 4,
//             m: 5, n: 5,
//             r: 6
//         };

//     r = f +
//         a
//             .map(function (v, i, a) { return codes[v] })
//             .filter(function (v, i, a) {
//                 return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
//             })
//             .join('');

//     return (r + '000').slice(0, 4).toUpperCase();
// };



// let finalString;
// let mainStr = "নিঃসঙ্গ";
// let splitStr = mainStr.split(" ");


// if (splitStr.length == 1) {
//     // //console.log(splitStr);
//     let size = splitStr[0].length;
//     let div = Math.ceil(size / 2);
//     var search_string = [];
//     search_string[0] = (splitStr[0].substr(0, div));
//     search_string[1] = (splitStr[0].substr(div, splitStr[0].length));

//     finalString = search_string.map(val => {
//         return new RegExp(val);
//     });
// } else if (splitStr.length > 1) {
//     let splitStr = mainStr.split(" ").map(val => {
//         return new RegExp(val);
//     });

//     finalString = mainStr.split(" ").map(val => {
//         return new RegExp(val);
//     });
// }


// //console.log(finalString);

// //console.log(x.slice(0, -3))
