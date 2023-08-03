var highlighterEnabled = true;
var showFoundWords = true;
var printHighlights = true;
//var neverHighlightOn = [];
var HighlightsData = {}; //local storage
var SyncData = {}; //sync storage
var noContextMenu=["_generated_background_page.html","chrome://newtab/"]; 
var tabsTracker=[];
var debug= false;


if (localStorage.HighlightsData) {
    HighlightsData=JSON.parse(localStorage.HighlightsData);
    var upgraded=upgradeVersion(HighlightsData,'local', true, false);
}
else {
    var HighlightsData = {};
    HighlightsData.Version = "13";
    HighlightsData.neverHighlightOn = [];
    HighlightsData.ShowFoundWords = true;
    HighlightsData.PrintHighlights = true;
    var today=new Date();
    HighlightsData.Donate=today.setDate(today.getDate()+20);    
    HighlightsData.PerformanceSetting=200;
    HighlightsData.Groups = {
        "Default Group": {
            "Color": "#ff6",
            "Fcolor": "#000",
            "ShowInEditableFields": false,
            "Enabled": true,
            "FindWords": true,
            "ShowOn": [],
            "DontShowOn": [],
            "Words": [],
            "Type": 'local',
            "NotifyOnHighlight": false,
            "NotifyFrequency": 1,
            "Modified": Date.now()
        }
    };
    var upgraded=upgradeVersion(HighlightsData,'local', false, false);
}



printHighlights=HighlightsData.PrintHighlights;
showFoundWords=HighlightsData.ShowFoundWords;
//neverHighlightOn=HighlightsData.neverHighlightOn;

function loadSyncInMemory(){
    getDataFromSyncStorage(function(data){
    if(!data.Settings){
        //Initialize sync storage
        data={Settings:{Version:"20"},"Groups":{}};
        chrome.storage.sync.set({"Settings": data.Settings});
    }
    

    //TO DO: make sure when data model is 15 that this is fixed
    
    var upgraded=upgradeVersion({Version: data.Settings.Version, Groups: data},'sync',true,false);
    
    /*if(SyncData.version!=version){
        //TODO: update storage
        for (group in SyncData.Groups){
            chrome.storage.sync.set({[group]:SyncData.Groups[group]});
        }
        chrome.storage.sync.set({"Settings": {Version:SyncData.version}});
        
    }*/
});
}

loadSyncInMemory();

function backup(inData, fromVersion, type){
    downloadObjectAsJson(inData, "HighlightThis_BackupBeforeUpgradeFromV"+fromVersion+"_"+type+".txt", function(){});
}

function downloadObjectAsJson(exportObj, exportName, callback){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName );
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    callback();
}


function upgradeVersion(inData, type, backupBeforeUpgrade, forceSave){
    var result={};
    var upgraded=false;
    
    var latestVersion="20";

    if(type=="sync"){
        delete inData.Groups.Settings;
    } //avoids upgrading settings
    if(Number(inData.Version)<latestVersion){        
        backupBeforeUpgrade && backup(inData, inData.Version, type);
        upgraded=true;
    }
    if (inData.Version=="2") {
        //upgrade from v2
        for (var highlightData in inData.Groups) {
            inData.Groups[highlightData].Enabled=true;
            inData.Groups[highlightData].FindWords=true;
            inData.Groups[highlightData].Fcolor="#000";
            inData.Groups[highlightData].ShowOn=[];
            inData.Groups[highlightData].DontShowOn=[];
        }
        type=='local' && (inData.ShowFoundWords=true);
        type=='local' && (inData.neverHighlightOn=[]);
        inData.Version="6";
    }
    if (inData.Version=="3") {
        //upgrade from v3
        for (var highlightData in inData.Groups) {
            inData.Groups[highlightData].FindWords=true;
            inData.Groups[highlightData].Fcolor="#000";
            inData.Groups[highlightData].ShowOn=[];
            inData.Groups[highlightData].DontShowOn=[];
        }
        type=='local' && (inData.ShowFoundWords=true);
        type=='local' && (inData.neverHighlightOn=[]);
        inData.Version="6";
    }
    if (inData.Version=="4") {
        //upgrade from v4
        for (var highlightData in inData.Groups) {
            inData.Groups[highlightData].Fcolor="#000";
            inData.Groups[highlightData].ShowOn=[];
            inData.Groups[highlightData].DontShowOn=[];
        }
        type=='local' && (inData.ShowFoundWords=true);
        type=='local' && (inData.neverHighlightOn=[]);
        inData.Version="6";

    }
    if (inData.Version=="5") {
        //upgrade from v4
        for (var highlightData in inData.Groups) {
            inData.Groups[highlightData].DontShowOn=[];
        }
        type=='local' && (inData.neverHighlightOn=[]);
        inData.Version="6";
    }
    if (inData.Version=="6"){
        //convert words to array
        for (var highlightData in inData.Groups) {
            var arr = Object.keys(inData.Groups[highlightData].Words).map(function(k) { return k});
            inData.Groups[highlightData].Words=arr;
            inData.Groups[highlightData].Modified=Date.now();
        }
        inData.Version="7";
    }
    if (inData.Version=="7"){
        type=='local' && (inData.PrintHighlights=true);
        inData.Version="8";
    }
    if (inData.Version=="8"){
        for (var highlightData in inData.Groups) {
            inData.Groups[highlightData].Type='local';
        }
        inData.Version="9";
    }
    if (inData.Version=="9"||inData.Version=="10"){
        for (var highlightData in inData.Groups) {
            inData.Groups[highlightData].ShowInEditableFields=false;
        }
        inData.Version="11";
    }
    if (inData.Version=="11"){
        var today=new Date();
        type=='local' && (inData.Donate=today);            
        inData.Version="12";
    }
    if (inData.Version=="12"){
        type=='local' && (inData.PerformanceSetting=200);            
        inData.Version="13";
    }
    if (inData.Version=="13"){
        for (var highlightData in inData.Groups) {
            inData.Groups[highlightData].NotifyOnHighlight=false;
        }
        inData.Version="14";
    }
    if (inData.Version=="14"){
        for (var highlightData in inData.Groups) {
            inData.Groups[highlightData].NotifyFrequency=1;
            inData.Groups[highlightData].storage=type;
        }
        inData.Version="15";
    }
    if (inData.Version=="15"){
        for (var highlightData in inData.Groups) {
            inData.Groups[highlightData].regexTokens=false;
            inData.Groups[highlightData].caseSensitive=false;

        }
        inData.Version="16";
    }
    if (inData.Version=="16"|inData.Version=="17"){
        // fix for an issue due to a rollback on chrome and FF
        for (var highlightData in inData.Groups) {
            if(inData.Groups[highlightData].regexTokens==undefined){
                inData.Groups[highlightData].regexTokens=false;
                inData.Groups[highlightData].caseSensitive=false;
            }
        }
        inData.Version="18";
    }
    
    if (inData.Version=="18"){
        // add sync frequency to remote list config
        for (var highlightData in inData.Groups) {
            if(inData.Groups[highlightData].Type=='remote'){
                inData.Groups[highlightData].RemoteConfig.syncFrequency=240;
            }
        }
        inData.Version="19";
    }

    if (inData.Version=="19"){
        type=='local' && (inData.installId=uuidv4());
        inData.Version="20";
    }
    //apply and store
    if (type=='sync'){
        
        //delete inData.Version;
        SyncData=inData;
        delete SyncData.Version;
        if(upgraded||forceSave){
            chrome.storage.sync.clear(function(){
                chrome.storage.sync.set({"Settings":{"Version":inData.Version}},function(){});
                for(group in SyncData.Groups){
                    chrome.storage.sync.set({[group]:SyncData.Groups[group]},function(){});
                } 
            });
        }
    }
    else {
        HighlightsData = JSON.parse(JSON.stringify(inData)); // make a real copy since otherwise there is data loss in FF after a restore
        (upgraded||forceSave)&&(localStorage["HighlightsData"] = JSON.stringify(inData));
    }
    
    return true;
}


