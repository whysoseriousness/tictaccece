var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var rooms = {}; // {room : {x : , o: }}

app.use(express.static('.'));

app.get('/', function(req, res){
	res.sendFile(__dirname+'/index.html');
});

io.on('connection', function(socket){
	console.log('connected');
	socket.on('chat message', function(message){ 	io.to(message["room"]).emit('chat message', message["body"]);	});
	socket.on('move',  function(data){ /*  move["player","piece"]; */   
		var room = data["room"];
		var move = data["move"];
		if(!rooms[room]){ rooms[room] = {};  }
		if(rooms[room]["x"] === socket.id){ 
			io.to(room).emit('move', {'piece' : 'x', 'place' : move});
			if(rooms[room]["o"]){ io.to(rooms[room]["o"]).emit("turn"); }
		} if(rooms[room]["o"] === socket.id){ 
			io.to(room).emit('move', {'piece' : 'o', 'place' : move});
			if(rooms[room]["x"]){ io.to(rooms[room]["x"]).emit("turn"); }
		}
	});
	socket.on('join',  function(room){
		socket.join(room);   
		io.to(room).emit('chat message', 'this room has one more butt'); 
		if(!rooms[room]){ rooms[room] = {};  }
		if(!rooms[room]["x"]){ 
			rooms[room]["x"] = socket.id;  
			io.to(room).emit('chat message', 'x has joined the game');
		}else if(!rooms[room]["o"]){ 
			rooms[room]["o"] = socket.id;  
			io.to(room).emit('chat message', 'o has joined the game');
			io.to(rooms[room]["o"]).emit("turn");
		} 
	});
	socket.on('disconnect', function(room){ // Warning: you can't pass room to this function so it doesn't work
		console.log('disconnected');
		socket.leave(room);  
		io.to(room).emit('chat message', 'this room has one less butt'); 
		if(!rooms[room]){ rooms[room] = {};  }
		if(rooms[room]["x"] === socket.id){ 
			rooms[room]["x"] = false;  
			io.to(room).emit('chat message', 'x has left the game');
		} if(rooms[room]["o"] === socket.id){ 
			rooms[room]["o"] = false;  
			io.to(room).emit('chat message', 'o has left the game');
		} 
	});

});

http.listen(1993, function(){
	console.log('listening on *:1993');
});
