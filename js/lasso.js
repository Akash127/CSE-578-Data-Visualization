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
