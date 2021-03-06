//#region global values will be defined here
var initX=13;
var initY=9;
var selected;
var selectedElement;
var selectedProperties;
var cx1=cx2=cy1=cy2=0;
var x_left_dropzone=[];
var x_right_dropzone=[];
var y_top_dropzone=[];
var y_bottom_dropzone=[];
var tip;
var index=0;
var newxname;
var isNewCluster=true;
var lineData = [
  {"x": 0, "y": -Number.MAX_SAFE_INTEGER},
  {"x": 0, "y": Number.MAX_SAFE_INTEGER}
]

var clusterMap = {
  'A':[],
  'B':[],
  'C':[],
  'D':[]
}
var clusterInputIndex = 0;
var selectedCluster = null;

var categorialList = []

//#endregion

//#region some scatterplot init
ScatterPlot = function(data, containerClassName, xv, yv) {
  this.data = data
  this.containerClassName = containerClassName
  initX = xv;
  initY = yv;
  this.init();
};

ScatterPlot.prototype.init = function() {
  var vis = this;
  vis.margin = {left:50, right:50, top:50, bottom:50};

  vis.width = 600 - vis.margin.left - vis.margin.right;
  vis.height = 550 - vis.margin.top - vis.margin.bottom;

  vis.svg = d3.select(vis.containerClassName).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    
  vis.columns = this.data.columns;

  var xmax = d3.max(this.data,function(d){return +d["coord"][vis.columns[initX]]});
  var xmin = d3.min(this.data,function(d){return +d["coord"][vis.columns[initX]]});
  var ymax = d3.max(this.data,function(d){return +d["coord"][vis.columns[initY]]});
  var ymin = d3.min(this.data,function(d){return +d["coord"][vis.columns[initY]]});

  // Initiating Scales for Axis and Inverted Axis

  var x_dropdown=document.getElementById('select').value;
  var y_dropdown=document.getElementById('select1').value;
  vis.xScale = d3.scaleLinear()
    .range([0, vis.width])
    .domain([xmin,xmax])

  vis.yScale = d3.scaleLinear()
    .range([vis.height, 0])
    .domain([ymin, ymax])
  
  //Create copy of scales for zoom to work with
  vis.copyX = vis.xScale.copy();    
  vis.copyY = vis.yScale.copy();
  
  // Creating and Adding Axis
  // create Axis Objects
  vis.xAxis = d3.axisBottom(vis.xScale)
    .ticks(10)
    .tickSize(-vis.height)
  
  vis.yAxis = d3.axisLeft(vis.yScale)
    .ticks(10)
    .tickSize(-vis.width)
    
  // Draw Axis
  vis.gX = vis.svg.append('g')
    .attr('transform', 'translate(' + vis.margin.left + ',' + (vis.margin.top + vis.height) + ')')
    .call(vis.xAxis);
  
  vis.gY = vis.svg.append('g')
    .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')')
    .call(vis.yAxis);

  // Define the Clipping Area
  vis.svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
      .attr("width", vis.width)
      .attr("height", vis.height)

  // Define Zoom Object
  var zoom = d3.zoom()
    .scaleExtent([0, 5])
    // .extent([0, 0], [vis.width, vis.height])
    .on("zoom", function() {
      return zoomed(vis);
    });

  // Define Listener Element for Zoom
  vis.zoomArea = vis.svg.append("rect")
    .attr("width", vis.width)
    .attr("height", vis.height)
    // .style("fill", "none")
    .style("opacity", 0)
    .style("pointer-events", "all")
    .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')')
    .call(zoom)
  
  // Define Scatterplot Group after appending rect to caputer mouseover events
  vis.scatterPlotGroup = vis.svg.append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")

  // Define Origin Lines
  vis.yOrigin = d3.line()
    .x(function(d) {return vis.xScale(d.x)})
    .y(function(d) {return vis.yScale(d.y)})

  vis.xOrigin = d3.line()
    .x(function(d) {return vis.xScale(d.y)})
    .y(function(d) {return vis.yScale(d.x)})

  // Adding X Origin
  vis.scatterPlotGroup.append("path")
    .attr("d", vis.yOrigin(lineData))
    .attr("class", "yOriginLine")
    .attr("clip-path", "url(#clip)")

  // Adding Y Origin
  vis.scatterPlotGroup.append("path")
    .attr("d", vis.xOrigin(lineData))
    .attr("class", "xOriginLine")
    .attr("clip-path", "url(#clip)")
    // Adding Axis Labels
  vis.scatterPlotGroup.append("text")
    .text(vis.columns[initX])
    .attr("y", vis.height + 50)
    .attr("x", vis.width/2)
    .attr("class", "x-axis-label")
    .attr("font-size", "18px")
  vis.scatterPlotGroup.append("text")
    .text(vis.columns[initY])
    .attr("x", -vis.height/2 - 50)
    .attr("y", -35)
    .attr("class", "y-axis-label")
    .attr("font-size", "18px")
    .attr("transform", "rotate(-90)")

  //Add Lasso Objects
  vis.lasso = d3.lasso()
    .closePathDistance(75) 
    .closePathSelect(true) 
    // .targetArea(vis.scatterPlotGroup)
    .on("start",lasso_start) 
    .on("draw",lasso_draw) 
    .on("end",lasso_end);

  vis.processData();
};
//#endregion

