var app = new Vue({
  el: '#docapp',
  
  data: {
    message: 'Hello Vue!',
    modules: [],
    contents: { 
      name: "...", 
      methods: [{name: "test"}], 
      accessors: [] 
    }
  },

  methods: {
    test: function( m ) {
      this.message = m;
    },
    loadClass: function( mod, cls ) {
      loadContents( mod+"_"+cls );
    }
  }
})



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

  console.log( ms );
  app.modules = ms;
});

function loadContents( id ) {
  console.log( id );
  loadJSON( `./json/${id}.json`, (data, status) => {
    app.contents.name = data.name;
    app.contents.methods = data.methods;
    app.contents.accessors = data.accessors;
  });
}