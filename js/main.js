

var scatterPlot, desc;
var selectedPoint;

function pointSelected(event) {
  selectedPoint = event;
  desc.update()
}

// Load Dataset and Charts
d3.csv("dataset/dataclean.csv").then(function(data) {
  scatterPlot = new ScatterPlot(data, "#chart-area1");
  if(!selectedPoint) {
    selectedPoint = data[0]
  }
  desc = new DescriptionTable("#desc");
});
