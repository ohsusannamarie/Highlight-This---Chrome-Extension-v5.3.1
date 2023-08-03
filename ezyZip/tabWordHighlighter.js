var wordsArray = [];
var regexConfig={};
var skipSelectors='';
var ReadyToFindWords = true; //indicates if not in a highlight execution
var Config={
    highlightLoopFrequency: 1000,
    //highlightWarmup: 300,
    fixedLoopTime: false,
    increaseLoop: 500,
    decreaseLoop: 50,
    maxLoopTime: 2500,
    minLoopTime: 500,
    highlightAtStart: false,
    updateOnDomChange: false
};

var Highlight=true; // indicates if the extension needs to highlight at start or due to a change. This is evaluated in a loop
var HighlightLoopFrequency=1000; // the frequency of checking if a highlight needs to occur
//var HighlightWarmup=300; // min time to wait before running a highlight execution

var HighlightLoop;


var alreadyNotified = false;
var wordsReceived = false;
var highlighterEnabled = true;
var searchEngines = {
    'google.com': 'q',
    'bing.com': 'q'
}
var markerCurrentPosition = -1;
var markerPositions = [];
var highlightMarkers = {};
var markerScroll = false;
var printHighlights = true;

var debugStats={findCount:0, loopCount:0, subTreeModCount:0};
var debug = false;

if(window.location == window.parent.location){
    //only listen for messages in the main page, not in iframes since they load the extension too
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            debug && console.log("got a message", request);
            if (sender.id==chrome.runtime.id){ //sender.id == "abcibokldhgkclhihipipbiaednfcpia" || sender.id == "fgmbnmjmbjenlhbefngfibmjkpbcljaj" || sender.id=="highlightthis@deboel.eu" ||sender.id=="fooncbolibmdgfadbjclmmccbdkcgefb" || sender.id == "ijfjhfggkglopfajafgaafcmoiiocllc" || sender.id=='adnjkbmoheojmfpnamdabnlcbmojiidk') {
                if (request.command == "ScrollHighlight") {
                    jumpNext();
                    showMarkers();
                    return false
                }
                if (request.command == "getMarkers") {
                    sendResponse(highlightMarkers);
                    return true;
                }
                if (request.command == "ClearHighlights") {
                    highlightMarkers = {};
                    return false;

                }
                if (request.command == "ReHighlight") {
                    reHighlight(request.words);
                    return false;
                }
            }
            return true;
        }

    );
}
else {
    debug&&console.log("not in main page",window.location)
}

function jumpNext() {
    if (markerCurrentPosition == markerPositions.length - 1 || markerCurrentPosition > markerPositions.length - 1) {
        markerCurrentPosition = -1;
    }
    markerCurrentPosition += 1;
    $(window).scrollTop(markerPositions[markerCurrentPosition] - (window.innerHeight / 2));
}

function showMarkers() {
    var element = document.getElementById('HighlightThisMarkers');
    if (element) {
        element.parentNode.removeChild(element);
    }

    var containerElement = document.createElement("DIV");
    containerElement.id = "HighlightThisMarkers";

    for (marker in highlightMarkers) {
        var span = document.createElement("SPAN");
        span.className = "highlightThisMarker";
        span.style.backgroundColor = highlightMarkers[marker].color;
        var markerposition = document.body.scrollTop + (highlightMarkers[marker].offset / document.body.clientHeight) * window.innerHeight;
        span.style.top = markerposition + "px";
        containerElement.appendChild(span);
    }
    document.body.appendChild(containerElement);
    if (!markerScroll) {
        document.addEventListener("scroll", function () {
            showMarkers();
        });
        markerScroll = true;
    }
}

function reHighlight(words) {
    wordsArray=words.words;
    regexConfig=words.regex;
    skipSelectors= words.skipSelectors;
    findWords();
}


chrome.runtime.sendMessage({command: "getStatus"}, function (response) {
    debug&&console.log('reponse from getStatus',window.location);
    highlighterEnabled = response.status;
    printHighlights = response.printHighlights;
    Config = response.config;
    Highlight = Config.highlightAtStart;
    HighlightLoopFrequency= Config.highlightLoopFrequency;
    debug&&console.log('reponse from getStatus', Config);

    if (highlighterEnabled) {
        debug&&console.log('about to get words',window.location);

        chrome.runtime.sendMessage({
            command: "getWords",
            url: location.href.replace(location.protocol + "//", "")
        }, function (response) {
            debug&&console.log('got words');
            wordsArray=response.words.words;
            regexConfig=response.words.regex;
            skipSelectors=response.words.skipSelectors;
            debug&&console.log('processed words');
            wordsReceived = true;

            //start the highlight loop
            highlightLoop();
        });

    }
});

