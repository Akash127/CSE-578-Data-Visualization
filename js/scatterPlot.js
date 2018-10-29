
ScatterPlot = function(data, containerClassName) {
  this.data = data
  this.containerClassName = containerClassName
  this.init();
};
var initX=9;
var initY=13;
ScatterPlot.prototype.init = function() {
  var vis = this;
  vis.margin = {left:50, right:10, top:10, bottom:70};

  vis.width = 500 - vis.margin.left - vis.margin.right;
  vis.height = 550 - vis.margin.top - vis.margin.bottom;

  vis.svgCanvas = d3.select(vis.containerClassName).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

  vis.scatterPlotGroup = vis.svgCanvas.append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
    var columns=this.data.columns;
    var max=d3.max(this.data,function(d){return +d["coord"][columns[initX]]});
    var min =d3.min(this.data,function(d){return +d["coord"][columns[initX]]});
    var ymax=d3.max(this.data,function(d){return +d["coord"][columns[initY]]});
    var ymin =d3.min(this.data,function(d){return +d["coord"][columns[initY]]});
   // console.log(columns);
  // Initiating Scales for Axis and Inverted Axis

  vis.xScale_scatter = d3.scaleLinear()
    .range([0, vis.width])
    .domain([min,max])

  vis.yScale_scatter = d3.scaleLinear()
    .range([0, vis.height])
    .domain([ymin, ymax])
  
    vis.invertedYScale_scatter = d3.scaleLinear()
    .range([vis.height, 0])
    .domain([ymin, ymax])
  
  
  // Creating and Adding Axis
  vis.xAxis_scatter = d3.axisBottom(vis.xScale_scatter)
    .ticks(4)
  vis.xAxis = vis.scatterPlotGroup.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + vis.height + ")")
    .call(vis.xAxis_scatter);

  vis.yAxis_scatter = d3.axisLeft(vis.invertedYScale_scatter)
   // .ticks(4)
  vis.yAxis = vis.scatterPlotGroup.append("g")
    .attr("class", "y-axis")
    .call(vis.yAxis_scatter);
  
  // Adding Axis Labels
  vis.scatterPlotGroup.append("text")
    .text(columns[initX])
    .attr("y", -35)
    .attr("x", -380)
    .attr("class", "y-axis-label")
    .attr("font-size", "18px")
    .attr("transform", "rotate(-90)")


  vis.scatterPlotGroup.append("text")
    .text(columns[initY])
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

  // Tooltip
  var tip = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
      var text = "<strong><span style='color: #E57255'>"+d.player1+" defeated "+d.player2+"("+d.year+")</span></strong><br><br>"
      text += "First Point Won-("+ d.player1 + "): " + d.firstPointWon1 + "%<br>"
      text += "Return Point-(" + d.player2 + "): " + d.return2 + "%<br>"
      return text;
    });
  vis.scatterPlotGroup.call(tip);

  // Adding Circles
  vis.circles = vis.scatterPlotGroup.selectAll("circle")
    .data(vis.data)
    var columns=this.data.columns;
  vis.circles.enter()
    .append("circle")
      .attr("cx", function(d, i){
        return vis.xScale_scatter(+d["coord"][columns[initY]]);
      })
      .attr("cy", function(d) {
        return vis.height - vis.yScale_scatter(+d["coord"][columns[initX]]);
      })
      .attr("r", 5)
      .on("mouseover", pointSelected)
      // .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
      .attr("fill", "#FFB55F")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
}

function dragstarted(d) {
  //console.log(d);
  d3.select(this).raise().classed("active", true);
}

function dragged(d) {
  //console.log(d);
  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
  //console.log(d);
  d3.select(this).classed("active", false);
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