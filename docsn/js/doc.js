var sourceRoot = "https://github.com/williamngan/pts/blob/master/src/";

var app = new Vue({
  el: '#docapp',
  
  data: {
    message: '',
    modules: [],
    contents: { 
      name: " ", 
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

    jumpTo: function( id) {
      let elem = document.getElementById(id);
      if (elem) {
        elem.scrollIntoView(true);
        selectJump( id );
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
    }
  },

  updated: function() {
    if (this.selHash) {
      this.jumpTo( this.selHash.substr(1) );
      this.selHash = "";
    }
  }

})


function qs(name, limit) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  let q = (results === null) ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  return clean_str( q, limit );
}

function clean_str( str, limit ) {
  if (limit) str = str.substr(0, limit);
  return str.replace( /[^a-zA-Z0-9._]/g, "_" );
}

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
    loadContents( qsel );
  } 
});

function sortInherited( a, b ) {
  return (a.inherits ? 100000 : 0) - (b.inherits ? 100000 : 0) + a.name.localeCompare(b.name);
} 

function loadContents( id ) {
  
  loadJSON( `./json/${id}.json`, (data, status) => {
    app.contents.name = data.name;
    app.contents.kind = data.kind;
    app.contents.comment = data.comment;
    app.contents.source = data.source;
    app.contents.extends = data.extends;
    app.contents.implements = data.implements;
    
    app.contents.constructor = data.constructor;
    app.contents.methods = data.methods.sort( sortInherited );
    app.contents.accessors = data.accessors.sort( sortInherited );;
    app.contents.variables = data.variables.sort( sortInherited );;
    app.contents.properties = data.properties.sort( sortInherited );;
    app.contents.type_alias = data.type_alias;
    app.contents.count = (app.contents.methods.length || 0) + (app.contents.accessors.length || 0) + (app.contents.variables.length || 0) + (app.contents.properties.length || 0);

    if (window.location.hash) {
      app.selHash = clean_str(window.location.hash, 30);
    }

    selectState( id );

  });
}

function selectState( id, hash ) {
  app.selected = id;
  if (history.pushState) {
    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?p='+id;
    window.history.pushState({path:newurl},'',newurl);
  }
}

function selectJump( id ) {
  if(history.pushState) {
    history.pushState(null, null, '#'+id);
  }
  else {
    location.hash = '#'+id;
  }
}