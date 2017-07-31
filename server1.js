/**
 * Created by Administrator on 2017/7/25.
 */
var express=require('express');
var http=require('http');
var fs=require('fs');
var url=require('url');
var app=express();
app.use(express.static('public1'));
var server=http.createServer(app).listen(8888);
var io=require('socket.io').listen(server);
var mine=require('./mine').types;
var dataBase={
    user:[],
    userList:[
        {
            id:1,
            name:'官方客服',
            img:'dist/images/2.png'
        }
    ],
    sessionList:[
        {
            userId: 1,
            messages: [
                {
                    text: 'Hello，你好！',
                    date: new Date(),
                    name:'官方客服',
                },
            ]
        },
    ]
}
app.get('/',function(req,res){
    res.sendFile(__dirname+'/index1.html');
})
io.sockets.on('connection',function(socket){

    socket.on('newUser',function(data){
        console.log(data.userM.name==''||data.userM.password=='');
            if(data.userM.name==''||data.userM.password==''){
                socket.emit('empty');
                return;
            }
            for(var i=0;i<dataBase.userList.length;i++){
                if(dataBase.userList[i].name==data.chatM.name){
                    socket.emit('reLogin');
                    return;
                }
            }
            for(var z=0;z<dataBase.user.length;z++){
                if(data.userM.name==dataBase.user[z].name&&data.userM.password==dataBase.user[z].password){
                    var usermessage=dataBase.user[z];
                    socket.emit('user',usermessage);
                    if(data.chatM.name!=''){
                        dataBase.userList.push(data.chatM);
                        var session={
                            userId:data.chatM.id,
                            messages:[]
                        };
                        dataBase.sessionList.push(session);
                    }
                    socket.emit('start',dataBase);
                    io.sockets.emit('data',dataBase);
                    return;
                }
            }
            for(var j=0;j<dataBase.user.length;j++){
                if(data.userM.name==dataBase.user[j].name){
                    socket.emit('reName');
                    return;
                }
            }
            if(data.chatM.name!=''){
            dataBase.userList.push(data.chatM);
            var session={
                userId:data.chatM.id,
                messages:[]
            };
            dataBase.sessionList.push(session);
            }

        dataBase.user.push(data.userM);
        socket.emit('start',dataBase);
        io.sockets.emit('data',dataBase);

    });
    socket.on('addMessage',function (data) {
        dataBase.sessionList[data.index].messages.push(data.message);
        io.sockets.emit('newdata',dataBase);
    })
})