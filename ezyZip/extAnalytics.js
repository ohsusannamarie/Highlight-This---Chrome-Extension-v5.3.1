const analyticsEndpoint='https://api.highlightthis.net/api/analyticsService';

function collectAnalytics(reason){
    var analyticsObject = {
        version: chrome.runtime.getManifest().version,
        reason: reason,
        numberOfLocalGroups: 0,
        numberOfSyncGroups: 0,
        numberOfWords: 0,
        useDetectCompleteWords: false,
        useDetectPartialWords: false,
        useOfRegex: false,
        useOfCaseSensitive: false,
        useOfNotifications: false,
        useOfActions: false,
        useOfInclusionRules: false,
        useOfExclusionRules: false,
        useOfGeneralExclusionRules: false,
        sourceFromWeb: false,
        sourceFromSheets: false,
        sourceFromPastebin: false,
        browser: getBrowser()
    };
    
    // get general analytics
    
    analyticsObject.settings={
        performanceSetting:HighlightsData.PerformanceSetting,
        showFoundWords: HighlightsData.ShowFoundWords,
        version: HighlightsData.Version,
        neverHighlightOn: (HighlightsData.neverHighlightOn.length>0)
    }
    
    //get group analytics
    for (var groupname in HighlightsData.Groups) {
        var group = HighlightsData.Groups[groupname];
    
        analyticsObject.numberOfLocalGroups+=1;
        analyticsObject.numberOfWords+=group.Words.length;
        analyticsObject.useDetectCompleteWords=analyticsObject.useDetectCompleteWords||group.FindWords;
        analyticsObject.useDetectPartialWords=analyticsObject.useDetectPartialWords||!group.FindWords;
        analyticsObject.useOfRegex=analyticsObject.useOfRegex||group.regexTokens;
        analyticsObject.useOfCaseSensitive=analyticsObject.useOfCaseSensitive||group.caseSensitive;
        analyticsObject.useOfNotifications=analyticsObject.useOfNotifications||group.NotifyOnHighlight;
        if(group.action) analyticsObject.useOfActions=analyticsObject.useOfActions||group.action.type!=0;
        analyticsObject.useOfInclusionRules=analyticsObject.useOfInclusionRules||group.ShowOn.length>0;
        analyticsObject.useOfExclusionRules=analyticsObject.useOfExclusionRules||group.DontShowOn.length>0;
        if(group.Type=='remote'&&group.RemoteConfig.type=='googleSheets') analyticsObject.sourceFromSheets=true;
        if(group.Type=='remote'&&group.RemoteConfig.type=='web') analyticsObject.sourceFromWeb=true;
        if(group.Type=='remote'&&group.RemoteConfig.type=='pastebin') analyticsObject.sourceFromPastebin=true;
        
    }
    
    
    for (var groupname in SyncData.Groups) {
        var group = SyncData.Groups[groupname];
    
        analyticsObject.numberOfSyncGroups+=1;
        analyticsObject.numberOfWords+=group.Words.length;
        analyticsObject.useDetectCompleteWords=analyticsObject.useDetectCompleteWords||group.FindWords;
        analyticsObject.useDetectPartialWords=analyticsObject.useDetectPartialWords||!group.FindWords;
        analyticsObject.useOfRegex=analyticsObject.useOfRegex||group.regexTokens;
        analyticsObject.useOfCaseSensitive=analyticsObject.useOfCaseSensitive||group.caseSensitive;
        analyticsObject.useOfNotifications=analyticsObject.useOfNotifications||group.NotifyOnHighlight;
        if(group.action) analyticsObject.useOfActions=analyticsObject.useOfActions||group.action.type!=0;
        analyticsObject.useOfInclusionRules=analyticsObject.useOfInclusionRules||group.ShowOn.length>0;
        analyticsObject.useOfExclusionRules=analyticsObject.useOfExclusionRules||group.DontShowOn.length>0;
    }
    
    
   return analyticsObject;
}

function sendAnalytics(inObj){
    $.post(analyticsEndpoint+'/analytics/'+HighlightsData.installId,inObj,function(r){});
}