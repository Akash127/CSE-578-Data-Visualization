
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
      categories: []
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
  legend: {
    enabled: false
},  
  series: [{

      //draggableX: true,
      draggableY: true,
      dragMaxY: 1.5,
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
    legend: {
        enabled: false
    },
    xAxis: {
        categories: []
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
        yDecimals: 2,
        formatter:function(){
            return this.x + ":" +this.y;
        }
    },
  
    series: [{  
        //draggableX: true,
        draggableY: true,
        dragMaxY: 1.5,
        dragMinY: -1.5,
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
 //console.log(loadData);
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
  var slicedcolumns=columns.slice(4,20);
  this.chart.xAxis[0].setCategories(slicedcolumns);
  this.chartRight.xAxis[0].setCategories(slicedcolumns);
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
     var select1 = document.getElementById("select1")
     for(var i = 0; i < arr.length; i++)
     {
         var option = document.createElement("OPTION"),
         txt = document.createTextNode(arr[i]);
         option.appendChild(txt);
         option.setAttribute("value",arr[i]);
         select1.insertBefore(option,select1.lastChild);
     }
     $("#select").val("HP");
     $("#select1").val("Retail Price");

     var chartData=[],chartData1=[];
     for(var i=4;i<20;i++)
        {
            if(arr[i]=="HP")    chartData.push(1.5); else chartData.push(0)
            if(arr[i]=="Retail Price") chartData1.push(1.5); else chartData1.push(0);
        }
        this.chart.series[0].setData(chartData);
        this.chartRight.series[0].setData(chartData1);
    
});


function chooseX() {
  var abc = document.getElementById('select').value;  

  var t = document.getElementById('chart-area1');  
  t.innerHTML = '';

  // Load Dataset and Charts
d3.csv("dataset/04cars data_clean.csv").then(function(data) {
  loadData=[];
  data.forEach(element => {
    var tmp={"Name":null,"raw":null,"coord":null};
    tmp["Name"]=element["Vehicle Name"];
    tmp["raw"]=element;
    tmp["coord"]={};
    loadData.push(tmp);
  });
  //console.log(loadData);
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
  var chartData=[];
  for(var i=0;i<columns.length;i++){
    if(i>=4 && i<20){
    if (columns[i] == abc) {
      xv = i;
      chartData.push(1.5);
    }
    else chartData.push(0);
    }
  }
  chart.series[0].setData(chartData);
  scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv);

});
}

function chooseY() {
  var abc = document.getElementById('select1').value;  

  var t = document.getElementById('chart-area1');  
  t.innerHTML = '';

  // Load Dataset and Charts
d3.csv("dataset/04cars data_clean.csv").then(function(data) {

    loadData=[];
  data.forEach(element => {
    var tmp={"Name":null,"raw":null,"coord":null};
    tmp["Name"]=element["Vehicle Name"];
    tmp["raw"]=element;
    tmp["coord"]={};
    loadData.push(tmp);
  });

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
  var chartData=[];
  for(var i=0;i<columns.length;i++){
    if(i>=4 && i<20){
    if (columns[i] == abc) {
        yv = i;
      chartData.push(1.5);
    }
    else chartData.push(0);
    }
  }
chartRight.series[0].setData(chartData);
  scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv);

});
}
