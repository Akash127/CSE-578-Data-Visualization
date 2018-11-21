
var scatterPlot, desc;
var selectedPoint;
var loadData=[];
var GlobalV=[];
var changed;
var isLassoActivated = false;

var fileNameMap = {
  'Car':"Cars.csv",
  'Wine':'Wine.csv',
  'Diabetes':'Diabetes.csv'
}

// Read Filename from Local Storage
fileName = localStorage['myKey'] || 'Car'

function pointSelected(event) {
  selectedPoint = event.raw;
  desc.update();
}

// Function to Change Data to Wine Data
function changeToWineData() {
  localStorage['myKey'] = 'Wine';
  document.location.reload(true)
  console.log("Change to Wine Data")
}
// Function to Change Data to Diabetes Data
function changeToDiabetesData() {
  localStorage['myKey'] = 'Diabetes';
  document.location.reload(true)
  console.log("Change to Diabetes Data")
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
     delete d["coord"]["Vehicle Name"];
     delete d["coord"]["Pickup"];
   });
  }
  columns.splice(0,1);
  columns.splice(5,1);
  loadData["columns"]=columns;
 // var slicedcolumns=columns.slice(4,20);
  this.chart.xAxis[0].setCategories(columns);
  this.chartRight.xAxis[0].setCategories(columns);
//  console.log(loadData);
  xv =11;
  yv = 7;
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

     $("#select").val("HP");
     $("#select1").val("Retail Price");

     var chartData=[],chartData1=[];
     for(var i=0;i<columns.length;i++)
        {
            if(arr[i]=="Retail Price")  chartData.push(1); else chartData.push(0)
            if(arr[i]=="HP") chartData1.push(1); else chartData1.push(0);
        }
        this.chart.series[0].setData(chartData1);
        this.chartRight.series[0].setData(chartData);
});


function chooseX() {
  var abc = document.getElementById('select').value;  
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
     delete d["coord"]["Vehicle Name"];
     delete d["coord"]["Pickup"];
   });
  }
  columns.splice(0,1);columns.splice(5,1);
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
  chart.series[0].setData(chartData);
});
}

function chooseY() {
  var abc = document.getElementById('select1').value;  
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

  var columns =  data.columns;

  for(var i=0;i<columns.length;i++){
   var tmpMax=d3.max(loadData,function(d){return +d["raw"][columns[i]];});
   var tmpMin=d3.min(loadData,function(d){return +d["raw"][columns[i]];});
   loadData.forEach(function(d){
     d["coord"][columns[i]]=((+d["raw"][columns[i]]-tmpMin)/(tmpMax-tmpMin));
     delete d["coord"]["Vehicle Name"];
     delete d["coord"]["Pickup"];
   });
  }
  columns.splice(0,1);
  columns.splice(5,1);
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
  chartRight.series[0].setData(chartData);
});
}
