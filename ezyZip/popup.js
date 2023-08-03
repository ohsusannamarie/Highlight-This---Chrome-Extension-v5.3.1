var HighlightsData = chrome.extension.getBackgroundPage().getHighlightsData();// JSON.parse(localStorage["HighlightsData"]);
var wordsToAdd = [];

var Colors = [["#FFFFFF", "#000000","#FFFF66","#FFD700","#FF8C00","#00FF00","#32CD32","#228B22", "#00BFFF","#1E90FF","#0000CD", "#FF0000"]];


/*var Colors=[
        ["#FFFFFF", "#000000","#9e9e9e","#ffeb3b","#2196F3","#4CAF50","#f44336"],
        ["#FFFF66","#FFD700","#FF8C00","#00FF00","#32CD32","#228B22", "#00BFFF","#1E90FF","#0000CD", "#FF0000"], 
        ["#FDDFDF", "#FCF7DE","#DEFDE0","#DEF3FD","#F0DEFD"]
    ];*/
var FColors = [["#FFFFFF", "#000000","#FFFF66","#FFD700","#FF8C00","#00FF00","#32CD32","#228B22", "#00BFFF","#1E90FF","#0000CD", "#FF0000"]];


var onPageShown = false;
var Collapsed=true;
var enableSaveButton=false;
var debug=false;

const urlParams = new URLSearchParams(window.location.search);


String.prototype.format = function() {
    a = this;
    for (k in arguments) {
      a = a.replace("{" + k + "}", arguments[k])
    }
    return a
  }

document.addEventListener('DOMContentLoaded', function () {
    fillLiterals();
    //settings page
    debug && console.log('dom loaded');
    if(urlParams.get('width')){
        document.body.style.width=urlParams.get('width');
    }
    
    if (getBrowser()=="Firefox") {
        document.getElementById("uploadform").style.display="none";
        document.getElementById("importFFLink").style.display="block"; 
        document.getElementById("importFFLink").addEventListener('click',function(){
            //open a new form in the browser
            var creating = chrome.tabs.create({
                url:browser.runtime.getURL("import.html")
              });
            window.close();
        });
    }
    else {
        document.getElementById("uploadform").style.display="block";
        document.getElementById("importFFLink").style.display="none"; 
   
    }
    document.getElementById("exportLink").addEventListener('click', function () {
        exportToFile();
        return false;
    });
    document.getElementById("settingsLink").addEventListener('click', function () {
        showSettings();
    });

    document.getElementById('importFile').addEventListener('change',function(){
        //document.getElementById('importFileLink').innerHTML = chrome.i18n.getMessage("field_import") + ' ' + document.getElementById('importFile').files[0].name;
        analyzeInputFile();
        //document.getElementById('importFileLink').style.display="block";
    })
    document.getElementById("backFromSettings").addEventListener('click', function () {
        document.getElementById("settingsGroup").style.display = "none";
        document.getElementById("wordDisplay").style.display = "block";
        document.getElementById("menu").style.display = "block  ";
        drawInterface();
        return false;
    });

    document.getElementById("cancelSettings").addEventListener('click', function () {
        closeSettings();
        return false;
    });
    document.getElementById("saveSettings").addEventListener('click', function (e) {
        e.preventDefault();
        saveSettings();
        return false;
    });
    document.getElementById("importFileLink").addEventListener('click', function () {
        startRead();
        return false;
    });

    //home page
    document.getElementById("collapseAll").addEventListener('click', function () {
        if (Collapsed){
            expandAll();
        }
        else {
            collapseAll();
        }

        return false;
    });

    document.getElementById("filterwords").addEventListener('keyup',function(){filterWords(this.value)});

    document.getElementById("showDonate").addEventListener('click',function(){
        window.open("https://highlightthis.net/Help.html");
    });

    //words found page
    document.getElementById("dontshowwords").addEventListener('click', function () {
        setShowWordsFound(false);
        showConfig();
        drawInterface();
        return false;
    });

    //word group page
    document.getElementById("cancelAddGroup").addEventListener('click', function () {
        cancelAddGroup();
        return false;
    });

    document.getElementById("cancelCreateGroup").addEventListener('click', function () {
        cancelAddGroup();
        return false;
    });

    document.getElementById("findwords").addEventListener('change', function () {
         hintNonUnicodeChar(editorToWords().join());
        return false;
    });


    document.getElementById("useRegexTokens").addEventListener('change',function(){
        if(document.getElementById("useRegexTokens").checked){
            document.getElementById("field_words_help").innerHTML = '<span class="regexmode">'+chrome.i18n.getMessage("regex_mode")+'</span>' + chrome.i18n.getMessage("field_words_regex_help");
            
        }
        else{
            document.getElementById("field_words_help").innerHTML = chrome.i18n.getMessage("field_words_help");
        }
        validateWords();
    })

    document.getElementById("highlightOnSites").addEventListener('focusout',function(){

        lengthLimitSyncStorage();
    })
    document.getElementById("dontHighlightOnSites").addEventListener('focusout',function(){

        lengthLimitSyncStorage();
    })

    document.getElementById("browseHighlight").addEventListener('click', function () {
        browseHighlight();
        return false;
    });
    document.getElementById("toConfig").addEventListener('click', function () {
        showConfig();
        drawInterface();
        return false;
    });
    document.getElementById("groupForm").addEventListener('submit', function (e) {
        e.preventDefault();
        submitGroup();
        //return false;
    });

    document.getElementById("migrateSuggestionButton").addEventListener('click', function () {
        migrateStorage();
        return false;
    });

    document.getElementById("yesDeleteGroup").addEventListener('click', function () {
        yesDeleteGroup();
        return false;
    });
    document.getElementById("noDeleteGroup").addEventListener('click', function (e) {
        e.preventDefault();
        noDeleteGroup();
        return false;
    });
   /* document.getElementById("deleteGroupLink").addEventListener('click', function () {
        deleteGroup();
        return false;
    });*/
    document.getElementById("myonoffswitch").addEventListener('change', function () {
        onOff();
        return false;
    });
    document.getElementById("performance").addEventListener('change',function(ev){
        showPerformanceDescription(ev.currentTarget.value*100+100);
    })
    document.getElementById("addGroupLink").addEventListener('click', function () {
        addGroup();
        return false;
    });

    document.getElementById("tabSettingsGeneral").addEventListener('click', function (ev) {
        switchTab(ev.currentTarget, "settingsGeneral","settings");
        return false;
    });
    document.getElementById("tabSettingsBackup").addEventListener('click', function (ev) {
        switchTab(ev.currentTarget, "settingsBackup","settings");
        document.getElementById("exportLinkDownload").innerHTML="";
        return false;
    });


    document.getElementById("tabGeneral").addEventListener('click', function (ev) {
        switchTab(ev.currentTarget, "firstScreen","general");
        return false;
    });
    document.getElementById("tabStyleScreen").addEventListener('click', function (ev) {
        switchTab(ev.currentTarget, "styleScreen","general");
        return false;
    });
    
    document.getElementById("tabLimitations").addEventListener('click', function (ev) {
        switchTab(ev.currentTarget, "secondScreen","general");
        return false;
    });
    document.getElementById("tabAction").addEventListener('click', function (ev) {
        switchTab(ev.currentTarget, "actionScreen","general");
        return false;
    });

    document.getElementById("tabAdvanced").addEventListener('click', function (ev) {
        var groupName= document.getElementById("group").value

        displayMigrateStorage(groupName);

        switchTab(ev.currentTarget, "thirdScreen","general");
        return false;
    });

    document.getElementById("syncLink").addEventListener('click', function (e) {
        e.preventDefault();
        syncList();
        return false;
    });
    document.getElementById("createGroupLink").addEventListener('click', function () {
        createGroup();
        return false;
    });

    function storageSelected(){
        var storageTypes= document.getElementsByName("storage");
        var storage;
        for(var i = 0; i < storageTypes.length; i++) {
            if(storageTypes[i].checked)
            storage = storageTypes[i].value;
        }
        if(storage=='local'){
            document.getElementById("newGroupTypePart2").style.display="block";
        }
        else {
            document.getElementById("newGroupTypePart2").style.display="none";
            document.getElementById("typeLocal").checked=true;
            document.getElementById("typeRemote").checked=false;
            
        }
        document.getElementById("createGroupLink").disabled=false;
    }

    document.getElementById("storageLocal").addEventListener('change',function(){
        storageSelected();
    });

    document.getElementById("storageSync").addEventListener('change',function(){
        storageSelected();
    });
    document.getElementById("field_remoteType").addEventListener('change',function(){

        document.getElementById("pastbinAttributes").style.display="none";
        document.getElementById("webAttributes").style.display="none";
        document.getElementById("googleSheetsAttributes").style.display="none";

        switch(document.getElementById("field_remoteType").value){
            case 'web':
                document.getElementById("webAttributes").style.display="block";

                break;
            case 'pastebin':
                document.getElementById("pastbinAttributes").style.display="block";
                break;
            case 'googleSheets':
            
                document.getElementById("googleSheetsAttributes").style.display="block";
              
                break;
        }

        debug && console.log(document.getElementById("field_remoteType").value);
    })

    document.getElementById("remoteSourceAttributes").addEventListener("change",function(){
        // disable sync button on change of remote config

        //document.getElementById("syncLink").disabled=true;

    });

    document.getElementById('launchGoogleSheetsAssisantbtn').addEventListener('click', function(e){
        e.preventDefault();
        document.getElementById('wordsSection').style.display='none';
        document.getElementById('findWordsSection').style.display='none';
        document.getElementById('launchGoogleSheetsAssisantbtn').style.display="none";
        
        document.getElementById("syncRow").style.display="none";
        document.getElementById("googleSheetsIdContainer").style.display="none";

        

        document.getElementById('closeGoogleSheetsAssisantbtn').style.display="block";
        document.getElementById('googleSheetsAssistant').style.display='block';


    })

    document.getElementById('closeGoogleSheetsAssisantbtn').addEventListener('click', function(e){
        e.preventDefault();
        document.getElementById('wordsSection').style.display='block';
        document.getElementById('findWordsSection').style.display='block';
        document.getElementById('googleSheetsAssistant').style.display='none';

        document.getElementById("syncRow").style.display="table-row";
        
        document.getElementById("googleSheetsIdContainer").style.display="block";

        document.getElementById('launchGoogleSheetsAssisantbtn').style.display="block";
        document.getElementById('closeGoogleSheetsAssisantbtn').style.display="none";

    })

    document.getElementById('googleAssistOKbtn').addEventListener('click',function(e){
        e.preventDefault();
        var url=document.getElementById('googleAssistLink').value;
        var response=extractGoogleSheetsIdFromURL(url);
        if(response.result){
            document.getElementById('googleSheetsId').value=response.id;
            document.getElementById('googleAssistInfo').innerText="success";
        }
        else{
            document.getElementById('googleAssistInfo').innerText="error " + response.message;

        }
    })
    debug && console.log('check donate');



    document.getElementById("action").addEventListener('change', function(e){
        displayActionOptions(e.target.value)
    })
    document.getElementById('actionLink').addEventListener('keyup', function(e){
        url=e.target.value.trim();
        actionURLValidation(url);
    })

    if (chrome.extension.getBackgroundPage().showDonate()){
        debug && console.log('show donate');
        document.getElementById("donate").style.display="block";
        document.getElementById("menu").style.display="none";
        document.getElementById("donatebtn").addEventListener('click', function (ev) {
            donate(true);
            return false;
        });
        document.getElementById("dontdonate").addEventListener('click', function (ev) {
            donate(false);
            return false;
        });
        
    }
    else {
        debug && console.log('go to drawinterface');
        drawInterface();
        if (onPageShown) {
            //it could take very long for getting on pageshown if there is a weird word config, therefore we already show the wordlst
        }
        else {
            debug && console.log('show found words');
            onPage();
        }
    }
});

