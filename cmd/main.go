package main

import (
	"context"
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/zwoabier/youtrack-helper/internal/app"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	appInstance := app.NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "YouTrack Helper",
		Width:  600,
		Height: 500,
		AssetServer: &assetserver.Options{
			FS: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 0},
		OnStartup: func(ctx context.Context) {
			appInstance.Startup(ctx)
			runtime.WindowCenter(ctx)
			runtime.WindowMinMaxSize(ctx, 400, 300, 800, 600)
		},
		Bind: []interface{}{
			appInstance,
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}
