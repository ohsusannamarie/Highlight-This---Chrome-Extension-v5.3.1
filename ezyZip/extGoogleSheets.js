function getSheetAsJson(id){
    xhr.open("GET", 'https://spreadsheets.google.com/feeds/cells/'+id+'/1/public/values?alt=json', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status==200) {
            var resp = DOMPurify.sanitize(xhr.responseText);
            wordsToAdd = resp.split("\n").filter(function (e) {
                return e;
            });
            for(word in wordsToAdd){
                wordsToAdd[word]=wordsToAdd[word].replace(/(\r\n|\n|\r)/gm,"");
            }
            list.Words=wordsToAdd;
            list.RemoteConfig.lastUpdated=Date.now();
            localStorage['HighlightsData'] = JSON.stringify(HighlightsData);
            if(notify){
               notifySyncedList(listname);
            }    
        }
    };
    xhr.send();
}