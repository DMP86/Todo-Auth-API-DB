package main

import (
	"fmt"
	"net/http"

	"github.com/dgrijalva/jwt-go"
)

type User struct {
	name  string
	email string
}

func Authorize(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqToken := r.Header.Get("Authorization")

		token, err := jwt.Parse(reqToken, func(t *jwt.Token) (interface{}, error) {
			return []byte(SecretKey), nil
		})
		if err == nil && token.Valid {
			fmt.Println("valid token")
			h.ServeHTTP(w, r)
		} else {
			fmt.Println("invalid token")
			w.WriteHeader(401)
			return
		}
	})
}
