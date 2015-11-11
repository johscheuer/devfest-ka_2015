//ALlow Cors Access
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

var express = require('express'),
    http = require('http'),
    redis = require('redis');

var app = express();
app.use(allowCrossDomain);

console.log("Connect to: " + process.env.REDISMASTER_PORT_6379_TCP_ADDR + ":" + process.env.REDISMASTER_PORT_6379_TCP_PORT)
console.log("Connect to: " + process.env.REDISSLAVE_PORT_6379_TCP_ADDR + ":" + process.env.REDISSLAVE_PORT_6379_TCP_PORT)

var master_client = redis.createClient(process.env.REDISMASTER_PORT_6379_TCP_PORT, process.env.REDISMASTER_PORT_6379_TCP_ADDR);
var slave_client = redis.createClient(process.env.REDISSLAVE_PORT_6379_TCP_PORT, process.env.REDISSLAVE_PORT_6379_TCP_ADDR);

// Creates a new todo in redis
app.put('/', function (req, res) {
  master_client.rpush("todos", req.query.todo, function(err, reply) {
		if (err) {
			console.log("Error: " + err)
			res.statusCode = 500;
		}
  });
  res.send('Created ' + req.query.todo);
});

// deletes a todo in redis
app.delete('/', function (req, res) {
  master_client.lrem("todos", 1, req.query.todo, function(err, reply) {
		if (err) {
			console.log("Error: " + err)
			res.statusCode = 500;
		}
  });
  res.send('Deleted ' + req.query.todo);
});

// gets (nearly) all todos :)
app.get('/', function(req, res) {
	slave_client.lrange('todos', -100, 100, function(err, reply) {
		res.statusCode = 200;
		res.send(JSON.stringify(reply, null, 2));
    });
});

http.createServer(app).listen(9090, function() {
  console.log('Listening on port 9090');
  slave_client.lrange('todos', -100, 100, function(err, reply) {
		console.log(JSON.stringify(reply, null, 2));
    });
});

master_client.on("error", function (err) {
  console.log("Error " + err);
});

slave_client.on("error", function (err) {
  console.log("Error " + err);
});
