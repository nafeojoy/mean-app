import Product from '../../models/product.model';

export function updateProductsForBundleCreate(items, bundle) {
  return new Promise((resolve, reject) => {
    Product.update({
        _id: {
          $in: items
        }
      }, {
        $set: {
          is_in_bundle: true
        },
        $push: {
          list_of_bundle: bundle
        }
      }, {
        multi: true
      })
      .exec()
      .then(updt => {
        resolve({
          status: true
        });
      })
      .catch(err => {
        resolve({
          status: false
        })
      })
  })
}


export function updateProductsForBundleUpdate(updateStateObj, bundle) {
  return new Promise((resolve, reject) => {
    Product.update({
        _id: {
          $in: updateStateObj.old_bundle_item
        }
      }, {
        $set: {
          is_in_bundle: false
        },
        $pull: {
          list_of_bundle: bundle
        }
      }, {
        multi: true
      })
      .exec()
      .then(updt => {
        return Product.update({
          _id: {
            $in: updateStateObj.new_bundle_items
          }
        }, {
          $set: {
            is_in_bundle: true
          },
          $push: {
            list_of_bundle: bundle
          }
        }, {
          multi: true
        })
      })
      .then(reUpdt => {
        resolve(reUpdt);
      })
      .catch(err => {
        resolve(err)
      })
  })

}


export function createProductSearchText(product_id) {
  return new Promise((resolve, reject) => {
    Product.findOne({
        _id: product_id
      })
      .select({
        name: 1,
        published_year: 1,
        description: 1,
        lang: 1,
        author: 1,
        category: 1,
        publisher: 1
      })
      .populate({
        path: "author",
        select: "name seo_url import_id lang"
      })
      .populate({
        path: "category",
        select: "name seo_url import_id lang"
      })
      .populate({
        path: "publisher",
        select: "name seo_url import_id lang"
      })
      .exec()
      .then(product => {
        //console.log("In Search text1", product._id);
        let search_txt = "";
        try {
          search_txt = search_txt.concat(product.name, " ");
          search_txt = product.lang[0].content.name ? search_txt.concat(product.lang[0].content.name, " ") : search_txt;

          search_txt = search_txt.concat('2017', " ");

          search_txt = product.description ? search_txt.concat(product.description, " ") : search_txt;
          search_txt = product.lang[0].content.description ? search_txt.concat(product.lang[0].content.description, " ") : search_txt;

          search_txt = product.publisher.name ? search_txt.concat(product.publisher.name, " ") : search_txt;
          search_txt = product.publisher.lang[0].content.name ? search_txt.concat(product.publisher.lang[0].content.name, " ") : search_txt;

          search_txt = getObjectIdInfo(product.author) ? search_txt.concat(getObjectIdInfo(product.author), " ") : search_txt;
          search_txt = getObjectIdInfo(product.author) ? search_txt.concat(getObjectIdInfo(product.category)) : search_txt;
          product.search_text = search_txt.toLowerCase();
          //Make accessories Object
          let accessories = {
            categories_en: [],
            categories_bn: [],
            authors_en: [],
            authors_bn: [],
            publisher_en: new Object(),
            publisher_bn: new Object()
          };
          product.author.map(athr => {
            accessories.authors_en.push({
              name: athr.name,
              seo_url: athr.seo_url,
              import_id: athr.import_id
            })
            accessories.authors_bn.push({
              name: athr.lang[0].content.name,
              seo_url: athr.lang[0].content.seo_url,
              import_id: athr.import_id
            })
          })
          product.category.map(ctgr => {
            accessories.categories_en.push({
              name: ctgr.name,
              seo_url: ctgr.seo_url,
              import_id: ctgr.import_id
            })
            accessories.categories_bn.push({
              name: ctgr.lang[0].content.name,
              seo_url: ctgr.lang[0].content.seo_url,
              import_id: ctgr.import_id
            })
          })
          accessories.publisher_en = {
            name: product.publisher.name,
            seo_url: product.publisher.seo_url,
            import_id: product.publisher.import_id
          }
          accessories.publisher_bn = {
            name: product.publisher.lang[0].content.name,
            seo_url: product.publisher.lang[0].content.seo_url,
            import_id: product.publisher.import_id
          }
          product.accessories = accessories;

        } catch (error) {
          //console.log("In Search text2", error);
        }
        product.soundex_code = soundexSen(product.name);

        //Extra Soundex
        // let soundex_ex = soundexExtra(product.soundex_code);
        // product.soundex_code_extra = soundex_ex.join(" ");

        //console.log("In Search text2 soundex", product.soundex_code);
        product.save(err => {
          if (err)
            resolve({
              error: true
            })
          else
            resolve({
              error: false
            });
        });
      })
      .catch(err => {
        resolve({
          error: true
        })
      })
  })
}