function createSearchMenu(){
    chrome.runtime.getPlatformInfo(
        function (i) {

            if (i.os == "mac") {
                var shortcut = "Shift+Cmd+Space";
            }
            else {
                var shortcut = "Shift+Ctrl+Space";
            }
            try {
                var highLight = chrome.contextMenus.create({
                    "title": chrome.i18n.getMessage("jump_to_word") + " (" + shortcut + ")",
                    "id": "Highlight"
                });

                var separator=chrome.contextMenus.create({
                    "type": "separator",
                    "contexts": ["all"],
                    "id": "separator"
                });
                var manage = chrome.contextMenus.create({
                    "title": "Manage",
                    "contexts": ["all"],
                    "id": "Manage"
                });
            }
            catch {

            }

        }
    );
}

function getGroupsForMoveOrCopy(){
    var filteredGroups=getGroups(HighlightsData, '',[]);
    filteredGroups=getGroups(SyncData, '', filteredGroups);
    var sortedByModified = [];

    for (var group in filteredGroups){
        if(filteredGroups[group].Type!="remote"){
            sortedByModified.push([group, filteredGroups[group].Modified,filteredGroups[group].storage])
        }
    }
    sortedByModified.sort(
        function(a, b) {
            return b[1] - a[1]
        }
    );
    return sortedByModified
}

function updateContextMenu(inUrl, reason){
    log('updatig context menu', inUrl);
    if(inUrl&&noContextMenu.indexOf(inUrl)==-1){
        chrome.contextMenus.removeAll(function(){
            /*the next console.log avoids a race condition it seems*/
            //console.log('contextMenus.removeAll callback from %s on %s',reason, inUrl);
            
            var contexts = ["selection"];
            
            var filteredGroups=getGroups(HighlightsData, inUrl,[]);
            filteredGroups=getGroups(SyncData, inUrl, filteredGroups);
            var sortedByModified = [];
    
            for (var group in filteredGroups){
                if(filteredGroups[group].Type!="remote"){
                    sortedByModified.push([group, filteredGroups[group].Modified,filteredGroups[group].storage])
                }
            }
            sortedByModified.sort(
                function(a, b) {
                    return b[1] - a[1]
                }
            );
            var numItems=0;
            createSearchMenu();

            for (var i = 0; i < contexts.length; i++) {
                var context = contexts[i];
    
                sortedByModified.forEach(function (group) {
                    var menuItemId=group[2]=='local'?"AddTo_" + group[0]:"SAddTo_" + group[0];
                    if (numItems==chrome.contextMenus.ACTION_MENU_TOP_LEVEL_LIMIT){
                        //create a parent menu
                        var parentid = chrome.contextMenus.create({
                            "title": chrome.i18n.getMessage("more"), "contexts": [context],
                            "id": "more"
                        });
                    }
                    var title = "+ " + group[0];
                    if (numItems>(chrome.contextMenus.ACTION_MENU_TOP_LEVEL_LIMIT-1)){
                        var id = chrome.contextMenus.create({
                            "title": title, "contexts": [context],
                            "id": menuItemId, "parentId":"more"
                        });
                    } else {
                        var id = chrome.contextMenus.create({
                            "title": title, "contexts": [context],
                            "id": menuItemId
                        });
                    }
                    numItems+=1;
                });
    
            }
        });
       

    }
}

