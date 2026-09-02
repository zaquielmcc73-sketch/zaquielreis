const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  safeStorage,
} = require('electron');

const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn, execSync } = require('child_process');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;
let serverProcess = null;
let updateDownloaded = false;
let isQuitting = false;

// ============================================================
// AUTO UPDATER
// ============================================================

function sendUpdaterStatus(payload) {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater:status', payload);
    }
  } catch (error) {
    console.error('[Updater] Erro ao enviar status:', error);
  }
}

function setupAutoUpdater() {
  if (!app.isPackaged) {
    console.log(
      '[Updater] Modo desenvolvimento: atualização automática desativada.'
    );
    return;
  }

  console.log('[Updater] Inicializando sistema de atualização...');

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('checking-for-update', () => {
    console.log('[Updater] Verificando atualizações...');

    sendUpdaterStatus({
      status: 'checking',
      currentVersion: app.getVersion(),
    });
  });

  autoUpdater.on('update-available', (info) => {
    console.log(
      `[Updater] Nova versão disponível: ${info.version}`
    );

    sendUpdaterStatus({
      status: 'available',
      version: info.version,
      currentVersion: app.getVersion(),
      releaseDate: info.releaseDate || null,
      releaseName: info.releaseName || null,
      releaseNotes: info.releaseNotes || null,
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log(
      `[Updater] Aplicativo já está atualizado. Versão atual: ${info?.version || app.getVersion()}`
    );

    sendUpdaterStatus({
      status: 'not-available',
      version: app.getVersion(),
      currentVersion: app.getVersion(),
    });
  });

  autoUpdater.on('download-progress', (progress) => {
    const percent = Math.max(
      0,
      Math.min(100, Math.round(progress.percent || 0))
    );

    console.log(
      `[Updater] Download: ${percent}%`
    );

    sendUpdaterStatus({
      status: 'downloading',
      percent,
      transferred: progress.transferred || 0,
      total: progress.total || 0,
      bytesPerSecond: progress.bytesPerSecond || 0,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log(
      `[Updater] Atualização baixada com sucesso: ${info.version}`
    );

    updateDownloaded = true;

    sendUpdaterStatus({
      status: 'downloaded',
      version: info.version,
      currentVersion: app.getVersion(),
    });
  });

  autoUpdater.on('error', (error) => {
    console.error(
      '[Updater] Erro:',
      error?.stack || error?.message || error
    );

    sendUpdaterStatus({
      status: 'error',
      message: error?.message || String(error),
    });
  });
}

async function checkForUpdates() {
  if (!app.isPackaged) {
    console.log(
      '[Updater] Ignorando verificação: aplicativo em desenvolvimento.'
    );
    return {
      success: false,
      reason: 'development',
    };
  }

  try {
    console.log('[Updater] Executando checkForUpdates()...');

    const result = await autoUpdater.checkForUpdates();

    return {
      success: true,
      version: result?.updateInfo?.version || null,
    };
  } catch (error) {
    console.error(
      '[Updater] Falha ao verificar atualização:',
      error?.message || error
    );

    return {
      success: false,
      error: error?.message || String(error),
    };
  }
}

// ============================================================
// SERVER
// ============================================================

function checkServerRunning(port = 3000) {
  return new Promise((resolve) => {
    const req = http.get(
      `http://127.0.0.1:${port}/api/health`,
      (res) => {
        resolve(res.statusCode === 200);
      }
    );

    req.on('error', () => {
      const req2 = http.get(
        `http://localhost:${port}/api/health`,
        (res2) => {
          resolve(res2.statusCode === 200);
        }
      );

      req2.on('error', () => resolve(false));

      req2.setTimeout(800, () => {
        req2.destroy();
        resolve(false);
      });
    });

    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function killServerProcess() {
  if (!serverProcess) {
    return;
  }

  try {
    console.log(
      '[Electron] Encerrando processo do servidor backend...'
    );

    if (process.platform === 'win32' && serverProcess.pid) {
      try {
        execSync(
          `taskkill /pid ${serverProcess.pid} /T /F`,
          { stdio: 'ignore' }
        );
      } catch (_) {
        try {
          serverProcess.kill('SIGTERM');
        } catch (_) {}
      }
    } else {
      try {
        serverProcess.kill('SIGTERM');
      } catch (_) {}
    }
  } catch (err) {
    console.error(
      '[Electron] Erro ao encerrar processo do servidor:',
      err
    );
  }

  serverProcess = null;
}

async function startEmbeddedServerIfNeeded() {
  const isRunning = await checkServerRunning(3000);

  if (isRunning) {
    console.log(
      '[Electron] Servidor backend já está ativo na porta 3000.'
    );

    return true;
  }

  console.log(
    '[Electron] Servidor backend não detectado na porta 3000. Iniciando servidor local...'
  );

  process.env.PORT = '3000';

  if (app.isPackaged) {
    process.env.NODE_ENV = 'production';
  }

  const rootDir = path.resolve(__dirname, '..');

  const candidatePaths = [
    path.join(__dirname, '../dist/server.cjs'),
    path.join(rootDir, 'dist/server.cjs'),
    path.join(
      process.resourcesPath || '',
      'app.asar',
      'dist',
      'server.cjs'
    ),
    path.join(
      process.resourcesPath || '',
      'app',
      'dist',
      'server.cjs'
    ),
    path.join(
      app.getAppPath ? app.getAppPath() : '',
      'dist',
      'server.cjs'
    ),
  ];

  let serverBundlePath = null;

  for (const p of candidatePaths) {
    try {
      if (p && fs.existsSync(p)) {
        serverBundlePath = p;
        break;
      }
    } catch (_) {}
  }

  if (serverBundlePath) {
    try {
      console.log(
        `[Electron] Carregando backend em processo: "${serverBundlePath}"...`
      );

      process.env.NODE_ENV =
        process.env.NODE_ENV || 'production';

      require(serverBundlePath);

      console.log(
        '[Electron] Módulo backend inicializado no processo principal.'
      );
    } catch (err) {
      console.error(
        '[Electron] Erro ao carregar server.cjs via require:',
        err
      );
    }
  } else if (!app.isPackaged) {
    const serverTsPath = path.join(
      rootDir,
      'server.ts'
    );

    if (fs.existsSync(serverTsPath)) {
      console.log(
        '[Electron Dev] Iniciando backend a partir de server.ts com tsx...'
      );

      const isWin = process.platform === 'win32';
      const cmd = isWin ? 'npx.cmd' : 'npx';

      serverProcess = spawn(
        cmd,
        ['tsx', 'server.ts'],
        {
          cwd: rootDir,
          env: {
            ...process.env,
            NODE_ENV: 'development',
            PORT: '3000',
          },
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe'],
        }
      );

      if (serverProcess) {
        serverProcess.stdout.on('data', (data) => {
          const msg = data.toString().trim();

          if (msg) {
            console.log(`[Backend] ${msg}`);
          }
        });

        serverProcess.stderr.on('data', (data) => {
          const msg = data.toString().trim();

          if (msg) {
            console.error(`[Backend Erro] ${msg}`);
          }
        });

        serverProcess.on('error', (err) => {
          console.error(
            '[Electron] Falha ao iniciar processo do servidor backend:',
            err
          );
        });

        serverProcess.on('exit', (code, signal) => {
          console.log(
            `[Electron] Processo do servidor finalizado (code: ${code}, signal: ${signal})`
          );

          serverProcess = null;
        });
      }
    } else {
      console.error(
        '[Electron] Nem dist/server.cjs nem server.ts foram encontrados.'
      );

      return false;
    }
  } else {
    console.error(
      '[Electron] ERRO CRÍTICO: dist/server.cjs não foi encontrado no pacote da aplicação.'
    );
  }

  console.log(
    '[Electron] Aguardando confirmação do servidor na porta 3000...'
  );

  let attempts = 0;
  const maxAttempts = 40;

  while (attempts < maxAttempts) {
    await new Promise((resolve) =>
      setTimeout(resolve, 250)
    );

    const ready = await checkServerRunning(3000);

    if (ready) {
      console.log(
        `[Electron] Servidor backend verificado e pronto na porta 3000 após ${attempts + 1} tentativa(s).`
      );

      return true;
    }

    attempts++;
  }

  console.warn(
    '[Electron] Tempo limite atingido ao aguardar o servidor na porta 3000.'
  );

  return false;
}

// ============================================================
// WINDOW
// ============================================================

async function createWindow() {
  await startEmbeddedServerIfNeeded();

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#070a10',
    title:
      'Veo Auto Studio — Professional Sales Video Suite',
    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
    },
  });

  mainWindow.loadURL(
    'http://127.0.0.1:3000'
  ).catch((err) => {
    console.warn(
      '[Electron] Falha ao carregar http://127.0.0.1:3000, tentando localhost...',
      err
    );

    mainWindow.loadURL(
      'http://localhost:3000'
    ).catch(() => {
      mainWindow.loadFile(
        path.join(
          __dirname,
          '../dist/index.html'
        )
      );
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============================================================
// SECURE STORAGE
// ============================================================

const KEY_STORAGE_FILE = path.join(
  app.getPath('userData'),
  'secure_key.dat'
);

ipcMain.handle(
  'secure:saveApiKey',
  async (event, apiKey) => {
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted =
          safeStorage.encryptString(apiKey);

        fs.writeFileSync(
          KEY_STORAGE_FILE,
          encrypted
        );

        process.env.GEMINI_API_KEY = apiKey;

        return {
          success: true,
        };
      }

      const buf = Buffer.from(
        apiKey,
        'utf-8'
      );

      fs.writeFileSync(
        KEY_STORAGE_FILE,
        buf
      );

      process.env.GEMINI_API_KEY = apiKey;

      return {
        success: true,
        warning:
          'OS encryption fallback used',
      };
    } catch (err) {
      console.error(
        'Failed to securely save API key:',
        err
      );

      return {
        success: false,
        error: err.message,
      };
    }
  }
);

ipcMain.handle(
  'secure:getApiKey',
  async () => {
    try {
      if (
        fs.existsSync(
          KEY_STORAGE_FILE
        )
      ) {
        const raw =
          fs.readFileSync(
            KEY_STORAGE_FILE
          );

        if (
          safeStorage.isEncryptionAvailable()
        ) {
          const decrypted =
            safeStorage.decryptString(
              raw
            );

          return {
            success: true,
            apiKey: decrypted,
          };
        }

        return {
          success: true,
          apiKey: raw.toString(
            'utf-8'
          ),
        };
      }

      return {
        success: false,
        apiKey: null,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
    }
  }
);

// ============================================================
// NATIVE FOLDER PICKER
// ============================================================

ipcMain.handle(
  'dialog:selectDirectory',
  async () => {
    if (!mainWindow) {
      return null;
    }

    const result =
      await dialog.showOpenDialog(
        mainWindow,
        {
          properties: [
            'openDirectory',
            'createDirectory',
          ],
          title:
            'Selecione a pasta de saída para as campanhas do Veo Auto Studio',
        }
      );

    if (
      result.canceled ||
      result.filePaths.length === 0
    ) {
      return null;
    }

    return result.filePaths[0];
  }
);

// ============================================================
// SHELL
// ============================================================

ipcMain.handle(
  'shell:openPath',
  async (event, folderPath) => {
    if (
      folderPath &&
      fs.existsSync(folderPath)
    ) {
      await shell.openPath(folderPath);
      return true;
    }

    return false;
  }
);

ipcMain.handle(
  'shell:showItemInFolder',
  async (event, filePath) => {
    if (
      filePath &&
      fs.existsSync(filePath)
    ) {
      shell.showItemInFolder(filePath);
      return true;
    }

    return false;
  }
);

// ============================================================
// UPDATER IPC
// ============================================================

ipcMain.handle(
  'updater:check',
  async () => {
    return await checkForUpdates();
  }
);

ipcMain.handle(
  'updater:download',
  async () => {
    if (!app.isPackaged) {
      return {
        success: false,
        reason: 'development',
      };
    }

    try {
      console.log(
        '[Updater] Iniciando download da atualização...'
      );

      await autoUpdater.downloadUpdate();

      return {
        success: true,
      };
    } catch (error) {
      console.error(
        '[Updater] Erro ao baixar atualização:',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          String(error),
      };
    }
  }
);

ipcMain.handle(
  'updater:install',
  async () => {
    if (!updateDownloaded) {
      return {
        success: false,
        error:
          'Nenhuma atualização foi baixada ainda.',
      };
    }

    console.log(
      '[Updater] Preparando instalação e reinicialização...'
    );

    isQuitting = true;

    autoUpdater.quitAndInstall(
      false,
      true
    );

    return {
      success: true,
    };
  }
);

ipcMain.handle(
  'updater:getVersion',
  async () => {
    return {
      version: app.getVersion(),
      isPackaged: app.isPackaged,
    };
  }
);

// ============================================================
// APP READY
// ============================================================

app.whenReady().then(async () => {
  setupAutoUpdater();

  await createWindow();

  if (app.isPackaged) {
    setTimeout(() => {
      checkForUpdates();
    }, 5000);
  }

  app.on('activate', () => {
    if (
      BrowserWindow.getAllWindows()
        .length === 0
    ) {
      createWindow();
    }
  });
});

// ============================================================
// APP SHUTDOWN
// ============================================================

app.on('before-quit', () => {
  if (!isQuitting) {
    console.log(
      '[Electron] Encerrando aplicação...'
    );
  }

  killServerProcess();
});

app.on('will-quit', () => {
  killServerProcess();
});

app.on('window-all-closed', () => {
  killServerProcess();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('exit', () => {
  killServerProcess();
});

process.on('SIGINT', () => {
  killServerProcess();
  process.exit(0);
});

process.on('SIGTERM', () => {
  killServerProcess();
  process.exit(0);
});