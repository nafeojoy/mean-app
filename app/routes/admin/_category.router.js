import Category from '../../models/category.model';
import {
	isSeoUnique
} from './admin-api.service';

import {
	getNextSequence
} from './sequence.service';

import {
	soundexSen
} from './product.service';

export default (app, router, auth, slug) => {

	router.route('/categorys')
		.get((req, res, next) => {
			var pageNum = 1,
				itemsPerPage = 10;
			var paginationHeader = req.headers['bz-pagination'];
			if (paginationHeader) {
				var params = paginationHeader.split(',');
				pageNum = parseInt(params[0]);
				itemsPerPage = parseInt(params[1]);
			}

			var featurePaginationHeader = req.headers['bz-feature-pagination'];
			if (featurePaginationHeader) {
				pageNum = parseInt(featurePaginationHeader);
			}

			Category.count((err, count) => {
				return count
			}).then(count => {
				let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
				let imageSize = "$image." + size;
				Category.aggregate(
					[{
						$project: {
							name: "$name",
							image: "$image",
							import_id: "$import_id",
							is_featured: "$is_featured",
							featured_order: "$featured_order",
							sngImage: imageSize,
							hide_on_public: "$hide_on_public",
							lang: "$lang",
							description: "$description",
							occupation: "$occupation",
							nationality: "$nationality",
							birth_place: "$birth_place",
							birth_at: "$birth_at",
							died_at: "$died_at",
							awards: "$awards",
						}
					},
					{
						$sort: {
							name: 1
						}
					}
					]
				)
					.skip(itemsPerPage * (pageNum - 1))
					.limit(itemsPerPage)
					.exec((err, categorys) => {
						if (err) {
							res.send(err);
						} else {
							res.json({
								'items': categorys,
								'count': count
							});
						}
					});
			}).catch(err => {
				res.send(err);
			});
		});


	router.route('/categories')
		.get((req, res) => {

			var pageNum = 1,
				itemsPerPage = 10;
			var paginationHeader = req.headers['bz-pagination'];

			if (paginationHeader) {
				var params = paginationHeader.split(',');
				pageNum = parseInt(params[0]);
				itemsPerPage = parseInt(params[1]);
			}

			Category.count((err, count) => {
				return count
			}).then(count => {
				Category.find()
					.sort({
						'hierarchy_path': 1
					})
					.skip(itemsPerPage * (pageNum - 1))
					.limit(itemsPerPage)
					.exec((err, categories) => {
						if (err) {
							res.send(err)
						}
						res.json({
							'items': categories,
							'count': count
						})
					});
			}).catch(err => {
				res.send(err);
			});
		})

		.post(auth, slug(Category), (req, res) => {
			req.body.hierarchy_path = req.body.name;
			if (req.body.parent) {
				Category.findOne({
					_id: req.body.parent,
				})
					.populate('parents')
					.exec((err, parentCategory) => {
						req.body.hierarchy_path = parentCategory.hierarchy_path + ' > ' + req.body.hierarchy_path;
						req.body.parents = [];
						parentCategory.parents.forEach((parent) => {
							req.body.parents.push(parent._id);
						})
						req.body.parents.push(parentCategory._id);
						var newCategory = null;
						Category.create({
							name: req.body.name,
							image: req.body.image,
							hide_on_public: req.body.hide_on_public,
							import_id: req.body.image && req.body.image['120X175'] ? parseInt(req.body.image['120X175'].split('/')[4]) : undefined,
							description: req.body.description,
							hierarchy_path: req.body.hierarchy_path,
							meta_tag_title: req.body.meta_tag_title,
							meta_tag_description: req.body.meta_tag_description,
							meta_tag_keywords: req.body.meta_tag_keywords,
							seo_url: req.slug.seo_url,
							parents: req.body.parents,
							is_enabled: req.body.is_enabled,
							lang: req.body.lang,
							soundex_code: soundexSen(req.body.name),
							order: req.body.order
						}, (err, category) => {
							if (err) {
								res.send(err);
							} else {
								if (!category.image) {
									getNextSequence('category_import_id').then(seq => {
										category.import_id = seq;
										category.save(err => {
											if (err) {
												res.send(err);
											} else {
												res.json(category);
											}
										})
									})
								} else {
									res.json(category);
								}
							}
						})
							.then(category => {
								newCategory = category;
								var parentPromises = category.parents.map(parent_id => {
									return new Promise((resolve, reject) => {
										Category.update({
											_id: parent_id
										}, {
												$push: {
													children: category._id
												}
											})
											.then(parent => {
												resolve();
											}).catch(err => {
												reject(err);
											})
									})
								});
								return Promise.all(parentPromises);
							}).then(() => {
								res.json(newCategory)
							}).catch(err => {
								res.json(err);
							})
					})
			} else {
				Category.create({
					name: req.body.name,
					image: req.body.image,
					import_id: req.body.image && req.body.image['120X175'] ? parseInt(req.body.image['120X175'].split('/')[4]) : undefined,
					description: req.body.description,
					hierarchy_path: req.body.hierarchy_path,
					meta_tag_title: req.body.meta_tag_title,
					hide_on_public: req.body.hide_on_public,
					meta_tag_description: req.body.meta_tag_description,
					meta_tag_keywords: req.body.meta_tag_keywords,
					seo_url: req.body.seo_url,
					is_enabled: req.body.is_enabled,
					order: req.body.order,
					soundex_code: soundexSen(req.body.name),
					lang: req.body.lang
				}, (err, category) => {
					if (err) {
						res.send(err)
					} else {
						if (!category.image) {
							getNextSequence('category_import_id').then(seq => {
								category.import_id = seq;
								category.save(err => {
									if (err) {
										res.send(err);
									} else {
										res.json(category);
									}
								})
							})
						} else {
							res.json(category);
						}
					}
				})
			}

		});


	router.route('/seo-update/category/:id')
		.put(auth, (req, res) => {
			isSeoUnique(Category, req.body.seo_url, req.body.lang[0].content.seo_url, req.params.id)
				.then(output => {
					if (output.duplicate) {
						res.json(output)
					} else {
						Category.findOne({
							'_id': req.params.id
						}, (err, category) => {
							if (err)
								res.send(err);
							if (category._id) {
								category.meta_tag_title = req.body.meta_tag_title;
								category.meta_tag_description = req.body.meta_tag_description;
								category.meta_tag_keywords = req.body.meta_tag_keywords;
								category.seo_url = req.body.seo_url;
								category.banner = req.body.banner;
								category.lang = [{
									code: 'bn',
									content: {
										name: category.lang[0].content.name,
										description: category.lang[0].content.description,
										meta_tag_title: req.body.lang[0].content.meta_tag_title,
										meta_tag_description: req.body.lang[0].content.meta_tag_description,
										meta_tag_keywords: req.body.lang[0].content.meta_tag_keywords,
										seo_url: req.body.lang[0].content.seo_url
									}
								}];
								category.updated_by = req.user._id;
								category.updated_at = new Date();
							}
							return category.save((err) => {
								if (err) {
									res.send(err);
								} else {
									return res.send(category);
								}
							});
						})
					}
				}) 
		})


	router.route('/all-cats')
		.get((req, res) => {
			Category.count((err, count) => {
				return count
			}).then(count => {
				Category.find()
					.sort({
						'hierarchy_path': 1
					})
					.exec((err, categories) => {
						if (err) {
							res.send(err)
						}
						res.json({
							'items': categories,
							'count': count
						})
					});
			}).catch(err => {
				res.send(err);
			});
		})

	router.route('/categories/search/v1')
		.get((req, res) => {
			var pageNum = 1,
				itemsPerPage = 50;

			var terms = req.query.search;
			if (req.query.page) {
				pageNum = req.query.page;
			}
			if (req.query.limit) {
				itemsPerPage = 50; //req.query.limit;
			}

			let expression = '.*' + terms + '.*';
			let searchConditions = {
				"name": {
					$regex: expression,
					$options: 'i'
				},
				"is_enabled": true
			};

			Category.find(searchConditions)
				.count((err, count) => {
					return count
				})
				.then(count => {
					Category.find(searchConditions)
						.skip(itemsPerPage * (pageNum - 1))
						.limit(itemsPerPage)
						.exec((err, category) => {
							if (err)
								res.send(err);
							else
								res.json({
									'items': category,
									'count': count
								});
						})
				})
				.catch(err => {
					res.send(err);
				})
		});


	router.route('/categories/:id')
		.get((req, res) => {
			Category.findOne({
				'_id': req.params.id
			})
				.exec((err, category) => {
					if (err)
						res.send(err);
					else
						res.json(category);
				})
		})

		.put(auth, (req, res) => {
			Category.findOne({
				'_id': req.params.id
			}, (err, category) => {
				if (err) {
					res.send(err)
				}
				if (req.body._id) {
					req.body.lang[0].content.seo_url = category.lang[0].content.seo_url;
					category.name = req.body.name;
					category.description = req.body.description;
					if (req.body.book == 'empty') {
						category.featured_item = undefined;
					} else {
						category.featured_item = req.body.book;
					}
					category.meta_tag_title = req.body.meta_tag_title;
					category.banner = req.body.banner;
					category.meta_tag_description = req.body.meta_tag_description;
					category.meta_tag_keywords = req.body.meta_tag_keywords;
					category.is_enabled = req.body.is_enabled;
					category.hide_on_public = req.body.hide_on_public;
					category.is_show_home_tab = req.body.is_show_home_tab;
					category.is_show_feature_tab = req.body.is_show_feature_tab;
					category.order = req.body.order;
					category.lang = req.body.lang;
					category.image = req.body.image;
					category.soundex_code = soundexSen(req.body.name);

				}
				return category.save((err) => {
					if (err) {
						res.send(err)
					}
					return res.send(category)
				})
			})
		})

		.delete(auth, (req, res) => {
			Category.findByIdAndRemove({
				_id: req.params.id
			})
				.then(category => {
					var parentPromises = category.parents.map(parent_id => {
						return new Promise((resolve, reject) => {
							Category.update({
								_id: parent_id
							}, {
									$pull: {
										children: category._id
									}
								})
								.then(parent => {
									resolve()
								})
								.catch(err => {
									reject(err)
								})
						})
					});

					return Promise.all(parentPromises);
				})
				.then(() => {
					res.send({
						'message': 'Category Deleted',
						'status': true
					})
				})
				.catch(err => {
					res.json(err);
				})
		})

	router.route('/categories/feature-category/parent')
		.get((req, res) => {
			Category.find({
				parents: {
					$size: 0
				}
			})
				.exec((err, category) => {
					if (err)
						res.send(err)

					res.json(category)
				})
		})

	router.route('/featured-categories')
		.get((req, res) => {
			let initital_data = new Object();
			Category.aggregate([{
				$match: {
					"featured.status": true
				}
			},
			{
				$project: {
					_id: "$_id",
					name: "$name",
					hierarchy_path: "$hierarchy_path",
					featured: "$featured",
					import_id: '$import_id',
					book_count: { $size: '$book_list' }
				}
			},
			{
				$sort: {
					'featured.tab_priority': 1
				}
			}
			])
				.exec()
				.then(features => {
					initital_data.featured = features;
					return Category.count({
						"featured.status": false
					})
				})
				.then(total => {
					initital_data.categories = {
						count: total,
						items: []
					};
					return Category.aggregate([{
						$match: {
							"featured.status": false
						}
					},
					{
						$project: {
							_id: "$_id",
							name: "$name",
							hierarchy_path: "$hierarchy_path",
							featured: "$featured",
							import_id: '$import_id',
							book_count: { $size: '$book_list' }
						}
					},
					{
						$sort: { name: 1 }
					}
					])
						.limit(10)
				})
				.then(categories => {
					initital_data.categories.items = categories;
					res.json(initital_data);
				})
				.catch(err => {
					//console.log(err);
					res.json([]);
				})
		})

		.put((req, res) => {
			updateFeatures(req.body).then(updated => {
				res.json({
					success: true
				})
			})
		})

	function updateFeatures(items) {
		let upAfResults = items.map(itm => {
			return new Promise((resolve, reject) => {
				Category.findByIdAndUpdate({
					_id: itm._id
				}, {
						$set: {
							featured: itm.featured
						}
					})
					.exec()
					.then(upAfResult => {
						resolve(upAfResult)
					})
					.catch(err => {
						//console.log(err)
						resolve(err)
					})
			})
		})
		return Promise.all(upAfResults)
	}

	router.route('/unfeatured-categories')
		.get((req, res) => {
			var pageNum = 1,
				itemsPerPage = 10;
			var paginationHeader = req.headers['bz-feature-pagination'];
			var import_id = req.headers['import_id'];
			var name = req.headers['name'];
			let cond = new Object();
			cond['featured.status'] = false;
			if (import_id) {
				cond['import_id'] = parseInt(import_id);
			}
			if (name) {
				let expression = '.*' + name + '.*';
				cond['name'] = { $regex: expression };
			}
			if (paginationHeader) {
				pageNum = parseInt(paginationHeader);
			}
			let result = new Object();
			Category.count(cond)
				.exec()
				.then(count => {
					result.count = count;
					return Category.aggregate([
						{
							$match: cond
						},
						{
							$project: {
								_id: "$_id",
								name: "$name",
								hierarchy_path: "$hierarchy_path",
								import_id: '$import_id',
								book_count: { $size: '$book_list' }
							}
						}
					])
						.skip(itemsPerPage * (pageNum - 1))
						.limit(itemsPerPage)
				})
				.then(categories => {
					result.items = categories;
					res.json(result)
				})
				.catch(err => {
					res.send(err);
				});
		})

	router.route('/remove-feature/:id')
		.put((req, res) => {
			Category.findByIdAndUpdate({
				_id: req.params.id
			}, {
					$set: {
						featured: {
							status: false
						}
					}
				})
				.exec()
				.then(result => {
					res.json({
						success: true,
						result: result
					});
				})
				.catch(err => {
					//console.log(err);
					res.json({
						success: false
					});
				})
		})


	router.route('/featured_categorys')
		.get((req, res) => {
			let size = req.cookies.deviceName == 'desktop' ? '120X175' : '42X60';
			let imageSize = "$image." + size;
			Category.aggregate(
				[{
					$match: {
						'is_featured': true
					}
				},
				{
					$project: {
						name: "$name",
						image: imageSize,
						description: "$description",
						occupation: "$occupation",
						nationality: "$nationality",
						birth_place: "$birth_place",
						birth_at: "$birth_at",
						died_at: "$died_at",
						awards: "$awards",
					}
				},
				{
					$sort: {
						name: 1
					}
				}
				]
			)
				.exec((err, categorys) => {
					if (err) {
						res.send(err);
					} else {
						res.json(categorys);
					}
				});
		})


		.post(auth, (req, res) => {
			var featured_categorys = req.body;
			updateAuthors(featured_categorys).then(result => {
				res.json({
					success: true
				})
			}).catch(err => {
				res.json({
					message: err.message
				})
			})

		})

	router.route('/featured_categorys/:id')
		.put((req, res) => {
			Category.findOne({
				"_id": req.params.id
			})
				.exec((err, category) => {
					category.is_featured = false;
					category.featured_order = 0;
					// author.is_featured= req.body.is_featured;
					// author.featured_order= req.body.featured_order;
					return category.save((err) => {
						if (err)
							res.send(err)

						res.json({
							status: true
						});
					})
				})
		})


	function updateAuthors(categorys) {
		var categoryPromises = categorys.map((categoryObj, i) => {
			return new Promise((resolve, reject) => {
				Category.findOne({
					'_id': categoryObj._id
				})
					.exec((err, category) => {
						category.is_featured = true;
						category.featured_order = (i + 1);
						category.save((err) => {
							if (err) {
								reject(err);
							} else {
								resolve(true);
							}
						})
					})
			})
		})
		return Promise.all(categoryPromises);
	}

}
