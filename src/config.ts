import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
    dbUrl: string,
    currentUserName: string,
};

function getConfigFilePath(): string {
    const homeDir = os.homedir()
    return path.join(homeDir, ".gatorconfig.json"); 
};

function writeConfig(cfg: Config): void {
    const rawConfig = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    };
    const config = JSON.stringify(rawConfig, null, 2);
    const filePath = getConfigFilePath();

    fs.writeFileSync(filePath, config,  { encoding: "utf-8" });
};

function validateConfig(rawConfig: any): Config {
    if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
        throw new Error("Config missing db url or is not a string");
    }
    if (rawConfig.current_user_name && typeof rawConfig.current_user_name !== "string") {
        throw new Error("Config missing current user name or is not a string");
    }

    return {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name ?? "",
    };
}

export function setUser(newUserName: string): void {
    const cfg = readConfig();
    cfg.currentUserName = newUserName;
    writeConfig(cfg)
}

export function readConfig(): Config {
    const filePath = getConfigFilePath();
    const rawConfig = fs.readFileSync(filePath, { encoding: "utf-8" } )
    const parsedConfig = JSON.parse(rawConfig)
    const config = validateConfig(parsedConfig)
    return config
}