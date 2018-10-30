var scatterPlot, desc;
var selectedPoint;
var loadData=[];

function pointSelected(event) {
  selectedPoint = event;
  desc.update();
}

// Load Dataset and Charts
d3.csv("dataset/04cars data_clean.csv").then(function(data) {
  
  data.forEach(element => {
    var tmp={"Name":null,"raw":null,"coord":null};
    tmp["Name"]=element["Vehicle Name"];
    tmp["raw"]=element;
    tmp["coord"]={};
    loadData.push(tmp);
  });
 console.log(loadData);
  var columns=  data.columns;

  for(var i=0;i<columns.length;i++){
   var tmpMax=d3.max(loadData,function(d){return +d["raw"][columns[i]];});
   var tmpMin=d3.min(loadData,function(d){return +d["raw"][columns[i]];});
   loadData.forEach(function(d){
     d["coord"][columns[i]]=((+d["raw"][columns[i]]-tmpMin)/(tmpMax-tmpMin));
     delete d["coord"]["Vehicle Name"];
     delete d["coord"]["Pickup"];
   });
  }
  loadData["columns"]=columns;
//  console.log(loadData);
  xv = 9;
  yv = 13;
  scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv);
  if(!selectedPoint) {
    selectedPoint = data[0]
  }
  desc = new DescriptionTable("#desc");
    var select = document.getElementById("select"),
     arr = data.columns;
     for(var i = 0; i < arr.length; i++)
     {
         var option = document.createElement("OPTION"),
         txt = document.createTextNode(arr[i]);
         option.appendChild(txt);
         option.setAttribute("value",arr[i]);
         select.insertBefore(option,select.lastChild);
         option.setAttribute("id","x"+i);
     }
     var select1 = document.getElementById("select1"),
     arr = data.columns;
     for(var i = 0; i < arr.length; i++)
     {
         var option = document.createElement("OPTION"),
         txt = document.createTextNode(arr[i]);
         option.appendChild(txt);
         option.setAttribute("value",arr[i]);
         select1.insertBefore(option,select1.lastChild);
     }
    
});


function chooseX() {
  var abc = document.getElementById('select').value;  

  var t = document.getElementById('chart-area1');  
  t.innerHTML = '';

  // Load Dataset and Charts
d3.csv("dataset/04cars data_clean.csv").then(function(data) {

  data.forEach(element => {
    var tmp={"Name":null,"raw":null,"coord":null};
    tmp["Name"]=element["Vehicle Name"];
    tmp["raw"]=element;
    tmp["coord"]={};
    loadData.push(tmp);
  });
  console.log(loadData);
  var columns=  data.columns;

  for(var i=0;i<columns.length;i++){
   var tmpMax=d3.max(loadData,function(d){return +d["raw"][columns[i]];});
   var tmpMin=d3.min(loadData,function(d){return +d["raw"][columns[i]];});
   loadData.forEach(function(d){
     d["coord"][columns[i]]=((+d["raw"][columns[i]]-tmpMin)/(tmpMax-tmpMin));
     delete d["coord"]["Vehicle Name"];
     delete d["coord"]["Pickup"];
   });
  }
  loadData["columns"]=columns;

  for(var i=0;i<columns.length;i++){
    if (columns[i] == abc) {
      xv = i;
    }
  }

  scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv);

});
}

function chooseY() {
  var abc = document.getElementById('select1').value;  

  var t = document.getElementById('chart-area1');  
  t.innerHTML = '';

  // Load Dataset and Charts
d3.csv("dataset/04cars data_clean.csv").then(function(data) {

  data.forEach(element => {
    var tmp={"Name":null,"raw":null,"coord":null};
    tmp["Name"]=element["Vehicle Name"];
    tmp["raw"]=element;
    tmp["coord"]={};
    loadData.push(tmp);
  });
  console.log(loadData);
  var columns=  data.columns;

  for(var i=0;i<columns.length;i++){
   var tmpMax=d3.max(loadData,function(d){return +d["raw"][columns[i]];});
   var tmpMin=d3.min(loadData,function(d){return +d["raw"][columns[i]];});
   loadData.forEach(function(d){
     d["coord"][columns[i]]=((+d["raw"][columns[i]]-tmpMin)/(tmpMax-tmpMin));
     delete d["coord"]["Vehicle Name"];
     delete d["coord"]["Pickup"];
   });
  }
  loadData["columns"]=columns;

  for(var i=0;i<columns.length;i++){

    if (columns[i] == abc) {
      yv = i;
    }
  }

  scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv);

});
}
