import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gitHash = execSync("git rev-parse --short HEAD").toString().trim();
writeFileSync(".env.local", `VITE_GIT_SHA=${gitHash}\n`, { flag: "a" });
