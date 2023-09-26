const { Auth } = require("msmc");
const { ipcRenderer } = require('electron')
const maxResBtn = document.getElementById('maxResBtn')
//const { login } = require('./launch')
const playbtn = document.getElementById("play-btn")
const settingsbtn = document.getElementById("settings-btn")
const stBackbtn = document.getElementById("stbackButton")
const premiumbtn = document.getElementById("premiumBtn")
const logoutbtn = document.getElementById('premiumBtnlogout')
const applyRambtn = document.getElementById("applyRam")


let premiumtoken

const ipc = ipcRenderer

const versionsDropdown = document.getElementById('dropdown-menu');

var minRam, maxRam = "";

const versions = [ 
    "1.20.2",
    "1.20.1",
    "1.20",
    "1.19.4",
    "1.19.3",
    "1.19.2",
    "1.19.1",
    "1.19",
    "1.18.2",
    "1.18.1",
    "1.18",
    "1.17.2",
    "1.17.1",
    "1.17",
    "1.16.5",
    "1.16.4",
    "1.16.3",
    "1.16.2",
    "1.16.1",
    "1.16",
    "1.15.2",
    "1.15.1",
    "1.15",
    "1.14.4",
    "1.14.3",
    "1.14.2",
    "1.14.1",
    "1.14",
    "1.13.2",
    "1.13.1",
    "1.13",
    "1.12.2",
    "1.12.1",
    "1.12",
    "1.11.2",
    "1.11.1",
    "1.11",
    "1.10.2",
    "1.10.1",
    "1.10",
    "1.9.4",
    "1.9.3",
    "1.9.2",
    "1.9.1",
    "1.9",
    "1.8.9",
    "1.8.8",
    "1.8.7",
    "1.8.6",
    "1.8.5",
    "1.8.4",
    "1.8.3",
    "1.8.2",
    "1.8.1",
    "1.8",
    "1.7.10",
    "1.7.9",
    "1.7.8",
    "1.7.7",
    "1.7.6",
    "1.7.5",
    "1.7.4",
    "1.7.3",
    "1.7.2",
    "1.7.1",
    "1.7",
    "1.6.4",
    "1.6.3",
    "1.6.2",
    "1.6.1",
    "1.6",
    "1.5.2",
    "1.5.1",
    "1.5",
    "1.4.7",
    "1.4.6",
    "1.4.5",
    "1.4.4",
    "1.4.3",
    "1.4.2"
]

document.getElementById('dropdown-button').textContent = "1.20.2";

versions.forEach(item => {
    const div = document.createElement('div');
    div.textContent = /* "Release  " + */ item;
    div.className = 'dropdownitem';
    div.addEventListener('click', function() {
        document.getElementById('dropdown-button').textContent = this.textContent;
    });
    versionsDropdown.appendChild(div);
});

//MINIZE APP FUNCTION//
minimizeBtn.addEventListener('click', ()=> {
    ipc.send('minimizeApp')
})

function changeMaxResBtn(isMaximizedApp){
    if(isMaximizedApp){
        maxResBtn.title = 'Restore'
        maxResBtn.classList.remove('maximizeBtn')
        maxResBtn.classList.add('restoreBtn')
    }else {
        maxResBtn.title = 'Maximize'
        maxResBtn.classList.remove('restoreBtn')
        maxResBtn.classList.add('maximizeBtn')
    }
}
ipc.on('isMaximized', () => {changeMaxResBtn(true)})
ipc.on('isRestored', () => {changeMaxResBtn(false)})
//MAXIMIZE RESTORE APP FUNCTION//
maxResBtn.addEventListener('click', ()=> {
    ipc.send('maximizeRestoreApp')
})

//CLOSE APP FUNCTION//
closeBtn.addEventListener('click', ()=> {
    ipc.send('closeApp')
})

settingsbtn.addEventListener('click', () => {
    document.getElementById('contentArea').style.display = 'none';
    document.getElementById('settingsArea').style.display = 'block';
})

premiumbtn.addEventListener('click', () =>{
    ipc.send('login')
})

logoutbtn.addEventListener('click', () =>{
    premiumtoken = ''
    premiumbtn.style.display = 'block';
    logoutbtn.style.display = 'none'
    document.getElementById('username').style.display = 'inline-block';
    document.getElementById('premiumlabel').style.display = 'none';

})

ipc.on('loged', (event, arg) => {
    ipc.send('debug', arg.token)
    premiumname = arg.token.name
    premiumbtn.style.display = 'none';
    logoutbtn.style.display = 'block'
    document.getElementById('username').style.display = 'none';
    document.getElementById('premiumlabel').style.display = 'inline-block';
    document.getElementById('premiumlabel').textContent = premiumname;
    premiumtoken = arg.token
    
})

stBackbtn.addEventListener('click', () => {
    document.getElementById('contentArea').style.display = 'block';
    document.getElementById('settingsArea').style.display = 'none';
})

applyRambtn.addEventListener('click', () => {
    minRam = document.getElementById('minRam')
    maxRam = document.getElementById('maxRam')
})


playbtn.addEventListener("click",() => {
    user = document.getElementById('username').value;
    if(user && !premiumtoken){
        version = document.getElementById('dropdown-button').textContent;
        if(!minRam || !maxRam){
            ipc.send('play', {user: user, version: version, minRam: "2G", maxRam: "4G",})
        }else{
            ipc.send('play', {user: user, version: version, minRam: minRam, maxRam: maxRam,})
        }
        document.getElementById('play-txt').textContent = "Loading";
        document.getElementById('btn-container').classList.add('btn-container-disabled')
        playbtn.disabled = true;
    }
    if(premiumtoken){
        version = document.getElementById('dropdown-button').textContent;
        if(!minRam || !maxRam){
            ipc.send('play', {user: user, version: version, minRam: "2G", maxRam: "4G", premiumtoken: premiumtoken})
        }else{
            ipc.send('play', {user: user, version: version, minRam: minRam, maxRam: maxRam, premiumtoken: premiumtoken})
        }
        document.getElementById('play-txt').textContent = "Loading";
        document.getElementById('btn-container').classList.add('btn-container-disabled')
        playbtn.disabled = true;
    }
});

ipc.on('loaded', () => {
    document.getElementById('play-txt').textContent = "Play";
    document.getElementById('btn-container').classList.remove('btn-container-disabled')
    playbtn.disabled = false;
})

// ipcRenderer.on('load-token', (event, mstoken) => {
//     premiumtoken = mstoken
//     ipcRenderer.send('loaded')
// })


ipcRenderer.on('load-input-value', (event, inputValue) => {
    // Load the input value into your input element
    let inputElement = document.getElementById('username')
    inputElement.value = inputValue
})

ipcRenderer.on('load-version-value', (event, versionValue) => {
    // Load the input value into your input element
    let inputVersionElement = document.getElementById('dropdown-button')
    inputVersionElement.textContent = versionValue
})

ipcRenderer.on('load-ram-values', (event, minRamValue, maxRamValue) => {
    if (minRamValue == String && minRamValue != ''){
        document.getElementById('minRam').value = minRamValue
        minRam = minRamValue
    }
    if(maxRamValue == String && maxRamValue != ''){
        document.getElementById('maxRam').value = maxRamValue
        maxRam = maxRamValue
    }
})