$(function () {
    var ref = new Wilddog("https://feeloc-face.wilddogio.com/comments");

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
        '/i/matt.jpg',
        '/i/elliot.jpg',
        '/i/joe.jpg'
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
                        console.log(d);
                    });
                }
            }
        }
    });

    ref.on('value', function (datasnapshot) {
        if (!!datasnapshot.val()) {
            comment.comments.push(datasnapshot.val());
            setTimeout(function () {
                comment.commentText = '';
                $commentContent.scrollTop($commentContent[0].scrollHeight);
            }, 10);
        }
    });

    ref.set({});
    $.get('/comments', function (d) {
        comment.comments = d.comments;
    }, 'json');

    $('.upload').click(function () {
        $('.modal.small').modal({
            blurring: true
        }).modal('show');
        _upload();
    });

    $('.click-here').click(function () {
        $('.ui.labeled.icon.sidebar')
            .sidebar('toggle')
        ;
    });
});