//TODO : fix for Firefox


chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId.indexOf("AddTo_") ==0) {
        groupName = info.menuItemId.replace("AddTo_", "");
        var wordAlreadyAdded = false;

        if (HighlightsData.Groups[groupName].Words.indexOf(info.selectionText)>-1) {
            wordAlreadyAdded = true;
        }
        if (wordAlreadyAdded) {
            notifyWordAlreadyInList(info.selectionText)
        }
        else {
            HighlightsData.Groups[groupName].Words.push(info.selectionText);
            HighlightsData.Groups[groupName].Modified = Date.now();
            localStorage['HighlightsData'] = JSON.stringify(HighlightsData);
            notifyWordAdded(info.selectionText,groupName);

            updateContextMenu(tab.url, 'context menu clicked AddTo');
        }
    }
    if (info.menuItemId.indexOf("SAddTo_") ==0) {
        groupName = info.menuItemId.replace("SAddTo_", "");
        var wordAlreadyAdded = false;

        if (SyncData.Groups[groupName].Words.indexOf(info.selectionText)>-1) {
            wordAlreadyAdded = true;
        }
        if (wordAlreadyAdded) {
            notifyWordAlreadyInList(info.selectionText)

        }
        else {
            SyncData.Groups[groupName].Words.push(info.selectionText);
            SyncData.Groups[groupName].Modified = Date.now();       
            chrome.storage.sync.set({[groupName]:SyncData.Groups[groupName]});
            notifyWordAdded(info.selectionText,groupName);

            updateContextMenu(tab.url, 'context menu clicked SAddTo');
        }
    }
    if (info.menuItemId == "Highlight") {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {command: "ScrollHighlight"});
        });
    }
    if (info.menuItemId == "Manage") {
        if(getBrowser()=='Firefox'){
            browser.windows.create({
                url: "popup.html?url="+tab.url,
                width: 450,
                height: 640,
                type: 'panel'
            });
        }
        else {
            window.open("popup.html?url="+tab.url, "extension_popup", "width=470,height=640,status=no,scrollbars=no,resizable=no");
        }
    }
    requestReHighlight();
})



chrome.runtime.onInstalled.addListener(function() {
	log("Highlights plugin installed");
    chrome.alarms.create("Data sync", {"periodInMinutes":10});
    chrome.alarms.create("Send Analytics", {"periodInMinutes": 14400})

})

chrome.alarms.onAlarm.addListener(function(alarm){
    if(alarm.name=="Data sync") {
        syncData();
    }
    if(alarm.name=='Send Analytics'){
        sendAnalytics(collectAnalytics('timer'));
    }
})



chrome.commands.onCommand.addListener(function(command) {
  if (command=="ScrollHighlight") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {command: "ScrollHighlight"});
    });
  }
});


/*chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
      if (sender.id == "hpapadcmhnggfplkccakfdjgfkckjfko"){
        if(request.command=="getWords") {
            sendResponse({words:getWords(request.url)});
        }
      }
      return;
});*/

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        log("This is a first install!");
        var creating = chrome.tabs.create({
            url:"https://highlightthis.net/Welcome.html"
        });
        setTimeout(function(){ sendAnalytics(collectAnalytics('install')); }, 10000);

    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
        setTimeout(function(){ sendAnalytics(collectAnalytics('update')); }, 10000);
        /*var creating = chrome.tabs.create({
            url:"https://highlightthis.net/ReleaseNote_5_2.html"
          });*/
    }
    
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    log("message received", request, sender);

      if(request.command=="showWordsFound") {
          sendResponse({success:showWordsFound(request.state)});
      }
      if(request.command=="setPrintHighlights") {
          sendResponse({success:setPrintHighlights(request.state)});
      }
    if(request.command=="getWords") {
      sendResponse({words:getWords(request.url)});
    }
    if(request.command=="addGroup") {
      sendResponse({success:addGroup(request.group, request.color, request.fcolor, request.findwords, request.showon, request.dontshowon, request.words, request.groupType, request.remoteConfig, request.regex, request.showInEditableFields, request.notifyOnHighlight, request.storage, request.notifyFrequency, request.useRegexTokens, request.caseSensitive, request.action)});
    }
    if(request.command=="deleteGroup") {
      sendResponse({success:deleteGroup(request.group, request.storage)});
    }


    if(request.command=="syncList") {
        syncWordList(HighlightsData.Groups[request.group], true,request.group, request.remoteConfig, function(response){

            sendResponse(response);
        })
        
    }
    if(request.command=="setWords") {
      sendResponse({success:setWords(request.words, request.group, request.color, request.fcolor, request.findwords, request.showon, request.dontshowon,  request.newname, request.groupType, request.remoteConfig,request.regex, request.showInEditableFields, request.notifyOnHighlight, request.storage, request.notifyFrequency,request.useRegexTokens, request.caseSensitive, request.action)});
    }
    if(request.command=="removeWord") {
      sendResponse({success:removeWord(request.word)});
    }    
    if(request.command=="showHighlights") {
      showHighlights(request.count ,sender.tab.id, request.url);
      sendResponse({success: 'ok'});
    }
    if(request.command=="beep") {
      document.body.innerHTML += '<audio src="beep.wav" autoplay="autoplay"/>';
    }
    if(request.command=="getStatus") {
      sendResponse({status:highlighterEnabled, printHighlights: printHighlights, config:getConfig()});
    }

    if(request.command=="updateContextMenu"){
        updateContextMenu(request.url, ' message listener');
        sendResponse({success: 'ok'});

    }
    if(request.command=="flipGroup") {
      sendResponse({success: flipGroup(request.group, request.action, request.storage)});
    }
    if(request.command=="notifyOnHighlight"){

        showNotification(sender.tab.title, sender.tab.id, request.forced);
        sendResponse({success: 'ok'});
    }
    return true;
});


