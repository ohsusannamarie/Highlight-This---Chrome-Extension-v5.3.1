var WordsSelectAll=true;


var RandomString="nv5oN52OYN2hGhQlsIL4QuetMdZk5gELIWiCD5uUXYjWeHi1GfxKjJ3nRLYSwV3x7V07wHcyNTXUK6uF81C2PDAGzd9xRNHp88DKnJmFFsfOkiSlPYaqP7JOUTNezmvWgcbcDlKqVXszEQ8hz61Zz7OvoQ09H2l33RsGaBRG2YgJUe4ba2VA6KIvynei3IgkPFDRJjQetNPWIyXe9q2ph3hbSDfVowmwPisl8nQo2MMGOGr7dwLKsGdkw0YOJtjsvchaUYGXhp1a4f4VzfCFRUCHaD9gkYYBb5joCcP9Q0Zl0CNrubl8FI8KQRBLuAWTaKyL76X8jywrrkFBVxfAYUlbeaAm0B7fLvMRbJr8vQAn6qtCgAr2ffO0ydL6VSiylinz14UBgfwJaecwvhA41RjJ2qgaVylive1ULvzZc0oRNmMIjX88epRxobuskWz8wwQJLa0q0lYj1kixn841MxLWwjLndX72n1n7jxkWzxTxsqXK62YZiafdYg4cNO0Ehdc5AUDDMXVKdfyRMpVBA81M3gBTfUf7YuE1qxnyMiwDsI0ocYmhHBbVfNyuR3ZblfUYEhb9eY2aw5Ib3LCD3qVVHCtfYAdfVdk75jIhyZw5eiM77u3SOeQLnO8e4SRKKbAw3AhyqerX8QptPHY4lPohp9yOyHKv9gGfxk7m1fTisFHNHBf7cT8vtXLgjM4GzUmeFQP8F13AoDDtLL9of2H5WvX97uNC2LNpPaatBd1WAOVEmr1AY7XDG9dldYSghp4eNx4XMT8tzeGj0C7zowaGJWGWgUOIhM5tecbIcNwHaW574xgTCp1FD5Ix6BPXiolcvJM8JdEMgxXPeXbOx6q7IZtvBJ9FZym2En8fqELR6BioMbjbrjCwyDUDGx2z5UTltmVpGPuY9Xqw3yDz9OxqukDll3wXvlTNqfabyf1oD9wHMukrlu32A4hLObmgXnCVxiCJawzuHds747t5VpoKLrcjo2cN2ozaDjau";
var WordCheckTimeout = null; 

