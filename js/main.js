

// Load Dataset and Charts
d3.csv("dataset/cleaned_matches_dataset.csv").then(function(data) {
  scatterPlot = new ScatterPlot(data, "#chart-area1");
});

