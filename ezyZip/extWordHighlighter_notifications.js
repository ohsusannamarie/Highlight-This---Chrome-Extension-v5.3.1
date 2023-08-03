function notifyWordAlreadyInList(word){
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": "Highlight This",
        "message": word + " " + chrome.i18n.getMessage("already_in_wordlist")
    });
}

function notifyWordAdded(word,groupName){
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": chrome.i18n.getMessage("added_new_word"),
        "message": word + " " + chrome.i18n.getMessage("has_been_added_to") +" "+ groupName + ".\n" + chrome.i18n.getMessage("refresh_page")
    });
}

function notifyWordFoundOnPage(text){
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": chrome.i18n.getMessage("word_found_on_page"), 
        "message": text
    });
}

function notifySyncedList(listname){
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": chrome.i18n.getMessage("list_synced"),
        "message": "'"+listname+"' "+chrome.i18n.getMessage("has_been_updated")
    });
}

function notifyLicenseRegistered(validUntil){
    var d = new Date(validUntil);
    var friendlyDate=d.getDate() + "-" + chrome.i18n.getMessage("shortmonth_"+(d.getMonth()+1)) + "-" + d.getFullYear();
  
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": chrome.i18n.getMessage("license_new")||"New License",
        "message": chrome.i18n.getMessage("license_new_until") + " " + friendlyDate
    });

}
function notifyLicenseUpdated(validUntil){
    var d = new Date(validUntil);
    var friendlyDate=d.getDate() + "-" + chrome.i18n.getMessage("shortmonth_"+(d.getMonth()+1)) + "-" + d.getFullYear();
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": chrome.i18n.getMessage("license_updated")||"Updated License",
        "message": chrome.i18n.getMessage("license_new_until")+" "+friendlyDate
    });

}
function notifyLicenseRevoked(){
    chrome.notifications.create(Date.now().toString(), {
        "type": "basic",
        "iconUrl": "Plugin96.png",
        "title": chrome.i18n.getMessage("license_expired")||"Your license has expired",
        "message": chrome.i18n.getMessage("license_expired_message")
    });

}