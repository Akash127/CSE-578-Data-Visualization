// --------------------------------------- Cluster Processing Functions---------------------------------

// Function to process Cluster Data 
function processClusterData(clusterData) {
  console.log("IN PROCESS DATA")
  
  // Extract Data from Cluster if Valid
  clusterData = clusterData["_groups"][0].map(node => node["__data__"])
  
  // Check if valid cluster
  if(isValid(clusterData)) {
    // Can do some further processing here.
    isNewCluster=true;
    selectedCluster = getClusterSummary(clusterData)
  }
}

// Function to Save Cluster When Button is Clicked
function saveCluster() {
  if(isNewCluster==true){
    if(selectedCluster) {
      clusterMap['D'] = clusterMap['C']
      clusterMap['C'] = clusterMap['B']
      clusterMap['B'] = clusterMap['A']
      clusterMap['A'] = selectedCluster;
      console.log("CLUSTER ADDED")
    }
  console.log(clusterMap)
  addToCompare();
  chooseClusterDropdown();
  $("#onSaveCluster").modal('show');
  isNewCluster=false;
  }
  else if(selectedCluster) $("#onSaveCluster").modal('show'),console.log(clusterMap);
  else  alert("Please select a cluster to analyse and save!");
}

function addToCompare() {
  viewBox1="350 78 710 1290"
  viewBox2="350 -250 700 1290"
  viewBox3="350 -580 700 1290"
  viewBox4="350 -900 700 1290"
  var temp=$("#ToCompare1>svg");
  var temp1=$("#ToCompare2>svg");
  var temp2=$("#ToCompare3>svg");

  $("#ToCompare1").empty();
  $("#ToCompare1").append('<input type="checkbox" class="A">');
  $("#chart-area1>svg").clone().appendTo("#ToCompare1");
  $("#ToCompare2").empty();
  $("#ToCompare2").append('<input type="checkbox" class="B">');
  $("#ToCompare2").append(temp);
  $("#ToCompare3").empty();
  $("#ToCompare3").append('<input type="checkbox" class="C">');
  $("#ToCompare3").append(temp1);
  $("#ToCompare4").empty();
  $("#ToCompare4").append('<input type="checkbox" class="D">');
  $("#ToCompare4").append(temp2);
  if($("#ToCompare1>svg").length!=0) {
    document.getElementById("ToCompare1").childNodes[1].setAttribute("viewBox",viewBox1);
    $("#ToCompare1").css("background-color","cornsilk");
  }
  else $("#ToCompare1").empty();

  if($("#ToCompare2>svg").length!=0){
    document.getElementById("ToCompare2").childNodes[1].setAttribute("viewBox",viewBox2 );
    $("#ToCompare2").css("background-color","cornsilk").css("text-align","")
  }
  else $("#ToCompare2").empty(),$("#ToCompare2").html("Cluster 2 currently not present").css("background-color","#BBBDBF").css("text-align","center");

  if($("#ToCompare3>svg").length!=0){
    document.getElementById("ToCompare3").childNodes[1].setAttribute("viewBox",viewBox3 );
    $("#ToCompare3").css("background-color","cornsilk").css("text-align","")
  }
  else $("#ToCompare3").empty(),$("#ToCompare3").html("Cluster 3 currently not present").css("background-color","#BBBDBF").css("text-align","center");

  if($("#ToCompare4>svg").length!=0){
    document.getElementById("ToCompare4").childNodes[1].setAttribute("viewBox",viewBox4  );
    $("#ToCompare4").css("background-color","cornsilk").css("text-align","")
  }
  else $("#ToCompare4").empty(),$("#ToCompare4").html("Cluster 4 currently not present").css("background-color","#BBBDBF").css("text-align","center");
}

// Function to Check if Cluster is Valid or Not
function isValid(clusterData) {
  if(clusterData.length > 0)
    return true;
  else return false;
}
function toggleSideBar(){
  $('#sidebar').toggleClass('active');
}
// Function to return cluster summary
function getClusterSummary(clusterData) {
  var categoricalSummary = {};
  var continuousSummary = {};
  categorialList=[];
  ExceptionClustersList=[];
  ExceptionClusterData=[];
  continuousSummary = getContinuousSummary(clusterData);
  categoricalSummary = getCategoricalSummary(clusterData);

  var result = {
    catSum: categoricalSummary,
    contSum: continuousSummary,
    expSum:ExceptionClusterData
  }
  return result;
}

