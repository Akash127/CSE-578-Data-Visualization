
var scatterPlot, desc;
var selectedPoint;
var loadData=[];
var GlobalV=[];
var changed;
var isLassoActivated = false;

var fileNameMap = {
  'Car':"Cars.csv",
  'Spotify':'Spotify.csv',
  'Pokemon':'Pokemon.csv'
}

var fileNameBtn = {
  'Car':"carBtn",
  'Spotify':'spotifyBtn',
  'Pokemon':'pokemonBtn'
}

// Read Filename from Local Storage
fileName = localStorage['myKey'] || 'Car'

document.getElementById('carBtn').className = 'btn btn-secondary ';
document.getElementById('spotifyBtn').className = 'btn btn-secondary ';
document.getElementById('pokemonBtn').className = 'btn btn-secondary ';
document.getElementById(fileNameBtn[fileName]).className = 'btn btn-secondary active';

function pointSelected(event) {
  selectedPoint = event.raw;
  desc.update();
}

// Function to Change Data to Spotify Data
function changeToSpotifyData() {
  localStorage['myKey'] = 'Spotify';
  document.location.reload(true)
  console.log("Change to Spotify Data")
}
// Function to Change Data to Pokemon Data
function changeToPokemonData() {
  localStorage['myKey'] = 'Pokemon';
  document.location.reload(true)
  console.log("Change to Pokemon Data")
}

// Function to Change Data to Car Data
function changeToCarData() {
  localStorage['myKey'] = 'Car';
  document.location.reload(true)
  console.log("Change to Car Data")
}

console.log("Loading: " + fileNameMap[fileName])

// Load Dataset and Charts
d3.csv("dataset/" + fileNameMap[fileName]).then(function(data) {
  console.log(data)
  da=data;
  data.forEach(element => {
    var tmp={"Name":null,"raw":null,"coord":null};
    tmp["Name"]=element["Vehicle Name"];
    tmp["raw"]=element;
    tmp["coord"]={};
    loadData.push(tmp);
  });

  var columns=  data.columns;

  for(var i=0;i<columns.length;i++){
   var tmpMax=d3.max(loadData,function(d){return +d["raw"][columns[i]];});
   var tmpMin=d3.min(loadData,function(d){return +d["raw"][columns[i]];});
   loadData.forEach(function(d){
     d["coord"][columns[i]]=((+d["raw"][columns[i]]-tmpMin)/(tmpMax-tmpMin));
     if(localStorage['myKey']=='Car') delete d["coord"]["Vehicle Name"],delete d["coord"]["Pickup"];
   });
  }
  if(localStorage['myKey']=='Car') columns.splice(0,1),columns.splice(5,1);
  loadData["columns"]=columns;
  this.chart.xAxis[0].setCategories(columns);
  this.chartRight.xAxis[0].setCategories(columns);

  if(localStorage['myKey']=='Car') {xv =11,yv = 7;}
  else if(localStorage['myKey']=='Pokemon'){xv=3,yv=7;}
  else if(localStorage['myKey']=='Spotify'){xv=3,yv=7;}

  scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv);
  if(!selectedPoint) {
    selectedPoint = loadData[0].raw
  }
  desc = new DescriptionTable("#desc");
    var select = document.getElementById("select"),arr = data.columns;
     for(var i = 0; i < arr.length; i++)
     {
         var option = document.createElement("OPTION"),
         txt = document.createTextNode(arr[i]);
         option.appendChild(txt);
         option.setAttribute("value",arr[i]);
         select.insertBefore(option,select.lastChild);
         option.setAttribute("id","x"+i);
     }
     var select1 = document.getElementById("select1")
     var selectCluster=document.getElementById("selectCluster");
     var selectComp=document.getElementById("selectComp");
     for(var i = 0; i < arr.length; i++)
     {
         var option = document.createElement("OPTION"),
         txt = document.createTextNode(arr[i]);
         option.appendChild(txt);
         option.setAttribute("value",arr[i]);
         select1.insertBefore(option,select1.lastChild);
     }
     for(var i = 0; i < arr.length; i++)
     {
         var option = document.createElement("OPTION"),
         txt = document.createTextNode(arr[i]);
         option.appendChild(txt);
         option.setAttribute("value",arr[i]);
         selectCluster.insertBefore(option,selectCluster.lastChild);
    }

     for(var i = 0; i < arr.length; i++)
     {
         var option = document.createElement("OPTION"),
         txt = document.createTextNode(arr[i]);
         option.appendChild(txt);
         option.setAttribute("value",arr[i]);
         selectComp.insertBefore(option,selectComp.lastChild);
    }

     var chartData=[],chartData1=[];
     $("#select").val(columns[xv]);
     $("#select1").val(columns[yv]);
     for(var i=0;i<columns.length;i++)
        {
            if(arr[i]==columns[yv])  chartData.push(1); else chartData.push(0)
            if(arr[i]==columns[xv]) chartData1.push(1); else chartData1.push(0);
        }
        this.chart.series[0].setData(chartData1);
        this.chartRight.series[0].setData(chartData);
});


