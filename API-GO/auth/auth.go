package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"
	"web/easy"
	"web/poolPgx"

	"github.com/dgrijalva/jwt-go"
	"github.com/streadway/amqp"
	"golang.org/x/crypto/bcrypt"
)

var Pool, errr = poolPgx.Pgx()

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func main() {
	if errr != nil {
		fmt.Fprintln(os.Stderr, "Error SQL connection:", errr)
		os.Exit(1)
	}
	defer Pool.Close()

	Conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	failOnError(err, "Failed to open a conn")

	ch, err := Conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	msgs, err := ch.Consume(
		"auth", // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Failed to register a consumer")

	for d := range msgs {
		fmt.Println(d)
		var status string
		js := easy.A{}
		err = js.UnmarshalJSON(d.Body)
		if err != nil {
			fmt.Println(err)
			status = "400"
			_ = ch.Publish(
				"",          // exchange
				d.MessageId, // routing key
				false,       // mandatory
				false,       // immediate
				amqp.Publishing{
					ContentType: "text",
					Body:        []byte("Bad json"),
					MessageId:   status,
				})
			return
		}

		conn, err := Pool.Acquire(context.Background())
		if err != nil {
			fmt.Println(err)
			status = "503"
			_ = ch.Publish(
				"",          // exchange
				d.MessageId, // routing key
				false,       // mandatory
				false,       // immediate
				amqp.Publishing{
					ContentType: "text",
					Body:        []byte("Bad connect"),
					MessageId:   status,
				})
			return
		}

		defer conn.Release()

		var password []byte
		err = conn.QueryRow(context.Background(), "select hash from users where email=$1", string(js.Email)).Scan(&password)
		if err != nil {

			status = "401"
			_ = ch.Publish(
				"",          // exchange
				d.MessageId, // routing key
				false,       // mandatory
				false,       // immediate
				amqp.Publishing{
					ContentType: "text",
					Body:        []byte("Wrong email"),
					MessageId:   status,
				})
			return
		}
		err = bcrypt.CompareHashAndPassword(password, []byte(js.Password))
		if err != nil {

			status = "401"
			_ = ch.Publish(
				"",          // exchange
				d.MessageId, // routing key
				false,       // mandatory
				false,       // immediate
				amqp.Publishing{
					ContentType: "text",
					Body:        []byte("Wrong password"),
					MessageId:   status,
				})
			return
		}

		token := jwt.New(jwt.SigningMethodHS256)
		claims := jwt.MapClaims{}
		claims["name"] = js.Email
		claims["exp"] = time.Now().Add(time.Minute * 60).Unix()
		token.Claims = claims
		fmt.Println(token)
		tokenString, err := token.SignedString([]byte("SuperSecretKey"))
		fmt.Println(tokenString, err)
		_ = ch.Publish(
			"",          // exchange
			d.MessageId, // routing key
			false,       // mandatory
			false,       // immediate
			amqp.Publishing{
				ContentType: "text",
				Body:        []byte(tokenString),
				MessageId:   "200",
			})
	}
}
