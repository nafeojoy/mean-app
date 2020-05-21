import Product from '../../models/product.model';
var toSkip = 0;
var toLimit = 10000;
export default (app, router, auth) => {
  router.route('/bulk-update/product-accessories')
    .get((req, res) => {
      Product.find()
        .select({
          author: 1,
          category: 1,
          publisher: 1
        })
        .populate({
          path: "author",
          select: "name seo_url lang"
        })
        .populate({
          path: "category",
          select: "name seo_url lang"
        })
        .populate({
          path: "publisher",
          select: "name seo_url lang"
        })
        .skip(toSkip)
        .limit(toLimit)
        .exec()
        .then(product => {
          //console.log(toSkip, toLimit);
          toSkip += 10000;
          return makeAccessories(product)
        })
        .then(obj => {
          res.json({
            updated: obj.length
          });
        })
        .catch(err => {
          res.send(err);
        })
    })

  function makeAccessories(products) {
    var updates = products.map(product => {
      return new Promise((resolve, reject) => {
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
            seo_url: athr.seo_url
          })
          accessories.authors_bn.push({
            name: athr.lang[0].content.name,
            seo_url: athr.lang[0].content.seo_url
          })
        })
        product.category.map(ctgr => {
          accessories.categories_en.push({
            name: ctgr.name,
            seo_url: ctgr.seo_url
          })
          accessories.categories_bn.push({
            name: ctgr.lang[0].content.name,
            seo_url: ctgr.lang[0].content.seo_url
          })
        })
        accessories.publisher_en = {
          name: product.publisher.name,
          seo_url: product.publisher.seo_url
        }
        accessories.publisher_bn = {
          name: product.publisher.lang[0].content.name,
          seo_url: product.publisher.lang[0].content.seo_url
        }
        Product.update({
            _id: product._id
          }, {
            $set: {
              accessories: accessories
            }
          })
          .exec()
          .then(what => {
            resolve(what);
          })
          .catch(err => {
            reject(err)
          })
      })
    })
    return Promise.all(updates)
  }
}
