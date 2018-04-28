chrome.runtime.setUninstallURL("https://1ce.org");

if (!localStorage.created) {
  chrome.tabs.create({ url: "https://1ce.org" });
  var manifest = chrome.runtime.getManifest();
  localStorage.ver = manifest.version;
  localStorage.created = 1;
}

notifyInterval = null;
lastNotify = null;

function fireNotify(){
  console.log('fireNotify');
  chrome.notifications.create({
    type:'basic',
    title : chrome.i18n.getMessage("notification_title"),
    message : chrome.i18n.getMessage("notification_message"),
    iconUrl: chrome.runtime.getURL('images/stop.png'),
    buttons : [
      {
        title : chrome.i18n.getMessage("restart_notify")
      },
      {
        title : chrome.i18n.getMessage("stop_notify")
      },
    ]
  }, function(notificationId){
    lastNotify = notificationId;
    console.log('lastNotify' ,lastNotify);
  });
  
}

period = 1000 * 60 * 25;

function upadteBadge(num){
  chrome.browserAction.setBadgeText({text : ''+ (num) });
}

function startRun(){
  //console.log('start');
  stopRun();
  startFrom = new Date().getTime();
  upadteBadge(25);
  notifyInterval = setInterval(function(){
    var diff = new Date().getTime() - startFrom,
        minutesLeft = Math.floor( (period - diff) / (1000 * 60));
    console.log('minutesLeft', minutesLeft);
    upadteBadge(minutesLeft+1);
    

    if(minutesLeft <= 0 ){
      fireNotify();
      stopRun();
    }
  }, 1000);
}

function stopRun(){
  console.log('stop');
  clearInterval(notifyInterval);
}

function stopRunClicked(){
  running = false;
  chrome.browserAction.setIcon({path:  chrome.runtime.getURL('images/start.png')});
  chrome.browserAction.setBadgeText({text : '' });
  chrome.browserAction.setTitle({title:chrome.i18n.getMessage("start_notify")});
  stopRun();

}
function startRunClicked(){
  running = true;
  chrome.browserAction.setIcon({path:  chrome.runtime.getURL('images/stop.png')});
  chrome.browserAction.setTitle({title:chrome.i18n.getMessage("stop_notify")});
  startRun();
}

stopRunClicked();

chrome.browserAction.onClicked.addListener(function(tab){
  console.log(running,'running');
  if(running){
    stopRunClicked();
  }
  else{
    startRunClicked();
  }
});

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
  if(lastNotify == notificationId){
    if(!buttonIndex){
      startRunClicked();
    }
    else{
      stopRunClicked();
    }
    chrome.notifications.clear(notificationId);
    lastNotify =null;
  }
});