function displayActionOptions(action){
    if(action=='1'){
        document.getElementById("action1Attributes").style.display="table-row";
        document.getElementById("action1Info").style.display="block";
        return;
    }
    document.getElementById("action1Attributes").style.display="none";
    document.getElementById("action1Info").style.display="none";
}
function actionURLValidation(url){
    var valid=true;
    var validationErrors= [];
    if(!isUrl(encodeURI(url))){
        validationErrors.push(chrome.i18n.getMessage("url_invalid"));
    };
    if(validationErrors.length>0){
        document.getElementById("actionLinkValidation").style.display="block";
        document.getElementById("actionLinkValidation").innerText=validationErrors.join("<br />");
        document.getElementById('actionExample').style.display="none";

    }
    else{
        document.getElementById("actionLinkValidation").style.display="none";
        document.getElementById('actionExampleUrl').innerHTML=constructActionUrl(url,'Highlight', 'Hi?hL*');
        document.getElementById('actionExample').style.display="block";

    }
}
function hintNonUnicodeChar(value){
    if(value.match(/[^\x00-\xFF]/gi)&&document.getElementById("findwords").checked){
        document.getElementById("hintNonUnicode").style.display="block";
        //document.getElementById("advancedInfoIcon").style.display="initial";
    }
    else{
        document.getElementById("hintNonUnicode").style.display="none";
        //document.getElementById("advancedInfoIcon").style.display="none";
    }
}


function acceptedLengthForSyncStorage(){
    var estimatedLength=500;
    //TOOD
    
    //estimatedLength+=document.getElementById("words").value.length;
    estimatedLength+=document.getElementById("highlightOnSites").value.length;
    estimatedLength+=document.getElementById("dontHighlightOnSites").value.length;
    
    if(estimatedLength>8000){
        return false;
    }

    return true;
}
function lengthLimitSyncStorage(){
    
    if(document.getElementById("field_storage").value=='sync' && !acceptedLengthForSyncStorage()){

        document.getElementById("formSubmitButton").disabled=true;
    }
    else {
        document.getElementById("formSubmitButton").disabled=false;
    }
    
}


