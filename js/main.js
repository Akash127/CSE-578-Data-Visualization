
var scatterPlot, desc;
var selectedPoint;
var loadData=[];

function pointSelected(event) {
  selectedPoint = event.raw;
  desc.update();
}
var chart=null;
chart = new Highcharts.Chart({
  chart: {
      renderTo: 'left-bars',
      animation: true,
      height:300,
      width:400,
      credits:false
  },
  credits:{
    enabled:false
},
  title: {
      text: 'Y-Axis attributes weights'
  },

  xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },

  plotOptions: {
      series: {
          point: {
              events: {

                  drag: function (e) {
                    
                  },
                  drop: function () {
                      $('.change-left').html(
                          'In <b>' + this.series.name + '</b>, <b>' + this.category + '</b> was set to <b>' + Highcharts.numberFormat(this.y, 2) + '</b>');
                  }
              }
          },
          stickyTracking: false
      },
      column: {
          stacking: 'normal'
      },
      line: {
          cursor: 'ns-resize'
      }
  },

  tooltip: {
      yDecimals: 2,
      formatter:function(){
          return this.x + ":" +this.y;
      }
  },

  series: [{
      data: [0, 0, 0.5, 0, 1, 0, 0, 0, -1, 0, 0, 0],
      //draggableX: true,
      draggableY: true,
      dragMaxY:1.5,
      dragMinY: -1.5,
      type: 'column',
      minPointLength: 2
  }]

});
var chartRight=null;
chartRight = new Highcharts.Chart({
    chart: {
        renderTo: 'right-bars',
        animation: true,
        height:300,
        width:400
    },
    credits:{
        enabled:false
    },
    title: {
        text: 'X-Axis attributes weights'
    },
  
    xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
  
    plotOptions: {
        series: {
            point: {
                events: {
  
                    drag: function (e) {
                      
                    },
                    drop: function () {
                        $('.change-right').html(
                            'In <b>' + this.series.name + '</b>, <b>' + this.category + '</b> was set to <b>' + Highcharts.numberFormat(this.y, 2) + '</b>');
                    }
                }
            },
            stickyTracking: false
        },
        column: {
            stacking: 'normal'
        },
        line: {
            cursor: 'ns-resize'
        }
    },
  
    tooltip: {
        yDecimals: 2
    },
  
    series: [{
        data: [0, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
        //draggableX: true,
        draggableY: true,
        dragMinY: 0,
        type: 'column',
        width:300,
        height:500,
        minPointLength: 2
    }]
  
  });
// Load Dataset and Charts
d3.csv("dataset/04cars data_clean.csv").then(function(data) {
  
  data.forEach(element => {
    var tmp={"Name":null,"raw":null,"coord":null};
    tmp["Name"]=element["Vehicle Name"];
    tmp["raw"]=element;
    tmp["coord"]={};
    loadData.push(tmp);
  });
 console.log(loadData);
  var columns=  data.columns;

  for(var i=0;i<columns.length;i++){
   var tmpMax=d3.max(loadData,function(d){return +d["raw"][columns[i]];});
   var tmpMin=d3.min(loadData,function(d){return +d["raw"][columns[i]];});
   loadData.forEach(function(d){
     d["coord"][columns[i]]=((+d["raw"][columns[i]]-tmpMin)/(tmpMax-tmpMin));
     delete d["coord"]["Vehicle Name"];
     delete d["coord"]["Pickup"];
   });
  }
  loadData["columns"]=columns;
//  console.log(loadData);
  xv = 9;
  yv = 13;
  scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv);
  if(!selectedPoint) {
    selectedPoint = loadData[0].raw
  }
  desc = new DescriptionTable("#desc");
    var select = document.getElementById("select"),
     arr = data.columns;
     for(var i = 0; i < arr.length; i++)
     {
         var option = document.createElement("OPTION"),
         txt = document.createTextNode(arr[i]);
         option.appendChild(txt);
         option.setAttribute("value",arr[i]);
         select.insertBefore(option,select.lastChild);
         option.setAttribute("id","x"+i);
     }
     var select1 = document.getElementById("select1"),
     arr = data.columns;
     for(var i = 0; i < arr.length; i++)
     {
         var option = document.createElement("OPTION"),
         txt = document.createTextNode(arr[i]);
         option.appendChild(txt);
         option.setAttribute("value",arr[i]);
         select1.insertBefore(option,select1.lastChild);
     }
    
});


function chooseX() {
  var abc = document.getElementById('select').value;  

  var t = document.getElementById('chart-area1');  
  t.innerHTML = '';

  // Load Dataset and Charts
d3.csv("dataset/04cars data_clean.csv").then(function(data) {

  data.forEach(element => {
    var tmp={"Name":null,"raw":null,"coord":null};
    tmp["Name"]=element["Vehicle Name"];
    tmp["raw"]=element;
    tmp["coord"]={};
    loadData.push(tmp);
  });
  console.log(loadData);
  var columns=  data.columns;

  for(var i=0;i<columns.length;i++){
   var tmpMax=d3.max(loadData,function(d){return +d["raw"][columns[i]];});
   var tmpMin=d3.min(loadData,function(d){return +d["raw"][columns[i]];});
   loadData.forEach(function(d){
     d["coord"][columns[i]]=((+d["raw"][columns[i]]-tmpMin)/(tmpMax-tmpMin));
     delete d["coord"]["Vehicle Name"];
     delete d["coord"]["Pickup"];
   });
  }
  loadData["columns"]=columns;

  for(var i=0;i<columns.length;i++){
    if (columns[i] == abc) {
      xv = i;
    }
  }

  scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv);

});
}

function chooseY() {
  var abc = document.getElementById('select1').value;  

  var t = document.getElementById('chart-area1');  
  t.innerHTML = '';

  // Load Dataset and Charts
d3.csv("dataset/04cars data_clean.csv").then(function(data) {

  data.forEach(element => {
    var tmp={"Name":null,"raw":null,"coord":null};
    tmp["Name"]=element["Vehicle Name"];
    tmp["raw"]=element;
    tmp["coord"]={};
    loadData.push(tmp);
  });
  console.log(loadData);
  var columns=  data.columns;

  for(var i=0;i<columns.length;i++){
   var tmpMax=d3.max(loadData,function(d){return +d["raw"][columns[i]];});
   var tmpMin=d3.min(loadData,function(d){return +d["raw"][columns[i]];});
   loadData.forEach(function(d){
     d["coord"][columns[i]]=((+d["raw"][columns[i]]-tmpMin)/(tmpMax-tmpMin));
     delete d["coord"]["Vehicle Name"];
     delete d["coord"]["Pickup"];
   });
  }
  loadData["columns"]=columns;

  for(var i=0;i<columns.length;i++){

    if (columns[i] == abc) {
      yv = i;
    }
  }

  scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv);

});
}
