var sourceRoot = "https://github.com/williamngan/pts/blob/master/src/";
var _search = [];

function loadJSON( url, callback ) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      callback( JSON.parse(request.responseText), "success" );
    } else {
      callback( false, "server error" );
    }
  };

  request.onerror = function() {
    callback( false, "connection error" );
  };

  request.send();
}


loadJSON( "./json/modules.json", (data, status) => {
  let ms = [];
  let m_types = null;
  for (var k in data) {
    let m = [ k ];
    m.push( data[k] );

    if (k == "Types" ) { // Types should be last in list
      m_types = m;
    } else {
      ms.push( m );
    }
  }

  // push Types to last in list
  if (m_types) ms.push( m_types );

  app.modules = ms;

  let qsel = qs("p", 40);
  if (qsel) {
    loadContents( qsel, window.location.hash );
  } 
});


loadJSON( "./json/search.json", (data, status) => {
  _search = data;

  let se = document.querySelector( "#search_input" );
  se.addEventListener("keyup", function(evt) {
    if (!se.value) {
      app.search([], "");
    } else {
      app.search( getSearchResult( se.value ), se.value );
    }
  });

  document.querySelector("#clearSearch").addEventListener("click", function(evt) {
    app.search([], "");
    se.value = "";
  });

});




var app = new Vue({
  el: '#docapp',
  
  data: {
    message: '',
    modules: [],
    searchResults: [],
    searchQuery: "",
    contents: { 
      name: "", 
      constructor: {},
      methods: [], 
      accessors: [],
      variables: [],
      type_alias: [],
      count: 0
    },
    selected: "",
    selHash: ""
  },

  methods: {
    test: function( m ) {
      this.message = m;
    },

    loadClass: function( mod, cls ) {
      loadContents( mod+"_"+cls );
    },

    jumpTo: function( id, ignoreHistory ) {
      if (!id) {
        document.querySelector("#contents").scrollTo(0,0);
        return;
      }
      let elem = document.getElementById(id);
      if (elem) {
        elem.scrollIntoView(true);
        if (!ignoreHistory) setHistory( app.selected, id );
      }
    },

    md: function( s ) {
      if (!s || typeof s !== "string") return "";
      return marked( s );
    },

    source: function( s ) {
      return (s && s.length > 0) ? `${sourceRoot}${s[0][0]}#L${s[0][1]}` : "#";
    },

    showSource: function( s ) {
      var hide = !s || !s[0][0] || s[0][0].indexOf("node_modules") >= 0;
      return !hide;
    },

    params: function( sig ) {
      if (sig && sig[0]) {
        var ls = [];
        var ps = sig[0].parameters || [];
        for (var i=0, len=ps.length; i<len; i++) {
          ls.push( ps[i].name ); 
        }
        return ls.join(", ");
      }
      return ""
    },

    first: function( s ) {
      return (s && s.length > 0) ? [s[0]] : [];
    },

    search: function( res, query ) {
      app.searchResults = res;
      app.searchQuery = query;
      document.querySelector("#search").className = (query.length > 0) ? "searching" : "";
    },

    expandMemberPane: function() {
      if (!app || !app.contents) return false;
      return app.contents.count > 5 || app.searchQuery.length > 0;
    },

    clickTarget: function(evt) {
      if (evt.target.tagName.toLowerCase() === "code" && evt.target.parentElement.getAttribute("href") === "#link") {
        evt.preventDefault();
        evt.stopPropagation();
        var currId = getParentID(evt.target, 0);
        if (currId && app.selected) setHistory( app.selected, currId );
        app.codeLink( evt.target.textContent );
        return false;
      }
    },

    codeLink: function(q) {
      loadFirstResult( q );
    }
  },

  updated: function() {
    if (this.selHash) {
      this.jumpTo( this.selHash, true );
    }
  }

})

// ---

function qs(name, limit, path) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec( path ? path : location.search);
  let q = (results === null) ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  return clean_str( q, limit );
}

function qsHash( path ) {
  let idx = path.lastIndexOf("#");
  return (idx >= 0) ? path.substr( idx+1 ) : "";
}

function clean_str( str, limit ) {
  if (limit) str = str.substr(0, limit);
  return str.replace( /[^a-zA-Z0-9._\$]/g, "_" );
}

