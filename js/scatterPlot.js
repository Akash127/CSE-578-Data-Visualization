//#region global values will be defined here
var initialXColumnNo=13;
var initialYColumnNo=9;
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
ScatterPlot = function(data, containerClassName, xAxisColumnNo, yAxisColumnNo) {
  this.data = data
  this.containerClassName = containerClassName
  initialXColumnNo = xAxisColumnNo;
  initialYColumnNo = yAxisColumnNo;
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

  var xmax = d3.max(this.data,function(d){return +d["coord"][vis.columns[initialXColumnNo]]});
  var xmin = d3.min(this.data,function(d){return +d["coord"][vis.columns[initialXColumnNo]]});
  var ymax = d3.max(this.data,function(d){return +d["coord"][vis.columns[initialYColumnNo]]});
  var ymin = d3.min(this.data,function(d){return +d["coord"][vis.columns[initialYColumnNo]]});

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
    .text(vis.columns[initialXColumnNo])
    .attr("y", vis.height + 50)
    .attr("x", vis.width/2)
    .attr("class", "x-axis-label")
    .attr("font-size", "18px")
  vis.scatterPlotGroup.append("text")
    .text(vis.columns[initialYColumnNo])
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
    d['x']=d["coord"][vis.columns[initialXColumnNo]];
    d['y']=d["coord"][vis.columns[initialYColumnNo]];
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
       +"<button class='btn tool-tip btn-sm btn-secondary mr-1' onclick=y_bottom_click()>Drop in Y-Low</button>"
       +"<button class='btn tool-tip btn-sm btn-secondary' onclick=y_top_click()>Drop in Y-High</button>"
      
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


ScatterPlot.prototype.updategraph=function(axis, high, low,newGivenVector)
{
  var data=this.data;
  var decisionVector = {};

  data.forEach((element)=>{
    element["coord"]["Vehicle Name"]=1;
    element["coord"]["Pickup"]=2;
    element["coord"]["Name"]=1;
    element["coord"]["Song Title"]=1;
    element["coord"]["Artist"]=1;
  });

  attr=this.data.columns;
  var attrLen=attr.length; //t be changed
  var AttrLowMean={},AttrHighMean={};

  if(newGivenVector==undefined) ///if the update is coming from dropzones
  { 
    attr.forEach(element=>{
      decisionVector[element]=0;
      AttrLowMean[element] = d3.mean(low, function(d) { return d["coord"][element]});
      AttrHighMean[element] = d3.mean(high, function(d) { return d["coord"][element]});
    });

    decisionVector=makeNewAxisVector(newGivenVector,attr,AttrHighMean,AttrLowMean)
    GlobalV.push(decisionVector);
  }
  else  
  //if change is coming from highcharts
  decisionVector=makeNewAxisVector(newGivenVector,attr)  
  
  //making new axis
  chartdata=[];
  index = index + 1; 
  newxname = 'x'+index;

  for(var j=0;j<attrLen;j++)       
    chartdata.push(decisionVector[attr[j]]);
  
  data.forEach(function(d) {
    d["coord"][newxname] = 0; 
    for (var j = 0; j<attrLen; j++)
      d["coord"][newxname] = d["coord"][newxname] + decisionVector[attr[j]]*d["coord"][attr[j]];
  });
  
  //changing the higchart only if the axis is made from dropzzones
  if(newGivenVector==undefined)  axis=="X"?chart.series[0].setData(chartdata):chartRight.series[0].setData(chartdata);   
  
  //plotting new points
  data.forEach(function(d) {
    d[axis=="X" ? "x" : "y"] = d["coord"][newxname]; 
  });
  
  //changing Axis labels
  if(axis=="X") $('.x-axis-label').text(newxname);
  if(axis=="Y") $('.y-axis-label').text(newxname);
  
  //drawing the vis again
  this.drawvis(); 
 }

ScatterPlot.prototype.updategraphOnDropdownChange=function(axis,index,newGivenVector){
  attr=this.data.columns;
  attrLen=attr.length;
  decisionVector=makeNewAxisVector(newGivenVector,attr);
  newxname = 'x'+index;
  this.data.forEach(function(d) {
   d["coord"][newxname] = 0; 
   for (var j = 0; j<attrLen; j++) {
     d["coord"][newxname] = d["coord"][newxname] + decisionVector[attr[j]]*d["coord"][attr[j]];
   }
  });

  //changing the datapoints
  this.data.forEach(function(d) {d[axis=="X" ? "x" : "y"] = d["coord"][newxname]; });
  if(axis=="X") $('.x-axis-label').text(newxname);
  if(axis=="Y") $('.y-axis-label').text(newxname);
  this.drawvis();
}

function makeNewAxisVector(givenVector,attr,AttrHighMean,AttrLowMean)
{
 var vectorToReturn={},denominator=0;
  if(givenVector==undefined){
   attr.forEach(element=>{
     vectorToReturn[element] = AttrHighMean[element]-AttrLowMean[element];
     denominator = denominator + (AttrHighMean[element]-AttrLowMean[element])*(AttrHighMean[element]-AttrLowMean[element]);
   });
 }
 else{
   vectorToReturn=givenVector;
   attr.forEach(element=>{
     denominator=denominator+vectorToReturn[element]*vectorToReturn[element];
   });
 }
 denominator = Math.sqrt(denominator);
 attr.forEach(element=>{
   vectorToReturn[element] = vectorToReturn[element]/denominator;
 });
 return vectorToReturn;
}
//#endregion

//#region Axis Save and Clear
function SaveX()
{
  var select = document.getElementById("select");
  var isPresent=false;
  var dropdownlist=$('#select>option');
  var x_axis_label=$(".x-axis-label").text();
  for(var i=0;i<$(dropdownlist).length;i++)
  {
    if($(dropdownlist[i]).val()==x_axis_label)  
      isPresent=true;
  }
  if(!isPresent){ 
    var option = document.createElement("OPTION"),txt=document.createTextNode(x_axis_label);
    option.appendChild(txt);
    option.setAttribute("value",x_axis_label);
    select.insertBefore(option,select.lastChild); 
    $("#select").val($('#select option:last').val());
  }
  else
    alert("Sorry,You cannot save the same axis again!!!");
  
}
function SaveY()
{
  var select1 = document.getElementById("select1");
  var isPresent=false;
  var dropdownlist=$('#select1>option');
  var y_axis_label=$(".y-axis-label").text();
  for(var i=0;i<$(dropdownlist).length;i++)
  {
    if($(dropdownlist[i]).val()==$(".y-axis-label").text())  
      isPresent=true;
  }
  if(!isPresent){
    var option = document.createElement("OPTION"),txt=document.createTextNode(y_axis_label);
    option.appendChild(txt);
    option.setAttribute("value",y_axis_label);
    select1.insertBefore(option,select1.lastChild);
    $("#select1").val($('#select1 option:last').val());
  }
  else
    alert("Sorry,You cannot save the same axis again!!!");
  
}
function ClearX(){
  x_right_dropzone=[];
  x_left_dropzone=[];
  while($(".x-left")[0].lastChild) $(".x-left")[0].removeChild($(".x-left")[0].lastChild);
  while($(".x-right")[0].lastChild) $(".x-right")[0].removeChild($(".x-right")[0].lastChild);
  document.getElementById('select').value=this.data.columns[initialXColumnNo];
  chooseX();
}
function ClearY(){
  y_bottom_click=[];
  y_top_click=[];
  while($(".y-top")[0].lastChild) $(".y-top")[0].removeChild($(".y-top")[0].lastChild);
  while($(".y-bottom")[0].lastChild) $(".y-bottom")[0].removeChild($(".y-bottom")[0].lastChild);
  document.getElementById('select1').value=this.data.columns[initialYColumnNo];
  chooseY();
}
//#endregion
