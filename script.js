// organize the data
var data = {}
d3.csv("data.csv").then(function(csv) {
  //setting keys in data (in a kind of elegant way)
  (new Set(csv.map( d => d.Medida.replace(/^\s+|\s+$/g, '').replace('%', 'percent') )))
  .forEach(function(m){
    data[m] = []

    d3.select("#data-table")
      .append("div")
      .attr("id", m.replace(/\s/g, '-'))
      .attr("class", "row")
  })
  csv.forEach(function(d){
      data[d.Medida.replace(/^\s+|\s+$/g, '').replace('%', 'percent')].push(d);
  })
  set_graph()
  console.log(data)
});

//Poppin' data in the charts, like a blizzard.
function set_graph(){
  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 700 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  //Create tooltip
  var tooltip = d3.select("body").append("div").attr("class", "toolTip");

  // set the ranges
  var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
  var y = d3.scaleLinear()
            .range([height, 0]);
  var ylog = d3.scaleSymlog()
            .range([height, 0]);
  var scaleColor = d3.scaleLinear()
            .domain([0, 9])
            .range(["#00aae4", "#32a852"])
  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#histogram").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Scale the range of the data in the domains
  x.domain(data.Freq.map(d => d["Posición Frente al aborto"]));
  y.domain([0, d3.max(data.Freq.map(d => parseInt(d.Valor)))]);
  ylog.domain([1, d3.max(data.Freq.map(d => parseInt(d.Valor)))]);

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
      .data(data.Freq)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d["Posición Frente al aborto"]) } )
      .attr("width", x.bandwidth())
      .attr("y", d => ylog((parseInt(d.Valor))) )
      .attr("height", d =>  height - ylog(parseInt(d.Valor)) )
      .attr("fill", (d, i) => scaleColor(i) )
      //now the hover effect
      .on("mousemove", function(d){
          tooltip
            .style("left", x(d["Posición Frente al aborto"]) + x.bandwidth() + 27 + "px")
            .style("top", ylog(parseInt(d.Valor)) + 110 + "px")
            .style("display", "inline-block")
            .html((parseInt(d.Valor)));
      })
      .on("mouseout", function(d){ tooltip.style("display", "none");})
      .on("click", function(d, i){
        d3.select("#wordcloud")
          .attr("src", "clouds/wc_" + d["Posición Frente al aborto"] + ".html")

          for (var key in data) {
            console.log(key);
            if (data.hasOwnProperty(key)) {
              console.log(key.replace(/\s/g, '-'));
                d3.select("#data-table #" + key.replace(/\s/g, '-'))
                  .html(
                    "<div class='col-4'>" +
                      data[key][i].Medida +
                    "</div>"+
                    "<div class='col-8'>" +
                      data[key][i].Valor +
                    "</div>"
                  )

            }
        }
      });

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .html((d, i) => i + 1)
      // .attr("y", 50)
      // .attr("x", 20)
      // .attr("dy", ".35em")
      // .attr("transform", "rotate(-30)")
      // .style("text-anchor", "start");

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(ylog)
              .tickValues([1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000,
                          d3.max(data.Freq.map(d => parseInt(d.Valor)))]))

}
