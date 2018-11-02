var initX=9;
var initY=13;
var selected;
var selectedElement;
var selectedProperties;
var cx1=cx2=cy1=cy2=0;
var x_left_dropzone=[];
var x_right_dropzone=[];
var y_top_dropzone=[];
var y_bottom_dropzone=[];
var tip;
var lineData = [
  {"x": 0, "y": -Number.MAX_SAFE_INTEGER},
  {"x": 0, "y": Number.MAX_SAFE_INTEGER}
] 


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

  vis.width = 900 - vis.margin.left - vis.margin.right;
  vis.height = 700 - vis.margin.top - vis.margin.bottom;

  vis.svg = d3.select(vis.containerClassName).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

  vis.scatterPlotGroup = vis.svg.append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
    
  vis.columns = this.data.columns;

  var xmax = d3.max(this.data,function(d){return +d["coord"][vis.columns[initX]]});
  var xmin = d3.min(this.data,function(d){return +d["coord"][vis.columns[initX]]});
  var ymax = d3.max(this.data,function(d){return +d["coord"][vis.columns[initY]]});
  var ymin = d3.min(this.data,function(d){return +d["coord"][vis.columns[initY]]});

  // Initiating Scales for Axis and Inverted Axis

  vis.xScale = d3.scaleLinear()
    .range([0, vis.width])
    .domain([xmin,xmax])

  vis.yScale = d3.scaleLinear()
    .range([vis.height, 0])
    .domain([ymin, ymax])
  
  
  // Creating and Adding Axis
  // create Axis Objects
  vis.xAxis = d3.axisBottom(vis.xScale)
    .ticks(20)
    .tickSize(-vis.height)
  
  vis.yAxis = d3.axisLeft(vis.yScale)
    .ticks(20)
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
  vis.svg.append("rect")
    .attr("width", vis.width)
    .attr("height", vis.height)
    .style("fill", "none")
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
  
  // Adding Axis Labels
  vis.scatterPlotGroup.append("text")
    .text(vis.columns[initX])
    .attr("y", -35)
    .attr("x", -380)
    .attr("class", "y-axis-label")
    .attr("font-size", "18px")
    .attr("transform", "rotate(-90)")


  vis.scatterPlotGroup.append("text")
    .text(vis.columns[initY])
    .attr("y", vis.height + 50)
    .attr("x", 150)
    .attr("class", "x-axis-label")
    .attr("font-size", "18px")

  vis.processData();

  var low=[];
  var high=[];
  this.updategraph("Y",)
};

//-------------------------------Process Data------------------------------------------

ScatterPlot.prototype.processData = function() {
  var vis = this;
  vis.drawvis();
}


//-------------------------------Create Vizualization----------------------------------

ScatterPlot.prototype.drawvis = function() {

  var vis = this;

  // // Tooltip
    tip = d3.tip().attr('class', 'd3-tip')
     .html(function(d) {
      $(this).addClass("selected");
         selected=d3.selectAll('.selected');
        selectedElement=this;
         selectedProperties=d;
       var text = "<button onclick=x_left_click()>Drop in X-left</button>"
       +"<button onclick=x_right_click()>Drop in X-right</button>"
       +"<button onclick=y_top_click()>Drop in Y-top</button>"
      +"<button onclick=y_bottom_click()>Drop in y-bottom</button>"
       return text;
     });
   vis.scatterPlotGroup.call(tip);

  // Adding Circles
  vis.circles = vis.scatterPlotGroup.selectAll("circle")
    .data(vis.data)
  
  vis.circles.enter()
    .append("circle")
      .attr("cx", function(d, i){
        return vis.xScale(+d["coord"][vis.columns[initY]]);
      })
      .attr("cy", function(d) {
        return vis.yScale(+d["coord"][vis.columns[initX]]);
      })
      .attr("r", 5)
      .attr("class","dropdown")
      .attr("clip-path", "url(#clip)")
      .on("mouseover", pointSelected)
      .attr("fill", "#FFB55F")
      .on("click",tip.show);
  

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

}

function zoomed (vis) {

  //if tooltip is showing 
  if($(".d3-tip").css('opacity')==1) {
    tip.hide();
    selected.classed("selected",false);
    selected=null;
  }
  // create new scale ojects based on event
  var new_xScale = d3.event.transform.rescaleX(vis.xScale);
  var new_yScale = d3.event.transform.rescaleY(vis.yScale);
  // Update axes
  vis.gX.call(vis.xAxis.scale(new_xScale));
  vis.gY.call(vis.yAxis.scale(new_yScale));

  vis.scatterPlotGroup.selectAll("circle").data(vis.data)
   .attr('cx', function(d) {return new_xScale(+d["coord"][vis.columns[initY]])})
   .attr('cy', function(d) {return new_yScale(+d["coord"][vis.columns[initX]])});

  vis.xOrigin = d3.line()
    .x(function(d) {return new_xScale(d.y)})
    .y(function(d) {return new_yScale(d.x)})
  
  vis.scatterPlotGroup.select(".xOriginLine")
    .attr("d", vis.xOrigin(lineData))
    .attr("clip-path", "url(#clip)")

  vis.yOrigin = d3.line()
   .x(function(d) {return new_xScale(d.x)})
   .y(function(d) {return new_yScale(d.y)})
  
  vis.scatterPlotGroup.select(".yOriginLine")
    .attr("d", vis.yOrigin(lineData))
    .attr("clip-path", "url(#clip)")
}

function x_left_click(){
  tip.hide();
  var cln = selectedElement.cloneNode(true);
  cln.removeAttribute("class");
  cln.classList.add("in-x-left");
  selected.classed("selected",false);
  selected=null;

  x_left_dropzone.push(selectedProperties);
  cx1+=cx1;
  d3.select(".x-left").selectAll("circle").data(x_left_dropzone).enter()
  .append("circle")
  .attr("r",4)
  .attr("cx",cx1)
  .attr("cy",cx1)
  .attr("fill","red")
  .on("mouseover",pointSelected);
  
}
function x_right_click(){
  tip.hide();
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
  
}
function y_top_click(){
  tip.hide();
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
  
}
function y_bottom_click(){
  tip.hide();
  var cln = selectedElement.cloneNode(true);
  cln.removeAttribute("class");
  cln.classList.add("in-x-top");
  selected.classed("selected",false);
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
}
ScatterPlot.prototype.updategraph=function(axis,YH,YL,XL,XH){
  var data=this.data;
  
  attr=this.data.columns;
  var attrNo=15; //t be changed
  var x1={},
  x0={};
  var high=this.data[0],low=this.data[2];
  for (var i = 0; i<attrNo; i++) {
    x1[attr[i]] = d3.mean(low, function(d) { return d[attr[i]]});
    x0[attr[i]] = d3.mean(high, function(d) { return d[attr[i]]});
  }

  var hlpair = [];
  for (var i = 0; i<high.length; i++) {
    for (var j = 0; j<low.length; j++) {
      var tmpelt = {};
      for (var k = 0; k<attrNo; k++) {
        tmpelt[attr[k]] = high[i][attr[k]] - low[j][attr[k]];
      }
      hlpair[hlpair.length] = tmpelt;
    }
  }
}