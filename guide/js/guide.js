(function() {

  var demos = Array.from( document.querySelectorAll("img") ).filter( (f) => {
    var t = f.getAttribute("alt");
    var idx = t.indexOf(".js");
    return idx > 0 && idx === (t.length - 3);
  });

  for (let i=0, len=demos.length; i<len; i++) {
    var div = document.createElement("div");
    div.setAttribute("class", "demoOverlay");
    demos[i].parentNode.appendChild( div );
  }


})();