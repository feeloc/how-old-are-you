$(function () {
    var ref = new Wilddog("https://feeloc-face.wilddogio.com/comments");
    //var height = $(window).height() - 20;

    //var $comments = $('.ui.comments');
    //var $commentContent = $('.comment-content');

    //$comments.css({height: height});
    //$commentContent.css({height: height - $('h3').outerHeight() - $('form').outerHeight()});

    var names = ['张三', '李四', '王二麻子'];
    var avatars = [
        '/i/matt.jpg',
        '/i/elliot.jpg',
        '/i/joe.jpg'
    ];

    var random = function () {
        return Math.floor(Math.random() * 3);
    };

    var addComment = function () {
        if (comment.commentText != '') {
            comment.add = 0;
            var content = {
                time: moment().format('MM-DD, HH:mm'),
                content: comment.commentText,
                name: names[random()],
                avatar: avatars[random()]
            };
            ref.set(content);
            $.post('/comments', {
                data: JSON.stringify(content)
            }, function (d) {

            });
        }
    };

    var afterAddComment = function () {
        setTimeout(function () {
            comment.commentText = '';
            //$commentContent.scrollTop($commentContent[0].scrollHeight - $commentContent.height() - 50);
        }, 10);
    };

    var comment = new Vue({
        el: '.comments',
        data: {
            comments: [],
            commentText: '',
            add: 1
        },
        methods: {
            add: function () {
                addComment();
            },
            addByKey: function (e) {
                if (e.keyCode == 13 && e.ctrlKey) {
                    addComment();
                }
            }
        }
    });

    ref.on('value', function (datasnapshot) {
        if (!!datasnapshot.val()) {
            comment.comments.push(datasnapshot.val());
            afterAddComment();
        }
    });

    ref.set({});

    $.get('/comments', function (d) {
        var length = d.comments.length;
        var count = 0;
        var timer = setInterval(function () {
            comment.comments.push(d.comments[count]);
            count++;
            afterAddComment();
            if (count + 1 == length) {
                clearInterval(timer);
            }
        }, 1000);
    }, 'json');
});