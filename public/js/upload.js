/**
 * Created by hujianmeng on 15/8/7.
 */
var _upload = function (user, avatar, callback) {
    var $wrap = $('#uploader'),

    // 图片容器
    $queue = $wrap.find('.image-preview'),

    $statusBar = $wrap.find('.statusBar'),

    $info = $statusBar,

    // 上传按钮
    $upload = $wrap.find('.upload-analyze'),

    // 没选择文件之前的内容。
    $placeHolder = $wrap.find('.placeholder'),

    // 添加的文件数量
    fileCount = 0,

    // 添加的文件总大小
    fileSize = 0,

    // 可能有pedding, ready, uploading, confirm, done.
    state = 'pedding',

    // 所有文件的进度信息，key为file id
    percentages = {},
    // 判断浏览器是否支持图片的base64
    isSupportBase64 = (function () {
        var data = new Image();
        var support = true;
        data.onload = data.onerror = function () {
            if (this.width != 1 || this.height != 1) {
                support = false;
            }
        };
        data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        return support;
    })(),

    // 检测是否已经安装flash，检测flash的版本
    flashVersion = (function () {
        var version;

        try {
            version = navigator.plugins['Shockwave Flash'];
            version = version.description;
        } catch (ex) {
            try {
                version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
                    .GetVariable('$version');
            } catch (ex2) {
                version = '0.0';
            }
        }
        version = version.match(/\d+/g);
        return parseFloat(version[0] + '.' + version[1], 10);
    })(),

    supportTransition = (function () {
        var s = document.createElement('p').style,
        r = 'transition' in s ||
            'WebkitTransition' in s ||
            'MozTransition' in s ||
            'msTransition' in s ||
            'OTransition' in s;
        s = null;
        return r;
    })(),

    // WebUploader实例
    uploader;

    if (!WebUploader.Uploader.support('flash') && WebUploader.browser.ie) {

        // flash 安装了但是版本过低。
        if (flashVersion) {
            (function (container) {
                window['expressinstallcallback'] = function (state) {
                    switch (state) {
                        case 'Download.Cancelled':
                            alert('您取消了更新！');
                            break;

                        case 'Download.Failed':
                            alert('安装失败');
                            break;

                        default:
                            alert('安装已成功，请刷新！');
                            break;
                    }
                    delete window['expressinstallcallback'];
                };

                var swf = './expressInstall.swf';
                // insert flash object
                var html = '<object type="application/' +
                    'x-shockwave-flash" data="' + swf + '" ';

                if (WebUploader.browser.ie) {
                    html += 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ';
                }

                html += 'width="100%" height="100%" style="outline:0">' +
                    '<param name="movie" value="' + swf + '" />' +
                    '<param name="wmode" value="transparent" />' +
                    '<param name="allowscriptaccess" value="always" />' +
                    '</object>';

                container.html(html);

            })($wrap);

        } else {
            $wrap.html('<a href="http://www.adobe.com/go/getflashplayer" target="_blank" border="0"><img alt="get flash player" src="http://www.adobe.com/macromedia/style_guide/images/160x41_Get_Flash_Player.jpg" /></a>');
        }

        return;
    } else if (!WebUploader.Uploader.support()) {
        alert('Web Uploader 不支持您的浏览器！');
        return;
    }

    // 实例化
    uploader = WebUploader.create({
        pick: {
            id: '#filePicker',
            label: '选择图片'
        },
        formData: {
            user: user,
            avatar: avatar
        },
        dnd: '#dndArea',
        paste: '#uploader',
        swf: '../webupload/Uploader.swf',
        chunked: false,
        chunkSize: 512 * 1024,
        server: '/upload',
        // runtimeOrder: 'flash',

        accept: {
            title: 'Images',
            extensions: 'jpg,jpeg,bmp,png',
            mimeTypes: 'image/*'
        },

        // 禁掉全局的拖拽功能。这样不会出现图片拖进页面的时候，把图片打开。
        disableGlobalDnd: true,
        fileNumLimit: 2,
        fileSizeLimit: 5 * 1024 * 1024,    // 200 M
        fileSingleSizeLimit: 2 * 1024 * 1024,    // 50 M
        success: callback
    });

    // 拖拽时不接受 js, txt 文件。
    uploader.on('dndAccept', function (items) {
        var denied = false,
        len = items.length,
        i = 0,
        // 修改js类型
        unAllowed = 'text/plain;application/javascript ';

        for (; i < len; i++) {
            // 如果在列表里面
            if (~unAllowed.indexOf(items[i].type)) {
                denied = true;
                break;
            }
        }

        return !denied;
    });

    uploader.on('ready', function () {
        window.uploader = uploader;
    });

    // 当有文件添加进来时执行，负责view的创建
    function addFile(file) {
        var $wrap = $queue,
        $info = $('<p class="error"></p>'),

        showError = function (code) {
            switch (code) {
                case 'exceed_size':
                    text = '文件大小超出';
                    break;

                case 'interrupt':
                    text = '上传暂停';
                    break;

                default:
                    text = '上传失败，请重试';
                    break;
            }

            $info.text(text).appendTo($wrap);
        };

        if (file.getStatus() === 'invalid') {
            showError(file.statusText);
        } else {
            // @todo lazyload
            $wrap.text('预览中');
            uploader.makeThumb(file, function (error, src) {
                var img;

                if (error) {
                    $wrap.text('不能预览');
                    return;
                }

                if (isSupportBase64) {
                    img = $('<img src="' + src + '">');
                    $wrap.empty().append(img);
                } else {
                    $.ajax('../../server/preview.php', {
                        method: 'POST',
                        data: src,
                        dataType: 'json'
                    }).done(function (response) {
                        if (response.result) {
                            img = $('<img src="' + response.result + '">');
                            $wrap.empty().append(img);
                        } else {
                            $wrap.text("预览出错");
                        }
                    });
                }
            }, 1, 1);

            percentages[file.id] = [file.size, 0];
        }
    }

    function updateTotalProgress() {
        var loaded = 0,
        total = 0;

        $.each(percentages, function (k, v) {
            total += v[0];
            loaded += v[0] * v[1];
        });

        updateStatus();
    }

    function updateStatus() {
        var text = '', stats;

        if (state === 'ready') {
            text = '选中' + fileCount + '张图片，共' +
                WebUploader.formatSize(fileSize);
        } else if (state === 'uploading') {
            text = '上传分析中……'
        } else if (state == 'finish') {
            stats = uploader.getStats();
            text = '上传分析成功^_^';

            if (stats.uploadFailNum) {
                text = '上传失败';
            }
        }

        $info.html(text);
    }

    function setState(val) {
        var stats;

        if (val === state) {
            return;
        }

        $upload.removeClass('state-' + state);
        $upload.addClass('state-' + val);
        state = val;

        switch (state) {
            case 'pedding':
                $queue.hide();
                uploader.refresh();
                break;

            case 'ready':
                $queue.show();
                uploader.refresh();
                break;

            case 'uploading':
                break;

            case 'paused':
                break;

            case 'confirm':
                stats = uploader.getStats();
                if (stats.successNum && !stats.uploadFailNum) {
                    setState('finish');
                    return;
                }
                break;
            case 'finish':
                stats = uploader.getStats();
                if (stats.successNum) {

                } else {
                    state = 'done';
                }
                break;
        }

        updateStatus();
    }

    uploader.onUploadProgress = function (file, percentage) {
        var $li = $('#' + file.id),
        $percent = $li.find('.progress span');

        $percent.css('width', percentage * 100 + '%');
        percentages[file.id][1] = percentage;
        updateTotalProgress();
    };

    uploader.onFileQueued = function (file) {
        fileCount++;
        fileSize += file.size;

        if (fileCount === 1) {
            $placeHolder.addClass('element-invisible');
        }

        addFile(file);
        setState('ready');
        updateTotalProgress();
    };

    uploader.on('all', function (type) {
        var stats;
        switch (type) {
            case 'uploadFinished':
                setState('confirm');
                break;

            case 'startUpload':
                setState('uploading');
                break;

            case 'uploadProgress':
                setState('uploading');
                break;

            case 'stopUpload':
                setState('paused');
                break;

        }
    });

    uploader.on('uploadSuccess', function (file, response) {
        callback($.extend(response, {
            user: user,
            avatar: avatar,
            file: {url: response.url},
            likeCount: 0,
            commentCount: 0
        }));
    });

    uploader.onError = function (code) {
        alert('Eroor: ' + code);
    };

    $upload.on('click', function () {
        if ($(this).hasClass('disabled')) {
            return false;
        }

        if (state === 'ready') {
            uploader.upload();
        } else if (state === 'paused') {
            uploader.upload();
        } else if (state === 'uploading') {
            uploader.stop();
        }
    });

    $info.on('click', '.retry', function () {
        uploader.retry();
    });

    $info.on('click', '.ignore', function () {
        alert('todo');
    });

    $upload.addClass('state-' + state);
    updateTotalProgress();
};