function donate(state){
    document.getElementById("donate").style.display="none";
    document.getElementById("menu").style.display="block";
    if(state){
        window.open("https://www.paypal.me/WDeboel/1EUR");
    }
    chrome.extension.getBackgroundPage().setDonate(state);
    if (onPageShown) {
        drawInterface();
    }
    else {
        onPage();
    }
}
function fillLiterals(){

    document.getElementById("litTitle").innerHTML = chrome.i18n.getMessage("popup_title");
    document.getElementById("popup_title").innerHTML = chrome.i18n.getMessage("popup_title");
    document.getElementById("showDonate").innerHTML = chrome.i18n.getMessage("popup_showDonate");
    document.getElementById("byline").innerHTML = chrome.i18n.getMessage("popup_byline");
    document.getElementById("popup_nowords").innerHTML = chrome.i18n.getMessage("popup_nowords");
    //document.getElementById("popup_addnewlist").innerHTML = chrome.i18n.getMessage("popup_addnewlist");
    document.getElementById("collapseAll").innerHTML = chrome.i18n.getMessage("popup_collapseAll");
    document.getElementById("popup_create1").innerHTML = chrome.i18n.getMessage("popup_create1");
    document.getElementById("popup_create2").innerHTML = chrome.i18n.getMessage("popup_create2");
    //document.getElementById("popup_addnewlist").innerHTML = chrome.i18n.getMessage("popup_addnewlist");
    document.getElementById("toConfig").innerHTML = chrome.i18n.getMessage("popup_configureWords");
    document.getElementById("foundWords").innerHTML = chrome.i18n.getMessage("popup_foundWords");
    document.getElementById("dontShowWordsLabel").innerHTML = chrome.i18n.getMessage("popup_dontshowwords");
    document.getElementById("popup_tip1").innerHTML = chrome.i18n.getMessage("popup_tip1");
    document.getElementById("popup_tip2").innerHTML = chrome.i18n.getMessage("popup_tip2");
    document.getElementById("popup_tip3").innerHTML = chrome.i18n.getMessage("popup_tip3");
    //document.getElementById("deleteGroupLink").innerHTML = chrome.i18n.getMessage("deleteGroupLink");
    document.getElementById("field_listname").innerHTML = chrome.i18n.getMessage("field_listname");
    document.getElementById("field_colors").innerHTML = chrome.i18n.getMessage("field_colors");
    document.getElementById("field_colors_help").innerHTML = chrome.i18n.getMessage("field_colors_help");
    document.getElementById("field_foreground").innerHTML = chrome.i18n.getMessage("field_foreground");
    document.getElementById("field_background").innerHTML = chrome.i18n.getMessage("field_background");
    document.getElementById("example1").innerHTML = chrome.i18n.getMessage("example1");
    document.getElementById("example2").innerHTML = chrome.i18n.getMessage("example2");
    document.getElementById("example").innerHTML = chrome.i18n.getMessage("example");
    //document.getElementById("field_detection").innerHTML = chrome.i18n.getMessage("field_detection");
    document.getElementById("field_detection_help").innerHTML = chrome.i18n.getMessage("field_detection_help");
    document.getElementById("field_words").innerHTML = chrome.i18n.getMessage("field_words");

    document.getElementById("sites_info").innerHTML = chrome.i18n.getMessage("sites_info");
    document.getElementById("field_highlightOn").innerHTML = chrome.i18n.getMessage("field_highlightOn");
    document.getElementById("field_dontHighlight").innerHTML = chrome.i18n.getMessage("field_dontHighlight");
    document.getElementById("cancelAddGroup").innerHTML = chrome.i18n.getMessage("popup_cancel");
    document.getElementById("popup_settings").innerHTML = chrome.i18n.getMessage("popup_settings");
    document.getElementById("field_showFoundWords").innerHTML = chrome.i18n.getMessage("field_showFoundWords");
    document.getElementById("field_printHighlights").innerHTML = chrome.i18n.getMessage("field_printHighlights");
    document.getElementById("field_neverHighlightOn").innerHTML = chrome.i18n.getMessage("field_neverHighlightOn");
    document.getElementById("field_neverHighlightOn_help").innerHTML = chrome.i18n.getMessage("field_neverHighlightOn_help");
    document.getElementById("cancelSettings").innerHTML = chrome.i18n.getMessage("popup_cancel");
    document.getElementById("saveSettings").innerHTML = chrome.i18n.getMessage("popup_save");
    document.getElementById("field_exportSettings").innerHTML = chrome.i18n.getMessage("field_exportSettings");
    document.getElementById("exportLink").innerHTML = chrome.i18n.getMessage("field_export");
    document.getElementById("field_importSettings").innerHTML = chrome.i18n.getMessage("field_importSettings");
    document.getElementById("importFileLink").innerHTML = chrome.i18n.getMessage("field_import");
    document.getElementById("restoreWarning").innerHTML = chrome.i18n.getMessage("restoreWarning");
    document.getElementById("backFromSettings").innerHTML = chrome.i18n.getMessage("popup_back");
    document.getElementById("popup_confirmDelete").innerHTML = chrome.i18n.getMessage("popup_confirmDelete");
    document.getElementById("yesDeleteGroup").innerHTML = chrome.i18n.getMessage("popup_yes");
    document.getElementById("noDeleteGroup").innerHTML = chrome.i18n.getMessage("popup_no");
    document.getElementById("labelListName").innerHTML = chrome.i18n.getMessage("popup_labelListName");
    document.getElementById("newGroupTitle").innerHTML = chrome.i18n.getMessage("title_newGroupType");
    document.getElementById("newGroupDetail").innerHTML = chrome.i18n.getMessage("newGroupDetail");
    document.getElementById("cancelCreateGroup").innerHTML = chrome.i18n.getMessage("popup_cancel");
    document.getElementById("createGroupLink").innerHTML = chrome.i18n.getMessage("popup_next");
    document.getElementById("localLabel").innerHTML = chrome.i18n.getMessage("localLabel");
    document.getElementById("remoteLabel").innerHTML = chrome.i18n.getMessage("remoteLabel");
    document.getElementById("field_source").innerHTML = chrome.i18n.getMessage("field_source");
    document.getElementById("field_useRegexTokens_help").innerHTML = chrome.i18n.getMessage("field_useRegexTokens_help");
    document.getElementById("field_caseSensitive_label").innerHTML = chrome.i18n.getMessage("field_caseSensitive_label");

    
    document.getElementById("syncLinkText").innerHTML=chrome.i18n.getMessage("sync");

    document.getElementById("donate1").innerHTML = chrome.i18n.getMessage("donate1");
    document.getElementById("donate2").innerHTML = chrome.i18n.getMessage("donate2");
    document.getElementById("donate3").innerHTML = chrome.i18n.getMessage("donate3");
    document.getElementById("donatebtn").innerHTML = chrome.i18n.getMessage("donatebtn");
    document.getElementById("dontdonate").innerHTML = chrome.i18n.getMessage("dontdonate");

    document.getElementById("field_performance").innerHTML = chrome.i18n.getMessage("performance");
    document.getElementById("performanceHelp").innerHTML = chrome.i18n.getMessage("performanceHelp");

    
    document.getElementById("field_showInEditableFields_help").innerHTML = chrome.i18n.getMessage("highlight_editable_fields");
    document.getElementById("field_notifyOnHighlight_help").innerHTML = chrome.i18n.getMessage("notify_when_found");
    document.getElementById("notifyFrequency_1").innerHTML = chrome.i18n.getMessage("once_per_page");
    document.getElementById("notifyFrequency_2").innerHTML = chrome.i18n.getMessage("everytime");

    document.getElementById("newGroupTitleStorage").innerHTML = chrome.i18n.getMessage("sync_list_header");
    document.getElementById("newGroupDetailStorage").innerHTML = chrome.i18n.getMessage("sync_list_desc");
    document.getElementById("storageLocalLabel").innerHTML = chrome.i18n.getMessage("sync_list_no");
    document.getElementById("storageSyncLabel").innerHTML = chrome.i18n.getMessage("sync_list_yes");

    document.getElementById("non_unicode_chars").innerHTML = chrome.i18n.getMessage("non_unicode_chars");

    document.getElementById("tabGeneral").innerHTML = chrome.i18n.getMessage("tab_general");
    document.getElementById("tabStyleScreen").innerHTML = chrome.i18n.getMessage("tab_style");
    document.getElementById("tabLimitations").innerHTML = chrome.i18n.getMessage("tab_limitations");
    document.getElementById("tabAdvanced").innerHTML = chrome.i18n.getMessage("tab_advanced");
    document.getElementById("tabAction").innerHTML = chrome.i18n.getMessage("tab_action");

    document.getElementById("tabSettingsGeneral").innerHTML = chrome.i18n.getMessage("tab_settings_general");
    document.getElementById("tabSettingsBackup").innerHTML = chrome.i18n.getMessage("tab_settings_backup");

    document.getElementById("titleCreateNewList").innerHTML = chrome.i18n.getMessage("create_new_list");
    document.getElementById("remotelist_help").innerHTML = chrome.i18n.getMessage("remotelist_help");

    document.getElementById("wordsMoveMenuTitle").innerHTML = chrome.i18n.getMessage("send_to");
  


    document.getElementById("action_intro").innerHTML = chrome.i18n.getMessage("action_intro");
    document.getElementById("label_action").innerHTML = chrome.i18n.getMessage("label_action");
    document.getElementById("label_link").innerHTML = chrome.i18n.getMessage("label_link");
    document.getElementById("action_none").innerHTML = chrome.i18n.getMessage("action_none");
    document.getElementById("action_newtab").innerHTML = chrome.i18n.getMessage("action_newtab");
    document.getElementById("actionExampleHelp").innerHTML = chrome.i18n.getMessage("action_example");
    document.getElementById("action_tip1").innerHTML = chrome.i18n.getMessage("action_tip1");
    document.getElementById("action_tip2").innerHTML = chrome.i18n.getMessage("action_tip2");
    document.getElementById("action_tip3").innerHTML = chrome.i18n.getMessage("action_tip3");
    document.getElementById("action_tip4").innerHTML = chrome.i18n.getMessage("action_tip4");
    


    document.getElementById("last_synced_on").innerHTML = chrome.i18n.getMessage("last_synced_on");

    document.getElementById("launchGoogleSheetsAssisantbtn").innerHTML = chrome.i18n.getMessage("launch_assistant");
    document.getElementById("closeGoogleSheetsAssisantbtn").innerHTML = chrome.i18n.getMessage("close_assistant");
    document.getElementById("labelSheetsId").innerHTML = chrome.i18n.getMessage("sheets_id");
    document.getElementById("googleSheetsAssistantTitle").innerHTML = chrome.i18n.getMessage("sheets_assistant");
    document.getElementById("googleAssist1").innerHTML = chrome.i18n.getMessage("assistant_step_1");
    document.getElementById("googleAssist2").innerHTML = chrome.i18n.getMessage("assistant_step_2");
    document.getElementById("googleAssist3").innerHTML = chrome.i18n.getMessage("assistant_step_3");
    document.getElementById("googleAssist4").innerHTML = chrome.i18n.getMessage("assistant_step_4");
    document.getElementById("googleAssist5").innerHTML = chrome.i18n.getMessage("assistant_step_5");
    document.getElementById("googleAssist6").innerHTML = chrome.i18n.getMessage("assistant_step_6");


    launchGoogleSheetsAssisantbtn
}