//#region Draw visualisation
$(document).ready(function(){
  $($("#chart-area1>svg>rect"),$("#clip>rect")).on("click",function()
  {
    if($(".d3-tip").css('opacity')==1) 
    {
      $(".d3-tip").css('opacity',"0");
      $(".tool-tip").attr("disabled",true)
      selected.classed("selected",false);
      selected=null;
    }
  });
});
 
  
ScatterPlot.prototype.processData = function() {
  var vis = this;
  this.data.forEach(d=>{
    d['x']=d["coord"][vis.columns[initX]];
    d['y']=d["coord"][vis.columns[initY]];
  })
  vis.drawvis();
}

ScatterPlot.prototype.drawvis = function() {
 // console.log("[IN_DRAWVIS]");
  var vis = this;

  // Tooltip
    tip = d3.tip().attr('class', 'd3-tip')
     .html(function(d) {
      $(this).addClass("selected");
         selected=d3.selectAll('#chart-area1 .selected');
         selectedElement=this;
         selectedProperties=d;
       var text = "<button class='btn tool-tip btn-sm btn-secondary mr-1' onclick=x_left_click()>Drop in X-Low</button>"
       +"<button class='btn tool-tip  btn-sm btn-secondary mr-1' onclick=x_right_click()>Drop in X-High</button>"
       +"<button class='btn tool-tip btn-sm btn-secondary' onclick=y_bottom_click()>Drop in Y-Low</button>"
       +"<button class='btn tool-tip btn-sm btn-secondary mr-1' onclick=y_top_click()>Drop in Y-High</button>"
      
       return text;
     });
   vis.scatterPlotGroup.call(tip);

  // Adding Circles
  vis.circles = vis.scatterPlotGroup.selectAll("circle")
    .data(vis.data)
  
  vis.circles.enter()
    .append("circle")
      .attr("cx", function(d, i){
        return vis.xScale(+d['x']);
      })
      .attr("cy", function(d) {
        return vis.yScale(+d['y']);
      })
      .attr("r", 5)
      .attr("class","dropdown")
      .attr("clip-path", "url(#clip)")
      .on("mouseover", pointSelected)
      .attr("fill", "#f7b63f")
      .style("stroke","#53443e")
      // .attr("fill", "#A4A4A4")
      .on("click",tip.show);
      // Updating scatterplot
  vis.scatterPlotGroup.selectAll("circle").data(vis.data)
    .attr('cx', function(d) {return vis.xScale(+d['x'])})
    .attr('cy', function(d) {return vis.yScale(+d['y'])});
 
  vis.lasso.items(vis.scatterPlotGroup.selectAll("circle"))
  
}
//#endregion

