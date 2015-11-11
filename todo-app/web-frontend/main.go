package main

import (
	"encoding/json"
	"net/http"

	"github.com/codegangsta/negroni"
	"github.com/gorilla/mux"
	"github.com/xyproto/simpleredis"
	"gopkg.in/redis.v3"
)

var (
	masterPool *simpleredis.ConnectionPool
	slavePool  *simpleredis.ConnectionPool
)

func CreateRedisClient(addr string) *(redis.Client) {
	return redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: "", // no password set
		DB:       0,  // use default DB
	})
}

func ReadTodoHandler(rw http.ResponseWriter, req *http.Request) {
	key := mux.Vars(req)["key"]
	client := CreateRedisClient("redis-slave:6379")
	cmd := client.LRange(key, -100, 100)
	membersJSON, err := json.MarshalIndent(cmd.Val(), "", "  ") //.([]byte)
	if err != nil {
		panic(err)
	}
	rw.Write(membersJSON)
}

func InsertTodoHandler(rw http.ResponseWriter, req *http.Request) {
	key := mux.Vars(req)["key"]
	value := mux.Vars(req)["value"]
	client := CreateRedisClient("redis-master:6379")
	client.RPush(key, value)
	ReadTodoHandler(rw, req)
}

func DeleteTodoHandler(rw http.ResponseWriter, req *http.Request) {
	key := mux.Vars(req)["key"]
	value := mux.Vars(req)["value"]
	client := CreateRedisClient("redis-master:6379")
	client.LRem(key, 1, value)
	ReadTodoHandler(rw, req)
}

func main() {
	r := mux.NewRouter()
	r.Path("/read/{key}").Methods("GET").HandlerFunc(ReadTodoHandler)
	r.Path("/insert/{key}/{value}").Methods("GET").HandlerFunc(InsertTodoHandler)
	r.Path("/delete/{key}/{value}").Methods("GET").HandlerFunc(DeleteTodoHandler)

	n := negroni.Classic()
	n.UseHandler(r)
	n.Run(":3000")
}
