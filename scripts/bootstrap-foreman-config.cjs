const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

function fallbackResolveForemanConfigFilePath() {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME && process.env.XDG_CONFIG_HOME.trim();

  if (xdgConfigHome) {
    return path.join(xdgConfigHome, 'foreman', 'foreman-config.json');
  }

  const homeDirectory = (process.env.HOME && process.env.HOME.trim()) || os.homedir().trim();

  if (!homeDirectory) {
    throw new Error('Unable to resolve the shared Foreman config home. Set XDG_CONFIG_HOME or HOME.');
  }

  return path.join(homeDirectory, '.config', 'foreman', 'foreman-config.json');
}

function fallbackCreateDefaultForemanConfig() {
  return {
    version: 1,
    entry_policy: {
      mode: 'codex_cli_foreman_first',
    },
    output: {
      verbosity: 'default',
    },
    runtime: {
      worker_poll_interval_ms: 90000,
    },
    archive_targets: {
      notebooklm: {
        enabled: false,
        auth_mode: 'browser',
        notebook_url: null,
        notebook_id: null,
        secret_ref: null,
      },
    },
    agents: {
      orchestrator: {
        name: 'captain',
        profile: null,
        model: 'gpt-5.4',
        variant: 'high',
        config_entries: [],
      },
      planner: {
        name: 'tactician',
        profile: null,
        model: 'gpt-5.4',
        variant: 'medium',
        config_entries: [],
      },
      'code specialist': {
        name: 'raider',
        profile: null,
        model: 'gpt-5.3-codex',
        variant: 'high',
        config_entries: [],
      },
      verifier: {
        name: 'arbiter',
        profile: null,
        model: 'gpt-5.4',
        variant: 'medium',
        config_entries: [],
      },
    },
  };
}

function loadRuntimeHelpers() {
  try {
    const runtime = require('../dist/runtime.js');

    return {
      resolveForemanConfigFilePath:
        typeof runtime.resolveForemanConfigFilePath === 'function'
          ? runtime.resolveForemanConfigFilePath
          : fallbackResolveForemanConfigFilePath,
      createDefaultForemanConfig:
        typeof runtime.createDefaultForemanConfig === 'function'
          ? runtime.createDefaultForemanConfig
          : fallbackCreateDefaultForemanConfig,
    };
  } catch {
    return {
      resolveForemanConfigFilePath: fallbackResolveForemanConfigFilePath,
      createDefaultForemanConfig: fallbackCreateDefaultForemanConfig,
    };
  }
}

async function main() {
  const { resolveForemanConfigFilePath, createDefaultForemanConfig } = loadRuntimeHelpers();
  const configPath = resolveForemanConfigFilePath();

  try {
    await fs.access(configPath);
    return;
  } catch (error) {
    if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'ENOENT') {
      throw error;
    }
  }

  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, `${JSON.stringify(createDefaultForemanConfig(), null, 2)}\n`, 'utf8');
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown error.';
  process.stderr.write(`[codex-foreman] postinstall bootstrap skipped: ${message}\n`);
  process.exit(0);
});
