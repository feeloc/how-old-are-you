var router = require('express').Router();
var AV = require('leanengine');

// `AV.Object.extend` 方法一定要放在全局变量，否则会造成堆栈溢出。
// 详见： https://leancloud.cn/docs/js_guide.html#对象
var Photos = AV.Object.extend('Photos');

// 查询
router.get('/', function (req, res, next) {
    var query = new AV.Query(Photos);
    //query.descending('createdAt');
    query.find({
        success: function (results) {
            res.json({
                photos: results
            });
        },
        error: function (err) {
            if (err.code === 101) {
                res.json({
                    photos: []
                });
            } else {
                next(err);
            }
        }
    });
});

module.exports = router;
