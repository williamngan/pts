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
    selected: ""
  },

  methods: {
    test: function( m ) {
      this.message = m;
    },
    loadClass: function( mod, cls ) {
      loadContents( mod+"_"+cls );
    },
    md: function( s ) {
      if (!s || typeof s !== "string") return "";
      return marked( s );
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
  for (var k in data) {
    let m = [ k ];
    m.push( data[k] );
    ms.push( m );
  }

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
    app.contents.count = app.contents.methods.length + app.contents.accessors.length + app.contents.variables.length + app.contents.properties.length;
    
    selectState( id );
  });
}

function selectState( id ) {
  app.selected = id;
  if (history.pushState) {
    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?p='+id;
    window.history.pushState({path:newurl},'',newurl);
  }
}