//#region zoom
function zoomed (vis) {
var toolTipVar=$(".d3-tip");
  //if tooltip is showing 
  $(".d3-tip").each((element)=>{
    if($(toolTipVar[element]).css('opacity')==1) {
      $(toolTipVar[element]).css('opacity',"0");
      $(".tool-tip").attr("disabled",true)
      selected.classed("selected",false);
      selected=null;
    }
  })
  if($(".d3-tip").css('opacity')==1) {
    $(".d3-tip").css('opacity',"0");
    $(".tool-tip").attr("disabled",true)
    selected.classed("selected",false);
    selected=null;
  }
  // create new scale ojects based on event
  var new_xScale = d3.event.transform.rescaleX(vis.copyX);
  var new_yScale = d3.event.transform.rescaleY(vis.copyY);
  
  // Update axes
  vis.gX.call(vis.xAxis.scale(new_xScale));
  vis.gY.call(vis.yAxis.scale(new_yScale));

  // Update Scatterplot Circles
  vis.scatterPlotGroup.selectAll("circle").data(vis.data)
   .attr('cx', function(d) {return new_xScale(+d["x"])})
   .attr('cy', function(d) {return new_yScale(+d["y"])});

  vis.xOrigin
    .x(function(d) {return new_xScale(d.y)})
    .y(function(d) {return new_yScale(d.x)})
  
  vis.scatterPlotGroup.select(".xOriginLine")
    .attr("d", vis.xOrigin(lineData))
    .attr("clip-path", "url(#clip)")

  vis.yOrigin
   .x(function(d) {return new_xScale(d.x)})
   .y(function(d) {return new_yScale(d.y)})
  
  vis.scatterPlotGroup.select(".yOriginLine")
    .attr("d", vis.yOrigin(lineData))
    .attr("clip-path", "url(#clip)")

  //Change Original Scales
  vis.xScale = new_xScale;
  vis.yScale = new_yScale;
}
//#endregion

//#region ToolTip click functions
function x_left_click(){
   $(".d3-tip").css('opacity',"0");
   $(".tool-tip").attr("disabled",true)
  var cln = selectedElement.cloneNode(true);
  cln.removeAttribute("class");
  cln.classList.add("in-x-left");
  selected.classed("selected",false);
  selected=null;

  x_left_dropzone.push(selectedProperties);
  // Show circle in dropzone
  cx1+=10;
  d3.select(".x-left").selectAll("circle").data(x_left_dropzone).enter()
  .append("circle")
  .attr("r",4)
  .attr("cx",cx1)
  .attr("cy",cx1)
  .attr("fill","red")
  .on("mouseover",pointSelected);
  
  updategraph_util("X")
}

function x_right_click(){
   $(".d3-tip").css('opacity',"0");
   $(".tool-tip").attr("disabled",true)
  var cln = selectedElement.cloneNode(true);
  cln.removeAttribute("class");
  cln.classList.add("in-x-right");
  selected.classed("selected",false);
  selected=null;
  x_right_dropzone.push(selectedProperties);
  cx2+=10;
  d3.select(".x-right").selectAll("circle").data(x_right_dropzone).enter()
  .append("circle")
  .attr("r",4)
  .attr("cx",cx2)
  .attr("cy",cx2)
  .attr("fill","red")
  .on("mouseover",pointSelected);

  updategraph_util("X")
}


