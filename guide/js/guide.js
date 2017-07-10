(function() {

  Pts.namespace( this );
  var sourceCodePath = "./js/examples/";

  var blocks = Array.from( document.querySelectorAll("img") ).filter( (f) => {
    var t = f.getAttribute("alt");
    var idx = t.indexOf("js:");
    return idx === 0;
  });

  for (let i=0, len=blocks.length; i<len; i++) {
    createDemoContainer( blocks[i] );
  }

  var demos = {};
  window.registerDemo = function( id, space ) {
    demos[id] = space;
  }

  function createDemoContainer( imgElem ) {
    var div = document.createElement("div");
    var divID = imgElem.getAttribute("alt").replace(/js\:/gi, "");

    var link = document.createElement("a");
    link.textContent = "source code";
    link.classList.add("sourceCodeLink");
    link.setAttribute( "target", "_blank");
    link.setAttribute( "href", sourceCodePath+divID+".js");
    div.appendChild( link );

    div.setAttribute("class", "demoOverlay");
    div.setAttribute("id", divID );
    imgElem.parentNode.appendChild( div );

    loadDemo( div, divID );

    function startDemo(evt) {
      div.classList.add("active");
      if (demos[divID]) demos[divID].replay();
    }

    function stopDemo(evt) {
      div.classList.remove("active");
      if (demos[divID]) demos[divID].stop();
    }

    div.addEventListener( 'mouseenter', startDemo );
    div.addEventListener( 'touchstart', startDemo );
    div.addEventListener( 'mouseleave', stopDemo );
    div.addEventListener( 'touchend', stopDemo );
  }

  function loadDemo( div, demoID ) {
    var script = document.createElement('script');
    try {
      script.src = "./js/examples/"+demoID+".js";
      script.onload = function () {
          console.log( "loaded " + demoID );
      };
    } catch (e) {
      console.warn( e  );
    }

    document.body.appendChild(script);
    
  }

  
})();