document.addEventListener('DOMContentLoaded', function () {

    document.getElementById("words").addEventListener("paste", function(e) {
        e.preventDefault();
        if(document.getElementById("words").innerHTML.trim()==''||document.getElementById("words").innerHTML.trim()=='<br>'){
            document.getElementById("words").innerHTML='<div></div>'
        }
        var text = e.clipboardData.getData("text/plain");
        if (getBrowser()=="Firefox") {
            ensureOneParagraph();
            textArray=text.split('\n')
            textArray.forEach(function(word){
                document.execCommand("insertParagraph", false, null);
                document.execCommand("insertText", false, word);
            });
        }
        else {
            document.execCommand("insertText", false, text);
        }

        hintNonUnicodeChar(editorToWords().join(''));

    });
    document.getElementById("words").addEventListener("drop", function(e) {
        e.preventDefault();

        if(document.getElementById("words").innerHTML.trim()==''||document.getElementById("words").innerHTML.trim()=='<br>'){
            document.getElementById("words").innerHTML='<div></div>'
        }
        var text = e.dataTransfer.getData("Text");
        document.execCommand("insertText", false, text);
        hintNonUnicodeChar(editorToWords().join(''));

    });

    document.getElementById("words").addEventListener("click", function(e) {
        if(e.x<35){
            WordsSelectAll=false;
            updateWordsSelectIcon();
            if(e.target.className=="") {
                e.target.className="checked";
            }
            else if (e.target.className="checked"){
                e.target.className="";
            }
        }
    });
    document.getElementById("wordsSelectBtn").addEventListener("click", function(e) {
        WordsSelectAll=!WordsSelectAll;
        e.preventDefault(); 
        document.querySelectorAll("#words div:not([hidden])").forEach(element => {
            element.className=WordsSelectAll?"":"checked";
        });
        updateWordsSelectIcon();
    });
    document.getElementById("wordsDelete").addEventListener('click', function(e){
        e.preventDefault();
        WordsSelectAll=true;
        updateWordsSelectIcon();
        document.querySelectorAll("#words div.checked:not([hidden])").forEach(function(el){el.remove()});
        ensureOneParagraph();
    });
    document.getElementById("wordsMove").addEventListener('click', function(e){
        e.preventDefault();
 
        //build menu
        groups=chrome.extension.getBackgroundPage().getGroupsForMoveOrCopy();
        var menuHtml='';
        for(var group in groups){
            if(groups[group][0]!=document.getElementById("editWordsGroupName").value)
            menuHtml+='<li groupName="'+groups[group][0]+'" groupStorage="'+groups[group][2]+'">'+groups[group][0]+'</li>';
        }
        
        document.getElementById("wordsMoveMenuList").innerHTML=menuHtml;
        document.getElementById("wordsMoveMenu").style.display='block';
    });
    document.getElementById("wordsMoveMenuList").addEventListener('click', function(e){
        WordsSelectAll=true;
        updateWordsSelectIcon();
        //console.log('clicked on '+e.target.getAttribute('groupName')        );
        var words=[];
        document.querySelectorAll("#words div.checked:not([hidden])").forEach(function(el){words.push(el.innerText)})

        chrome.extension.getBackgroundPage().addWords(words, e.target.getAttribute('groupName'), e.target.getAttribute('groupStorage'), function(){
            HighlightsData = chrome.extension.getBackgroundPage().getHighlightsData();
        })
        document.getElementById("wordsMoveMenu").style.display='none';

    });


    document.getElementById('wordsMoveContainer').addEventListener('mouseleave',function(){

        document.getElementById("wordsMoveMenu").style.display='none';

    });
    document.getElementById("wordsSortAsc").addEventListener('click', function(e){
        sortWordList('#words div', true);
        e.preventDefault();
    });
    document.getElementById("wordsSortDesc").addEventListener('click', function(e){
        sortWordList('#words div', false);
        e.preventDefault();
    })
    document.getElementById("filterwordlist").addEventListener('keyup',function(){filterWordList(this.value)});

    document.getElementById("words").addEventListener("keydown", function(e) {
        //console.log(e.target.innerHTML);

        ensureOneParagraph();
        hintNonUnicodeChar(editorToWords().join(''));

    });
   
    document.getElementById("words").addEventListener("input",function(e){
        
        validateWords();


    })
    document.getElementById("words").addEventListener("focusout", function(e) {
        //validateWords();
    });

});

function ensureOneParagraph(){
    if(document.getElementById("words").innerHTML.trim()==''||document.getElementById("words").innerHTML.trim()=='<br>'){
        document.getElementById("words").innerHTML='<div></div>'

    }
}
function updateWordsSelectIcon(){
    if(WordsSelectAll){
        document.getElementById('WordsSelectIcon').className='far fa-check-square';
        document.getElementById("wordsMove").disabled=true;

    }
    else {
        document.getElementById('WordsSelectIcon').className='far fa-square';
        document.getElementById("wordsMove").disabled=false;

    }
}
function wordsToEditor(words){

    //.replace(/</g,"&lt;")
    if(words){
        words=words.map(function(x){ return x.replace(/</g,"&lt;") });
        wordsText='<div>'+words.join('</div><div>')+'</div>';
    }
    else {
        wordsText='<div></div>';
    }
    try{
        var displayMovebtn=false;
        groups=chrome.extension.getBackgroundPage().getGroupsForMoveOrCopy();
        for(var group in groups){
            if(groups[group][0]!=document.getElementById("editWordsGroupName").value)
                displayMovebtn=true;
        }
        displayMovebtn>0?(document.getElementById("wordsMove").style.display='block'):(document.getElementById("wordsMove").style.display='none');

        document.getElementById("wordsMove").disabled=true;

        WordsSelectAll=true;
        updateWordsSelectIcon();
    }
    catch {
        console.log('issue occured when initializing the word editor')
    }
    document.execCommand('defaultParagraphSeparator', false, 'p');

    document.getElementById("words").innerHTML = wordsText;
}

