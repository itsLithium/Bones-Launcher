const { Client, Authenticator } = require("minecraft-launcher-core");
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Auth } = require("msmc");
const keytar = require('keytar');
const ipc = ipcMain
const os = require("os");

userDirectory = os.homedir();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 620,
    minWidth: 1024, 
    minHeight: 620,
    maxWidth: 1024,
    maxHeight: 620,
    frame: false,
    icon: __dirname + '../../build/icon.ico',
    webPreferences: {
      preload: path.join(__dirname, 'app.js'),
      nodeIntegration: true,
      contextIsolation: false,

    },


  });

  //MC LAUNCH

  const runMC = (token, version, minRam, maxRam) => {
    const launcher = new Client();
    let opts = {
        clientPackage: null,
        // Simply call this function to convert the msmc Minecraft object into a mclc authorization object
        authorization: token,
        root: userDirectory + "/AppData/Roaming/.minecraft",
        version: {
            number: version,
            type: "release"
        },
        memory: {
            max: maxRam,
            min: minRam
        }  
    };
    console.log("Starting!");
    launcher.launch(opts).then(() => launched);
  
    
    //launcher.on('debug', (e) => console.log(e));
    
    launcher.on('progress', (e) => launched(e));
    //launcher.on('progress', (e) => console.log(e));
    
  }
  
  const login = (user, version, minRam, maxRam, premiumtoken) => {
    if (premiumtoken){
      runMC(premiumtoken, version, minRam, maxRam)
    }else if (user){
      Authenticator.getAuth(user).then(token => runMC(token, version, minRam, maxRam))
    }
  }
  
  const launched = (data) => {
    
    if(data.task == data.total){
      console.log("cargue " + data.task)
      mainWindow.webContents.send('loaded')
    }
  }

  let inputValue = await keytar.getPassword('bones-launcher', 'username')
  let versionValue = await keytar.getPassword('bones-launcher', 'version')
  let minRamValue = await keytar.getPassword('bones-launcher', 'minRam')
  let maxRamValue = await keytar.getPassword('bones-launcher', 'maxRam')
 
  
  // mstoken = loadMCToken('mstoken')
  // if(mstoken){
  //   mainWindow.webContents.send('load-token', {mstoken: mstoken})
  // }


  console.log(inputValue)
  console.log(versionValue)
  // Send the loaded input value to renderer process
  if(inputValue){
    mainWindow.webContents.send('load-input-value', inputValue)
  }
  if(versionValue){
    mainWindow.webContents.send('load-version-value', versionValue)
  }
  if (minRamValue && maxRamValue){
    mainWindow.webContents.send('load-ram-values', {minRam: minRamValue, maxRam: maxRamValue})
  }

  ipc.on('debug', (event, arg)=>{
    console.log(arg)
  })
  

  ipc.on('play', async (event, arg) =>{
    await keytar.setPassword('bones-launcher', 'username', arg.user)
    await keytar.setPassword('bones-launcher', 'version', arg.version)
    await keytar.setPassword('bones-launcher', 'minRam', arg.minRam)
    await keytar.setPassword('bones-launcher', 'maxRam', arg.maxRam)

    if(arg.premiumtoken){
      login(arg.user, arg.version, arg.minRam, arg.maxRam, arg.premiumtoken)
    }else{
      login(arg.user, arg.version, arg.minRam, arg.maxRam)
    }
    //event.sender.send('loaded');
    console.log(arg.user)
  })

  ipc.on('login', async () => {
    const authManager = new Auth("select_account");

    authManager.launch("raw").then(async xboxManager => {
      //Generate the Minecraft login token
      mctoken = await xboxManager.getMinecraft();
      _name = mctoken.mclc().name
      // saveMCToken(mctoken.mclc().access_token)
      mainWindow.webContents.send('loged', {token: mctoken.mclc(), name: _name})
      console.log(_name)
    });
  })

  


async function saveMCToken(token) {
    await keytar.setPassword("bones-launcher", 'mstoken', token);
}

async function loadMCToken(account) {
    return await keytar.getPassword("bones-launcher", account);
}



//APP TITLEBAR BUTTONS FUNCTIONS//

  ipc.on('minimizeApp', () => {
    mainWindow.minimize()
  })

  ipc.on('maximizeRestoreApp', () => {
    if(mainWindow.isMaximized()){
      mainWindow.restore()
    } else {
      mainWindow.maximize()
    }
  })

  ipc.on('closeApp', () => {
    mainWindow.close()
  })

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('isMaximized')
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('isRestored')
  })
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  //! Open DevTools. /DEBUG/
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

