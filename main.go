package main

import (
	"embed"

	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create application with options
	app := NewApp()

	err := wails.Run(&options.App{
		Title:  "YouTrack Spotlight Search",
		Assets: &assetserver.Options{
			Handler: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
		WindowStartState: options.Normal,
		Frameless:        true,
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