function editorToWords(){
    var words=[];
    if (document.getElementById("words").childNodes[0]&&document.getElementById("words").childNodes[0].textContent.trim()!=''){
        words.push(document.getElementById("words").childNodes[0].textContent);
    }
    document.querySelectorAll("#words div").forEach(function(el){
        var word=el.innerText;
        if(word.trim()!==''&&words.indexOf(word)==-1){
            words.push(word);
        }
    });
    return words;
}

function filterWordList(infilter){
    //wordListContainer
    var searchExp=new RegExp(infilter,'gi');
    WordsSelectAll=true;
    updateWordsSelectIcon();
    document.getElementById("words").childNodes.forEach(element => {
        if(element.innerText.match(searchExp)){
            element.hidden=false;
        }
        else {
            element.hidden=true;
        }
    });
}

function sortWordList(s, asc) {
    Array.prototype.slice.call(document.body.querySelectorAll(s)).sort(function sort (ea, eb) {
        var a = ea.textContent.trim();
        var b = eb.textContent.trim();
        if (a < b) return asc?-1:1;
        if (a > b) return asc?1:-1;
        return 0;
    }).forEach(function(div) {
        div.parentElement.appendChild(div);
    });
}

function validateWords(){
    //Disable the submit button to allow for validation checks
    document.getElementById("formSubmitButton").disabled=true;

    if (document.getElementById("useRegexTokens").checked){
        clearTimeout(WordCheckTimeout);
        WordCheckTimeout = setTimeout(function () {
            validateWordRegexes(function(valid,reasons){
                validationWordsRender(valid, reasons);
            });
        }, 500);
    }
    else {
        if(document.getElementById("field_storage").value=='sync' && !acceptedLengthForSyncStorage()){
            validationWordsRender(false, [chrome.i18n.getMessage("wordlist_too_long_for_sync_storage")]);
        }
        else {
            validationWordsRender(true, [])
        }
    }        
}

function validationWordsRender(valid, reasons){

    if(valid){
        document.getElementById("validationErrors").style.display='none';
        document.getElementById("formSubmitButton").disabled=false;
        document.querySelectorAll("#words div").forEach(function(el){el.style.color='black'});
    }
    else {
        document.getElementById("validationErrors").style.display='block';
        document.getElementById("validationErrors").innerHTML=reasons.join(",");
        document.getElementById("formSubmitButton").disabled=true;
    }
}

function validateWordRegexes(callback){
    var response=true
    var reasons=[];
    document.querySelectorAll("#words div").forEach(function(el){
        valid=validateWordRegex(el.innerText);
        if (valid.result){
            el.style.color='black';
        }
        else{
            el.style.color='red';
            if (reasons.indexOf(valid.reason) === -1) reasons.push(valid.reason);
            response=false;
        }
    })
    
    callback(response, reasons);
}

function validateWordRegex(word){
    try {
        var testRegex=new RegExp(word,"gi");
        if(RandomString.match(testRegex)&&RandomString.match(testRegex).length>50){
            return {result:false, reason:chrome.i18n.getMessage("regex_too_many_matches")};
        }
        return {result:true};
    }
    catch {
        return {result:false, reason:chrome.i18n.getMessage("regex_invalid")};;
    }
    


}

