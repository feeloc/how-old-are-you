var router = require('express').Router();
var AV = require('leanengine');

// `AV.Object.extend` 方法一定要放在全局变量，否则会造成堆栈溢出。
// 详见： https://leancloud.cn/docs/js_guide.html#对象
var Comments = AV.Object.extend('Comments');

// 查询
router.get('/', function (req, res, next) {
    var query = new AV.Query(Comments);
    //query.descending('createdAt');
    query.find({
        success: function (results) {
            res.json({
                comments: results
            });
        },
        error: function (err) {
            if (err.code === 101) {
                res.json({
                    comments: []
                });
            } else {
                next(err);
            }
        }
    });
});

// 新增
router.post('/', function (req, res, next) {
    var data = JSON.parse(req.body.data);
    var comment = new Comments();
    comment.set('name', data.name);
    comment.set('avatar', data.avatar);
    comment.set('time', data.time);
    comment.set('content', data.content);
    comment.save(null, {
        success: function () {
            res.json({status: 'success'});
        },
        error: function (err) {
            next(err);
        }
    })
});

module.exports = router;
