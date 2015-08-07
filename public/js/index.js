$(function () {
    var ref = new Wilddog("https://feeloc-face.wilddogio.com/message");

    var width = $(window).width();
    var height = $(window).height();
    var topMenuHeight = $('.top.menu').outerHeight();

    var $cards = $('.ui.cards');
    var $comments = $('.ui.comments');
    var $commentContainer = $comments.parent();
    var $commentContent = $('.comment-content');

    $cards.css({height: height - topMenuHeight - 20});
    $comments.css({height: $commentContainer.height()});
    $commentContent.css({height: $('.four.column').height() - $('h3').outerHeight() - $('form').outerHeight()});

    var names = ['张三', '李四', '王二麻子'];
    var avatars = [
        'http://semantic-ui.com/images/avatar/small/matt.jpg',
        'http://semantic-ui.com/images/avatar/small/elliot.jpg',
        'http://semantic-ui.com/images/avatar/small/joe.jpg'
    ];

    var random = function () {
        return Math.floor(Math.random() * 3);
    };

    var comment = new Vue({
        el: '.comments',
        data: {
            comments: [
            ],
            commentText: ''
        },
        methods: {
            add: function () {
                if (comment.commentText != '') {
                    ref.set({
                        time: moment().format('MM-DD, HH:mm'),
                        content: comment.commentText,
                        name: names[random()],
                        avatar: avatars[random()]
                    });
                }
            }
        }
    });

    ref.on('value', function (datasnapshot) {
        comment.comments.push(datasnapshot.val());
        setTimeout(function () {
            comment.commentText = '';
            $commentContent.scrollTop($commentContent[0].scrollHeight);
        }, 10);
    });
});