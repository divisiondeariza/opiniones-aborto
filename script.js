// organize the data
var data = {}
d3.csv("data.csv").then(function(csv) {
  //setting keys in data (in a kind of elegant way)
  (new Set(csv.map( d => d.Medida.replace(/^\s+|\s+$/g, '') )))
  .forEach(function(m){
    data[m] = []
  })
  csv.forEach(function(d){
      data[d.Medida.replace(/^\s+|\s+$/g, '')].push(d);
  })
  set_graph()
  console.log(data)
});

//Poppin' data in the charts, like a blizzard.
function set_graph(){
  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
  var y = d3.scaleLinear()
            .range([height, 0]);

  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Scale the range of the data in the domains
  x.domain(data.Freq.map(d => d["Posición Frente al aborto"]));
  y.domain([0, d3.max(data.Freq.map(d => parseInt(d.Valor)))]);

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
      .data(data.Freq)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d["Posición Frente al aborto"]) } )
      .attr("width", x.bandwidth())
      .attr("y", function(d) {return y((parseInt(d.Valor))) })
      .attr("height", function(d) { return height - y(parseInt(d.Valor)); })
      .attr("fill", "steelblue");

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y))

}
