package main

import (
	"encoding/json"
	"github.com/zwoabier/youtrack-helper/internal/logger"
	"os"
	"path/filepath"

	"github.com/zalando/go-keyring"
)

type ConfigManager struct {
	configPath string
	config     Config
}

func NewConfigManager() *ConfigManager {
	cm := &ConfigManager{}
	cm.initConfigPath()
	cm.loadConfig()
	return cm
}

func (cm *ConfigManager) initConfigPath() error {
	userHome, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	configDir := filepath.Join(userHome, ".youtrack-helper")
	if err := os.MkdirAll(configDir, 0700); err != nil {
		return err
	}

	cm.configPath = filepath.Join(configDir, "config.json")
	return nil
}

func (cm *ConfigManager) loadConfig() error {
	if _, err := os.Stat(cm.configPath); os.IsNotExist(err) {
		cm.config = Config{LogLevel: "debug"}
		return nil
	}

	data, err := os.ReadFile(cm.configPath)
	if err != nil {
		return err
	}

	if err := json.Unmarshal(data, &cm.config); err != nil {
		return err
	}

	// Log loaded config (without sensitive data)
	logger.Debug("Config loaded from %s; baseURL empty=%v, projects=%d, log_level=%s, log_to_file=%v",
		cm.configPath, cm.config.BaseURL == "", len(cm.config.Projects), cm.config.LogLevel, cm.config.LogToFile)

	return nil
}

func (cm *ConfigManager) SaveConfig(cfg Config) error {
	cm.config = cfg

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(cm.configPath, data, 0600)
}

func (cm *ConfigManager) GetConfig() Config {
	return cm.config
}

func (cm *ConfigManager) IsConfigured() bool {
	return cm.config.BaseURL != "" && len(cm.config.Projects) > 0 && cm.getToken() != ""
}

func (cm *ConfigManager) SaveToken(token string) error {
	return keyring.Set("youtrack-spotlight", "token", token)
}

func (cm *ConfigManager) getToken() string {
	token, err := keyring.Get("youtrack-spotlight", "token")
	if err != nil {
		return ""
	}
	return token
}

func (cm *ConfigManager) GetToken() string {
	return cm.getToken()
}
