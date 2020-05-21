var getSlug = require('speakingurl');
var slugComponent = require('slug-component');
var shortId = require('shortid');
var async = require('async');

export default function uniqueSlugPlugin(schema, options) {
    var watcher = [], slugs = [],
        opts = {
            separator: '-',
            lang: 'en',
            truncate: 120
        };

    // merge options
    for (var attrname in options) {
        opts[attrname] = options[attrname];
    }

    schema.eachPath(function (pathname, schemaType) {
        if (schemaType.instance == 'String' && schemaType.options && schemaType.options.slug) {
            var slug = {
                'name': pathname
            };

            if (typeof (schemaType.options.slug) === 'string') {
                slug.fields = [schemaType.options.slug]
            } else if (schemaType.options.slug instanceof Array) {
                slug.fields = schemaType.options.slug;
            } else {
                // TODO launch error
            }

            if (schemaType.options.unique || schemaType.options.unique_slug) {
                slug.unique = true;
            }

            if (schemaType.options.slug_padding_size === undefined) {
                slug.isShortIdMode = true;
            } else {
                slug.isShortIdMode = false;
                slug.padding = schemaType.options.slug_padding_size;
            }

            watcher = watcher.concat(slug.fields.filter(function (field) {
                return watcher.indexOf(field) < 0;
            }));

            slugs.push(slug);
        }
    });

    schema.pre('save', function (next) {
        var doc = this, reSlug = false;

        /*watcher.forEach(function (item) {
            if (doc.isModified(item)) {
                reSlug = true;
            }
        });

        if (!reSlug) {
            return next();
        }*/

        async.each(slugs, function (item, callback) {
            if (item.isShortIdMode) {
                buildUniqueShortIdSlug(doc, item, opts, function (err, slug) {
                    if (err) {
                        callback(err);
                    } else {
                        doc[item.name] = slug;

                        // generate slugs for multi languages
                        if (doc['lang']) {
                            langUniqueShortIdSlug(doc, item, opts, function (err, lang) {
                                doc['lang'] = lang;
                                callback();
                            })
                        } else {
                            callback();
                        }
                    }
                });
            } else {
                buildUniqueCounterSlug(doc, item, opts, item.padding, function (err, slug) {
                    if (err) {
                        callback(err);
                    } else {
                        doc[item.name] = slug;

                        // generate slugs for multi languages
                        if (doc['lang']) {
                            langUniqueCounterSlug(doc, item, opts, item.padding, function (err, lang) {
                                doc['lang'] = lang;
                                callback();
                            })
                        } else {
                            callback();
                        }
                    }
                });
            }

        }, function (err, res) {
            next();
        });
    });
}

function makeSlug(values, options, lang = 'en') {
    var slug = '';

    if (lang != 'en') {
        let str = values[0].replace(/\//g, '1');
        slug = str.trim().replace(/ /g, options.separator);
    } else {
        slug = getSlug(values.join(' '), options);
    }
    return slug;
}

/**
 * Generate a unique slug. If the slug is already used, the generated slug has an appended random string, eg: my-slug-NJw9XvZ5l
 * 
 * @param doc
 * @param field
 * @param values
 * @param options
 * @param next
 */
function buildUniqueShortIdSlug(doc, slugItem, options, next) {
    var field = slugItem.name, values = [];

    slugItem.fields.forEach(function (field) {
        values.push(doc[field]);
    });

    var slug = makeSlug(values, options), query = {};

    query[field] = slug;

    doc.model(doc.constructor.modelName).findOne(query).exec(function (err, result) {
        if (result) {
            slug += options.separator + shortId.generate();
        }
        next(null, slug);
    });
}

function langUniqueShortIdSlug(doc, slugItem, options, next) {
    var langs = doc['lang'], field = slugItem.name, values = [], sluggedLangs = [];

    var buildSlugs = new Promise(function (resolve, reject) {
        async.forEachOfSeries(langs, function (lang, i, callback) {
            slugItem.fields.forEach(function (field) {
                values.push(lang.content[field]);
            });

            var slug = makeSlug(values, options, lang.code);

            doc.model(doc.constructor.modelName).findOne(
                { 'lang.code': lang.code, 'lang.content.seo_url': slug },
                {
                    _id: 0, seo_url: 1, lang: { $elemMatch: { code: lang.code } }
                }
            ).exec(function (err, result) {
                if (result) {
                    slug += options.separator + shortId.generate();
                }

                lang.content['seo_url'] = slug;
                sluggedLangs.push(lang);

                callback();
            });
        }, function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });

    buildSlugs.then(function () {
        next(null, sluggedLangs);
    });
}

function buildUniqueCounterSlug(doc, slugItem, options, padding, next) {
    var field = slugItem.name, values = [];

    slugItem.fields.forEach(function (field) {
        values.push(doc[field]);
    });

    var slug = makeSlug(values, options),
        count = 0, match = null, test = new RegExp(options.separator + '(\\d+)$'),
        query = {}, search = new RegExp(slug + "(" + options.separator + '(\\d+))?$'),
        sort = {};

    sort[field] = -1;

    if (doc._id) {
        query["_id"] = {
            $ne: doc._id
        }
    }

    query[field] = search;

    // field = search and doc != doc
    doc.model(doc.constructor.modelName).findOne(query).sort(sort).exec(function (err, result) {
        if (result) {
            if (match = result[field].match(test)) {
                count = match[1];
            }
            count++;
            slug += options.separator + pad(count, padding);
        }

        next(null, slug);
    })
}

function langUniqueCounterSlug(doc, slugItem, options, padding, next) {
    var langs = doc['lang'], field = slugItem.name, values = [], sluggedLangs = [];

    var count = 0, match = null, test = new RegExp(options.separator + '(\\d+)$'), sort = {};

    sort[field] = -1;

    var buildSlugs = new Promise(function (resolve, reject) {
        async.forEachOfSeries(langs, function (lang, i, callback) {
            slugItem.fields.forEach(function (field) {
                values.push(lang.content[field]);
            });

            var slug = makeSlug(values, options, lang.code);
            var search = new RegExp(slug + "(" + options.separator + '(\\d+))?$');

            doc.model(doc.constructor.modelName).findOne(
                {
                    'lang.code': lang.code, 'lang.content.seo_url': search, '_id': {
                        $ne: doc._id
                    }
                },
                {
                    _id: 0, seo_url: 1, lang: { $elemMatch: { code: lang.code } }
                }
            )
                .sort(sort)
                .exec(function (err, result) {
                    if (result) {
                        if (match = result[field].match(test)) {
                            count = match[1];
                        }
                        count++;
                        slug += options.separator + pad(count, padding);
                    }

                    lang.content['seo_url'] = slug;
                    sluggedLangs.push(lang);

                    callback();
                });
        }, function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });

    buildSlugs.then(function () {
        next(null, sluggedLangs);
    });
}

function pad(num, size) {
    var str = num + '';

    while (str.length < size) {
        str = '0' + str;
    }

    return str;
}