function requestReHighlight(){
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {command: "ReHighlight", words:getWords(tabs[0].url)});
    });
}
function importFile(contents, storage){
    //validation needed
    var validated=true;
    var temp=contents;
    if (temp.Version!=undefined){
        if (temp.Groups==undefined){validated=false;}
    }
    else {
        validated=false;

    }

    if (validated==true){
        //split in local and sync groups
        for(var group in temp.Groups){
            if (temp.Groups[group].storage) {
                if((storage=="sync" && temp.Groups[group].storage!=='sync')||(storage=='local'&&temp.Groups[group].storage=='sync')){delete temp.Groups[group];}
            }
        }
        if(storage=='local'){
            upgradeVersion(temp,'local', false,true);
            return true;
        }
        else {
            //only keep the groups and the version
            var syncObject={"Groups":temp.Groups, "Version": temp.Version};
            upgradeVersion(syncObject, 'sync', false,true)
            return true;
        }
    }
    return validated;
}

function getGroups(inData, inUrl, inResults){
    var groupsForUrl=inResults;
    try {
        for(var neverShowOn in inData.neverHighlightOn){
            if (inUrl.match(globStringToRegex(inData.neverHighlightOn[neverShowOn]))){
                return groupsForUrl;
            }
        }
        for (var highlightData in inData.Groups) {
            var returnHighlight=false;
            if (inData.Groups[highlightData].Enabled){
                if (inUrl==''||inData.Groups[highlightData].ShowOn.length==0){
                    returnHighlight=true;
                }
                else {
                    for(var showOn in inData.Groups[highlightData].ShowOn){
                        if (inUrl.match(globStringToRegex(inData.Groups[highlightData].ShowOn[showOn]))){
                            returnHighlight=true;
                        }
                    }
                }
                for(var dontShowOn in inData.Groups[highlightData].DontShowOn){
                    if (inUrl.match(globStringToRegex(inData.Groups[highlightData].DontShowOn[dontShowOn]))){
                        returnHighlight=false;
                    }
                }
                if(returnHighlight){groupsForUrl[highlightData]=inData.Groups[highlightData];}
            }
        }
    }
    catch {
        log('error in getting groups', inData, inUrl, inResults);
    }
    return groupsForUrl;
}
function getWords(inUrl){

    groupsForUrl=getGroups(HighlightsData, inUrl,[]);
    groupsForUrl=getGroups(SyncData, inUrl, groupsForUrl);
    //groupsForUrl = groupsForUrl.concat(syncGroupsForUrl);

    var wordsForUrl={words:{},regex:{}};

    //now let's calculate the regex and worlist 
    wordsForUrl.words=transformWordsToWordList(groupsForUrl);
    wordsForUrl.regex=transformWordsToRegex(wordsForUrl.words);
    wordsForUrl.skipSelectors=skipSelectorsForUrl(inUrl);
    return wordsForUrl;
}



