function skipSelectorsForUrl(inUrl){
    //the datepicker component acts weird on changing text content

    var skipSelectors=['.ui-datepicker'];
    if(inUrl.indexOf('calendar.google.com')>-1){
        //google calendar loses text that is highlighed and all text behind it in elements with role button
        skipSelectors.push('[role="button"]');
    }

    return skipSelectors.join(', ');
}