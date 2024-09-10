(function ($) {
    // 加载聊天窗口样式
    var style = document.createElement('style');
    style.innerHTML = `
        #chat {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            height: 400px;
            border-radius: 10px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            transition: all 0.4s ease-in-out;
            overflow: hidden;
        }
        #chat.minimized {
            height: 40px;
            background: rgba(255, 255, 255, 0.7);
        }
        #chat_top {
            background: linear-gradient(45deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.9));
            color: rgba(255, 255, 255, 0.9);
            padding: 10px;
            text-align: center;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
            transition: background 0.3s ease-in-out;
        }
        #chat_top:hover {
            background: linear-gradient(45deg, rgba(76, 175, 80, 1), rgba(56, 142, 60, 1));
        }
        #chat_message {
            flex: 1;
            padding: 10px;
            overflow-y: auto;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            background-color: rgba(245, 245, 245, 0.9);
            transition: background-color 0.3s ease;
        }
        .message_service, .message_custom {
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.85);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        #chat_input {
            width: calc(100% - 20px);
            margin: 10px;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            background: rgba(255, 255, 255, 0.8);
            box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        #send {
            margin: 10px;
            padding: 10px;
            background: linear-gradient(45deg, rgba(76, 175, 80, 0.8), rgba(56, 142, 60, 0.8));
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        #send:hover {
            background: linear-gradient(45deg, rgba(76, 175, 80, 1), rgba(56, 142, 60, 1));
        }
        #close-btn {
            position: absolute;
            top: 5px;
            right: 10px;
            cursor: pointer;
            font-size: 18px;
            color: rgba(255, 255, 255, 0.8);
            transition: color 0.3s ease;
        }
        #close-btn:hover {
            color: rgba(255, 255, 255, 1);
        }
    `;
    document.head.appendChild(style);

    // 创建聊天窗口HTML结构
    var chatWidget = document.createElement('div');
    chatWidget.id = 'chat';
    chatWidget.innerHTML = `
        <div id="chat_top">
            <span id="isOnline">在线客服为您服务（在线）</span>
            <span id="close-btn">-</span>
        </div>
        <div id="chat_message"></div>
        <textarea id="chat_input" placeholder="请输入您的消息..."></textarea>
        <button id="send">发送</button>
    `;
    document.body.appendChild(chatWidget);

    // 点击顶部栏收起或展开聊天窗口
    $('#chat_top').on('click', function () {
        $('#chat').toggleClass('minimized');
        $('#close-btn').text($('#chat').hasClass('minimized') ? '+' : '-');
    });

    // 连接到Socket.io的客服命名空间
    var socket = io('http://127.0.0.1:8080/custom'); // 替换为你的服务器地址

    // 检查客服是否在线
    socket.on("isOnline", function (msg) {
        if(msg == false) {
           $('#isOnline').text("客服当前不在线");
           $('#chat_input').attr('disabled', 'disabled');
        }
    });

    // 监听服务器发来的客服消息
    socket.on("new_message", function (msg) {
        var $chat = $('#chat_message');   //获取聊天框
        var $message = $('<div class="message_service"></div>');
        $message.append(`
            <div class="service_left">
                <img src="http://127.0.0.1:8080/images/service_head.jpeg" class="service_head">
            </div>
            <div class="service_right">
                <div class="message_time">${msg.time}</div>
                <div class="service_message_contain">${msg.message}</div>
            </div>
        `);
        $chat.append($message).append("<div style='clear:both'></div>"); //清除浮动用的div
        $chat.scrollTop($chat[0].scrollHeight);  //滚动条置底
    });

    // 点击发送按钮，发送信息给在线客服
    $("#send").bind("click", function () {
        var message = $('#chat_input').val();
        if (message.trim() !== "") {
            var time = new Date().toLocaleTimeString();  // 获得发送时间
            var $chat = $('#chat_message');   // 获得聊天信息框准备插入新数据

            // 把数据通过socket.io发送给后台
            socket.emit('message_custom', {'message': message, 'time': time});

            // 清空输入框
            $('#chat_input').val("");         

            // 在页面上显示用户消息
            var $message = $('<div class="message_custom"></div>');
            $message.append(`
                <div class="custom_right">
                    <img src="http://127.0.0.1:8080/images/custom_head.jpg" class="service_head">
                </div>
                <div class="custom_left">
                    <div class="message_time">${time}</div>
                    <div class="custom_message_contain">${message}</div>
                </div>
            `);
            $chat.append($message).append("<div style='clear:both'></div>"); // 清除浮动用的div
            $chat.scrollTop($chat[0].scrollHeight);  // 滚动条置底
            $('#chat_input').focus();  // 聚焦到输入框
        }
    });

})(jQuery);
