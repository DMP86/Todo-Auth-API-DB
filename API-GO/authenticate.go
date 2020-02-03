package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
	"web/easy"

	"github.com/dgrijalva/jwt-go"
	"github.com/jackc/pgx/pgxpool"
	"golang.org/x/crypto/bcrypt"
)


func RegHandler(w http.ResponseWriter, r *http.Request) {
	conn, err, js := Enter(w, r)
	if err != nil {
		return
	}
	defer conn.Release()

	var password string
	err = conn.QueryRow(context.Background(), "select hash from users where email=$1", string(js.Email)).Scan(&password)
	if err == nil {
		w.WriteHeader(401)
		json.NewEncoder(w).Encode("Есть такой email")
		return
	}
	genPass, _ := bcrypt.GenerateFromPassword([]byte(js.Password), bcrypt.DefaultCost)
	tag, err := conn.Exec(context.Background(), `insert into users (email, hash, "createdAt", "updatedAt") values ($1, $2, $3, $4)`, js.Email, genPass, time.Now(), time.Now())
	if err != nil {
		w.WriteHeader(500)
		return
	}
	fmt.Println(tag)
	w.WriteHeader(201)
}

func Enter(w http.ResponseWriter, r *http.Request) (conn *pgxpool.Conn, err error, js easy.A) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return nil, err, js
	}
	
	err = js.UnmarshalJSON(body)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(400)
		return nil, err, js
	}

	conn, err = Pool.Acquire(context.Background())
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(503)
		return nil, err, js
	}
	return conn, nil, js
}
