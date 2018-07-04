var app = new Vue({
  el: '#docapp',
  
  data: {
    message: 'Hello Vue!',
    modules: [],
    contents: { 
      name: "...", 
      constructor: {},
      methods: [{name: "test"}], 
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
    }
  },

  updated: function() {
    if (this.selHash) {
      this.jumpTo( this.selHash.substr(1) );
      this.selHash = "";
    }
  }

})


function qs(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
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

  let qsel = qs("p");
  if (qsel) {
    loadContents( qsel );
  } 
});

function loadContents( id ) {
  
  loadJSON( `./json/${id}.json`, (data, status) => {
    app.contents.name = data.name;
    app.contents.kind = data.kind;
    app.contents.comment = data.comment;
    app.contents.source = data.source;
    app.contents.extends = data.extends;
    app.contents.implements = data.implements;
    
    app.contents.constructor = data.constructor;
    app.contents.methods = data.methods;
    app.contents.accessors = data.accessors;
    app.contents.variables = data.variables;
    app.contents.properties = data.properties;
    app.contents.type_alias = data.type_alias;
    app.contents.count = (app.contents.methods.length || 0) + (app.contents.accessors.length || 0) + (app.contents.variables.length || 0) + (app.contents.properties.length || 0);

    if (window.location.hash) {
      app.selHash = window.location.hash
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