

document.getElementById('demo').onload = function(evt) {
  
  if (window.frames.length > 0) {
    // console.log( frames[0].document )
    frames[0].document.body.style.background = "red"
    frames[0].test('Pts.namespace( this ); var space = new CanvasSpace("#pt").setup({bgcolor: "#fe3"}); var form = space.getForm(); space.add( function(time) { form.point( space.pointer, 3); } ); space.bindMouse().bindTouch().play();');
  }
}


var ptsdef = "";

var client = new XMLHttpRequest();
client.open('GET', '../../dist/pts.d.ts');
client.onload = function() {
  console.log( client.responseText );
  ptsdef = (client.responseText);
  vscode();
}
client.send();

function vscode() {
  require.config({ paths: { 'vs': './vs' }});
  require(['vs/editor/editor.main'], function() {
      
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
          ptsdef
      );
      
      window.editor = monaco.editor.create(document.getElementById('editor'), {
          value: "loading...",
          language: 'javascript',
          theme: "vs-dark",
          minimap: {
              enabled: false
          }
      });

  });
}