function y_top_click(){
   $(".d3-tip").css('opacity',"0");
   $(".tool-tip").attr("disabled",true)
  var cln = selectedElement.cloneNode(true);
  cln.removeAttribute("class");
  cln.classList.add("in-y-top");
  selected.classed("selected",false);
  selected=null;
  y_top_dropzone.push(selectedProperties);
  cy1+=10;
  d3.select(".y-top").selectAll("circle").data(y_top_dropzone).enter()
  .append("circle")
  .attr("r",4)
  .attr("cx",cy1)
  .attr("cy",cy1)
  .attr("fill","red")
  .on("mouseover",pointSelected);
  updategraph_util("Y")
}
function y_bottom_click(){
   $(".d3-tip").css('opacity',"0");
   $(".tool-tip").attr("disabled",true)
  var cln = selectedElement.cloneNode(true);
  cln.removeAttribute("class");
  cln.classList.add("in-x-top");
  if(selected)selected.classed("selected",false);
  selected=null;
  y_bottom_dropzone.push(selectedProperties);
  cy2+=10;
  d3.select(".y-bottom").selectAll("circle").data(y_bottom_dropzone).enter()
  .append("circle")
  .attr("r",4)
  .attr("cx",cy2)
  .attr("cy",cy2)
  .attr("fill","red")
  .on("mouseover",pointSelected);
  updategraph_util("Y")
}
//#endregion

//#region Graph Updation real work starts here

updategraph_util = function(axis) {
  if(axis == "X" && x_left_dropzone.length != 0 && x_right_dropzone.length != 0) {
    scatterPlot.updategraph('X', x_right_dropzone, x_left_dropzone);
  } else if(axis == "Y" && y_top_dropzone.length != 0 && y_bottom_dropzone.length != 0) {
    scatterPlot.updategraph('Y', y_top_dropzone, y_bottom_dropzone);
  }
}


ScatterPlot.prototype.updategraph=function(axis, high, low,Vgiven){
  var data=this.data;
  data.forEach((element)=>{
    element["coord"]["Vehicle Name"]=1;
    element["coord"]["Pickup"]=2;
  });
  attr=this.data.columns;
  var attrNo=attr.length; //t be changed
  var x1={},
  x0={};
if(Vgiven==undefined){
  for (var i = 0; i<attrNo; i++) {
    x1[attr[i]] = d3.mean(low, function(d) { return d["coord"][attr[i]]});
    x0[attr[i]] = d3.mean(high, function(d) { return d["coord"][attr[i]]});
  }

  var hlpair = [];
  for (var i = 0; i<high.length; i++) {
    for (var j = 0; j<low.length; j++) {
      var tmpelt = {};
      for (var k = 0; k<attrNo; k++) {
        tmpelt[attr[k]] = high[i]["coord"][attr[k]] - low[j]["coord"][attr[k]];
      }
      hlpair[hlpair.length] = tmpelt;
    }
  }
  var V = {}, Vchanged = {}, Verror = {}, norm = 0;
  //initialise V,Verr
  for (var i = 0; i<attrNo; i++) {
    V[attr[i]] = 0;
    Vchanged[attr[i]] = 0;
  }
  //calculating norm 
  for (var i = 0; i<attrNo; i++) {
    V[attr[i]] = x0[attr[i]]-x1[attr[i]];
    norm = norm + (x0[attr[i]]-x1[attr[i]])*(x0[attr[i]]-x1[attr[i]]);
   }
   var VV = [];
   for (var i = 0; i<attrNo; i++) {
     VV[i] = {"attr":attr[i], "value":V[attr[i]]};
   }
   //VV and Verror
   VV.sort(function(a,b) {return Math.abs(b["value"]) - Math.abs(a["value"]);});
   norm = Math.sqrt(norm);
   for (var i = 0; i<attrNo; i++) 
   { 
    V[attr[i]] = V[attr[i]]/norm;
    if (hlpair.length>1) { Verror[attr[i]] = d3.deviation(hlpair, function(d) { return d[attr[i]]; }); }
    else { Verror[attr[i]] = 0; }
  }
  GlobalV.push(V);
  changed=axis;
}
else
{
  var V = Vgiven, Verror = {}, norm = 0;
  for (var i = 0; i<attrNo; i++) {
   norm = norm + (V[attr[i]])*(V[attr[i]]);
  }
  norm = Math.sqrt(norm);
  for (var i = 0; i<attrNo; i++) {
   V[attr[i]] = V[attr[i]]/norm;
   Verror[attr[i]] = 0;
  }
}

//making new axis
chartdata=[];
   index = index + 1; 
   newxname = 'x'+index;
   for(var j=0;j<attrNo;j++)       chartdata.push(V[attr[j]]);
   data.forEach(function(d) {
    d["coord"][newxname] = 0; 
    for (var j = 0; j<attrNo; j++) {
      d["coord"][newxname] = d["coord"][newxname] + V[attr[j]]*d["coord"][attr[j]];
    }
  });
 if(Vgiven==undefined)  axis=="X"?chart.series[0].setData(chartdata):chartRight.series[0].setData(chartdata); //changing the higchart only if the axis is made from dropzzones
  data.forEach(function(d) {d[axis=="X" ? "x" : "y"] = d["coord"][newxname]; });
  if(axis=="X") $('.x-axis-label').text(newxname);
  if(axis=="Y") $('.y-axis-label').text(newxname);
  this.drawvis();

  
}
ScatterPlot.prototype.updategraphOnDropdownChange=function(axis,index,Vgiven){
  var V = Vgiven, Verror = {}, norm = 0;
  attr=this.data.columns;
  attrNo=attr.length;
  for (var i = 0; i<attrNo; i++) {
   norm = norm + (V[attr[i]])*(V[attr[i]]);
  }
  norm = Math.sqrt(norm);
  for (var i = 0; i<attrNo; i++) {
   V[attr[i]] = V[attr[i]]/norm;
   Verror[attr[i]] = 0;
  }
  
  newxname = 'x'+index;
  this.data.forEach(function(d) {
   d["coord"][newxname] = 0; 
   for (var j = 0; j<attrNo; j++) {
     d["coord"][newxname] = d["coord"][newxname] + V[attr[j]]*d["coord"][attr[j]];
   }
 });
 this.data.forEach(function(d) {d[axis=="X" ? "x" : "y"] = d["coord"][newxname]; });
 if(axis=="X") $('.x-axis-label').text(newxname);
 if(axis=="Y") $('.y-axis-label').text(newxname);
 this.drawvis();

}
//#endregion

