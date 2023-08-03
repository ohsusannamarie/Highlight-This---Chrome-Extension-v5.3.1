function getBrowser() {
    if (typeof chrome !== "undefined") {
      if (typeof browser !== "undefined") {
        return "Firefox";
      } else {
        return "Chrome";
      }
    } else {
      return "Edge";
    }
  }

  
  function isUrl(str){

    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

  function constructActionUrl(actionLink, foundText, matchText){
    var url=actionLink;
    url=url.replace(/\%s\%/gi, matchText.trim())
    url=url.replace(/\%t\%/gi, foundText.trim())
    url=url.replace(/\%su\%/gi, matchText.toUpperCase().trim())
    url=url.replace(/\%sl\%/gi, matchText.toLowerCase().trim())
    url=url.replace(/\%tu\%/gi, foundText.toUpperCase().trim())
    url=url.replace(/\%tl\%/gi, foundText.toLowerCase().trim())
    return encodeURI(url);
  }

  function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}