
ScatterPlot = function(data, containerClassName) {
  this.data = data
  this.containerClassName = containerClassName
  this.init();
};

ScatterPlot.prototype.init = function() {
  var vis = this;

  vis.margin = {left:50, right:10, top:10, bottom:70};

  vis.width = 700 - vis.margin.left - vis.margin.right;
  vis.height = 550 - vis.margin.top - vis.margin.bottom;

  vis.svgCanvas = d3.select(vis.containerClassName).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

  vis.scatterPlotGroup = vis.svgCanvas.append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")

  // Initiating Scales for Axis and Inverted Axis
  vis.xScale_scatter = d3.scaleLinear()
    .range([0, vis.width])
    .domain([50,100])

  vis.yScale_scatter = d3.scaleLinear()
    .range([0, vis.height])
    .domain([0, 60])

  vis.invertedYScale_scatter = d3.scaleLinear()
    .range([vis.height, 0])
    .domain([0, 60])
  
  // Creating and Adding Axis
  vis.xAxis_scatter = d3.axisBottom(vis.xScale_scatter)
    .ticks(4)
  vis.xAxis = vis.scatterPlotGroup.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + vis.height + ")")
    .call(vis.xAxis_scatter);

  vis.yAxis_scatter = d3.axisLeft(vis.invertedYScale_scatter)
    .ticks(4)
  vis.yAxis = vis.scatterPlotGroup.append("g")
    .attr("class", "y-axis")
    .call(vis.yAxis_scatter);
  
  // Adding Axis Labels
  vis.scatterPlotGroup.append("text")
    .text("Return Points Won By Defeated Player (%)")
    .attr("y", -35)
    .attr("x", -380)
    .attr("class", "y-axis-label")
    .attr("font-size", "18px")
    .attr("transform", "rotate(-90)")


  vis.scatterPlotGroup.append("text")
    .text("Points Won by the Winner on First Serve (%)")
    .attr("y", vis.height + 50)
    .attr("x", 150)
    .attr("class", "x-axis-label")
    .attr("font-size", "18px")

  vis.processData();
};

//-------------------------------Process Data------------------------------------------

ScatterPlot.prototype.processData = function() {
  var vis = this;
  vis.data.forEach(function(d) {
    d.firstPointWon1 = +(d.firstPointWon1.replace('%', ''))
    d.return2 = +(d.return2.replace('%', ''))
  })
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

  vis.circles.enter()
    .append("circle")
      .attr("cx", function(d, i){
        return vis.xScale_scatter(d.firstPointWon1);
      })
      .attr("cy", function(d) {
        return vis.height - vis.yScale_scatter(d.return2);
      })
      .attr("r", 5)
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
      .attr("fill", "#FFB55F")
}
