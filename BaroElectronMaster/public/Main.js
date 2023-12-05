const { app, BrowserWindow, protocol } = require("electron");
const electron = require("electron");
const { Menu } = require("electron");
const dayjs = require("dayjs");
const fs = require("fs");

let interval;
let captureInterval;

async function createMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: "electron",
    },
    {
      label: "Menu",
      submenu: [
        {
          label: "Close",
          accelerator: "CMDOrCtrl+w",
          role: "close",
        },
        {
          label: "ToggleFullScreen",
          role: "togglefullscreen",
          accelerator: "CMDOrCtrl+f",
        },
        {
          label: "reload",
          role: "reload",
          accelerator: "CMDOrCtrl+r",
        },
        {
          label: "developerTool",
          role: "toggleDevTools",
          accelerator: "CMDOrCtrl+d",
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
}

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

function createWindow(mx, my) {
  const win = new BrowserWindow({
    autoHideMenuBar: true,

    x: mx + 50,
    y: my + 50,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    },
  });
  createMenu(win);
  win.loadURL("https://vertical-monitor-dot-prd-barofactory.du.r.appspot.com/");

  interval = setInterval(() => {
    win.webContents.reloadIgnoringCache();
  }, 30 * 60 * 10000);

  captureInterval = setInterval(() => {
    let date = dayjs().format("YYYY-MM-DD HH:mm:ss");
    console.log(date);
    win.webContents
      .capturePage()
      .then((image) => {
        fs.writeFileSync(
          `/home/baro/baromon/www/screen_images/landScape_${date}.png`,
          image.toPNG(),
          (err) => {
            if (err) console.log(err);
          }
        );
      })
      .catch((err) => {
        throw err;
      });
  }, 60 * 1000);
}

app.on("window-all-closed", () => {
  clearInterval(captureInterval);
  clearInterval(interval);

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("ready", async () => {
  console.log(electron);
  let displays = electron.screen.getPrimaryDisplay().bounds;

  if (displays) {
    createWindow(displays.x, displays.y);
  }
});
