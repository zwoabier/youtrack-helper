package logger

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

const (
	LevelDebug = 0
	LevelInfo  = 1
	LevelWarn  = 2
	LevelError = 3
)

var (
	levelNames = map[int]string{
		LevelDebug: "DEBUG",
		LevelInfo:  "INFO",
		LevelWarn:  "WARN",
		LevelError: "ERROR",
	}
	levelFromString = map[string]int{
		"debug": LevelDebug,
		"info":  LevelInfo,
		"warn":  LevelWarn,
		"error": LevelError,
	}
)

var (
	mu          sync.Mutex
	currentLevel int = LevelInfo
	logToFile   bool
	filePath    string
	file        *os.File
)

func levelFor(s string) int {
	if l, ok := levelFromString[s]; ok {
		return l
	}
	return LevelInfo
}

// SetLevel sets the minimum log level. Allowed: "debug", "info", "warn", "error".
func SetLevel(level string) {
	mu.Lock()
	defer mu.Unlock()
	currentLevel = levelFor(level)
}

// SetLogToFile enables or disables writing logs to ~/.youtrack-helper/app.log.
func SetLogToFile(enabled bool) {
	mu.Lock()
	defer mu.Unlock()
	if file != nil {
		file.Close()
		file = nil
	}
	logToFile = enabled
	if enabled {
		dir, _ := os.UserHomeDir()
		configDir := filepath.Join(dir, ".youtrack-helper")
		os.MkdirAll(configDir, 0700)
		filePath = filepath.Join(configDir, "app.log")
	}
}

func write(level int, format string, args ...interface{}) {
	mu.Lock()
	if level < currentLevel {
		mu.Unlock()
		return
	}
	msg := fmt.Sprintf(format, args...)
	ts := time.Now().Format("2006-01-02 15:04:05")
	line := fmt.Sprintf("%s [%s] %s\n", ts, levelNames[level], msg)
	mu.Unlock()

	fmt.Print(line)

	if !logToFile {
		return
	}
	mu.Lock()
	if file == nil && filePath != "" {
		f, err := os.OpenFile(filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0600)
		if err == nil {
			file = f
		}
	}
	if file != nil {
		file.WriteString(line)
	}
	mu.Unlock()
}

// Debug logs at debug level.
func Debug(format string, args ...interface{}) {
	write(LevelDebug, format, args...)
}

// Info logs at info level.
func Info(format string, args ...interface{}) {
	write(LevelInfo, format, args...)
}

// Warn logs at warn level.
func Warn(format string, args ...interface{}) {
	write(LevelWarn, format, args...)
}

// Error logs at error level.
func Error(format string, args ...interface{}) {
	write(LevelError, format, args...)
}