function collapseAll() {
    document.getElementById("collapseAll").innerText = chrome.i18n.getMessage("popup_expandAll");
    var wordlists = document.getElementsByClassName("wordlist");
    for (var i = 0; i < wordlists.length; i++) {
        wordlists[i].style.display = "none";
    }
    Collapsed=true;
}

function expandAll() {
    document.getElementById("collapseAll").innerText = chrome.i18n.getMessage("popup_collapseAll");
    var wordlists = document.getElementsByClassName("wordlist");
    for (var i = 0; i < wordlists.length; i++) {
        wordlists[i].style.display = "block";
    }
    Collapsed=false;
}


function switchTab(tabElement, tabName, group) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName(group+" tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName(group+" tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    tabElement.className += " active";
}


function importFromFile() {
    window.alert("import");
}

function exportToFile() {
    var date = new Date();
    var day = ("0"+date.getDate()).slice(-2);
    var monthIndex = ("0"+(date.getMonth()+1)).slice(-2);
    var year = date.getFullYear();


   // downloadFileFromText('HighlightThis'+year+monthIndex+day, JSON.stringify(HighlightsData));
    downloadObjectAsJson(HighlightsData,'HighlightThis'+year+monthIndex+day,function(){})
}

function setShowWordsFound(inState) {
    debug && console.log("show words found", inState);
    chrome.runtime.sendMessage({command: "showWordsFound", state: inState}, function (response) {

    });
}

function setPrintHighlights(inState) {
    debug && console.log("set print highlights", inState);

    chrome.runtime.sendMessage({command: "setPrintHighlights", state: inState}, function (response) {
       
    });
}

function browseHighlight() {
    debug && console.log("Browse highlight");

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {command: "ScrollHighlight"});
    });
}

function updateGroupAfterSync(groupName, lastSync, words){
    HighlightsData.Groups[groupName].Words=words;
    HighlightsData.Groups[groupName].RemoteConfig.lastUpdated=lastSync;

}
function syncList(){
    debug && console.log("Sync list");
    document.getElementById("syncLinkText").innerHTML=chrome.i18n.getMessage("synchronizing");
    remoteConfig=getRemoteConfig();
    chrome.runtime.sendMessage({command: "syncList",group: document.getElementById("group").value, remoteConfig:remoteConfig}, function (response) {
        if(response.success){
            wordsToEditor(response.words);

            var lastSync=new Date(response.lastUpdated);
            document.getElementById("syncStatusLastUpdated").innerText=lastSync.toLocaleString(); 
            updateGroupAfterSync(document.getElementById("group").value, response.lastUpdated, response.words)
            //showStatusMessage("syncStatusMessage", "Done", true)
        }
        else {
            showStatusMessage("syncStatusMessage", response.message, false)
        }
        document.getElementById("syncLinkText").innerHTML=chrome.i18n.getMessage("sync");


    });
}

function showStatusMessage(containerId, message, success){
    document.getElementById(containerId).innerHTML=message;
    document.getElementById(containerId).style.display="initial";
    document.getElementById(containerId).className= (success?"statusSuccess":"statusError");
}



function onPage() {
    onPageShown = true;

    if (chrome.extension.getBackgroundPage().showFoundWords) {
        debug && console.log('show found words');

        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            debug && console.log("active tabs",tabs);
            chrome.tabs.sendMessage(tabs[0].id, {command: "getMarkers"}, function (result) {
                debug && console.log("got markers",result);

                if (result == undefined) {
                    //on a chrome page
                    drawInterface();
                }
                else {
                    debug && console.log('there is a result');
                    if (result[0] != undefined) {
                        debug && console.log('it has a page');
                        document.getElementById("menu").style.display = "none";
                        document.getElementById("wordDisplay").style.display = "none";
                        //document.getElementById("menu").style.display = "none";
                        document.getElementById("onPage").style.display = "block";
                        chrome.runtime.getPlatformInfo(
                            function (i) {
                                debug && console.log('got platform id');
                                if (i.os == "mac") {
                                    document.getElementById("OSKey").innerHTML = "Command";
                                }
                                else {
                                    document.getElementById("OSKey").innerHTML = "Control";
                                }
                            });
                            debug && console.log('about to render found words', result);
                        renderFoundWords(result);
                    }
                    else {
                        debug && console.log('go to drawinterface');
                        //drawInterface();
                    }
                }
            });
        });
    }
    else {
        drawInterface();
    }
}

function renderFoundWords(markers) {
    html = "";
    wordsFound = {};

    for (marker in markers) {
        if (wordsFound[markers[marker].word]) {
            wordsFound[markers[marker].word] += 1;
        }
        else {
            wordsFound[markers[marker].word] = 1;
        }
    }

    for (wordfound in wordsFound) {
        html += "<tr><td style='min-width:100px;'>" + DOMPurify.sanitize(wordfound) + "</td><td>" + wordsFound[wordfound] + "</td></tr>";
    }
    document.getElementById("wordsfound").innerHTML = html;
}


function setLimits() {
    document.getElementById("secondScreen").style.display = "block";
    document.getElementById("firstScreen").style.display = "none";
}

function backToFirstScreen() {

    document.getElementById("secondScreen").style.display = "none";
    document.getElementById("thirdScreen").style.display = "none";
    document.getElementById("actionScreen").style.display = "none";
    document.getElementById("firstScreen").style.display = "block";
}

function showSettings() {
    document.getElementById("showFoundWords").checked=chrome.extension.getBackgroundPage().HighlightsData.ShowFoundWords;
    document.getElementById("printHighlights").checked=chrome.extension.getBackgroundPage().HighlightsData.PrintHighlights;
    document.getElementById("performance").value=(chrome.extension.getBackgroundPage().HighlightsData.PerformanceSetting-100)/100;
   
    

    showPerformanceDescription(chrome.extension.getBackgroundPage().HighlightsData.PerformanceSetting);
   
    if(HighlightsData.neverHighlightOn && HighlightsData.neverHighlightOn.length>0){
        document.getElementById("neverHighlightOn").value=chrome.extension.getBackgroundPage().HighlightsData.neverHighlightOn.join("\n");
    }

    document.getElementById("wordDisplay").style.display = "none";
    document.getElementById("onPage").style.display = "none";
    document.getElementById("menu").style.display = "none";
    document.getElementById("secondScreen").style.display = "none";
    document.getElementById("firstScreen").style.display = "none";
    document.getElementById("newGroup").style.display = "none";
    document.getElementById("newGroupType").style.display = "none";
    document.getElementById("deleteGroup").style.display = "none";
    document.getElementById("settingsGroup").style.display = "block";
}

function showDonate() {
    document.getElementById("wordDisplay").style.display = "none";
    document.getElementById("menu").style.display = "none";

    document.getElementById("donateGroup").style.display = "block";
}


function closeSettings(){
    document.getElementById("settingsGroup").style.display = "none";
    document.getElementById("wordDisplay").style.display = "block";
    document.getElementById("menu").style.display = "block  ";
}
function showConfig() {
    document.getElementById("onPage").style.display = "none";

    document.getElementById("wordDisplay").style.display = "block";

    document.getElementById("menu").style.display = "block  ";
}
function deleteGroup(groupToDelete) {
    //var groupToDelete = document.getElementById("editWordsGroupName").value;
    document.getElementById("newGroup").style.display = "none";
    document.getElementById("deleteGroupName").innerHTML = DOMPurify.sanitize(groupToDelete);
    document.getElementById("wordDisplay").style.display = "none";
    document.getElementById("menu").style.display = "none";
    document.getElementById("deleteGroup").style.display = "block";
}

function yesDeleteGroup() {

    //TODO
    var group = DOMPurify.sanitize(document.getElementById("deleteGroupName").innerHTML);
    debug && console.log("yes delete group");

    chrome.runtime.sendMessage({command: "deleteGroup", group: group, storage: HighlightsData.Groups[group].storage}, function (response) {
        setTimeout(function () {
            drawInterface();
        }, 1000);
    });

    document.getElementById("wordDisplay").style.display = "block";
    document.getElementById("menu").style.display = "block  ";
    document.getElementById("deleteGroup").style.display = "none";
}