//#region Axis Save and Clear
function SaveX()
{
  var select = document.getElementById("select");
  if(changed=="X"){ 
  var option = document.createElement("OPTION"),txt=document.createTextNode("x"+index);
  option.appendChild(txt);
  option.setAttribute("value","x"+index);
  select.insertBefore(option,select.lastChild); 
  $("#select").val($('#select option:last').val());
  }
}
function SaveY()
{
  var select1 = document.getElementById("select1");
 if(changed=="Y"){
  var option = document.createElement("OPTION"),txt=document.createTextNode("x"+index);
  option.appendChild(txt);
  option.setAttribute("value","x"+index);
  select1.insertBefore(option,select1.lastChild);
  $("#select1").val($('#select1 option:last').val());
 }
}
function ClearX(){
x_right_dropzone=[];
x_left_dropzone=[];
while($(".x-left")[0].lastChild) $(".x-left")[0].removeChild($(".x-left")[0].lastChild);
while($(".x-right")[0].lastChild) $(".x-right")[0].removeChild($(".x-right")[0].lastChild);
document.getElementById('select').value="HP";
chooseX();
}
function ClearY(){
y_bottom_click=[];
y_top_click=[];
while($(".y-top")[0].lastChild) $(".y-top")[0].removeChild($(".y-top")[0].lastChild);
while($(".y-bottom")[0].lastChild) $(".y-bottom")[0].removeChild($(".y-bottom")[0].lastChild);
document.getElementById('select1').value="Retail Price";
chooseY();
}
//#endregion

// Add Lasso Functions

