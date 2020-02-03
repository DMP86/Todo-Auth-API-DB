package main

import (
	"math/rand"
	"time"
	"unsafe"
)

const (
	chars    = "0123456789_abcdefghijkl-mnopqrstuvwxyz" //ABCDEFGHIJKLMNOPQRSTUVWXYZ
	charsLen = len(chars)
	mask     = 1<<6 - 1
)

var src = rand.NewSource(time.Now().UnixNano())


func RandStr(ln int) string {

	buf := make([]byte, ln)
	for idx, cache, remain := ln-1, src.Int63(), 10; idx >= 0; {
		if remain == 0 {
			cache, remain = src.Int63(), 10
		}
		buf[idx] = chars[int(cache&mask)%charsLen]
		cache >>= 6
		remain--
		idx--
	}
	return *(*string)(unsafe.Pointer(&buf)) //создаём строку из слайса без копий
}