function transformWordsToWordList(words){
    var wordsArray=[];
    var regexFindBackAgainstContent=/\(\?\=|\(\?\!|\(\?\<\=|\(\?\<\!/gi;

    for (group in words) {
        if (words[group].Enabled) {
            for (word in words[group].Words) {
                var findBackAgainstContent=false;
                if( words[group].Words[word].trim()!==''){
                    if(words[group].regexTokens){
                        var regex=words[group].Words[word];
                        if(words[group].Words[word].match(regexFindBackAgainstContent)){findBackAgainstContent=true;}
                    }
                    else{
                        var regex=globStringToRegex(words[group].Words[word]);
                    }
                   
                    var action=words[group].action||{type:0};

                    wordsArray.push( {
                        word: words[group].Words[word].toLowerCase(),
                        "regex": regex,
                        "Color": words[group].Color,
                        "Fcolor": words[group].Fcolor,
                        "FindWords": words[group].FindWords,
                        "ShowInEditableFields": words[group].ShowInEditableFields,
                        "NotifyOnHighlight": words[group].NotifyOnHighlight,
                        "NotifyFrequency": words[group].NotifyFrequency,
                        "Matchtoken": (words[group].caseSensitive?"":"i"),
                        "caseSensitive": words[group].caseSensitive,
                        "findBackAgainstContent":  findBackAgainstContent,
                        "action": action
                    });
                }
            }
        }
    }
    return wordsArray
}
function transformWordsToRegex(input){
    var words = "";
    var wordparts = "";
    var wordsEditable = "";
    var wordpartsEditable = "";

    var wordsCS = "";
    var wordpartsCS = "";
    var wordsEditableCS = "";
    var wordpartsEditableCS = "";

    //reverse sort the keys based on length
    var sortedKeys = input.sort(function (a, b) {
        return b.word.length - a.word.length;
    });

    input.map(function(x){return x.word})

    for (word in sortedKeys) {
        if (sortedKeys[word].FindWords) {
            if(sortedKeys[word].caseSensitive){
                wordsCS += sortedKeys[word].regex + "|";
                if (sortedKeys[word].ShowInEditableFields) {
                    wordsEditableCS += sortedKeys[word].regex + "|";
                }
            }
            else {
                words += sortedKeys[word].regex + "|";
                if (sortedKeys[word].ShowInEditableFields) {
                    wordsEditable += sortedKeys[word].regex + "|";
                }
            }
        }
        else {
            if(sortedKeys[word].caseSensitive){
                wordpartsCS += sortedKeys[word].regex + "|";
                if (sortedKeys[word].ShowInEditableFields) {
                    wordpartsEditableCS += sortedKeys[word].regex + "|";
                }
            }
            else {
                wordparts += sortedKeys[word].regex + "|";
                if (sortedKeys[word].ShowInEditableFields) {
                    wordpartsEditable += sortedKeys[word].regex + "|";
                }
            }
        }

    }
    //regex for all words non case sensitive
    var re = "";
    if (words.length > 1) {
        words = words.substring(0, words.length - 1);
        re += "(" + words + ")";
        re = "\\b" + re + "\\b" + "|\\s" + re + "\\s";
    }
    if (wordparts.length > 1 && words.length > 1) {
        re += "|";
    }
    if (wordparts.length > 1) {
        wordparts = wordparts.substring(0, wordparts.length - 1);
        re += "(" + wordparts + ")";
    }
    matchRegex = re;

    //regex for all words  case sensitive
    var re = "";
    if (wordsCS.length > 1) {
        wordsCS = wordsCS.substring(0, wordsCS.length - 1);
        re += "(" + wordsCS + ")";
        re = "\\b" + re + "\\b" + "|\\s" + re + "\\s";
    }
    if (wordpartsCS.length > 1 && wordsCS.length > 1) {
        re += "|";
    }
    if (wordpartsCS.length > 1) {
        wordpartsCS = wordpartsCS.substring(0, wordpartsCS.length - 1);
        re += "(" + wordpartsCS + ")";
    }
    matchRegexCS = re;

    //ContentEditable regex non case sensitive
    var re = "";
    if (wordsEditable.length > 1) {
        wordsEditable = wordsEditable.substring(0, wordsEditable.length - 1);
        re += "(" + wordsEditable + ")";
        re = "\\b" + re + "\\b" + "|\\s" + re + "\\s";
    }

    if (wordpartsEditable.length > 1 && wordsEditable.length > 1) {
        re += "|";
    }

    if (wordpartsEditable.length > 1) {
        wordpartsEditable = wordpartsEditable.substring(0, wordpartsEditable.length - 1);
        re += "(" + wordpartsEditable + ")";
    }
    matchRegexEditable = re;

    //ContentEditable regex case sensitive
    var re = "";
    if (wordsEditableCS.length > 1) {
        wordsEditableCS = wordsEditableCS.substring(0, wordsEditableCS.length - 1);
        re += "(" + wordsEditableCS + ")";
        re = "\\b" + re + "\\b" + "|\\s" + re + "\\s";
    }

    if (wordpartsEditableCS.length > 1 && wordsEditableCS.length > 1) {
        re += "|";
    }

    if (wordpartsEditableCS.length > 1) {
        wordpartsEditableCS = wordpartsEditableCS.substring(0, wordpartsEditableCS.length - 1);
        re += "(" + wordpartsEditableCS + ")";
    }
    matchRegexEditableCS = re;
    var doMatchRegex=matchRegex.length>0;
    var doMatchRegexCS=matchRegexCS.length>0;
    var domatchRegexEditable=matchRegexEditable.length>0;
    var domatchRegexEditableCS=matchRegexEditableCS.length>0;

    return {matchRegex: matchRegex,matchRegexCS: matchRegexCS, matchRegexEditable: matchRegexEditable, matchRegexEditableCS: matchRegexEditableCS,doMatchRegex:doMatchRegex, doMatchRegexCS:doMatchRegexCS, domatchRegexEditable:domatchRegexEditable,domatchRegexEditableCS:domatchRegexEditableCS};
}

function onPage(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {command: "getMarkers"}, function(result){
        if(result){
            return(result);
        }
    });
  });
}

function showNotification(text, inTabId, forced)   
{
    trackedTab=tabsTracker.find(({tabId}) => tabId === inTabId);
    if(trackedTab){
        if(!trackedTab.notifiedOnHighlight | forced){
            trackedTab.notifiedOnHighlight=true;
            notifyWordFoundOnPage(text);
        }
    }
}

function showHighlights(count, inTabId, inUrl) 
{

    trackedTab=tabsTracker.find(({tabId}) => tabId === inTabId);
    if(trackedTab){
    
        trackedUrl=trackedTab.urls.find(({url}) => url === inUrl);
        if(!trackedUrl){
            trackedTab.urls.push({url: inUrl, count: count});
        }
        else{
            trackedUrl.count=count;
        }
    }
    var totalCount=trackedTab.urls.reduce( function(a, b){
        return a + b.count;
    }, 0);
  chrome.browserAction.setBadgeText({"text":totalCount.toString(),"tabId":inTabId}); 
  chrome.browserAction.setBadgeBackgroundColor ({"color":"#0091EA"});
}

function getDataFromStorage(dataType) {
	if(localStorage[dataType]) {return JSON.parse(localStorage[dataType]);} else {return {};}
}

function getDataFromSyncStorage(callback){
    chrome.storage.sync.get(function(data){
        callback(data);
    });
}

chrome.storage.onChanged.addListener(function (changes, areaname){
    if (areaname=='sync'){
        log('reload sync storage in mem')
        loadSyncInMemory();
    }
})

function showWordsFound(inState) {
    HighlightsData.ShowFoundWords=inState;
    showFoundWords=inState;
    localStorage['HighlightsData']=JSON.stringify(HighlightsData);
}

function showDonate(){
    var today=new Date();
    if(HighlightsData.Donate<today){return true;}
    return false; 
}

function setDonate(state){
    var today=new Date();
    if(state){
        HighlightsData.Donate=today.setDate(today.getDate()+365);
    }
    else {
        HighlightsData.Donate=today.setDate(today.getDate()+100);
    }
    localStorage['HighlightsData']=JSON.stringify(HighlightsData);
}
function setPrintHighlights(inState) {
    HighlightsData.PrintHighlights=inState;
    printHighlights=inState;
    localStorage['HighlightsData']=JSON.stringify(HighlightsData);
}

function setNeverHighligthOn(inUrls){
    inUrls=JSON.parse(JSON.stringify(inUrls)); //fix for FF where it becomes a dead object after closing the popup
    HighlightsData.neverHighlightOn=inUrls;
    //neverHighlightOn=inUrls;
    localStorage["HighlightsData"]=JSON.stringify(HighlightsData);
}
function setPerformance(setting){
    HighlightsData.PerformanceSetting=setting;
    localStorage["HighlightsData"]=JSON.stringify(HighlightsData);
}

function addGroup(inGroup, color, fcolor, findwords, showon, dontshowon, inWords,groupType, remoteConfig, regex, showInEditableFields, notifyOnHighlight, storage, notifyFrequency,useRegexTokens, caseSensitive, action) {
    for(word in inWords){
        inWords[word]=inWords[word].replace(/(\r\n|\n|\r)/gm,"");
    }
    var newGroupObject={"Color":color, "Fcolor":fcolor, "Enabled":true, "ShowOn": showon, "DontShowOn":dontshowon, "FindWords":findwords, "Type":groupType, "ShowInEditableFields":showInEditableFields, "NotifyOnHighlight": notifyOnHighlight, "NotifyFrequency":notifyFrequency,"storage":storage, "regexTokens":useRegexTokens, "caseSensitive": caseSensitive}
    if (groupType=='remote'){
        newGroupObject.RemoteConfig=remoteConfig;
    }
    if (groupType=='regex'){
        newGroupObject.Regex=regex;
    }

    if(storage=='local'){
        HighlightsData.Groups[inGroup]=newGroupObject;
        localStorage['HighlightsData']=JSON.stringify(HighlightsData);
        setWords(inWords, inGroup, color, fcolor, findwords, showon, dontshowon, inGroup, groupType, remoteConfig, regex, showInEditableFields, notifyOnHighlight, storage, notifyFrequency,useRegexTokens, caseSensitive, action);
    }
    else {
        SyncData.Groups['s_'+inGroup]=newGroupObject;
        setWords(inWords, 's_'+inGroup, color, fcolor, findwords, showon, dontshowon, inGroup, groupType, remoteConfig, regex, showInEditableFields, notifyOnHighlight, storage, notifyFrequency,useRegexTokens, caseSensitive, action);

    }

    requestReHighlight();
    return true;
}
function deleteGroup(inGroup, storage) {
    if(storage=='local'){
        delete HighlightsData.Groups[inGroup];
        localStorage['HighlightsData']=JSON.stringify(HighlightsData);
        requestReHighlight();
    }
    else {
        delete SyncData.Groups[inGroup];
        chrome.storage.sync.remove(inGroup, function(){
            requestReHighlight();
        })
    }
    
    return true;
}
function flipGroup(inGroup, inAction, storage) {
    if(storage=='local'){
        if (inAction=="enable"){
            HighlightsData.Groups[inGroup].Enabled=true;
        }
        else {
            HighlightsData.Groups[inGroup].Enabled=false;
        }
        localStorage['HighlightsData']=JSON.stringify(HighlightsData);
    }
    else {
        if (inAction=="enable"){
            SyncData.Groups[inGroup].Enabled=true;
        }
        else {
            SyncData.Groups[inGroup].Enabled=false;
        }
        chrome.storage.sync.set({[inGroup]:SyncData.Groups[inGroup]});

    }
    
    requestReHighlight();
    return true;
}

function flipGroupWordFind(inGroup, inAction) {
  if (inAction=="enable"){
    HighlightsData.Groups[inGroup].FindWords=true;
  }
  else {
    HighlightsData.Groups[inGroup].FindWords=false;
  }
  localStorage['HighlightsData']=JSON.stringify(HighlightsData);
    requestReHighlight();
  return true;
}
function getHighlightsData(){
    //function called from popup to retrieve all highlightsdata (local and synced)
    var response=JSON.parse(JSON.stringify(HighlightsData));;
    for (var highlightData in response.Groups) {
        response.Groups[highlightData].storage='local';
    }
    for (var highlightData in SyncData.Groups) {
        response.Groups[highlightData]=SyncData.Groups[highlightData];
        response.Groups[highlightData].storage='sync';
    }
        
    return response;
}

function migrateStorage (fromStorage, toStorage, inGroup){
    if (fromStorage=='local'){
        var groupObject=HighlightsData.Groups[inGroup];
    }
    else{
        var groupObject=SyncData.Groups[inGroup]
    }

    if (toStorage=='local'){
        chrome.storage.sync.remove(inGroup, function(){
            groupObject.storage='local';
            HighlightsData.Groups[inGroup]=groupObject;
            localStorage['HighlightsData'] = JSON.stringify(HighlightsData);
            delete SyncData.Groups[inGroup];
        })

     }
     else{
        groupObject.storage='sync';
        chrome.storage.sync.set({[inGroup]:groupObject}, function(){
            SyncData.Groups[inGroup]=groupObject;
            delete HighlightsData.Groups[inGroup];
            localStorage['HighlightsData'] = JSON.stringify(HighlightsData);
        });
        
        
     }
     return true;
}

function addWords(words, groupName, storage, callback) {
    var wordAlreadyAdded = [];
    var wordsAdded = [];
    if (storage=='local'){
        for(var word in words){

            if (HighlightsData.Groups[groupName].Words.indexOf(words[word])>-1) {
                wordAlreadyAdded.push(words[word]);
            }
    
            else {
                HighlightsData.Groups[groupName].Words.push(words[word]);
                HighlightsData.Groups[groupName].Modified = Date.now();
                localStorage['HighlightsData'] = JSON.stringify(HighlightsData);
                wordsAdded.push(words[word]);
            }
        }
        
    }
    else {
        for(var word in words){
            if (SyncData.Groups[groupName].Words.indexOf(words[word])>-1) {
                wordAlreadyAdded.push(words[word]);
            }

            else {
                SyncData.Groups[groupName].Words.push(words[word]);
                SyncData.Groups[groupName].Modified = Date.now();       
                chrome.storage.sync.set({[groupName]:SyncData.Groups[groupName]});
                wordsAdded.push(words[word]);


            }
        }
    }
    if (wordAlreadyAdded.length>0) {
        notifyWordAlreadyInList(wordAlreadyAdded.join(','));
    }
    if (wordsAdded.length>0){
        notifyWordAdded(wordsAdded.join(','),groupName);
    }
callback();
}

function setWords(inWords, inGroup, inColor, inFcolor, findwords, showon, dontshowon, newname, groupType, remoteConfig, regex, showInEditableFields, notifyOnHighlight, storage, notifyFrequency,useRegexTokens, caseSensitive, action) {

    for(word in inWords){
        inWords[word]=inWords[word].replace(/(\r\n|\n|\r)/gm,"");
    }

    //get group
    if (storage=='local'){
        var groupObject=HighlightsData.Groups[inGroup];
    }
    else{
        var groupObject=SyncData.Groups[inGroup]
    }
    groupObject.Modified = Date.now();
    groupObject.Color = inColor;
    groupObject.Fcolor = inFcolor;
    groupObject.ShowOn = showon;
    groupObject.DontShowOn = dontshowon;
    groupObject.FindWords = findwords;
    groupObject.ShowInEditableFields = showInEditableFields;
    groupObject.NotifyOnHighlight = notifyOnHighlight;
    groupObject.NotifyFrequency = notifyFrequency;
    groupObject.regexTokens = useRegexTokens;
    groupObject.caseSensitive = caseSensitive;
    groupObject.action = action;
    if (groupType=='remote'){
        groupObject.RemoteConfig=remoteConfig;
        groupObject.Words = groupObject.Words||[];
    }
    else {
        groupObject.Words = inWords;
    }
    if (groupType=='regex'){
        groupObject.Regex=regex;
    }

    groupObject.FindWords = findwords;
    if (inGroup != newname) {
        //rename a group
        if (storage=='local'){
            HighlightsData.Groups[newname] = groupObject;
            delete HighlightsData.Groups[inGroup];
        }
        else{
            //delete the old one from storage
            chrome.storage.sync.set({[newname]:SyncData.Groups[inGroup]});
            chrome.storage.sync.remove(inGroup);
            delete SyncData.Groups[inGroup];
        }

    }
    else{
        if (storage=='local'){
            localStorage['HighlightsData'] = JSON.stringify(HighlightsData);
         }
         else{
             chrome.storage.sync.set({[inGroup]:SyncData.Groups[inGroup]});
         }
    }

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        updateContextMenu(tabs.url, 'setwords');
    });

    requestReHighlight();
    return true;
}