function getParentID( elem, depth=0 ) {
  if (depth > 5) return "";
  var id = elem.parentElement.getAttribute("id");
  return (id) ? id : getParentID( elem.parentElement, depth+1 );
}


function loadContents( id, hash, reloading ) {

  if (!id) return;
  if (!hash) hash = "";
  if (hash.indexOf("#") === 0) hash = hash.substr(1);
  hash = clean_str(hash, 30);
  
  loadJSON( `./json/class/${id}.json`, (data, status) => {
    app.contents.name = data.name;
    app.contents.kind = data.kind;
    app.contents.comment = data.comment;
    app.contents.source = data.source;
    app.contents.extends = data.extends;
    app.contents.implements = data.implements;
    
    app.contents.constructor = data.constructor;
    app.contents.methods = (data.methods) ? data.methods.sort( sortInherited ) : [];
    app.contents.accessors = (data.accessors) ? data.accessors.sort( sortInherited ) : [];
    app.contents.variables = (data.variables) ? data.variables.sort( sortInherited ) : [];
    app.contents.properties = (data.variables) ? data.variables.sort( sortInherited ) : [];
    app.contents.type_alias = data.type_alias || [];
    app.contents.count = (app.contents.methods.length || 0) + (app.contents.accessors.length || 0) + (app.contents.variables.length || 0) + (app.contents.properties.length || 0) + (app.contents.type_alias.length || 0);

    app.selected = id;
    app.selHash = hash;
  
    if (!reloading) {
      setHistory( id, hash );
    } 

    setTimeout( function() {
      document.getElementById("members").scrollTo(0,0);
      document.getElementById("contents").scrollTo(0,0);
      app.jumpTo( hash, reloading );
    }, 100);
  });
}



function getSearchResult( q ) {
  let query = q.split(" ").join(".*\.");
  query = query.replace(/[^\w\$\.]/gi, " ");
  let res = _search.filter( (v) =>  v[1].search( new RegExp( query.trim(), "gi") ) >= 0 );
  return res.sort( (a, b) => (b[3]*100-b[0].length) - (a[3]*100-a[0].length) ).slice(0, 50);
}

function loadFirstResult( q ) {
  let skips = ["number", "boolean", "this", "string", "object", "void", "any", "Fn"];
  for (let i=0, len=skips.length; i<len; i++) {
    if (q.indexOf(skips[i]) === 0) return;
  }

  if (q.indexOf(" | ")) q = q.split(" ")[0];

  let res = getSearchResult( q );
  if (res && res[0]) {
    let qsel = qs( "p", 40, "?p="+res[0][0]);
    if (qsel) loadContents( qsel, qsHash(res[0][0]), false );
  }
}

function sortInherited( a, b ) {
  return (a.inherits ? 100000 : 0) - (b.inherits ? 100000 : 0) + a.name.localeCompare(b.name);
} 



function getRoot() {
  return window.location.protocol + "//" + window.location.host + window.location.pathname;
}

var lastHistory = ""

function setHistory( id, hash ) {
  
  if (id+hash === lastHistory) {
    return;
  } else {
    lastHistory = id+hash;
  }

  app.selected = id;

  if (history.pushState) {
    let pid = (id) ? '?p='+id : "";
    if (pid.length > 0) {
      var newurl = getRoot() + pid + (hash ? "#"+hash : "");
      window.history.pushState({path:newurl},'',newurl);
      toggleMenu( false );
      if (!hash) document.querySelector("#contents").scrollTo(0,0);
    }
  }
}


function resetContents() {
  app.contents = { 
    name: " ", 
    constructor: {},
    methods: [], 
    accessors: [],
    variables: [],
    type_alias: [],
    count: 0
  }
}


var _menu_toggle = false;

function toggleMenu( t ) {
  _menu_toggle = (t !== undefined) ? t : !_menu_toggle;
  document.querySelector("#menu").className = (_menu_toggle) ? "visible" : "";
}

document.querySelector("#toc").addEventListener("click", function(evt) {
  toggleMenu();
});

document.querySelector("#close").addEventListener("click", function() {
  toggleMenu(false);
});


// force reload on back button click
window.addEventListener( "popstate", function ( event ) {
  if (!event || !event.state || !event.state.path) {
    resetContents();
    setHistory("");
  } else {
    let qsel = qs("p", 40, event.state.path);
    if (qsel) loadContents( qsel, qsHash( event.state.path ), true );
  }
});

