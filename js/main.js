
var scatterPlot, desc;
var selectedPoint;
var loadData=[];
var GlobalV=[];
var changed;
var isLassoActivated = false;

function pointSelected(event) {
  selectedPoint = event.raw;
  desc.update();
}

// function toggle_lasso() {
//     console.log("Lasso Activated");
//     if(isLasso) {
//         isLasso = false;
//     } else {
//         isLasso = true;
//     }
// }

var chart=null;
chart = new Highcharts.Chart({
  chart: {
      renderTo: 'left-bars',
      animation: true,
      height:400,
      width:400
  },
  credits:{
    enabled:false
},
  title: {
      text: 'X-Axis attributes weights'
  },

  xAxis: {
      categories: []
  },
  yAxis: {
    softMax: 1
},

  plotOptions: {
      series: {
          point: {
              events: {

                  drag: function (e) {
                    
                  },
                  drop: function () {
                    var V={},data=chart.series[0].data;
                    for(var i=0;i<18;i++)
                    {
                         V[data[i].category]=data[i].y;
                    }
                    changed="X";
                    GlobalV.push(V);
                    scatterPlot.updategraph("X",[],[],V);
                    }
              }
          },
          stickyTracking: false,
          dragDrop: {
            draggableY: true,
            dragMaxY:1,
            dragMinY:-1
        }
      },
      bar: {
          stacking: 'normal', minPointLength: 2
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
      type: 'bar',
      negativeColor: '#FF0000'
  }]

});
var chartRight=null;
chartRight = new Highcharts.Chart({
    chart: {
        renderTo: 'right-bars',
        animation: false,
        height:400,
        width:400
    },
    credits:{
        enabled:false
    },
    title: {
        text: 'Y-Axis attributes weights'
    },
    legend: {
        enabled: false
    },
    xAxis: {
        categories: []
    },
    yAxis: {
        Max: 1
    },
    
    plotOptions: {
        series: {
            point: {
                events: {
                    drag: function (e) {
                      
                    },
                    drop: function () {
                        var V={},data=chartRight.series[0].data;
                        for(var i=0;i<18;i++)
                        {
                             V[data[i].category]=data[i].y;
                        }
                        
                        GlobalV.push(V);
                        scatterPlot.updategraph("Y",[],[],V);
                        changed="Y";
                    }
                }
            },
            dragDrop: {
                draggableY: true,
                dragMaxY:1,
                dragMinY:-1
            },
            stickyTracking: false
        },
        bar: {
            stacking: 'normal',
            //cursor: 'ns-resize'
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
        type: 'bar',
        width:300,
        height:500,
        minPointLength: 2,        
        negativeColor: '#FF0000'
    }]
  
  });
// Load Dataset and Charts
d3.csv("dataset/04cars data_clean.csv").then(function(data) {
  da=data;
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
  columns.splice(0,1);
  columns.splice(5,1);
  loadData["columns"]=columns;
 // var slicedcolumns=columns.slice(4,20);
  this.chart.xAxis[0].setCategories(columns);
  this.chartRight.xAxis[0].setCategories(columns);
//  console.log(loadData);
  xv =11;
  yv = 7;
  scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv);
  if(!selectedPoint) {
    selectedPoint = loadData[0].raw
  }
  desc = new DescriptionTable("#desc");
    var select = document.getElementById("select"),arr = data.columns;
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
     var selectCluster=document.getElementById("selectCluster");
     var selectComp=document.getElementById("selectComp");
     for(var i = 0; i < arr.length; i++)
     {
         var option = document.createElement("OPTION"),
         txt = document.createTextNode(arr[i]);
         option.appendChild(txt);
         option.setAttribute("value",arr[i]);
         select1.insertBefore(option,select1.lastChild);
     }
     for(var i = 0; i < arr.length; i++)
     {
         var option = document.createElement("OPTION"),
         txt = document.createTextNode(arr[i]);
         option.appendChild(txt);
         option.setAttribute("value",arr[i]);
         selectCluster.insertBefore(option,selectCluster.lastChild);
    }

     for(var i = 0; i < arr.length; i++)
     {
         var option = document.createElement("OPTION"),
         txt = document.createTextNode(arr[i]);
         option.appendChild(txt);
         option.setAttribute("value",arr[i]);
         selectComp.insertBefore(option,selectComp.lastChild);
    }

     $("#select").val("HP");
     $("#select1").val("Retail Price");

     var chartData=[],chartData1=[];
     for(var i=0;i<columns.length;i++)
        {
            if(arr[i]=="Retail Price")  chartData.push(1); else chartData.push(0)
            if(arr[i]=="HP") chartData1.push(1); else chartData1.push(0);
        }
        this.chart.series[0].setData(chartData1);
        this.chartRight.series[0].setData(chartData);
});


function chooseX() {
  var abc = document.getElementById('select').value;  

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
  columns.splice(0,1);columns.splice(5,1);
  loadData["columns"]=columns;

  //console.log(columns);
  var chartData=[];
  if(abc.startsWith("x"))
  {
   var ind=abc.substr(1)-1;
   for(var i =0;i<columns.length;i++)
    chartData.push(GlobalV[ind][columns[i]]); 
  scatterPlot.updategraphOnDropdownChange("X",ind+1,GlobalV[ind]);     
  }
  else
  {
    var t = document.getElementById('chart-area1');  
    t.innerHTML = '';
  for(var i=0;i<columns.length;i++){
    if (columns[i] == abc) {
      xv = i;
      chartData.push(1);
    }
    else chartData.push(0);
    }
    scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv); 
  }
  chart.series[0].setData(chartData);
});
}

function chooseY() {
  var abc = document.getElementById('select1').value;  

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

  var columns =  data.columns;

  for(var i=0;i<columns.length;i++){
   var tmpMax=d3.max(loadData,function(d){return +d["raw"][columns[i]];});
   var tmpMin=d3.min(loadData,function(d){return +d["raw"][columns[i]];});
   loadData.forEach(function(d){
     d["coord"][columns[i]]=((+d["raw"][columns[i]]-tmpMin)/(tmpMax-tmpMin));
     delete d["coord"]["Vehicle Name"];
     delete d["coord"]["Pickup"];
   });
  }
  columns.splice(0,1);
  columns.splice(5,1);
  loadData["columns"]=columns;
  var chartData=[];
  if(abc.startsWith("x"))
  {
   var ind=abc.substr(1)-1;
   for(var i =0;i<columns.length;i++)
    chartData.push(GlobalV[ind][columns[i]]); 
  scatterPlot.updategraphOnDropdownChange("Y",ind+1,GlobalV[ind]);     
  }
  else{
    var t = document.getElementById('chart-area1');  
    t.innerHTML = '';
  
  for(var i=0;i<columns.length;i++){
    
    if (columns[i] == abc) {
        yv = i;
      chartData.push(1);
    }
    else chartData.push(0);
    }
    scatterPlot = new ScatterPlot(loadData, "#chart-area1", xv, yv);
}
  chartRight.series[0].setData(chartData);
});
}
