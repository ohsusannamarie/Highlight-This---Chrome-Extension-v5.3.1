const licenseEndpoint='https://api.highlightthis.net/api/licenseService';


function requestLicense(email, duration, amount,callback){
    //requests a license to the webservice
    var request={
        email: email,
        duration: duration,
        licenseCount: amount
    }
    var currentLicense=getLicense();
    $.post(licenseEndpoint+'/requestLicense',request,function(resp){
        log('Got license info back', resp);
        if(resp.validUntil){
            if(currentLicense){
                var currentValidity=new Date(currentLicense.validUntil);
                var newValidity=new Date(resp.validUntil)
                if (newValidity>currentValidity){
                    registerLicense(resp, 'update');
                }
                callback && callback(true);
            }
            registerLicense(resp, 'new');
            callback && callback(true);
        }
        else{
            callback && callback(false);
        }
    })
}

function checkLicense(callback){
    var currentLicense=getLicense();

    if(currentLicense){
        $.post(licenseEndpoint+'/licensecheck',{"licenseKey": currentLicense.licenseKey},function(resp){
            log('Got license info back', resp);
            if(resp.validUntil){
                log('License still valid');
                //make sure to store the latest data if there is a different validity date
                if(resp.validUntil!=currentLicense.validUntil){
                    registerLicense(resp, 'update');
                }
                
            }
        }).fail(function(e) {
            if(e.status==410){
                log('License not valid anymore');
                revokeLicense();
            }
        });
    }
}

function checkEnteredLicenseKey(licenseKey, callback){
    $.post(licenseEndpoint+'/licensecheck',{"licenseKey": licenseKey},function(resp){
        log('Got license info back', resp);
        if(resp.validUntil){
                registerLicense(resp, 'new');
                callback(true);
        }
    }).fail(function(e) {
        callback(false);
    });  
}


function registerLicense(newLicense, mode){
    HighlightsData.License=newLicense;
    localStorage["HighlightsData"] = JSON.stringify(HighlightsData);
    if(mode=='new'){
        notifyLicenseRegistered(newLicense.validUntil);
    }
    else{
        notifyLicenseUpdated(newLicense.validUntil);

    }
}

function revokeLicense(){
    delete HighlightsData.License;
    localStorage["HighlightsData"] = JSON.stringify(HighlightsData);
    notifyLicenseRevoked();
}

function getLicense(){
    return HighlightsData.License;
}

function license(){
    var registeredLicense=getLicense();
    var now = new Date();

    if (registeredLicense){
        var validUntil=new Date(registeredLicense.validUntil)

        if(validUntil>now) {
            return "premium";
        }
    }
    return "free";
}

