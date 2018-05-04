var app = angular.module('AngularD3Visualization', ['ngAnimate', 'ui.bootstrap']);
app.controller('D3ChartController', ['$scope', function($scope){	
    jQuery("#JavaScriptPart").removeClass("hidden");    
    $scope.isCollapsed = true;
    $scope.hours = {};
    $scope.EditOption = false;   
	$scope.employeeList = [ 
			{name : 'Minu', hours : [
				{employeeActivity : "Development", hours : 10},
				{employeeActivity : "Services", hours : 8},
				{employeeActivity : "QA", hours : 10},
				{employeeActivity : "Testing", hours : 10},				
				{employeeActivity : "Overtime Hours", hours : 10}
			] 
		},
		{name : 'Mary', hours : [
				{employeeActivity : "Development", hours : 2},
				{employeeActivity : "Services", hours : 3},
				{employeeActivity : "QA", hours : 4},
				{employeeActivity : "Testing", hours : 5},				
				{employeeActivity : "Overtime Hours", hours : 7}
			] 
		},
		{name : 'Ana', hours : [
				{employeeActivity : "Development", hours : 7},
				{employeeActivity : "Services", hours : 5},
				{employeeActivity : "QA", hours : 8},
				{employeeActivity : "Testing", hours : 3},				
				{employeeActivity : "Overtime Hours", hours : 6}
			] 
		}
		];
    //adding a new employee to the exisitng project; //initially keep all the hours to 0, let the user change it.
    $scope.addEmployee = function () {
       	var addToArray=true;       	
       	var hoursEmptyArr = [
					       			{employeeActivity : "Development", hours : 0},
									{employeeActivity : "Services", hours : 0},
									{employeeActivity : "QA", hours : 0},
									{employeeActivity : "Testing", hours : 0},
									{employeeActivity : "Overtime Hours", hours : 0}																		
								];

       	var employees = {name : $scope.employees.name, hours : hoursEmptyArr };
       	//Add new employee if it doesnt alredy exists
		for(var i=0;i<$scope.employeeList.length;i++){
		    if($scope.employeeList[i].name===$scope.employees.name){
		        addToArray=false;
		    }
		}
		if(addToArray){
		    $scope.employeeList.push(employees);
		}
		$scope.employees = '';
		$scope.hours={};
    };

    //Update employees object by passing the index of employees array[]
    $scope.updateEmployeeList= function (index, hours) {   	
		var hours = hours.updated;		
		var editedPersonByemployeeActivity = $scope.employeeList[index].hours;		
		angular.forEach(hours, function(value, key){
			editedPersonByemployeeActivity[key].hours = parseInt(hours[key]);
		});   		
		$scope.employeeList[index].hours = editedPersonByemployeeActivity;	
    };

    $scope.removeEmployee = function (index) {
      $scope.employeeList.splice(index, 1);
    };

	$scope.drawD3Chart = function(argument) {		
		//Change the exisiting plot on update
	    jQuery("#pieChart").remove();
	    jQuery("#barChart").remove();
	    jQuery("#lineChart").remove();
		d3.select("#charts").append("div").attr("id", "pieChart");
		d3.select("#charts").append("div").attr("id", "barChart");
		d3.select("#charts").append("div").attr("id", "lineChart");
		/*
		################ FORMATS ##################
		-------------------------------------------
		*/
		var 	formatAsPercentage = d3.format("%"),
				formatAsPercentage1Dec = d3.format(".1%"),
				formatAsInteger = d3.format(","),
				fsec = d3.time.format("%S s"),
				fmin = d3.time.format("%M m"),
				fhou = d3.time.format("%H h"),
				fwee = d3.time.format("%a"),
				fdat = d3.time.format("%d d"),
				fmon = d3.time.format("%b")
				;

		//Create data - PieChart
		var datasetPieChart = [];
		angular.forEach($scope.employeeList, function(value, key){
			var totalHours = 0;
			
			angular.forEach(value.hours, function(value, key){
				totalHours = totalHours + value.hours;
			});

			datasetPieChart.push( {category: value.name, measure: totalHours} );
		});
		//Create data - BarChart and LineChart
		var datasetBarLineChart = [];
		var employeeActivityNames = [];
		angular.forEach($scope.employeeList, function(value, key){
			var groupName = value.name;			
			angular.forEach(value.hours, function(value, key){
				datasetBarLineChart.push( { group: groupName, category: value.employeeActivity, measure: value.hours } );
				employeeActivityNames.push(value.employeeActivity);
			});

		});
		employeeActivityNames = d3.set(employeeActivityNames).values();
		var datasetBarLineChartForAll = [];
		for (var i = 0; i < employeeActivityNames.length; i++) {
			var measureVal = 0;
			for (var j =  0; j < datasetBarLineChart.length; j++) {
				
				if (employeeActivityNames[i] === datasetBarLineChart[j].category) {
					measureVal = measureVal + datasetBarLineChart[j].measure;
				};
			};
			var totalHoursforBar = { group: "All", category: employeeActivityNames[i], measure : measureVal };
			datasetBarLineChartForAll.push(totalHoursforBar);
		};
		datasetBarLineChart = datasetBarLineChart.concat(datasetBarLineChartForAll);
		/*
		## PIE CHART ##
		-------------------------------------------
		*/
		function d3PieChart(data){
			var dataset = data;
			var total = d3.sum(dataset, function(d) {return d.measure; });
			var    innerRadius = (Math.min(400, 400) / 2) * .999,   
				   // for animation
				   innerRadiusFinal = (Math.min(400, 400) / 2) * .6,
				   innerRadiusFinal3 = Math.min(400, 400) / 2* .50,
				   color = d3.scale.category20();    //builtin range of colors		    
			var vis = d3.select("#pieChart")
			     .append("svg:svg")              //create the SVG element inside the <body>
			     .append("g")					//add g to use Scale on window resize
			     .attr("transform", "scale(1)")
			     .data([dataset])                   //associate our data with the document
			         .attr("width", 400)           //set the width and height of our visualization (these will be attributes of the <svg> tag
			         .attr("height", 400)
			     		.append("svg:g")                //make a group to hold our pie chart
			         .attr("transform", "translate(" + Math.min(400, 400) / 2 + "," + Math.min(400, 400) / 2 + ")")    //move the center of the pie chart from 0, 0 to radius, radius
						;
			//this will create <path> elements for us using arc data
		   var arc = d3.svg.arc().outerRadius(Math.min(400, 400) / 2).innerRadius(innerRadius);		   
		   // for animation
		   var arcFinal = d3.svg.arc().innerRadius(innerRadiusFinal).outerRadius(Math.min(400, 400) / 2);
		   var arcFinal3 = d3.svg.arc().innerRadius(innerRadiusFinal3).outerRadius(Math.min(400, 400) / 2);
		   var pie = d3.layout.pie().value(function(d) { return d.measure; });    
		   var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
		        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
		        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
		            .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
		               .attr("class", "slice")    //allow us to style things in the slices (like text)
		               .on("mouseover", mouseover)
		    				.on("mouseout", mouseout)
		    				.on("click", up)
		    				;		    				
		        arcs.append("svg:path")
		               .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
		               .attr("d", arc)     //this creates the actual SVG path using the associated data (pie) with the arc drawing function
							.append("svg:title") //mouseover title showing the figures
						    .text(function(d) { return d.data.category + " : " 
						   		+ formatAsPercentage((d.data.measure / total)) });
		        d3.selectAll("g.slice").selectAll("path").transition()
					    .duration(750)
					    .delay(10)
					    .attr("d", arcFinal );		
			  // Add a label to the larger arcs, translated to the arc centroid and rotated.
			  // source: http://bl.ocks.org/1305337#index.html
			  arcs.filter(function(d) { return d.endAngle - d.startAngle > .2; })
			  		.append("svg:text")
			      .attr("dy", ".35em")
			      .attr("text-anchor", "middle")
			      .attr("transform", function(d) { return "translate(" + arcFinal.centroid(d) + ")rotate(" + angle(d) + ")"; })
			      //.text(function(d) { return formatAsPercentage(d.value); })
			      .text(function(d) { return d.data.category /*+ " : " + d.data.measure */; })
			      ;			   
			   // Computes the label angle of an arc, converting from radians to degrees.
				function angle(d) {
				    var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
				    return a > 90 ? a - 180 : a;
				}			
				// Pie chart title			
				vis.append("svg:text")
			     	.attr("dy", ".35em")
			      .attr("text-anchor", "middle")
			      .text("Employees Contributing")
			      .attr("class","title")
			      ;	

			function mouseover() {
			  d3.select(this).select("path").transition()
			      .duration(750)
			        		//.attr("stroke","red")
			        		//.attr("stroke-width", 1.5)
			        		.attr("d", arcFinal3)
			        		;
			}
			
			function mouseout() {
			  d3.select(this).select("path").transition()
			      .duration(750)
			        		//.attr("stroke","blue")
			        		//.attr("stroke-width", 1.5)
			        		.attr("d", arcFinal)
			        		;
			}
			
			function up(d, i) {
			
						/* update bar chart when employee selects piece of the pie chart */
						//updateBarChart(dataset[i].category);
						updateBarChart(d.data.category, color(i));
						updateLineChart(d.data.category, color(i));
					 
			}
		}
		d3PieChart(datasetPieChart);
		/*
		## BAR CHART ##
		-------------------------------------------
		*/
		var datasetBarChart = datasetBarLineChart;
		// set initial group value
		var group = "All";
		function datasetBarChosen(group) {
			var ds = [];
			for (x in datasetBarChart) {
				 if(datasetBarChart[x].group==group){
				 	ds.push(datasetBarChart[x]);
				 } 
				}
			return ds;
		}
		function d3BarChartParams() {

				var margin = {top: 30, right: 5, bottom: 20, left: 50},
				width = 500 - margin.left - margin.right,
			   height = 250 - margin.top - margin.bottom,
				colorBar = d3.scale.category20(),
				barPadding = 1;				
				return {
					margin : margin, 
					width : width, 
					height : height, 
					colorBar : colorBar, 
					barPadding : barPadding
				};			
		}

		function d3BarChart() {
			var firstDatasetBarChart = datasetBarChosen(group); 		
			var basics = d3BarChartParams();			
			var margin = basics.margin,
				width = basics.width,
			   height = basics.height,
				colorBar = basics.colorBar,
				barPadding = basics.barPadding
				;
							
			var 	xScale = d3.scale.linear()
								.domain([0, firstDatasetBarChart.length])
								.range([0, width])
								;
								
			// Create linear y scale 
			// Purpose: No matter what the data is, the bar should fit into the svg area; bars should not
			// get higher than the svg height. Hence incoming data needs to be scaled to fit into the svg area.  
			var yScale = d3.scale.linear()
					// use the max funtion to derive end point of the domain (max value of the dataset)
					// do not use the min value of the dataset as min of the domain as otherwise you will not see the first bar
				   .domain([0, d3.max(firstDatasetBarChart, function(d) { return d.measure; })])
				   // As coordinates are always defined from the top left corner, the y position of the bar
				   // is the svg height minus the data value. So you basically draw the bar starting from the top. 
				   // To have the y position calculated by the range function
				   .range([height, 0])
				   ;
			
			//Create SVG element
			
			var svg = d3.select("#barChart")
					.append("svg")
				    .attr("width", width + margin.left + margin.right)
				    .attr("height", height + margin.top + margin.bottom)
				    .attr("id","barChartPlot")
				    ;
			var groupBarChart = svg.append("g")
					.attr("transform", "scale(1)")
					;

			var plot = groupBarChart
				    .append("g")
				    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				    ;
			            
			plot.selectAll("rect")
				   .data(firstDatasetBarChart)
				   .enter()
				   .append("rect")
					.attr("x", function(d, i) {
					    return xScale(i);
					})
				   .attr("width", width / firstDatasetBarChart.length - barPadding)   
					.attr("y", function(d) {
					    return yScale(d.measure);
					})  
					.attr("height", function(d) {
					    return height-yScale(d.measure);
					})
					.attr("fill", "lightgrey")
					;		
				
			// Add y labels to plot				
			plot.selectAll("text")
			.data(firstDatasetBarChart)
			.enter()
			.append("text")
			.text(function(d) {
					return formatAsInteger(d3.round(d.measure));
			})
			.attr("text-anchor", "middle")
			// Set x position to the left edge of each bar plus half the bar width
			.attr("x", function(d, i) {
					return (i * (width / firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length - barPadding) / 2);
			})
			.attr("y", function(d) {
					return yScale(d.measure) + 14;
			})
			.attr("class", "yAxis")
			// Add x labels to chart			
			var xLabels = groupBarChart.append("g").attr("transform", "translate(" + margin.left + "," + (margin.top + height)  + ")");			
			xLabels.selectAll("text.xAxis").data(firstDatasetBarChart).enter().append("text").text(function(d) { return d.category;})
				  .attr("text-anchor", "middle").attr("x", function(d, i) {
								   		return (i * (width / firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length - barPadding) / 2);
								   })
				  .attr("y", 15)
				  .attr("class", "xAxis")				  
				  ;
			groupBarChart.append("text")
				.attr("x", (width + margin.left + margin.right)/2)
				.attr("y", 15)
				.attr("class","title")				
				.attr("text-anchor", "middle")
				.text("Hours for Each Activity")
				;
		}
		d3BarChart();

		 /* update chart*/	
		function updateBarChart(group, colorChosen) {			
				var currentDatasetBarChart = datasetBarChosen(group);				
				var basics = d3BarChartParams();			
				var margin = basics.margin,
					width = basics.width,
				   height = basics.height,
					colorBar = basics.colorBar,
					barPadding = basics.barPadding
					;
				
				var xScale = d3.scale.linear().domain([0, currentDatasetBarChart.length]).range([0, width]);				
				var yScale = d3.scale.linear().domain([0, d3.max(currentDatasetBarChart, function(d) { return d.measure; })]).range([height,0]);			      
			    var svg = d3.select("#barChart svg");			      
			    var plot = d3.select("#barChartPlot").datum(currentDatasetBarChart);
			  	plot.selectAll("rect").data(currentDatasetBarChart).transition().duration(750).attr("x", function(d, i) {
					    return xScale(i);
					})
				   .attr("width", width / currentDatasetBarChart.length - barPadding)   
					.attr("y", function(d) {
					    return yScale(d.measure);
					})  
					.attr("height", function(d) {
					    return height-yScale(d.measure);
					})
					.attr("fill", colorChosen)
					;
				
				plot.selectAll("text.yAxis") 
					.data(currentDatasetBarChart)
					.transition()
					.duration(750)
				   .attr("text-anchor", "middle")
				   .attr("x", function(d, i) {
				   		return (i * (width / currentDatasetBarChart.length)) + ((width / currentDatasetBarChart.length - barPadding) / 2);
				   })
				   .attr("y", function(d) {
				   		return yScale(d.measure) + 14;
				   })
				   .text(function(d) {
						return formatAsInteger(d3.round(d.measure));
				   })
				   .attr("class", "yAxis")					 
				;				

				svg.selectAll("text.title") // target the text element(s) which has a title class defined
					.attr("x", (width + margin.left + margin.right)/2)
					.attr("y", 15)
					.attr("class","title")				
					.attr("text-anchor", "middle")
					.text(group + "'s Contribution")
				;
		}

		/*
		## LINE CHART ##
		-------------------------------------------
		*/

		var datasetLineChart = datasetBarLineChart;
		// set initial category value
		var group = "All";
		function datasetLineChartChosen(group) {
			var ds = [];
			for (x in datasetLineChart) {
				 if(datasetLineChart[x].group==group){
				 	ds.push(datasetLineChart[x]);
				 } 
				}
			return ds;
		}

		function d3LineChartParams() {
			var margin = {top: 20, right: 10, bottom: 0, left: 50},
			    width = 500 - margin.left - margin.right,
			    height = 150 - margin.top - margin.bottom
			    ;				
				return {
					margin : margin, 
					width : width, 
					height : height
				}			
				;
		}

		function d3LineChart() {
			var firstDatasetLineChart = datasetLineChartChosen(group);
			var totalData = 0;
			for (var i = firstDatasetLineChart.length - 1; i >= 0; i--) {
				totalData = totalData + firstDatasetLineChart[i].measure;
			};			
			var basics = d3LineChartParams();			
			var margin = basics.margin,
				width = basics.width,
			   height = basics.height
				;

			var xScale = d3.scale.linear()
			    .domain([0, firstDatasetLineChart.length-1])
			    .range([0, width])
			    ;

			var yScale = d3.scale.linear()
			    .domain([0, d3.max(firstDatasetLineChart, function(d) { return d.measure; })])
			    .range([height, 0])
			    ;
			
			var line = d3.svg.line()
			    //.x(function(d) { return xScale(d.category); })
			    .x(function(d, i) { return xScale(i); })
			    .y(function(d) { return yScale(d.measure); })
			    ;
			
			var svg = d3.select("#lineChart").append("svg")
				.append("g")					//add g to use Scale on window resize
			    .attr("transform", "scale(1)")
			    .datum(firstDatasetLineChart)
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			    // create group and move it so that margins are respected (space for axis and title)
			var plot = svg
			    .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			    .attr("id", "lineChartPlot")
			    ;

				/* descriptive titles as part of plot -- start */
			var dsLength=firstDatasetLineChart.length;
			plot.append("text").text(totalData).attr("id","lineChartTitle2").attr("x",width/2).attr("y",height/2);
			plot.append("path").attr("class", "line").attr("d", line).attr("stroke", "lightgrey");			  
			plot.selectAll(".dot")
			    .data(firstDatasetLineChart)
			  	 .enter().append("circle")
			    .attr("class", "dot")
			    .attr("fill", function (d) { return d.measure==d3.min(firstDatasetLineChart, function(d) { return d.measure; }) ? "red" : (d.measure==d3.max(firstDatasetLineChart, function(d) { return d.measure; }) ? "green" : "white") } )
			    .attr("cx", line.x())
			    .attr("cy", line.y())
			    .attr("r", 3.5)
			    .attr("stroke", "lightgrey")
			    .append("title")
			    .text(function(d) { return d.category + ": " + formatAsInteger(d.measure); })
			    ;
			svg.append("text")
				.text("Total Hours Worked")
				.attr("id","lineChartTitle1")	
				.attr("x",margin.left + ((width + margin.right)/2))
				.attr("y", 10)
				;
		}

		d3LineChart();		 
		/* update bar chart*/
		function updateLineChart(group, colorChosen) {
			var currentDatasetLineChart = datasetLineChartChosen(group); 		
			var totalData = 0;
			for (var i = currentDatasetLineChart.length - 1; i >= 0; i--) {
				totalData = totalData + currentDatasetLineChart[i].measure;
			};
			var basics = d3LineChartParams();			
			var margin = basics.margin,
				width = basics.width,
			   height = basics.height
				;
			var xScale = d3.scale.linear().domain([0, currentDatasetLineChart.length-1]).range([0, width]);
			var yScale = d3.scale.linear().domain([0, d3.max(currentDatasetLineChart, function(d) { return d.measure; })]).range([height, 0]);			
			var line = d3.svg.line().x(function(d, i) { return xScale(i); }).y(function(d) { return yScale(d.measure); });
		    var plot = d3.select("#lineChartPlot").datum(currentDatasetLineChart);			   
			/* descriptive titles as part of plot -- start */
			var dsLength=currentDatasetLineChart.length;			
			plot.select("text").text(totalData);
			/* descriptive titles -- end */			   
			plot.select("path").transition().duration(750).attr("class", "line").attr("d", line).attr("stroke", colorChosen);			   
			var path = plot.selectAll(".dot").data(currentDatasetLineChart).transition().duration(750)
			   .attr("class", "dot")
			   .attr("fill", function (d) { return d.measure==d3.min(currentDatasetLineChart, function(d) { return d.measure; }) ? "red" : (d.measure==d3.max(currentDatasetLineChart, function(d) { return d.measure; }) ? "green" : "white") } )
			   .attr("cx", line.x())
			   .attr("cy", line.y())
			   .attr("r", 3.5)
				.attr("stroke", colorChosen)
			   ;			   
			   path.selectAll("title").text(function(d) { return d.category + ": " + formatAsInteger(d.measure); })	 
			   ;  
		}
	};
}]);