var lasso_start = function() {
  scatterPlot.lasso.items()
      // .attr("r",7) 
      .classed("not_possible",true)
      .classed("selected",false);
  selectedCluster = null;
};

var lasso_draw = function() {

  scatterPlot.lasso.possibleItems()
      .classed("not_possible",false)
      .classed("possible",true);

  scatterPlot.lasso.notPossibleItems()
      .classed("not_possible",true)
      .classed("possible",false);
};

var lasso_end = function() {
  scatterPlot.lasso.items()
      .classed("not_possible",false)
      .classed("possible",false);

  scatterPlot.lasso.selectedItems()
      .classed("selected",true)
      .attr("r",5);

  scatterPlot.lasso.notSelectedItems()
      .attr("r",5);

  // console.log(scatterPlot.lasso.selectedItems())
  processClusterData(scatterPlot.lasso.selectedItems())
};

//Funtion to toggle between Lasso and Zoom
function toggle_lasso() {
  
  if(!isLassoActivated) {
    console.log("Lasso Activated!");
    isLassoActivated = true;
    scatterPlot.lassoArea = scatterPlot.scatterPlotGroup.append("rect")
    .attr("width", scatterPlot.width)
    .attr("height", scatterPlot.height)
    .style("opacity", 0)
    scatterPlot.lasso.targetArea(scatterPlot.lassoArea)
    scatterPlot.scatterPlotGroup.call(scatterPlot.lasso);
    document.getElementById("lassoToggle").innerHTML = "Activate Zoom";
    $("#SaveClusterBtn").removeAttr("disabled");
  } else {
    console.log("Lasso Deactivated!");
    isLassoActivated = false;
   if(scatterPlot.lassoArea) scatterPlot.lassoArea.remove();
    $("#SaveClusterBtn").attr("disabled","disabled");
    document.getElementById("lassoToggle").innerHTML = "Activate Lasso";
    // Change Selected Items color if not

    scatterPlot.lasso.selectedItems()
      .classed("selected",false)
      .attr("r",5);
  }
}

// --------------------------------------- Cluster Handling Functions---------------------------------

// Function to process Cluster Data 
function processClusterData(clusterData) {
  console.log("IN PROCESS DATA")
  
  // Extract Data from Cluster if Valid
  clusterData = clusterData["_groups"][0].map(node => node["__data__"])
  
  // Check if valid cluster
  if(isValid(clusterData)) {
    // Can do some further processing here.
    isNewCluster=true;
    selectedCluster = getClusterSummary(clusterData)
  }
}

// Function to Save Cluster When Button is Clicked
function saveCluster() {
  var indexMap = {
    0:'A',
    1:'B',
    2:'C',
    3:'D'
  }
if(isNewCluster==true){
  if(selectedCluster) {
    clusterMap['D'] = clusterMap['C']
    clusterMap['C'] = clusterMap['B']
    clusterMap['B'] = clusterMap['A']
    clusterMap['A'] = selectedCluster;

    // clusterMap[indexMap[clusterInputIndex]] = selectedCluster
    // clusterInputIndex = (clusterInputIndex + 1) % 4
    //selectedCluster = null;
    console.log("CLUSTER ADDED")
  }
  console.log(clusterMap)
  addToCompare();
  chooseClusterDropdown();
  $("#onSaveCluster").modal('show');
  isNewCluster=false;
 }
 else if(selectedCluster) $("#onSaveCluster").modal('show'),console.log(clusterMap);
 else  alert("Please select a cluster to analyse and save!");
}

