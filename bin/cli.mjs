#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_SRC = resolve(__dirname, "..", "agents");

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
  agent-system — 7-agent workflow for AI-assisted development

  Usage:
    npx agent-system init            Copy agents to ./agents/ in current project
    npx agent-system init --global   Copy agents to ~/.claude/agents/
    npx agent-system list            List available agents
    npx agent-system help            Show this help message
`);
}

function listAgents() {
  const files = readdirSync(AGENTS_SRC).filter((f) => f.endsWith(".md"));
  console.log("\n  Available agents:\n");
  for (const file of files) {
    const name = file.replace(".md", "");
    const tag =
      name === "ORCHESTRATION" ? "(how agents work together)" : "(agent)";
    console.log(`    ${name} ${tag}`);
  }
  console.log();
}

function init(global) {
  const target = global
    ? join(homedir(), ".claude", "agents")
    : join(process.cwd(), "agents");

  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }

  const files = readdirSync(AGENTS_SRC).filter((f) => f.endsWith(".md"));
  let copied = 0;
  let skipped = 0;

  for (const file of files) {
    const dest = join(target, file);
    if (existsSync(dest)) {
      console.log(`  skip  ${file} (already exists)`);
      skipped++;
    } else {
      cpSync(join(AGENTS_SRC, file), dest);
      console.log(`  copy  ${file}`);
      copied++;
    }
  }

  console.log(
    `\n  Done. ${copied} copied, ${skipped} skipped → ${target}\n`
  );

  if (!global) {
    console.log(
      "  Tip: run with --global to install to ~/.claude/agents/ (available in all projects)\n"
    );
  }
}

function initForce(global) {
  const target = global
    ? join(homedir(), ".claude", "agents")
    : join(process.cwd(), "agents");

  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }

  const files = readdirSync(AGENTS_SRC).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    cpSync(join(AGENTS_SRC, file), join(target, file));
    console.log(`  copy  ${file}`);
  }

  console.log(`\n  Done. ${files.length} files → ${target}\n`);
}

switch (command) {
  case "init": {
    const global = args.includes("--global") || args.includes("-g");
    const force = args.includes("--force") || args.includes("-f");
    if (force) {
      initForce(global);
    } else {
      init(global);
    }
    break;
  }
  case "list":
    listAgents();
    break;
  case "help":
  case "--help":
  case "-h":
  case undefined:
    printHelp();
    break;
  default:
    console.error(`  Unknown command: ${command}\n`);
    printHelp();
    process.exit(1);
}