function chooseX() {
  var abc = document.getElementById('select').value;  
  var xyz=document.getElementById('select1').value;  
  selected=null;
  isLassoActivated=false;
  document.getElementById("lassoToggle").innerHTML = "Activate Lasso";
  $("#SaveClusterBtn").attr("disabled","disabled");
  // Load Dataset and Charts
d3.csv("dataset/" + fileNameMap[fileName]).then(function(data) {
  loadData=[];
  data.forEach(element => {
    var tmp={"Name":null,"raw":null,"coord":null};
    tmp["Name"]=element["Vehicle Name"];
    tmp["raw"]=element;
    tmp["coord"]={};
    loadData.push(tmp);
  });
  //console.log(loadData);
  var columns=  data.columns;

  for(var i=0;i<columns.length;i++){
   var tmpMax=d3.max(loadData,function(d){return +d["raw"][columns[i]];});
   var tmpMin=d3.min(loadData,function(d){return +d["raw"][columns[i]];});
   loadData.forEach(function(d){
     d["coord"][columns[i]]=((+d["raw"][columns[i]]-tmpMin)/(tmpMax-tmpMin));
     if(localStorage['myKey']=='Car') delete d["coord"]["Vehicle Name"],delete d["coord"]["Pickup"];
   });
  }
  if(localStorage['myKey']=='Car') columns.splice(0,1),columns.splice(5,1);
  loadData["columns"]=columns;

  //console.log(columns);
  var chartData=[];
  if(abc.startsWith("x"))
  {
   var ind=abc.substr(1)-1;
   for(var i =0;i<columns.length;i++)
    chartData.push(GlobalV[ind][columns[i]]); 
  scatterPlot.updategraphOnDropdownChange("X",ind+1,GlobalV[ind]);     
  }
  else
  {
    var t = document.getElementById('chart-area1');  
    t.innerHTML = '';
  for(var i=0;i<columns.length;i++){
    if (columns[i] == abc) {
      xv = i;
      chartData.push(1);
    }
    else chartData.push(0);
    }
    scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv); 
  }
  if(xyz.startsWith("x"))
    {
    ind=xyz.substr(1)-1;
    scatterPlot.updategraphOnDropdownChange("Y",ind+1,GlobalV[ind]);
    }
  chart.series[0].setData(chartData);
});
}

function chooseY() {
  var abc = document.getElementById('select1').value;
  var xyz=document.getElementById('select').value;  
  isLassoActivated=false;
  selected=null;
  document.getElementById("lassoToggle").innerHTML = "Activate Lasso";
  $("#SaveClusterBtn").attr("disabled","disabled");
  // Load Dataset and Charts
d3.csv("dataset/" + fileNameMap[fileName]).then(function(data) {

    loadData=[];
  data.forEach(element => {
    var tmp={"Name":null,"raw":null,"coord":null};
    tmp["Name"]=element["Vehicle Name"];
    tmp["raw"]=element;
    tmp["coord"]={};
    loadData.push(tmp);
  });

  var columns =  data.columns;
  for(var i=0;i<columns.length;i++){
   var tmpMax=d3.max(loadData,function(d){return +d["raw"][columns[i]];});
   var tmpMin=d3.min(loadData,function(d){return +d["raw"][columns[i]];});
   loadData.forEach(function(d){
     d["coord"][columns[i]]=((+d["raw"][columns[i]]-tmpMin)/(tmpMax-tmpMin));
     if(localStorage['myKey']=='Car') delete d["coord"]["Vehicle Name"],delete d["coord"]["Pickup"];
   });
  }
  if(localStorage['myKey']=='Car') columns.splice(0,1),columns.splice(5,1);
  loadData["columns"]=columns;
  var chartData=[];
  if(abc.startsWith("x"))
  {
   var ind=abc.substr(1)-1;
   for(var i =0;i<columns.length;i++)
    chartData.push(GlobalV[ind][columns[i]]); 
  scatterPlot.updategraphOnDropdownChange("Y",ind+1,GlobalV[ind]);    
  }
  else{
    var t = document.getElementById('chart-area1');  
    t.innerHTML = '';
  for(var i=0;i<columns.length;i++){  
    if (columns[i] == abc) {
        yv = i;
      chartData.push(1);
    }
    else chartData.push(0);
    }
    scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv);   
}
if(xyz.startsWith("x"))
    {
    ind=xyz.substr(1)-1;
    scatterPlot.updategraphOnDropdownChange("X",ind+1,GlobalV[ind]);
    }
  chartRight.series[0].setData(chartData);
});
}
