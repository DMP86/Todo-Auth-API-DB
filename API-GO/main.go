package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"
	"web/poolPgx"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/streadway/amqp"
)

var Pool, errr = poolPgx.Pgx()

var Conn, er = Ampq()

const SecretKey = "SuperSecretKey"

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func main() {

	if errr != nil {
		fmt.Fprintln(os.Stderr, "Error acquiring connection:", errr)
		os.Exit(1)
	}
	defer Pool.Close()

	failOnError(er, "Failed to connect to RabbitMQ")
	defer Conn.Close()

	ch, err := Conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	_, err = ch.QueueDeclare(
		"auth", // name
		false,  // durable
		false,  // delete when unused
		false,  // exclusive
		false,  // no-wait
		nil,    // arguments
	)
	failOnError(err, "Failed to declare a queue")
	ch.Close()

	//Ctx()tcp()get()Proto()RPC()Server()
	//poolPgx()

	r := mux.NewRouter()

	fs := http.FileServer(http.Dir("static"))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))

	r.HandleFunc("/", HomeHandler)
	r.HandleFunc("/auth", Auth).Methods("POST")
	r.HandleFunc("/reg", RegHandler).Methods("POST")

	apiRouter := r.PathPrefix("/api").Subrouter()
	apiRouter.Use(Authorize)
	apiRouter.HandleFunc("", TodoGet).Methods("GET")
	apiRouter.HandleFunc("", TodoDel).Methods("DELETE")
	apiRouter.HandleFunc("", TodoPut).Methods("PATCH")
	apiRouter.HandleFunc("", TodoPost).Methods("POST")

	server := http.Server{
		Addr:           ":8000",
		Handler:        handlers.LoggingHandler(os.Stdout, r),
		ReadTimeout:    10 * time.Second, //Accept-RequestBody
		WriteTimeout:   10 * time.Second, // http: ReqBody-response, !https:Accept-Responce
		MaxHeaderBytes: 1 << 30,
	}

	errShutdown := make(chan error, 1)

	go func() {
		fmt.Println(os.Getpid())
		err := server.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			errShutdown <- err
		}
	}()

	osShutdown := make(chan os.Signal, 1)
	signal.Notify(osShutdown, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-errShutdown:
		fmt.Println("Received err", err)
	case sig := <-osShutdown:
		fmt.Println("Received sig", sig)
	}

	timeout, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	er = server.Shutdown(timeout)
	fmt.Println()

}

func HomeHandler(w http.ResponseWriter, r *http.Request) {

	http.ServeFile(w, r, "static/index.html")

}

func Auth(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}

	ch, err := Conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	id := RandStr(10)
	_, err = ch.QueueDeclare(
		id,    // name
		false, // durable
		true,  // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)

	failOnError(err, "Failed to register a consumer")

	err = ch.Publish(
		"",     // exchange
		"auth", // routing key
		false,  // mandatory
		false,  // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
			MessageId:   id,
		})
	failOnError(err, "Failed to declare a queue")

	msgs, err := ch.Consume(
		id,    // queue
		"",    // consumer
		true,  // auto-ack
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	failOnError(err, "Failed to register a consumer")

	select {
	case d := <-msgs:
		if d.MessageId != "200" {
			status, _ := strconv.Atoi(d.MessageId)
			http.Error(w, string(d.Body), status)
			return
		}
		jsToken := Token{Token: string(d.Body)}
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(jsToken)
	case <-time.After(1 * time.Second):
		ch.QueueDelete(id, true, true, true)
		fmt.Println("timeout")
	}

}

type Token struct {
	Token string
}
