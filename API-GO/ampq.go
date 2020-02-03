package main

import "github.com/streadway/amqp"

func Ampq() (*amqp.Connection, error){
	return amqp.Dial("amqp://guest:guest@localhost:5672/")
}