function addToCompare() {
  viewBox1="350 78 710 1290"
  viewBox2="350 -250 700 1290"
  viewBox3="350 -580 700 1290"
  viewBox4="350 -900 700 1290"
var temp=$("#ToCompare1>svg");
var temp1=$("#ToCompare2>svg");
var temp2=$("#ToCompare3>svg");

$("#ToCompare1").empty();
$("#ToCompare1").append('<input type="checkbox" class="A">');
$("#chart-area1>svg").clone().appendTo("#ToCompare1");
$("#ToCompare2").empty();
$("#ToCompare2").append('<input type="checkbox" class="B">');
$("#ToCompare2").append(temp);
$("#ToCompare3").empty();
$("#ToCompare3").append('<input type="checkbox" class="C">');
$("#ToCompare3").append(temp1);
$("#ToCompare4").empty();
$("#ToCompare4").append('<input type="checkbox" class="D">');
$("#ToCompare4").append(temp2);
if($("#ToCompare1>svg").length!=0) {
  document.getElementById("ToCompare1").childNodes[1].setAttribute("viewBox",viewBox1);
  $("#ToCompare1").css("background-color","cornsilk");
}
else $("#ToCompare1").empty();

if($("#ToCompare2>svg").length!=0){
  document.getElementById("ToCompare2").childNodes[1].setAttribute("viewBox",viewBox2 );
  $("#ToCompare2").css("background-color","cornsilk").css("text-align","")
}
else $("#ToCompare2").empty(),$("#ToCompare2").html("Cluster 2 currently not present").css("background-color","#BBBDBF").css("text-align","center");

if($("#ToCompare3>svg").length!=0){
  document.getElementById("ToCompare3").childNodes[1].setAttribute("viewBox",viewBox3 );
  $("#ToCompare3").css("background-color","cornsilk").css("text-align","")
}
else $("#ToCompare3").empty(),$("#ToCompare3").html("Cluster 3 currently not present").css("background-color","#BBBDBF").css("text-align","center");

if($("#ToCompare4>svg").length!=0){
  document.getElementById("ToCompare4").childNodes[1].setAttribute("viewBox",viewBox4  );
  $("#ToCompare4").css("background-color","cornsilk").css("text-align","")
}
else $("#ToCompare4").empty(),$("#ToCompare4").html("Cluster 4 currently not present").css("background-color","#BBBDBF").css("text-align","center");
}

// Function to Check if Cluster is Valid or Not
function isValid(clusterData) {
  if(clusterData.length > 0)
    return true;
  else return false;
}
function toggleSideBar(){
  $('#sidebar').toggleClass('active');
}
// Function to return cluster summary
function getClusterSummary(clusterData) {
  var categoricalSummary = {};
  var continuousSummary = {};
  categorialList=[];
  ExceptionClustersList=[];
  ExceptionClusterData=[];
  continuousSummary = getContinuousSummary(clusterData);
  categoricalSummary = getCategoricalSummary(clusterData);

  var result = {
    catSum: categoricalSummary,
    contSum: continuousSummary,
    expSum:ExceptionClusterData,
    catList:categorialList,
    expList:ExceptionClustersList
  }
  return result;
}

// Function return dictionary with summary of categorical attributes
function getCategoricalSummary(clusterData) {
  var attributeMap = {};
  for(attr in clusterData[0]['raw']) {
    if(categorialList.includes(attr)) {
      attributeMap[attr] = {};
    }
  }

  for(attribute in attributeMap) {
    uniqueAttrValues = getUnique(attribute)
    for(var i = 0; i < clusterData.length; i++) {
      uniqueAttrValues[clusterData[i]["raw"][attribute]] += 1
    }
    attributeMap[attribute] = uniqueAttrValues;
  }

  // Adding Attributes Name in Attribute Map
  var newAttributeMap = {};
  for(attr in attributeMap) {
    newAttributeMap[attr] = {};
  }

  for(attr in attributeMap) {
    var temp = "Non-" + attr;
    newAttributeMap[attr][attr] = attributeMap[attr][1],
    newAttributeMap[attr][temp] = attributeMap[attr][0]
  }

  
  return newAttributeMap;
}

