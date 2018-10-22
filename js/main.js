
// Load Dataset and Charts
d3.csv("dataset/dataclean.csv").then(function(data) {
  scatterPlot = new ScatterPlot(data, "#chart-area1");
});