// Function return dictionary with summary of categorical attributes
function getCategoricalSummary(clusterData) {
  var attributeMap = {};
  for(attr in clusterData[0]['raw']) {
    if(categorialList.includes(attr)) {
      attributeMap[attr] = {};
    }
  }

  for(attribute in attributeMap) {
    uniqueAttrValues = getUnique(attribute)
    for(var i = 0; i < clusterData.length; i++) {
      uniqueAttrValues[clusterData[i]["raw"][attribute]] += 1
    }
    attributeMap[attribute] = uniqueAttrValues;
  }

  // Adding Attributes Name in Attribute Map
  var newAttributeMap = {};
  for(attr in attributeMap) {
    newAttributeMap[attr] = {};
  }

  for(attr in attributeMap) {
    var temp = "Non-" + attr;
    newAttributeMap[attr][attr] = attributeMap[attr][1],
    newAttributeMap[attr][temp] = attributeMap[attr][0]
  }

  
  return newAttributeMap;
}

// Function return dictionary with summary of continuous attributes
function getContinuousSummary(clusterData) {
  var matrix = {};
  var value = {};
  var cl = clusterData.length;
  var i = 0;
  var nc = {};
  for (i = 0; i<= cl - 1; i++) {
    var abc = clusterData[i]['raw'];
    var j = 0;
    var rowValue = {};
    for (var m in abc) {
      rowValue[j] = abc[m];
      value[j] = m;
      j++;
    }
    nc = j;
    matrix[i] = rowValue;
  }
  var names = {};
  if(localStorage['myKey']=='Car')var j= 1; else j=0;
  for (; j <= nc - 1; j++) {
    var s = new Set();
    for (i = 0; i <= cl - 1; i++ ) {
      s.add(Math.floor(Number(matrix[i][j])* 1000) / 1000);
    }
    if(s.has(0) && s.has(1) && s.size==2)
    {
     rangeArray=undefined;
    if(!categorialList.includes(value[j])) categorialList.push(value[j]);
    }
    else if(s.size>5) {
      var arr = Array.from(s);
      var minv, maxv;
    if(s.size==1)minv=0,maxv=1;else minv = arr[0],maxv = arr[0];
      for (var ch in arr) {
        minv = Math.min(minv,arr[ch]);
        maxv = Math.max(maxv,arr[ch]);
      }
      range = maxv - minv;
      var interval = range/10;

      var countRange = {};
      var p = 0;
      for (p = 0; p <= 9; p++) {
        countRange[p] = 0;
      }
    var rangeArray = {};

    clusterData.forEach((element)=>{
     var common_diff=((maxv-minv)/10),attr_val=element["raw"][value[j]];
     for(var i=0;i<10;i++)
        if(attr_val>=(minv+common_diff*i) && attr_val<=(minv+common_diff*(i+1))) 
           countRange[i]++;
    });

      rangeArray = {};
      for (var m in countRange) {
        v1 = minv + m*interval;
        v2 = v1 + interval;
        v1 = v1.toString();
        v2 = v2.toString();
        rangeArray[v1] = countRange[m];
      }
    }
    else{
      let array=Array.from(s);
      array.sort();
      var newAttributeMap = {};
      array.forEach(element=>{
        newAttributeMap[element] = 0;
      })

      clusterData.forEach(element=>{
        var val=Number(element["raw"][value[j]]);
        if(array.includes(val)){
          newAttributeMap[val]++;
        }
      });
       var jsonToAppendToExceptionList={};jsonToAppendToExceptionList[value[j]]={};
       jsonToAppendToExceptionList[value[j]]=(newAttributeMap);
        ExceptionClusterData.push(jsonToAppendToExceptionList);
        ExceptionClustersList.push(value[j]);
        console.log(s,array,newAttributeMap);
      }
    names[value[j]] = rangeArray; 
  }
  return names;
}

// Function to Sort Dictionary and return top 5 values
function sortDictionaryByValue(dict) {
  
  var items = Object.keys(dict).map(function(key) {
    return [key, dict[key]];
  });
  items.sort(function(first, second) {
    return second[1] - first[1];
  });

  items = items.slice(0, 5);

  sortedDict = {}
  
  for(var i = 0; i < items.length; i++) {
    data = items[i]
    sortedDict[data[0]] = data[1]
  }
  return sortedDict;
}

// Function Get Unique Value
function getUnique(attr) {
  uniqueHash = {};
  scatterPlot.data.forEach(row => {
    type_category = row["raw"][attr]
    uniqueHash[type_category] = 0;
  })
  return uniqueHash
}

function onCompareClusterClick(){
  if($("input[type='checkbox']:checked").length==1 || $("input[type='checkbox']:checked").length==0)
    alert("Select 2 clusters to compare");
  else if($("input[type='checkbox']:checked").length==2){
  
   chooseCompDropdown();
   $('#exampleModalCenter').modal('show');
  }
  else{
    alert("You can select only 2 clusters to compare");
  }
}