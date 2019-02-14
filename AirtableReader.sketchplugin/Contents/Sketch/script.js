//const BrowserWindow = require("sketch-module-web-view")

var Sketch = require('sketch')
var SketchDom = require('sketch/dom')
var Text = SketchDom.Text
var Artboard = require('sketch/dom').Artboard
var Rectangle = require('sketch/dom').Rectangle
var Shape = require('sketch/dom').Shape
var Text = require('sketch/dom').Text
var Style = require('sketch/dom').Style
var Rectangle = require('sketch/dom').Rectangle
var utils = require('sketch/ui')
var postit_padding = 20;

var testDialog = function(context) {
  console.log("Testing");
}

var readContent = function(context) {

  const options = {
    identifier: "artboardManagerSettings",
    width: 350,
    height: 292,
    show: false,
    resizable: true,
    title: "Artboard Manager — Settings",
    minimizable: false,
    maximizable: false,
    backgroundColor: '#ececec'
  }

    var doc = context.document;
    // var textStyles = doc.sketchObject.documentData().layerTextStylesGeneric().objects();
    // console.log(textStyles);
    var api_key = doc.askForUserInput_initialValue("API key", "default");
    var currentPage = Sketch.getSelectedDocument().selectedPage
    var pageNumber = 0;

    var a = new Artboard({
          name: 'Page '+pageNumber,
          flowStartPoint: true,
          parent: currentPage,
          frame: new Rectangle(pageNumber*(595+50), 0, 595, 842),
    })

    var numCols = 2;
    var numRows = 3;

    var row = 0;
    var col = -1;
    var data = fetchJSON('https://api.airtable.com/v0/appO4YHDma0RsCMCL/verbatims?view=Grid%20view&api_key='+api_key);    
    var records = data.records;
    var offset = data.offset;

    while (offset  !== undefined) {
      var data_2 = fetchJSON('https://api.airtable.com/v0/appO4YHDma0RsCMCL/verbatims?view=Grid%20view&api_key='+api_key+'&offset='+offset);
      records = records.concat(data_2.records);
      offset = data_2.offset;
    }

    for (var i=0; i<records.length; i++) {
      col++;
      if (col == numCols) {
        col = 0;
        row++;
      }
      if (row == numRows) {
        row = 0;
        pageNumber++;
        a = new Artboard({
          name: 'Page '+pageNumber,
          flowStartPoint: true,
          parent: currentPage,
          frame: new Rectangle(pageNumber*(595+50), 0, 595, 842),
        })
      }

      var text = new Text({
        alignment: Text.Alignment.left,
        parent: a,
        frame: new Rectangle(50+col*275+postit_padding, 50+row*265+postit_padding, 215-2*postit_padding, 215-2*postit_padding),
        fixedWidth: true,
        text: records[i].fields.Verbatim, 
        style: new Style({          
          fills: [
            {
              color: '#333333',
              fillType: Style.FillType.Color,
            }
          ],        
        })
      })
      var newFont = NSFont.fontWithName_size('Graphik', 13)
      text.sketchObject.setFont(newFont)
      text.style.lineHeight = 17;
      
      var interviewee = new Text({
        alignment: Text.Alignment.left,
        parent: a,
        frame: new Rectangle(50+col*275+postit_padding, 50+row*265+185, 215-2*postit_padding, 215-2*postit_padding),
        fixedWidth: true,
        text: records[i].fields.Interviewee,           
        style: new Style({
          font: "Graphik",
          fills: [
            {
              color: '#333333',
              fillType: Style.FillType.Color,
            }
          ],
        }),        
      })
      interviewee.sketchObject.setFont(newFont)

      var cat_name =  records[i].fields.cat_name;
      
      if (cat_name != null) {
        var category = new Text({
          alignment: Text.Alignment.right,          
          verticalAlignment: Text.VerticalAlignment.bottom,
          parent: a,
          frame: new Rectangle(50+col*275+265-150, 50+row*265+187, 80, 80),
          fixedWidth: true,
          text: (cat_name+"").toUpperCase(),
        })
        
        category.style.fills = [
          {
            color: '#333333',
            fillType: Style.FillType.Color,
          },
        ]

        var fontSmall = NSFont.fontWithName_size("Graphik-Medium", 8);
        category.sketchObject.setFont(fontSmall);    
        category.style.lineHeight = 12;

      }      
      
      var rectangle = new Shape({
        name: "new way",
        parent: a,
        frame: new Rectangle(50+col*275, 50+row*265, 215, 215),
        style: {
          borders: ['#4A90E2'] 
        }
      });     
    }
}


function openWindow() {

  const options = {
    identifier: 'unique.id',
  }

  const browserWindow = new BrowserWindow(options)
  browserWindow.loadURL(require('./dialog.html'))

}


function fetchJSON(url) {
  var request = NSMutableURLRequest.new();
  [request setHTTPMethod:@"GET"];
  [request setURL:[NSURL URLWithString:url]];
  var error = NSError.new();
  var responseCode = null;
  var oResponseData = [NSURLConnection sendSynchronousRequest:request returningResponse:responseCode error:error];
  var dataString = [[NSString alloc] initWithData:oResponseData encoding:NSUTF8StringEncoding];
  return JSON.parse(dataString);
}