// Function return dictionary with summary of continuous attributes
function getContinuousSummary(clusterData) {
  var attributeMap = {};
  // TODO VYOM's Code
//  console.log(clusterData);

  var matrix = {};
  var value = {};
  var cl = clusterData.length;
  var i = 0;
  var nc = {};
  for (i = 0; i<= cl - 1; i++) {
    var abc = clusterData[i]['raw'];
    var j = 0;
    var rowValue = {};
    for (var m in abc) {
      rowValue[j] = abc[m];
      value[j] = m;
      j++;
    }
    nc = j;
    matrix[i] = rowValue;
  }
  var names = {};
  if(localStorage['myKey']=='Car')var j= 1; else j=0;
  for (; j <= nc - 1; j++) {
    var s = new Set();
    for (i = 0; i <= cl - 1; i++ ) {
      s.add(Math.floor(Number(matrix[i][j])* 1000) / 1000);
    }
    if(s.has(0) && s.has(1) && s.size==2)
    {
     rangeArray=undefined;
    if(!categorialList.includes(value[j])) categorialList.push(value[j]);
    }
    else if(s.size>5) {
      var arr = Array.from(s);
      var minv, maxv;
    if(s.size==1)minv=0,maxv=1;else minv = arr[0],maxv = arr[0];
      for (var ch in arr) {
        minv = Math.min(minv,arr[ch]);
        maxv = Math.max(maxv,arr[ch]);
      }
      range = maxv - minv;
      var interval = range/10;

      var countRange = {};
      var p = 0;
      for (p = 0; p <= 9; p++) {
        countRange[p] = 0;
      }
    var rangeArray = {};

    clusterData.forEach((element)=>{
     var common_diff=((maxv-minv)/10),attr_val=element["raw"][value[j]];
     for(var i=0;i<10;i++)
        if(attr_val>=(minv+common_diff*i) && attr_val<=(minv+common_diff*(i+1))) 
           countRange[i]++;
    });

      rangeArray = {};
      for (var m in countRange) {
        v1 = minv + m*interval;
        v2 = v1 + interval;
        v1 = v1.toString();
        v2 = v2.toString();
        rangeArray[v1] = countRange[m];
      }
    }
    else{
      let array=Array.from(s);
      array.sort();
      //console.log(s,array,newAttributeMap);
      var newAttributeMap = {};
      array.forEach(element=>{
        newAttributeMap[element] = 0;
      })

      clusterData.forEach(element=>{
        var val=Number(element["raw"][value[j]]);
        if(array.includes(val)){
          newAttributeMap[val]++;
        }
      });
       var jsonToAppendToExceptionList={};jsonToAppendToExceptionList[value[j]]={};
       jsonToAppendToExceptionList[value[j]]=(newAttributeMap);
        ExceptionClusterData.push(jsonToAppendToExceptionList);
        ExceptionClustersList.push(value[j]);
        console.log(s,array,newAttributeMap);
      }
    names[value[j]] = rangeArray; 
  }
 // console.log("name",names);
  return names;
}

// Function to Sort Dictionary and return top 5 values
function sortDictionaryByValue(dict) {
  
  var items = Object.keys(dict).map(function(key) {
    return [key, dict[key]];
  });
  items.sort(function(first, second) {
    return second[1] - first[1];
  });

  items = items.slice(0, 5);

  sortedDict = {}
  
  for(var i = 0; i < items.length; i++) {
    data = items[i]
    sortedDict[data[0]] = data[1]
  }
  return sortedDict;
}

// Function Get Unique Value
function getUnique(attr) {
  uniqueHash = {};
  scatterPlot.data.forEach(row => {
    type_category = row["raw"][attr]
    uniqueHash[type_category] = 0;
  })
  return uniqueHash
}

function onCompareClusterClick(){
  if($("input[type='checkbox']:checked").length==1 || $("input[type='checkbox']:checked").length==0)
    alert("Select 2 clusters to compare");
  else if($("input[type='checkbox']:checked").length==2){
  
   chooseCompDropdown();
   $('#exampleModalCenter').modal('show');
  }
  else{
    alert("You can select only 2 clusters to compare");
  }
}