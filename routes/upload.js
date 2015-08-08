var router = require('express').Router();
var AV = require('leanengine');
var fs = require('fs');
var rq = require('request');
var url = 'http://apicn.faceplusplus.com/v2/detection/detect?url={{url}}&api_secret=sV8kuCcQfXo25V66FhnRpyrQkKeHmXL1&api_key=06ce01a8c9983e360fedc11d635ee618';

var Photos = AV.Object.extend('Photos');
// 新增
router.post('/', function (req, res, next) {
    var file = req.files.file;
    var user = req.body.user;
    var avatar = req.body.avatar;

    if (file.size == 0) {
        fs.unlinkSync(file.path);
    } else {
        console.log(file);
        fs.readFile(file.path, function (err, data) {
            if (err) {
                res.json({
                    status: 'error',
                    message: '上传失败'
                });
            }
            var avFile = new AV.File(file.name, data);
            avFile.save().then(function (d) {
                fs.unlinkSync(file.path);
                rq.get(url.replace('{{url}}', d._url), function (err, data) {
                    if (err) {
                        res.json({
                            status: 'error',
                            message: '分析失败'
                        });
                    }

                    var photo = new Photos();
                    photo.set('file', avFile);
                    photo.set('res', data.body);
                    photo.set('user', user);
                    photo.set('avatar', avatar);
                    photo.save(null);
                    res.json({
                        status: 'success',
                        url: d._url,
                        res: JSON.parse(data.body)
                    });

                });
            });
        });
    }
});

module.exports = router;
