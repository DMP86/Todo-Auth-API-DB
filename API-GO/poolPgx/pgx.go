package poolPgx

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/jackc/pgx/log/zapadapter"
	"github.com/jackc/pgx/pgxpool"
	"go.uber.org/zap"
	
)

func Pgx() (*pgxpool.Pool, error) {
	dsn := "postgres://root:123456@localhost:5432/todo"
	
	logger, _ := zap.NewDevelopment()
	cfg, er := pgxpool.ParseConfig(dsn)
	if er != nil {
		return nil, fmt.Errorf("Failed config %s", er)
	}
	cfg.MaxConns = 10
	cfg.ConnConfig.TLSConfig = nil
	cfg.ConnConfig.PreferSimpleProtocol = true
	cfg.ConnConfig.Logger = zapadapter.NewLogger(logger)
	cfg.ConnConfig.DialFunc = (&net.Dialer{
		KeepAlive: 5 * time.Minute,
	}).DialContext
	pool, err := pgxpool.ConnectConfig(context.Background(), cfg)
	if err != nil {
		return nil, fmt.Errorf("Failed to connect: %s", err)
	}
	return pool, nil

}
