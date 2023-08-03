String.prototype.format = function() {
    a = this;
    for (k in arguments) {
      a = a.replace("{" + k + "}", arguments[k])
    }
    return a
  }




document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('importFile').addEventListener('change',function(){
        analyzeInputFile();
    });
    document.getElementById("restoreWarning").innerHTML = chrome.i18n.getMessage("restoreWarning");

});


 
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
            document.getElementById("importSyncFileLink").addEventListener('click', function () {
                restoreBackup('sync');
                return false;
            });

        }
        if (countLocal>0){
            document.getElementById("importLocalFileLink").innerHTML=chrome.i18n.getMessage("importLocalRules").format(countLocal);
            document.getElementById("importLocalFileLink").style.display='block';
            document.getElementById("hintRestore").style.display='block';
            document.getElementById("importLocalFileLink").addEventListener('click', function () {
                restoreBackup('local');
                return false;
            });
        }
        
    });

}

function restoreBackup(storage) {
    readFile(function(fileObj){
        if(!chrome.extension.getBackgroundPage().importFile(fileObj, storage)){
            document.getElementById('importError').innerText=chrome.i18n.getMessage("popup_importFailed");
        }
        else {
            document.getElementById('importDone').innerText==chrome.i18n.getMessage("popup_importDone");
            document.getElementById('uploadform').style.display="none";
            document.getElementById('importDone').style.display="block";
            setTimeout(function(){ window.close(); }, 3000);
        }
    })  

}
