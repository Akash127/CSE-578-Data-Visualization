DescriptionTable = function(containerClassName) {
  this.containerClassName = containerClassName;
  this.createTable();
}

DescriptionTable.prototype.createTable = function() {
  
  this.processData();
  
  this.table = d3.select(this.containerClassName).append('table')
    .attr("class", "table table-bordered table-sm text-light bg-secondary")
  this.thead = this.table.append('thead')
  this.tbody = this.table.append('tbody');
  
  this.columns = ['feature', 'value']

  this.rows = this.tbody.selectAll('tr')
    .data(this.featureData)
    .enter()
    .append('tr')

  this.cells = this.rows.selectAll('td')
    .data(row => {
      return this.columns.map(function (col) {
        return {col: col, value: row[col]}
      })
    })
    .enter()
    .append('td')
      .text(function(d) {
        return d.value;
      }) 
}

DescriptionTable.prototype.update = function() {

  this.processData();
  
  this.tbody.selectAll('tr')
    .data(this.featureData)
    .selectAll('td')
      .data(row => {
        return this.columns.map(function (col) {
          return {col: col, value: row[col]}
        })
      })
      .text(function(d) {
        return d.value;
      })  
}

DescriptionTable.prototype.processData = function() {
  
  var featureData = [];

  for(key in selectedPoint) {
    var temp = {
      'feature': key,
      'value': selectedPoint[key]
    };
    featureData.push(temp);
  }
  this.featureData = featureData;
}