function globStringToRegex(str) {
    str=str.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&");
    return preg_quote(str).replace(/\*/g, '\S*').replace(/\\\?/g, '.');
}



// TODO: allow syncing data to a synced word list

function syncData() {
    log(Date().toString() + " - start sync");

    for (var highlightData in HighlightsData.Groups) {

        if (HighlightsData.Groups[highlightData].Type=='remote'){
            var sync=false;
            if(HighlightsData.Groups[highlightData].RemoteConfig.lastUpdated) {
                var lastUpdated=new Date(HighlightsData.Groups[highlightData].RemoteConfig.lastUpdated);
                var now= new Date();
                
                if(((now-lastUpdated)/60000)>Number(HighlightsData.Groups[highlightData].RemoteConfig.syncFrequency)){
                    sync=true;
                }
            }
            else {
                sync=true;
            }

            sync && syncWordList(HighlightsData.Groups[highlightData], false,'',HighlightsData.Groups[highlightData].RemoteConfig, function(){});
        }
    }

}

//https://docs.google.com/spreadsheets/d/1jZR7gcmyL4JDlehxVLMxQ9yLBeU5H5tA4uoSNvCiL9I/edit?usp=sharing
function syncWordList(list, notify, listname, inRemoteConfig, callback){
    log('syncing ' + list)
    var xhr = new XMLHttpRequest();

    remoteConfig=inRemoteConfig;

    switch(remoteConfig.type){
        case 'pastebin':
            getSitesUrl='https://pastebin.com/raw/'+remoteConfig.id;
            break;
        case 'web':
            getSitesUrl=remoteConfig.url;
            break;
        case 'googleSheets':
            getSitesUrl='https://spreadsheets.google.com/feeds/cells/'+remoteConfig.id+'/1/public/values?alt=json';
    }
    xhr.open("GET", getSitesUrl, true);

    xhr.setRequestHeader("Access-Control-Allow-Origin", getSitesUrl);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if(xhr.status==200){
                var wordsToAdd=[];
                if(remoteConfig.type=='googleSheets'){
                    result=JSON.parse(xhr.responseText);

                    result.feed.entry.forEach(function(e){if(e.gs$cell.col==1)wordsToAdd.push(e.content.$t)})
                }
                else {
                    var resp = DOMPurify.sanitize(xhr.responseText);
                    wordsToAdd = resp.split("\n").filter(function (e) {
                        return e;
                    });
                }
                
                for(word in wordsToAdd){
                    wordsToAdd[word]=wordsToAdd[word].replace(/(\r\n|\n|\r)/gm,"");
                }
                list.Words=wordsToAdd;
                list.RemoteConfig.lastUpdated=Date.now();
                localStorage['HighlightsData'] = JSON.stringify(HighlightsData);
                if(notify){
                notifySyncedList(listname);
                }    
                callback({success:true, words: wordsToAdd, lastUpdated: list.RemoteConfig.lastUpdated});
            }
            else {
                callback({success: false, message: "response status " + xhr.status})
            }
        }
      
    };
    xhr.onerror = function(r,e){
        log('error getting remote list',r,e);
        callback({success: false});
    }
    xhr.send();
    log(xhr.statusText)
}


