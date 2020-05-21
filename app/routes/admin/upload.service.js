import config from '../../../config/config.json';

var url = require('url'),
  fs = require('fs-extra'),
  im = require('imagemagick'),
  md5 = require('md5'),
  formidable = require('formidable'),
  dir = config.IMAGE_UPLOAD_PATH,
  gm = require('gm');
// watermark = require('image-watermark');


function defaultImageConfig(id, model, imageIndex, imageSizes) {
  var _id = id;
  var defaultImageConfig = {
    image: {
      'fields': {
        'url': false,
        'directory': false,
        'type': false,
        'size': false,
        'fileName': 'image_url',
        'thumbName': 'thumb_url',
        'resize': imageSizes
      },
      'filePath': false,
    },
    removeFileOnUpdate: true,
    removeFileOnDelete: true,
    field: _id,
    path: config.IMAGE_UPLOAD_PATH + model + '/' + imageIndex + '/' + _id + '/image/',
    pathResize: config.IMAGE_UPLOAD_PATH + model + '/' + imageIndex + '/' + _id + '/',
    directory: 'image'
  };
  return defaultImageConfig;
}

var imageConfig = new defaultImageConfig();
var file_name;

function formEndPromise(fields, files, form, model, import_id, imageIndex, imageSizes) {

  var temp_path = form.openedFiles[0].path;
  file_name = form.openedFiles[0].name;
  let extention = file_name.split('.');
  let getExt = extention[extention.length - 1];
  file_name = import_id + "." + 'png';
  var _id = import_id;
  imageConfig = new defaultImageConfig(_id, model, imageIndex, imageSizes);
  var destination = imageConfig.path + file_name;


  var copyPromise = new Promise(function (resolve, reject) {
    fs.copy(temp_path, destination, function (err) {
      if (err) {
        reject(err);
      } else {
        imageConfig.uploadImg = imageConfig.path + file_name;
        var mk = rowCollections(imageConfig.image.fields.resize);
        if (mk == 1) {
          rowCollections(imageConfig.image.fields.resize, 1);
        }
        let imagePaths = {}
        for (var key in imageSizes) {
          if (imageSizes.hasOwnProperty(key)) {
            let dimension = imageSizes[key].directory
            imagePaths[dimension] = "/images/" + model + "/" + imageIndex + "/" + _id + "/" + dimension + "/" + file_name;
          }
        }
        resolve(imagePaths)
      }
    });
  });

  return copyPromise;
}

export function uploader(req, imageDirectory, import_id, imageIndex, imageSizes) {
  return new Promise((resolve, reject) => {
    var _id;
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      req.image_id = _id;
    });

    form.on('end', function (fields, files) {
      formEndPromise(fields, files, this, imageDirectory, import_id, imageIndex, imageSizes).then(response => {
        resolve(response);
      })
    });
  })
}

function rowCollections(resizeSize, callback, res) {
  var success;
  for (var k in resizeSize) {
    if (resizeSize.hasOwnProperty(k)) {
      var thumb = imageConfig.pathResize + resizeSize[k].directory + '/';
      if (callback == 1) {
        let dimensions = {
          width: resizeSize[k].width,
          height: resizeSize[k].height,
          quality: resizeSize[k].quality
        };
        dimensions = sizeOfImages(dimensions, resizeSize[k].width);
        resizeimg(imageConfig.pathResize + resizeSize[k].directory + '/', dimensions);
        success = '10';
      } else {
        fs.mkdirs(thumb, function (err) {
          if (err) return console.error(err);
        });
        success = '1';
      }
    }
  }
  return success;
}



function sizeOfImages(dimensions, widthValue) {
  var width;
  var height;
  var w1 = dimensions.width;
  var h1 = dimensions.height;
  if (w1 >= widthValue) {
    let newWidth = widthValue;
    let percent = newWidth / w1;
    let newHeight = Math.round((percent * h1));
    width = newWidth;
    height = newHeight;
  } else {
    width = w1;
    height = h1;
  }

  return {
    width: width,
    height: height,
    quality: dimensions.quality
  };
}


function resizeimg(thumb, dimensions) {
  var fullpath = imageConfig.uploadImg;
  // *********************Attempt of dynamically adding banner. Don't remove this code**************************
  // thumb = thumb + file_name;
  // var options = {
  //     'text' : 'boibazar.com', 
  //     'dstPath' : thumb,
  //     'resize' : '50%', 
  //     'color' : '#54cc5f'
  // };
  // watermark.embedWatermark(fullpath, options);
  // ******************************************************GM************************************************************

  
  thumb = thumb + file_name;
  gm(fullpath)
    .draw([config.WATERMARK_PATH_STRING])
    .resize(dimensions.width, dimensions.height)
    .quality(dimensions.quality)
    .write(thumb, function (err) {
      if (err) {
        console.log(err);
      }
    });


  // ********************************************************

  // fs.readFile(fullpath, function (err, data) {
  //     fs.writeFile(fullpath, data, function (err) {
  //         thumb = thumb + file_name;
  //         im.resize({
  //             srcPath: fullpath,
  //             dstPath: thumb,
  //             width: dimensions.width,
  //             height: dimensions.height,
  //             quality: dimensions.quality,
  //         }, function (err, stdout, stderr) {
  //             if (err) throw err;
  //         });
  //     });
  // });


}

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}