function noDeleteGroup() {
    document.getElementById("wordDisplay").style.display = "block";
    document.getElementById("menu").style.display = "block  ";
    document.getElementById("deleteGroup").style.display = "none";
}

function saveSettings(){
    setShowWordsFound(document.getElementById("showFoundWords").checked);
    setPrintHighlights(document.getElementById("printHighlights").checked);

    var neverHighlightOnSites = document.getElementById("neverHighlightOn").value.split("\n").filter(function (e) {
        return e
    });
    var cleanNeverHighlightOnSites=[];
    if(neverHighlightOnSites.length>0){
        neverHighlightOnSites.forEach(function(item) {
            cleanNeverHighlightOnSites.push( item.replace(/(http|https):\/\//gi, ""));
        });
    }
    chrome.extension.getBackgroundPage().setPerformance(document.getElementById("performance").value*100+100);
    chrome.extension.getBackgroundPage().setNeverHighligthOn(cleanNeverHighlightOnSites);

    closeSettings();
}

function showPerformanceDescription(performance){
    document.getElementById("perfomanceDescription").innerHTML=chrome.i18n.getMessage("perf_"+performance);
}
function addGroup() {
    //backToFirstScreen();
    //document.getElementById("deleteButton").style.display = "none";
    document.getElementById("wordDisplay").style.display = "none";
    document.getElementById("menu").style.display = "none";
    document.getElementById("newGroup").style.display = "none";
    document.getElementById("newGroupType").style.display = "block";
    document.getElementById('wordsSection').style.display='block';
    document.getElementById('findWordsSection').style.display='block';

    
    document.getElementById('googleSheetsAssistant').style.display='none';

    document.getElementById("createGroupLink").disabled=true;
    document.getElementById("storageLocal").checked=false;
    document.getElementById("storageSync").checked=false;
    document.getElementById("newGroupTypePart2").style.display="none";
}

function createGroup() {
    document.getElementById("groupForm").reset();
    wordsToEditor();

    var storageTypes= document.getElementsByName("storage");
    var storage;
    for(var i = 0; i < storageTypes.length; i++) {
        if(storageTypes[i].checked)
        storage = storageTypes[i].value;
    }
    document.getElementById("field_storage").value=storage;
    var listTypes = document.getElementsByName("type");
    var listType;

    for(var i = 0; i < listTypes.length; i++) {
        if(listTypes[i].checked)
            listType = listTypes[i].value;
    }
    document.getElementById("field_listType").value=listType;
    switch(listType){
        case "local":
            document.getElementById("words").contentEditable=true;
            document.getElementById("wordsDelete").style.display="initial";

            document.getElementById("regexSection").style.display="none";
            document.getElementById("words").className="";
            document.getElementById("extSource").style.display = "none";
            document.getElementById("syncFrequencySetting").style.display = "none";
            document.getElementById("wordsSection").style.display="block";

            

            break;
        case "remote":
            document.getElementById("regexSection").style.display="none";
            document.getElementById("words").contentEditable=false;
            document.getElementById("words").className="disabledWords";
            document.getElementById("wordsDelete").style.display="none";

            document.getElementById("extSource").style.display = "block";
            document.getElementById("syncFrequencySetting").style.display = "block";

            document.getElementById("field_remoteType").value="web";
            document.getElementById("googleSheetsAttributes").style.display="none";
            document.getElementById("pastbinAttributes").style.display="none";
            document.getElementById("webAttributes").style.display="block";
            document.getElementById("wordsSection").style.display="none";

            break;
        case "regex":
            document.getElementById("regexSection").style.dispay="block";
            document.getElementById("extSource").style.display = "none";
            document.getElementById("syncFrequencySetting").style.display = "none";
            document.getElementById("wordSection").style.display="none";

            break;
    }

    drawColorSelector("groupColorSelector", "#FFFF66");
    drawColorSelector("groupFColorSelector", "", "fcolor");
    document.getElementById("syncLink").style.display="none";
    document.getElementById("last_synced_on").style.display="none";
    document.getElementById("syncStatusLastUpdated").style.display="none";

    

    document.getElementById("syncStatusMessage").style.display="none";


    document.getElementById("example").style.backgroundColor = "#FFFF66";
    document.getElementById("example").style.color = "#000000";
    document.getElementById("groupFormTitle").innerHTML = chrome.i18n.getMessage("popup_createWordList");
    document.getElementById("formSubmitButton").innerHTML = chrome.i18n.getMessage("popup_add");
    document.getElementById("editWordsGroupName").value = "";
    document.getElementById("showInEditableFields").checked = false;
    document.getElementById("notifyOnHighlight").checked = false;
    document.getElementById("caseSensitive").checked = false;

    document.getElementById("useRegexTokens").checked = false;
    document.getElementById("field_words_help").innerHTML = chrome.i18n.getMessage("field_words_help");

    document.getElementById("notifyFrequency").value = "1";
    document.getElementById('actionExample').style.display="none";

    document.getElementById("action").value="0";
    displayActionOptions("0");


    hintNonUnicodeChar("");

    //backToFirstScreen();
    //document.getElementById("deleteButton").style.display = "none";
    document.getElementById("wordDisplay").style.display = "none";
    document.getElementById("newGroupType").style.display = "none";
    document.getElementById("menu").style.display = "none";
    document.getElementById("newGroup").style.display = "block";
}

function cancelAddGroup() {
    document.getElementById("editWordsGroupName").value = "";
    document.getElementById("wordDisplay").style.display = "block";

    document.getElementById("menu").style.display = "block  ";

    document.getElementById("newGroup").style.display = "none";
    document.getElementById("newGroupType").style.display = "none";
}

function flipGroup(inGroup, inAction) {
    debug && console.log("flip group");

    chrome.runtime.sendMessage({command: "flipGroup", group: inGroup, action: inAction, storage: HighlightsData.Groups[inGroup].storage}, function (response) {
        setTimeout(function () {
            drawInterface();
        }, 1000);
    });
}

function displayMigrateStorage(inGroup){
    //Migrate button and text
    if(HighlightsData.Groups[inGroup] && HighlightsData.Groups[inGroup].Type=='local'){
        document.getElementById("migrateSuggestionButton").disabled=false;
        if(HighlightsData.Groups[inGroup].storage=='local'){
            //suggest migrate to sync
            if(acceptedLengthForSyncStorage()){
                
                document.getElementById("migrateSuggestionText").innerHTML=chrome.i18n.getMessage("migrate_sync_text");
            }
            else{
                //avoid making a synced list
                document.getElementById("migrateSuggestionButton").disabled=true;
                document.getElementById("migrateSuggestionText").innerHTML=chrome.i18n.getMessage("migrate_sync_toobig_text");
            }
            document.getElementById("migrateSuggestionButton").innerHTML=chrome.i18n.getMessage("migrate_sync_button");
        }
        else {
            //suggest migrate to local
            document.getElementById("migrateSuggestionText").innerHTML=chrome.i18n.getMessage("migrate_local_text");
            document.getElementById("migrateSuggestionButton").innerHTML=chrome.i18n.getMessage("migrate_local_button");

        }
        document.getElementById('migrateSuggestion').style.display='block';
    }
    else {
        document.getElementById('migrateSuggestion').style.display='none';

    }
}
function migrateStorage(){
    var fromStorage=document.getElementById("field_storage").value;
    var groupName= document.getElementById("group").value

    if (fromStorage=='local'){
            chrome.extension.getBackgroundPage().migrateStorage(fromStorage, 'sync', groupName);


    }   
    else {
        chrome.extension.getBackgroundPage().migrateStorage(fromStorage, 'local', groupName);

    }
    
}

function editGroup(inGroup) {
    var wordsText = "";

    

    document.getElementById("highlightOnSites").value = HighlightsData.Groups[inGroup].ShowOn.join("\n");
    document.getElementById("dontHighlightOnSites").value = HighlightsData.Groups[inGroup].DontShowOn.join("\n");
    drawColorSelector("groupColorSelector", HighlightsData.Groups[inGroup].Color);
    drawColorSelector("groupFColorSelector", HighlightsData.Groups[inGroup].Fcolor, "fcolor");

    if(HighlightsData.Groups[inGroup].Words){
        wordsText=HighlightsData.Groups[inGroup].Words.join("\n");
    }
    else {
        wordsText='';

    }
    //wordsText='<div>'+HighlightsData.Groups[inGroup].Words.join("</div><div>")+'</div>';

    /*for (word in HighlightsData.Groups[inGroup].Words) {
        wordsText = wordsText + HighlightsData.Groups[inGroup].Words[word] + "\n";
    }*/
    document.getElementById("example").style.backgroundColor = HighlightsData.Groups[inGroup].Color;
    document.getElementById("example").style.color = HighlightsData.Groups[inGroup].Fcolor || '#000000';
    document.getElementById("formSubmitButton").innerHTML = chrome.i18n.getMessage("popup_save");
    document.getElementById("group").value = inGroup;
    document.getElementById("editWordsGroupName").value = inGroup;
    document.getElementById("groupFormTitle").innerHTML = chrome.i18n.getMessage("popup_editWordlist") + " " + inGroup;
    document.getElementById('googleSheetsAssistant').style.display='none';



    document.getElementById("field_storage").value= HighlightsData.Groups[inGroup].storage;
    switchTab(document.getElementById("tabGeneral"), "firstScreen","general");
    displayMigrateStorage(inGroup);

    //external lists
    document.getElementById("field_listType").value= HighlightsData.Groups[inGroup].Type;

    switch(HighlightsData.Groups[inGroup].Type){
        case "remote":
            document.getElementById("regexSection").style.display="none";
            document.getElementById("wordsSection").style.display="block";
            document.getElementById("findWordsSection").style.display="block";

            
            document.getElementById("words").contentEditable=false;
            document.getElementById("words").className="disabledWords";
            document.getElementById("wordsDelete").style.display="none";
            document.getElementById("syncLink").style.display="inline";
            document.getElementById("last_synced_on").style.display="initial";
            document.getElementById("syncStatusLastUpdated").style.display="initial";

            var lastSync=new Date(HighlightsData.Groups[inGroup].RemoteConfig.lastUpdated);
            document.getElementById("syncStatusLastUpdated").innerText=lastSync.toLocaleString(); 
            document.getElementById("extSource").style.display = "block";
                document.getElementById("syncRow").style.display="table-row";

            document.getElementById("syncFrequencySetting").style.display = "block";
            document.getElementById("field_remoteType").value=HighlightsData.Groups[inGroup].RemoteConfig.type;
            switch(HighlightsData.Groups[inGroup].RemoteConfig.type){
                case 'pastebin':
                    document.getElementById("pastebinId").value=HighlightsData.Groups[inGroup].RemoteConfig.id;
                    document.getElementById("webAttributes").style.display="none";
                    document.getElementById("pastbinAttributes").style.display="block";
                    document.getElementById("googleSheetsAttributes").style.display="none";

                    
                    break;
                case 'web':
                    document.getElementById("remoteWebUrl").value=HighlightsData.Groups[inGroup].RemoteConfig.url;

                    document.getElementById("webAttributes").style.display="block";
                    document.getElementById("pastbinAttributes").style.display="none";
                    document.getElementById("googleSheetsAttributes").style.display="none";
    
                    break;
                case 'googleSheets':
                    document.getElementById("googleSheetsId").value=HighlightsData.Groups[inGroup].RemoteConfig.id;
                    document.getElementById("googleSheetsAttributes").style.display="none";
                    document.getElementById("googleSheetsIdContainer").style.display="block";
                         document.getElementById("googleSheetsAttributes").style.display="block";

                   
                    document.getElementById("webAttributes").style.display="none";

                    document.getElementById("pastbinAttributes").style.display="none";
                    break;
                default:
            }
                 document.getElementById('syncFrequency').value=HighlightsData.Groups[inGroup].RemoteConfig.syncFrequency;
                document.getElementById('syncFrequency').disabled=false;

          
            break;
        case "regex":
            document.getElementById("regexSection").style.dispay="table-row";
            document.getElementById("extSource").style.display = "none";
            document.getElementById("syncFrequencySetting").style.display = "none";
            document.getElementById("wordsSection").style.display="none";
            document.getElementById("regex").value=HighlightsData.Groups[inGroup].Regex;
            break;
        default:
            document.getElementById("wordsSection").style.display="block";
            document.getElementById("regexSection").style.display="none";
            document.getElementById("words").contentEditable=true;
            document.getElementById("words").className="";
            document.getElementById("wordsDelete").style.display="initial";
            document.getElementById("syncLink").style.display="none";
            document.getElementById("extSource").style.display = "none";
            document.getElementById("syncFrequencySetting").style.display = "none";


    }
    
    backToFirstScreen();
    //document.getElementById("deleteButton").style.display = "block";
    document.getElementById("findwords").checked = HighlightsData.Groups[inGroup].FindWords;
    document.getElementById("showInEditableFields").checked = HighlightsData.Groups[inGroup].ShowInEditableFields;
    document.getElementById("notifyOnHighlight").checked = HighlightsData.Groups[inGroup].NotifyOnHighlight;
    document.getElementById("notifyFrequency").value = HighlightsData.Groups[inGroup].NotifyFrequency;
    document.getElementById("useRegexTokens").checked = HighlightsData.Groups[inGroup].regexTokens;
    document.getElementById("caseSensitive").checked = HighlightsData.Groups[inGroup].caseSensitive;

    if(HighlightsData.Groups[inGroup].action) {displayActionOptions(HighlightsData.Groups[inGroup].action.type);}



    
    if(HighlightsData.Groups[inGroup].regexTokens){
        document.getElementById("field_words_help").innerHTML = '<span class="regexmode">'+chrome.i18n.getMessage("regex_mode")+'</span>' + chrome.i18n.getMessage("field_words_regex_help");
    }
    else{
        document.getElementById("field_words_help").innerHTML = chrome.i18n.getMessage("field_words_help");

    }

    if(HighlightsData.Groups[inGroup].action){
        document.getElementById("action").value=HighlightsData.Groups[inGroup].action.type;
        if (HighlightsData.Groups[inGroup].action.type==1){
            document.getElementById("actionLink").value=HighlightsData.Groups[inGroup].action.actionLink;
            actionURLValidation(HighlightsData.Groups[inGroup].action.actionLink);
        }
    }

    //document.getElementById("words").value = wordsText;
    wordsToEditor(HighlightsData.Groups[inGroup].Words);
    hintNonUnicodeChar(wordsText);
    document.getElementById("wordDisplay").style.display = "none";
    document.getElementById("menu").style.display = "none";
    document.getElementById("syncStatusMessage").style.display="none";
    document.getElementById("syncLink").disabled=false;

    document.getElementById("newGroup").style.display = "block";
}


function cancelEditGroup() {
    document.getElementById("editGroupColorSelector").innerHTML = "";
    document.getElementById("editGroupFColorSelector").innerHTML = "";

    document.getElementById("wordDisplay").style.display = "block";
    document.getElementById("menu").style.display = "block  ";
    document.getElementById("editWords").style.display = "none";
}

function getRemoteConfig(){
    remoteType=document.getElementById("field_remoteType").value;
    switch(remoteType){
        case 'pastebin':
            remoteConfig={'type':'pastebin', 'id':document.getElementById("pastebinId").value};
            break;
        case 'googleSheets':
            remoteConfig={'type':'googleSheets', 'id':document.getElementById("googleSheetsId").value};
            break;
        case 'web':
            remoteConfig={'type':'web', 'url':document.getElementById("remoteWebUrl").value};
            break;
        default:
    }
    remoteConfig.syncFrequency=document.getElementById('syncFrequency').value;
    return remoteConfig;
}
function submitGroup() {
    var group = document.getElementById("editWordsGroupName").value;
    var newName = document.getElementById("group").value;

    if (group!=newName||newName==''){
        //check if there is no duplicate group name
        while (HighlightsData.Groups[newName]!=undefined || newName==''){
            newName+=1;
        }
    }
    if(document.getElementById("color").value==''){
        var color='';
    }
    else {
        var color = document.getElementById("color").jscolor.toHEXString();
    }
    if(document.getElementById("fcolor").value==''){
        var fcolor='';
    }
    else {
        var fcolor = document.getElementById("fcolor").jscolor.toHEXString();
    }
    var findwords = document.getElementById("findwords").checked;
    var showInEditableFields = document.getElementById("showInEditableFields").checked;
    var notifyOnHighlight = document.getElementById("notifyOnHighlight").checked;
    var notifyFrequency = document.getElementById("notifyFrequency").value;
    var useRegexTokens= document.getElementById("useRegexTokens").checked ;
    var caseSensitive = document.getElementById("caseSensitive").checked;
    var storage=document.getElementById("field_storage").value;
    var groupType=document.getElementById("field_listType").value;
    var remoteConfig={};
    if (groupType=='remote'){
        remoteType=document.getElementById("field_remoteType").value;
        remoteConfig=getRemoteConfig();
    }
    if (groupType=='regex'){
        var regexString=document.getElementById("regex").value;
    }
    else {
        var regexString=null;
    }

    document.getElementById("groupColorSelector").innerHTML = "";
    //TODO
    //var words = document.getElementById("words").value;
    /*wordsToAdd = words.split("\n").filter(function (e) {
        return e
    });*/
    wordsToAdd=editorToWords();

    highlightOnSites = document.getElementById("highlightOnSites").value.split("\n").filter(function (e) {
        return e
    });
    dontHighlightOnSites = document.getElementById("dontHighlightOnSites").value.split("\n").filter(function (e) {
        return e
    });

    var cleanHighLigthOnSites=[]; var cleanDontHighLigthOnSites=[];
    highlightOnSites.forEach(function(item) {
        //if (item.search(/[\/\*]/gi)==-1) {item=item+"/*";}
        cleanHighLigthOnSites.push( item.replace(/(http|https):\/\//gi, ""));
    });

    dontHighlightOnSites.forEach(function(item) {
        //if (item.search(/[\/\*]/gi)==-1) {item=item+"/*";}
        cleanDontHighLigthOnSites.push( item.replace(/(http|https):\/\//gi, ""));
    });

    var action={};
    if(document.getElementById("action")!=0){
        action.type= document.getElementById("action").value;
        action.actionLink=document.getElementById("actionLink").value;
    }
 

    if (group != "") {
        debug && console.log("before set words");

        chrome.runtime.sendMessage({
            command: "setWords",
            words: wordsToAdd,
            group: group,
            color: color,
            fcolor: fcolor,
            regex: regexString,
            findwords: findwords,
            showInEditableFields: showInEditableFields,
            notifyOnHighlight: notifyOnHighlight,
            notifyFrequency: notifyFrequency,
            showon: cleanHighLigthOnSites,
            dontshowon: cleanDontHighLigthOnSites,
            groupType: groupType,
            remoteConfig:remoteConfig,
            newname: newName,
            storage: storage,
            useRegexTokens: useRegexTokens,
            caseSensitive: caseSensitive,
            action: action
        }, function (response) {
            setTimeout(function () {
                
        
                drawInterface();
                document.getElementById("newGroup").style.display = "none";

                document.getElementById("wordDisplay").style.display = "block";
                document.getElementById("menu").style.display = "block";
            }, 500);
        });
    }
    else {
        debug && console.log("Before add group");

        chrome.runtime.sendMessage({
            command: "addGroup",
            group: newName,
            color: color,
            fcolor: fcolor,
            regex: regexString,
            findwords: findwords,
            showInEditableFields: showInEditableFields,
            notifyOnHighlight: notifyOnHighlight,
            notifyFrequency: notifyFrequency,
            showon: cleanHighLigthOnSites,
            dontshowon: cleanDontHighLigthOnSites,
            groupType: groupType,
            remoteConfig:remoteConfig,
            words: wordsToAdd,
            storage: storage,
            useRegexTokens: useRegexTokens,
            caseSensitive: caseSensitive,
            action: action
        }, function (response) {
            setTimeout(function () {

                drawInterface();
                document.getElementById("newGroup").style.display = "none";

                document.getElementById("wordDisplay").style.display = "block";
                document.getElementById("menu").style.display = "block";
                if(groupType=='remote'){
                    //download
                    chrome.runtime.sendMessage({command: "syncList",group: newName, remoteConfig:remoteConfig}, function (response) {
                        updateGroupAfterSync(newName, response.lastUpdated, response.words);

                    });
                }
            }, 500);
        });
    }


    clearHighlightsFromTab();
}

function extractGoogleSheetsIdFromURL(inUrl){
//https://spreadsheets.google.com/feeds/list/' + id + '/' + sheet + '/public/values?alt=json
    //        inUrl.replace('https://docs.google.com/spreadsheets/d/e/2PACX-1vSD7aoej2FzcDnF97B0FPjnJhSHhbfPWakes8jGRs7k52F9My0EPjIIa0upqinKp9bIcv_g0JlowKw2/pubhtml?gid=0&single=true')

    if(inUrl.indexOf('https://docs.google.com/spreadsheets/d')==0){
        var parts=inUrl.split('/');
        if(parts[5].length>10) {
            return {result: true, id: parts[5]};
        }
        else {
            if(parts[5]=='e'&&parts[6].length>10){
                return {result: true, id: parts[6]};

            }
        }
    }
    return {result:false, message:'not a valid url'};
}

function onOff() {
    if (chrome.extension.getBackgroundPage().highlighterEnabled) {
        chrome.extension.getBackgroundPage().highlighterEnabled = false;
    }
    else {
        chrome.extension.getBackgroundPage().highlighterEnabled = true;
    }
    renderOnOff();
}

function renderOnOff() {
    document.getElementById('myonoffswitch').checked = chrome.extension.getBackgroundPage().highlighterEnabled;
    if (!chrome.extension.getBackgroundPage().highlighterEnabled) {
        document.getElementById('header').style.backgroundColor = "grey";
    }
    else {
        document.getElementById('offDesc').innerHTML = "";
        document.getElementById('header').style.backgroundColor = "#0091EA";
    }
}

function clearHighlightsFromTab() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        debug&&("clearing highlights from tab");
        chrome.tabs.sendMessage(tabs[0].id, {command: "ClearHighlights"});
    });
}


function drawInterface() {
    debug && console.log('draw interface');
    HighlightsData = chrome.extension.getBackgroundPage().getHighlightsData(); //JSON.parse(localStorage["HighlightsData"]);
    var htmlContent = "";
    var groupNumber = 0;
    var linkNumber = 0;
    var arrGroups = Object.keys(HighlightsData.Groups).map(function(k) { return k});
    arrGroups.sort();
    //for (group in HighlightsData.Groups) {
    var groupix;
    for (groupix in arrGroups){
        group=arrGroups[groupix];
        var friendlyTitle=group;
        if(HighlightsData.Groups[group].storage=='sync'){
            friendlyTitle= group.replace(new RegExp("^s_+"), "");
        }
        htmlContent += '<div class="wordListContainer" groupname="'+group+'">';
        htmlContent += '<div class="groupTitle" id="groupHeader' + groupNumber + '">'
        if (HighlightsData.Groups[group].storage=='sync') {
            htmlContent += '<div class="list-icon"><i class="fa fa-exchange-alt" aria-hidden="true"></i></div>';
        }
        if (HighlightsData.Groups[group].Type=='remote') {
            htmlContent += '<div class="list-icon"><i class="fa fa-globe" aria-hidden="true"></i></div>';
        }
        if (HighlightsData.Groups[group].Enabled) {
            htmlContent += '<div class="groupColor" style="background-color:' + HighlightsData.Groups[group].Color + '; color:' + HighlightsData.Groups[group].Fcolor + ';">' + group.substr(0, 1) + '</div><div class="groupHeader">' + friendlyTitle + '</div>';
        }
        else {
            htmlContent += '<div class="groupColor" style=" background-color: #ccc;color:#fff;">' + group.substr(0, 1) + '</div><div class="groupHeader groupDisabled">' + friendlyTitle + '</div>';
        }
        htmlContent += '</div>';
        if (HighlightsData.Groups[group].ShowOn.length > 0||HighlightsData.Groups[group].DontShowOn.length > 0) {
            htmlContent += '<span style="margin-left: 5px;">('+chrome.i18n.getMessage("popup_limitations")+')</span>';
        }
        if (HighlightsData.Groups[group].Enabled) {
            htmlContent += '<a id="flipGroup' + groupNumber + '" class="flipGroup" tooltip="Disable group" group="' + group + '" action="disable" ><i class="fa fa-pause" aria-hidden="true"></i></a>';
        }
        else {
            htmlContent += '<a id="flipGroup' + groupNumber + '" class="flipGroup" tooltip="Enable group" group="' + group + '" action="enable" ><i class="fa fa-play" aria-hidden="true"></i></a>';
        }

        htmlContent += '<a id="deleteGroup' + groupNumber + '" class="deleteGroup" tooltip="Delete group" group="' + group + '"  ><i class="fa fa-trash" aria-hidden="true"></i></a>';

        htmlContent += '<a id="editGroup' + groupNumber + '" class="editGroup" tooltip="Edit group" group="' + group + '"  ><i class="fa fa-pencil-alt" aria-hidden="true"></i></a>';




        htmlContent += '<div class="clearfix"></div><ul id="wordList' + groupNumber + '" class="wordlist">';
        for (word in HighlightsData.Groups[group].Words) {
            htmlContent += '<li>' + DOMPurify.sanitize(HighlightsData.Groups[group].Words[word]) + '</li>';
        }
        htmlContent += '</ul>';
        htmlContent += '</div>';
        groupNumber += 1;
    }
    if (groupNumber == 0) {
        document.getElementById("intro").style.display = "block";
        document.getElementById("wordlistmenu").style.display = "none";
    }
    else {
        document.getElementById("intro").style.display = "none";
        document.getElementById("wordlistmenu").style.display = "block";

    }

    htmlContent += '<div style="text-align: center;width: 100%;position: fixed;bottom: 0px;background: white;"></div>' //<a id="settingsLink" class="secondaryLink" style="    ">'+chrome.i18n.getMessage("popup_settings")+'</a></div>';

    document.getElementById('wordData').innerHTML=htmlContent;
    if (Collapsed) {
        collapseAll();
    }
    else {
        expandAll();
    }



    for (var i = 0; i < groupNumber; i++) {
        var editGroupId = "editGroup" + i;
        var deleteGroupId = "deleteGroup" + i;
        var flipGroupId = "flipGroup" + i;
        var groupHeaderId = "groupHeader" + i;

        document.getElementById(editGroupId).addEventListener('click', function () {
            editGroup(this.getAttribute("group"));
            return false;
        });
        document.getElementById(deleteGroupId).addEventListener('click', function () {
            deleteGroup(this.getAttribute("group"));
            return false;
        });
        document.getElementById(flipGroupId).addEventListener('click', function () {
            flipGroup(this.getAttribute("group"), this.getAttribute("action"));
            return false;
        });
        document.getElementById(groupHeaderId).addEventListener('click',function(e){
            if(e.srcElement.parentElement.parentElement.childNodes[5].style.display=="block"){
                e.srcElement.parentElement.parentElement.childNodes[5].style.display="none";
            }
            else {
                e.srcElement.parentElement.parentElement.childNodes[5].style.display="block";
            }
            return false
        })

    }
    renderOnOff();

}


function filterWords(infilter){
    //wordListContainer
    var groupsToShow=[];
    var showGroup=false;
    var searchExp=new RegExp(infilter,'gi');
    if (infilter.length>0) {
        for (group in HighlightsData.Groups) {

            showGroup = false;
            if(group.match(searchExp)){
                showGroup = true;
            }
            else {
                for (word in HighlightsData.Groups[group].Words) {
                    if (HighlightsData.Groups[group].Words[word].match(searchExp)) {
                        showGroup = true;
                    }
                }
            }
            if (showGroup) {
                groupsToShow.push(group);
            }
        }

    }
    else {groupsToShow=Object.keys(HighlightsData.Groups);}

    allGroups=document.getElementsByClassName("wordListContainer");


    for( var group = 0; group < allGroups.length; group++) {
        if(groupsToShow.indexOf(allGroups[group].getAttribute("groupname"))>-1){
            allGroups[group].style.display="block";
        }
        else{
            allGroups[group].style.display="none";
        }

    }
}



function setColor(colorSelected, colorSet) {
    if(colorSelected.attributes["ColorValue"].value!=''){
        document.getElementById(colorSet).jscolor.fromString( colorSelected.attributes["ColorValue"].value);
    }
    else {
        document.getElementById(colorSet).value='';
    }
    colorElements = document.getElementById(colorSet + "list").getElementsByClassName("color")

    for (var i = 0; i < colorElements.length; i++) {
        colorElements[i].className = "color";
    }
    colorSelected.className += ' selected';

    renderColorExample();
}

function renderColorExample(){

        document.getElementById('example').style.color = document.getElementById("fcolor").jscolor.toHEXString();
        document.getElementById('example').style.backgroundColor = document.getElementById("color").jscolor.toHEXString();

}


function drawColorSelector(target, defaultColor, colorSet) {
    var colors;
    if (colorSet == "fcolor") {
        colors = FColors;
    } else {
        colors = Colors;
        colorSet = "color"
    }
    var htmlContent = '<ul id="' + colorSet + 'list" class="colorsList">';
    if ("" == defaultColor) {
        htmlContent += '<li class="color selected" colorValue="" style="color:red; text-align:center;"><span>x</span></li>';
    }
    else {
        htmlContent += '<li class="color" colorValue="" style="color:red; text-align:center;"><span>x</span></li>';
    }
    var color;

    for(row in colors){
        for (color in colors[row]) {
            if(color==0&&row>0){var style="clear: both;"} else {var style='';} 
            if (colors[row][color] == defaultColor) {
                htmlContent += '<li class="color selected" colorValue="' + colors[row][color] + '" style="'+style+'background-color:' + colors[row][color] + '; color: ' + invertColor(colors[row][color],true) + ';"></li>';
            }
            else {
                htmlContent += '<li class="color" colorValue="' + colors[row][color] + '" style="'+style+'background-color:' + colors[row][color] + '; color: ' + invertColor(colors[row][color],true)+ ';"></li>';
            }
        }

    }
   
    htmlContent+='</ul>';
    document.getElementById(target).innerHTML = htmlContent;

    htmlContent = '<input id="' + colorSet + '" class="jscolor" style="margin-left:10px;max-width:60px;" placeholder="html color code e.g. #e5e5e5" value="' + defaultColor + '">';
    document.getElementById(target+'Input').innerHTML = htmlContent;

    var colorelements = document.getElementById(colorSet + "list").getElementsByClassName("color");
    document.getElementById(colorSet).addEventListener('change', function(){renderColorExample();});
    for (var i = 0; i < colorelements.length; i++) {
        colorelements[i].addEventListener('click', function () {
            setColor(this, colorSet);
            return false;
        });
    }
    jscolor.installByClassName("jscolor");
    
}




function downloadObjectAsJson(exportObj, exportName, callback){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName );
    downloadAnchorNode.innerHTML=chrome.i18n.getMessage("download_backup");
    var parentEl=document.getElementById("exportLinkDownload");
    parentEl.innerHTML='';
    parentEl.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    //downloadAnchorNode.remove();
    callback();
  }

function readFile(callback){
    var file = document.getElementById('importFile').files[0];
    var reader = new FileReader();


    reader.onload = function(evt){
        var fileString = evt.target.result;
        var tempObj= JSON.parse(fileString);
        callback(tempObj);
    };
    reader.readAsText(file, "UTF-8");
    return true;
}
function analyzeInputFile(evt){
    document.getElementById("importSyncFileLink").style.display='none';
    document.getElementById("importLocalFileLink").style.display='none';
    document.getElementById("hintRestore").style.display='none';

    readFile(function(tempObj){
         var countSync=0; var countLocal=0;
        for (group in tempObj.Groups){
            tempObj.Groups[group].storage=='sync'?countSync+=1:countLocal+=1;
        }
        if (countSync>0){
            document.getElementById("importSyncFileLink").innerHTML=chrome.i18n.getMessage("importSyncRules").format(countSync);
            document.getElementById("importSyncFileLink").style.display='block';
            document.getElementById("hintRestore").style.display='block';
            document.getElementById("importSyncFileLink").addEventListener('click', function (e) {
                e.preventDefault();
                restoreBackup('sync');
                return false;
            });

        }
        if (countLocal>0){
            document.getElementById("importLocalFileLink").innerHTML=chrome.i18n.getMessage("importLocalRules").format(countLocal);
            document.getElementById("importLocalFileLink").style.display='block';
            document.getElementById("hintRestore").style.display='block';
            document.getElementById("importLocalFileLink").addEventListener('click', function (e) {
                e.preventDefault();
                restoreBackup('local');
                return false;
            });
        }
        
    });
    //reader.readAsText(file, "UTF-8");

}

function restoreBackup(storage) {
    readFile(function(fileObj){
        if(!chrome.extension.getBackgroundPage().importFile(fileObj, storage)){
            document.getElementById('importError').innerText=chrome.i18n.getMessage("popup_importFailed");
        }
        else {
            drawInterface();
            closeSettings();
        }
    })  

}