// track tabs

chrome.tabs.onActivated.addListener(function(tabid){
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        log("in tabs onactivated", tabid, tabs);

        updateContextMenu(tabs[0].url, 'tab activate');
    });
});

chrome.tabs.onUpdated.addListener(
    function(inTabId, changeInfo, tab){
        
        log("in tabs onupdated", inTabId, tab);
        //check if url changed
        if(tab.url!=undefined){
            trackedTab=tabsTracker.find(({tabId}) => tabId === inTabId);
            if(trackedTab){
                    // url changed, register, set notified to false and remove subUrls
                    log('updating tab tracker');
                    trackedTab.url=tab.url;
                    trackedTab.urls=[];
                    trackedTab.notifiedOnHighlight=false;
            }
            else{
                log('assuming we missed the tab creation');
                trackedTab={tabId: tab.id, url: tab.url, urls: [], notifiedOnHighlight: false};
                tabsTracker.push(trackedTab);
            }
            if (changeInfo.status=='complete') updateContextMenu(tab.url, 'tab updated');
        }

    }
);
chrome.tabs.onCreated.addListener(function(tab){
    // add tab to tracked tabs
    trackedTab={tabId: tab.id, url: tab.url, urls: [], notifiedOnHighlight: false};
    tabsTracker.push(trackedTab);
    //update the context menu when there is a url
    if(tab.url!=undefined){updateContextMenu(tab.url,'tab created');}
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){

    tabsTracker=tabsTracker.filter(function(value, index, arr){ return value.tabId!=tabId;});

});


