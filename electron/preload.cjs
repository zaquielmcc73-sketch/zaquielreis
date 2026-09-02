const {
  contextBridge,
  ipcRenderer,
} = require('electron');

// Expose safe, isolated API to renderer
contextBridge.exposeInMainWorld(
  'electronAPI',
  {
    // ========================================================
    // SYSTEM
    // ========================================================

    isElectron: true,
    platform: process.platform,

    // ========================================================
    // FILE SYSTEM
    // ========================================================

    selectDirectory: () =>
      ipcRenderer.invoke(
        'dialog:selectDirectory'
      ),

    openPath: (folderPath) =>
      ipcRenderer.invoke(
        'shell:openPath',
        folderPath
      ),

    showItemInFolder: (filePath) =>
      ipcRenderer.invoke(
        'shell:showItemInFolder',
        filePath
      ),

    // ========================================================
    // SECURE API KEY
    // ========================================================

    saveApiKeySecurely: (key) =>
      ipcRenderer.invoke(
        'secure:saveApiKey',
        key
      ),

    getApiKeySecurely: () =>
      ipcRenderer.invoke(
        'secure:getApiKey'
      ),

    // ========================================================
    // LOG
    // ========================================================

    onLog: (callback) => {
      const listener = (
        event,
        value
      ) => {
        callback(value);
      };

      ipcRenderer.on(
        'app:log',
        listener
      );

      return () => {
        ipcRenderer.removeListener(
          'app:log',
          listener
        );
      };
    },

    // ========================================================
    // AUTO UPDATER
    // ========================================================

    updater: {
      check: () =>
        ipcRenderer.invoke(
          'updater:check'
        ),

      download: () =>
        ipcRenderer.invoke(
          'updater:download'
        ),

      install: () =>
        ipcRenderer.invoke(
          'updater:install'
        ),

      getVersion: () =>
        ipcRenderer.invoke(
          'updater:getVersion'
        ),

      onStatus: (callback) => {
        const listener = (
          event,
          value
        ) => {
          callback(value);
        };

        ipcRenderer.on(
          'updater:status',
          listener
        );

        return () => {
          ipcRenderer.removeListener(
            'updater:status',
            listener
          );
        };
      },
    },
  }
);