$(document).ready(function () {
    Highlight=true;

    debug && console.log('setup binding of dom sub tree modification');
    if(Config.updateOnDomChange){
        //setup the mutationobjserver

        // select the target node
        var target = document.querySelector('body');

        // create an observer instance
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
               debug&&console.log(mutation);
            });
                debug&&(debugStats.subTreeModCount+=1);
                Highlight=true;
            
        });

        // configuration of the observer:
        var config = { attributes: false, childList: true, characterData: true, subtree: true }

        // pass in the target node, as well as the observer options
        observer.observe(target, config);
        /*$("body").bind("DOMSubtreeModified", function () {
            debug&&(debugStats.subTreeModCount+=1);
            Highlight=true;        });*/
    }

    //    adgoalLauncher();
});


function highlightLoop(){

    ReadyToFindWords = true;
    debug&&console.log("in loop",debugStats);
    if(Highlight){
        findWords(); 
        //calucate new HighlightLoopFrequency
        if(!Config.fixedLoopTime&&HighlightLoopFrequency<Config.maxLoopTime){
            HighlightLoopFrequency+=Config.increaseLoop;
        }
    }
    else{
        if(!Config.fixedLoopTime&&HighlightLoopFrequency>Config.minLoopTime){
            HighlightLoopFrequency-=Config.decreaseLoop;
        } 
    }

    debug&&(debugStats.loopCount+=1);
    debug&&console.log("new loop frequency",HighlightLoopFrequency);

    HighlightLoop = setTimeout(function () {
        highlightLoop();
    }, HighlightLoopFrequency);

}


function getSearchKeyword() {
    var searchKeyword = null;
    if (document.referrer) {
        for (searchEngine in searchEngines) {
            if (document.referrer.indexOf(searchEngine)) {
                searchKeyword = getSearchParameter(searchEngines[searchEngine]);
            }
        }
    }
    return searchKeyword;
}
function getSearchParameter(n) {
    var half = document.referrer.split(n + '=')[1];
    return half !== undefined ? decodeURIComponent(half.split('&')[0]) : null;
}


function findWords() {
    if (Object.keys(wordsArray).length > 0) {
        Highlight=false;

        debug&&console.log('finding words',window.location);

        ReadyToFindWords=false;
        
        var changed = false;
        var myHilighter = new HighlightEngine();

        regexConfig.removeStrings="";
        
        var loopNumber=Math.floor(Math.random() * 1000000000);
        var highlights = myHilighter.highlight(wordsArray, printHighlights, regexConfig, skipSelectors, loopNumber);
        if (highlights.numberOfHighlights > 0) {
            highlightMarkers = highlights.markers;
            markerPositions = [];
            for (marker in highlightMarkers) {
                if (markerPositions.indexOf(highlightMarkers[marker].offset) == -1) {
                    markerPositions.push(highlightMarkers[marker].offset);
                }
            }
            markerPositions.sort();


            chrome.runtime.sendMessage({
                command: "showHighlights",
                count: highlights.numberOfHighlights,
                url: document.location.href
            }, function (response) {
            });
            if((!alreadyNotified | highlights.notifyAnyway)& highlights.notify.length>0){
                alreadyNotified=true;
                var notificationWords=''; 
                for (var notification in highlights.notify){
                    notificationWords+=(highlights.notify[notification])+', ';
                }
                chrome.runtime.sendMessage({
                    command: "notifyOnHighlight", forced: highlights.notifyAnyway
                }, function (response) {});
            }
        }
        debug&&console.log('finished finding words');
        debug&&(debugStats.findCount+=1);

        ReadyToFindWords = true;
        //}, HighlightWarmup);
    }

}


function globStringToRegex(str) {
    return preg_quote(str).replace(/\\\*/g, '\\S*').replace(/\\\?/g, '.');
}

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
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&'); 
    //return str;
}

function clickHandler(e){

    try {
        var match=e.getAttribute('match');
        //find my word
        var wordConfig=$.grep(wordsArray, function(obj){return obj.word === match;})[0];
        
        //testing purpose
        if (wordConfig){
            if (wordConfig.action.type==1) {
                //replace tokens
                var url=constructActionUrl(wordConfig.action.actionLink, e.innerText, match);
                /*var url=wordConfig.action.actionLink;
                url=url.replace(/\%w\%/gi, match)
                url=url.replace(/\%t\%/gi, e.innerText)
                url=url.replace(/\%wu\%/gi, match.toUpperCase())
                url=url.replace(/\%wl\%/gi, match.toLowerCase())
                url=url.replace(/\%tu\%/gi, e.innerText.toUpperCase())
                url=url.replace(/\%tl\%/gi, e.innerText.toLowerCase())*/
                
                window.open(url);
            }
        }
    }
    catch(c){

    }

}