function preg_quote (str,delimiter) {
    // http://kevin.vanzonneveld.net
    // +   original by: booeyOH
    // +   improved by: Ates Goral (http://magnetiq.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // *     example 1: preg_quote("$40");
    // *     returns 1: '\$40'
    // *     example 2: preg_quote("*RRRING* Hello?");
    // *     returns 2: '\*RRRING\* Hello\?'
    // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
    // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
    //return str;
    return (str + '').replace(new RegExp('/^.*[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-].*$/', 'g'), '\\$&');
}

function getConfig(){
    if(HighlightsData.PerformanceSetting<200){
        return {
            highlightLoopFrequency: 250,
            fixedLoopTime: true,
            highlightAtStart: true,
            updateOnDomChange: true
        };
    }
    if(HighlightsData.PerformanceSetting<300){ 
                //Default
        return {
            highlightLoopFrequency: 500,
            fixedLoopTime: false,
            increaseLoop: 250,
            decreaseLoop: 125,
            maxLoopTime: 2500,
            minLoopTime: 500,
            highlightAtStart: true,
            updateOnDomChange: true
        };
    }
    if(HighlightsData.PerformanceSetting<400){ 
        return {
            highlightLoopFrequency: 1000,
            fixedLoopTime: false,
            increaseLoop: 500,
            decreaseLoop: 100,
            maxLoopTime: 2500,
            minLoopTime: 1000,
            highlightAtStart: true,
            updateOnDomChange: true
        };
    }
    if(HighlightsData.PerformanceSetting<500){ 
        // no ajax support, only highlights when doc loaded
        return {
            highlightLoopFrequency: 1000,
            fixedLoopTime: false,
            increaseLoop: 500,
            decreaseLoop: 50,
            maxLoopTime: 2500,
            minLoopTime: 1000,
            highlightAtStart: false,
            updateOnDomChange: false
        };
    }

    return {
        highlightLoopFrequency: 500,
        fixedLoopTime: false,
        increaseLoop: 250,
        decreaseLoop: 125,
        maxLoopTime: 2500,
        minLoopTime: 500,
        highlightAtStart: true,
        updateOnDomChange: true
    };

}

function getBrowser() {
    if (typeof chrome !== "undefined") {
        if (typeof browser !== "undefined") {
        return "Firefox";
        } else {
        return "Chrome";
        }
    } else {
        return "Edge";
    }
}

function log() {
    if (debug){
        debug&&console.log(arguments[0], {dateTime: Date.now(), logLine:arguments})
    }
}

