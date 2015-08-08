$(function () {
    var ref = new Wilddog("https://feeloc-face.wilddogio.com/comments");
    var photos = null;

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

    var addComment = function () {
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

            });
        }
    };

    var afterAddComment = function () {
        setTimeout(function () {
            comment.commentText = '';
            $commentContent.scrollTop($commentContent[0].scrollHeight - $commentContent.height() - 40);
        }, 10);
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
        comment.comments = d.comments;
        afterAddComment();
    }, 'json');

    var uploadDialog = $('.modal.small').modal({
        blurring: true
    });
    $('.upload').click(function () {
        uploadDialog.modal('show');
        _upload(names[random()], avatars[random()], function (d) {
            var faces = d.res.face;
            var svg = '<svg width="' + d.res.img_width + '" height="' + d.res.img_height + '">';
            for (var i = 0; i < faces.length; i++) {
                $('#showPhoto .gender').html(faces[i].attribute.gender.value == 'Female' ? '女' : '男');
                $('#showPhoto .age').html(faces[i].attribute.age.value);
                $('#showPhoto .smile').html(faces[i].attribute.smiling.value);
                svg += '<path stroke="#0877cf" class="line line-show" fill="none" stroke-width="2" stroke-linecap="round"' +
                    'stroke-linejoin="round" stroke-miterlimit="10"' +
                    'd="M' + (faces[i].position.center.x - faces[i].position.width / 2) + ',' + (faces[i].position.center.y - faces[i].position.height / 2) + 'L230,140">' +
                    '</path>'
            }
            svg += '</svg>';
            $('.image-preview').append(svg);
            photos.photos.unshift(d);
        });
    });

    $('.click-here').click(function () {
        $('.ui.labeled.icon.sidebar')
            .sidebar('toggle')
        ;
    });

    $.get('/photos',function(d){
        photos = new Vue({
            el: '.cards',
            data: {
                photos: d.photos
            },
            methods: {
                getDate: function(time){
                    return moment(time).format('MM-DD')
                },
                openPhoto: function(photo){
                    uploadDialog.modal('show');
                    $('#showPhoto .image-preview').html('<img src="'+photo.file.url+'"/>');

                    var res = JSON.parse(photo.res);
                    var faces = res.face;
                    var svg = '<svg width="' + res.img_width + '" height="' + res.img_height + '">';
                    for (var i = 0; i < faces.length; i++) {
                        $('#showPhoto .gender').html(faces[i].attribute.gender.value == 'Female' ? '女' : '男');
                        $('#showPhoto .age').html(faces[i].attribute.age.value);
                        $('#showPhoto .smile').html(faces[i].attribute.smiling.value);
                        svg += '<path stroke="#0877cf" class="line line-show" fill="none" stroke-width="2" stroke-linecap="round"' +
                            'stroke-linejoin="round" stroke-miterlimit="10"' +
                            'd="M' + (faces[i].position.center.x - faces[i].position.width / 2) + ',' + (faces[i].position.center.y - faces[i].position.height / 2) + 'L230,140">' +
                            '</path>'
                    }
                    svg += '</svg>';
                    $('.image-preview').append(svg);
                }
            }
        });
    })
});