function getObjectIdInfo(arrayOfObjects) {
  let conString = "";
  arrayOfObjects.map(obj => {
    conString = conString.concat(obj.name, " ");
    let lan = '';
    if (obj.lang[0] && obj.lang[0].content && obj.lang[0].content.name) {
      lan = obj.lang[0].content.name;
    }
    conString = conString.concat(lan, " ");
  })
  return conString;
}



export function soundexSen(MyStr) {
  var GROUPSEPARATOR = " ";
  // replace certain text in strings with a slash
  var re = / v | v\. | vel | aka | f | f. | r | r. | false | recte | on zhe /gi;
  MyStr = MyStr.replace(re, '');

  // append soundex of each individual word
  var result = '';
  var MyStrArray = MyStr.split(/[\s|,]+/); // use space or comma as token delimiter

  soundexExtra(MyStrArray).join(" ");

  for (var i in MyStrArray) {
    if (MyStrArray[i].length > 0) { // ignore null at ends of array (due to leading or trailing space)
      if (i != 0) {
        result += GROUPSEPARATOR;
      }
      result += soundex(MyStrArray[i]);
      if ((MyStrArray.length - 1) == i) {
        result += "";
      }
    }
  }
  let last_length = (MyStrArray[MyStrArray.length - 1]).length;

  if (result.slice(-3) == '000' && result.length > 4 && last_length < 3) {
    result = result.slice(0, -3);
  }
  return result;
}


export function soundex(s) {
  var a = s.toLowerCase().split(''),
    f = a.shift(),
    r = '',
    codes = {
      a: '',
      e: '',
      i: '',
      o: '',
      u: '',
      b: 1,
      f: 1,
      p: 1,
      v: 1,
      c: 2,
      g: 2,
      j: 2,
      k: 2,
      q: 2,
      s: 2,
      x: 2,
      z: 2,
      d: 3,
      t: 3,
      l: 4,
      m: 5,
      n: 5,
      r: 6
    };

  r = f +
    a
    .map(function (v, i, a) {
      return codes[v]
    })
    .filter(function (v, i, a) {
      return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
    })
    .join('');

  return (r + '000').slice(0, 4).toUpperCase();
};

export function soundexExtra(soundex) {

  let soundex_array = soundex;
  for (var i in soundex_array) {

    //Vowel Replaces
    if (soundex_array[i].charAt(0).toUpperCase() == 'A') {
      soundex_array.push(soundex_array[i].replaceAt(0, 'E'));
      soundex_array.push(soundex_array[i].replaceAt(0, 'O'));
    } else if (soundex_array[i].charAt(0).toUpperCase() == 'E') {
      soundex_array.push(soundex_array[i].replaceAt(0, 'I'));
      soundex_array.push(soundex_array[i].replaceAt(0, 'A'));
    } else if (soundex_array[i].charAt(0).toUpperCase() == 'I') {
      soundex_array.push(soundex_array[i].replaceAt(0, 'E'));
    } else if (soundex_array[i].charAt(0).toUpperCase() == 'O') {
      soundex_array.push(soundex_array[i].replaceAt(0, 'A'));
    } else if (soundex_array[i].charAt(0).toUpperCase() == 'V') {
      soundex_array.push(soundex_array[i].toUpperCase().replace('V', 'BH'));
    } else if (soundex_array[i].substring(0, 2).toUpperCase() == 'BH') {
      soundex_array.push(soundex_array[i].toUpperCase().replace('BH', 'V'));
    } else if (soundex_array[i].substring(0, 2).toUpperCase() == 'PH') {
      soundex_array.push(soundex_array[i].toUpperCase().replace('PH', 'F'));
    } else if (soundex_array[i].charAt(0).toUpperCase() == 'F') {
      soundex_array.push(soundex_array[i].toUpperCase().replace('F', 'PH'));
    } else if (soundex_array[i].charAt(0).toUpperCase() == 'C') {
      soundex_array.push(soundex_array[i].replaceAt(0, 'K'));
      soundex_array.push(soundex_array[i].replaceAt(0, 'Q'));
    } else if (soundex_array[i].charAt(0).toUpperCase() == 'K') {
      soundex_array.push(soundex_array[i].replaceAt(0, 'C'));
      soundex_array.push(soundex_array[i].replaceAt(0, 'Q'));
    } else if (soundex_array[i].charAt(0).toUpperCase() == 'Q') {
      soundex_array.push(soundex_array[i].replaceAt(0, 'C'));
      soundex_array.push(soundex_array[i].replaceAt(0, 'K'));
    } else if (soundex_array[i].charAt(0).toUpperCase() == 'J') {
      soundex_array.push(soundex_array[i].replaceAt(0, 'Z'));
    } else if (soundex_array[i].charAt(0).toUpperCase() == 'Z') {
      soundex_array.push(soundex_array[i].replaceAt(0, 'J'));
    }
  }

  return soundex_array;

}

String.prototype.replaceAt = function (index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

