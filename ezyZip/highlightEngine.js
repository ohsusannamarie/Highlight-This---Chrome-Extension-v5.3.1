function HighlightEngine() {

    var highlightTag = "EM";
    var highlightClassname = "Highlight";
    var skipTags = new RegExp("^(?:SCRIPT|HEAD|NOSCRIPT|STYLE|TEXTAREA)$"); //TEXTAREA

    //var skipClasses = new RegExp("(ui-datepicker)",'gi');
    var SkipSelectors = "";
    
    var wordColor = [];
    var matchRegex = "";
    var matchRegexEditable = "";
    //var replaceRegex="";
    var numberOfHighlights = 0; 
    var highlights = {}; 
    var notifyAnyway= false;
    var highlightMarkers = {};
    var notifyForWords= new Set();
    var RegexConfig={};


    // recursively apply word highlighting
    this.highlightWords = function (node, printHighlights, inContentEditable, loopNumber) {

        if (node == undefined || !node) return;
        if (node.nodeType === Node.ELEMENT_NODE && (skipTags.test(node.nodeName)||node.matches(SkipSelectors))) return;

        if (node.hasChildNodes()) {
            for (var i = 0; i < node.childNodes.length; i++) {
                this.highlightWords(node.childNodes[i], printHighlights, inContentEditable || node.isContentEditable, loopNumber);
            }
        }


        if (node.nodeType == 3) {
            //only act on text nodes
            var nv = node.nodeValue;
            if(nv.trim()!=''){
                if(!(node.parentElement.tagName==highlightTag&&node.parentElement.className==highlightClassname)){
                    //if we compare 2 regex's eg Case Sensity / Insensitive. Take the one with the lowest index from the exec, if equal take the longest string in [0]
                    if(inContentEditable) {
                        RegexConfig.doMatchRegexEditable?(regs = matchRegexEditable.exec(nv)):regs=undefined;
                        RegexConfig.doMatchRegexEditableCS?(regsCS = matchRegexEditableCS.exec(nv)):regsCS=undefined;
                    } 
                    else {
                        RegexConfig.doMatchRegex?(regs = matchRegex.exec(nv)):regs=undefined;
                        RegexConfig.doMatchRegexCS?(regsCS = matchRegexCS.exec(nv)):regsCS=undefined;
                    }

                    if(regs&&regsCS){
                        if(regs.index>regsCS.index||(regs.index==regsCS.index&&regsCS[0].length>regs[0].length)){regs=regsCS} 
                    } else {
                        regs=regs||regsCS;
                    }

                    if (regs) {
                        var wordfound = "";

                        //find back the longest word that matches the found word 
                        //TODO: this can be faster
                        for (word in wordColor) {
                            var pattern = new RegExp(wordColor[word].regex, wordColor[word].Matchtoken);
                            
                            if ((!wordColor[word].findBackAgainstContent&&pattern.test(regs[0])||(wordColor[word].findBackAgainstContent&&pattern.test(regs.input))) && word.length > wordfound.length) {

                            //if (pattern.test(regs.input) && word.length > wordfound.length) {
                                wordfound = word;
                                break;
                            }
                        }

                        if (wordColor[wordfound] != undefined) {
                            var match = document.createElement(highlightTag);
                            match.className = highlightClassname;
                            match.appendChild(document.createTextNode(regs[0]));
                            if (printHighlights) {
                                match.style = "padding: 1px;box-shadow: 1px 1px #e5e5e5;border-radius: 3px;-webkit-print-color-adjust:exact;";
                            }
                            else {
                                match.style = "padding: 1px;box-shadow: 1px 1px #e5e5e5;border-radius: 3px;";
                            }

                            if (wordColor[wordfound].Color) {
                                match.style.backgroundColor = wordColor[wordfound].Color;
                            }
                            if (wordColor[wordfound].Fcolor) {
                                match.style.color = wordColor[wordfound].Fcolor;
                            }
                            match.setAttribute('match', wordColor[wordfound].word);
                            match.setAttribute('loopNumber', loopNumber);

                            if(wordColor[wordfound].action.type!=0){
                                    match.onclick=function () {
                                    clickHandler(this);
                                };
                            }
                            match.style.fontStyle = "inherit";

                            if (!inContentEditable || (inContentEditable && wordColor[wordfound].ShowInEditableFields)) {
                                var after = node.splitText(regs.index);
                                after.nodeValue = after.nodeValue.substring(regs[0].length);
                                node.parentNode.insertBefore(match, after);
                            }
                            if(wordColor[wordfound].NotifyOnHighlight) {
                                notifyForWords.add(wordColor[wordfound].word);
                                if (wordColor[wordfound].NotifyFrequency=="2"){
                                    notifyAnyway=true;
                                }
                            }
                            
                            var nodeAttributes = this.findNodeAttributes(node.parentElement, {
                                "offset": 0,
                                "isInHidden": false
                            });

                            highlightMarkers[numberOfHighlights] = {
                                "word": wordColor[wordfound].word,
                                "offset": nodeAttributes.offset,
                                "hidden": nodeAttributes.isInHidden,
                                "color": wordColor[wordfound].Color
                            };
                            

                            numberOfHighlights += 1;
                            highlights[wordfound] = highlights[wordfound] + 1 || 1;
                        }
                    }
                } 
                else {
                    //text was already highlighted
                    
                    if(node.parentElement.getAttribute('loopNumber')!==loopNumber.toString()) {
                        var nodeAttributes = this.findNodeAttributes(node.parentElement, {
                            "offset": 0,
                            "isInHidden": false
                        });
                        
                        highlightMarkers[numberOfHighlights] = {
                            "word": node.parentElement.getAttribute('match'),
                            "offset": nodeAttributes.offset,
                            "hidden": nodeAttributes.isInHidden,
                            "color": wordColor.find(obj => obj.word === node.parentElement.getAttribute('match')).Color
                        };
                        

                        numberOfHighlights += 1;
                        highlights[node.parentElement.getAttribute('match')] = highlights[node.parentElement.getAttribute('match')] + 1 || 1;
                    }
                }              
            }
        }
    };

    this.findNodeAttributes = function (inNode, attributes) {
        attributes.offset += inNode.offsetTop;
        if (inNode.hidden || inNode.getAttribute("aria-hidden")) {
            attributes.isInHidden = true;
        }
        if (inNode.offsetParent) {
            return this.findNodeAttributes(inNode.offsetParent, attributes);

        }
        return attributes;
    }

    // start highlighting at target node
    this.highlight = function (words, printHighlights, regexConfig, skipSelectors, loopNumber) {
        wordColor = words;
        numberOfHighlights = 0;

        RegexConfig=regexConfig;

        matchRegex = new RegExp(regexConfig.matchRegex,"i");
        matchRegexCS = new RegExp(regexConfig.matchRegexCS,"");
        matchRegexEditable = new RegExp(regexConfig.matchRegexEditable,"i");
        matchRegexEditableCS = new RegExp(regexConfig.matchRegexEditableCS,"");
        SkipSelectors = skipSelectors;
        //replaceRegex = new RegExp(regexConfig.replaceRegex, "i");
 
        if (matchRegex||matchRegexEditable) {
            this.highlightWords(document.body, printHighlights, false, loopNumber);
        }  
        return {numberOfHighlights: numberOfHighlights, details: highlights, markers: highlightMarkers, notify: Array.from(notifyForWords), notifyAnyway: notifyAnyway};
    };

}
