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
  var margin = {top: 20, right: 10, bottom: 30, left: 70},
      width = 400 - margin.left - margin.right,
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

        d3.select("#data-table")
          .style("display", "inline");

        d3.select("#data-table #header")
          .html(
            "<div class='col-4'><b>Medida</b></div>"+
            "<div class='col-4'><b>Valor</b></div>" +
            "<div class='col-4'><b>Desviación Estándar</b></div>"
          ).style("background-color", odd? "#f0f0ff": "white")

          var odd = false;
          for (var key in data) {
            odd =  !odd;
            if (key == "Ejemplo de tweet"){
              d3.select("#tweet-example")
                .html("<b>Tweet de ejemplo:</b>" + data[key][i].Valor)
            }
            else if (data.hasOwnProperty(key)) {
                d3.select("#data-table #" + key.replace(/\s/g, '-'))
                  .html(
                    "<div class='col-4'>" +
                      data[key][i].Medida +
                    "</div>"+
                    "<div class='col-4'>" +
                      data[key][i].Valor +
                    "</div>" +
                    "<div class='col-4'>" +
                       data[key][i]["Desviación Estándar\n"] +
                    "</div>"
                  ).style("background-color", odd? "#f0f0ff": "white")

            }
        }
      });

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .html((d, i) => i + 1)

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(ylog)
              .tickValues([1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000,
                          d3.max(data.Freq.map(d => parseInt(d.Valor)))]))

  var arrows = d3.select("#histogram").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", 30 + margin.bottom)

// Now we add some nice arrows

//The point of the arrows
  arrows.append("svg:defs").append("svg:marker")
      .attr("id", "triangle")
      .attr("refX", 6)
      .attr("refY", 6)
      .attr("markerWidth", 30)
      .attr("markerHeight", 30)
      .attr("markerUnits","userSpaceOnUse")
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 12 6 0 12 3 6")
      .style("fill", "black");

  arrows.append("line")
      .attr("x1",  150)
      .attr("y1", 10)
      .attr("x2", 50)
      .attr("y2", 10)
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("marker-end", "url(#triangle)");

  arrows.append("text")
        .attr("x", 70)
        .attr("y", 30)
        .html("En contra")

  arrows.append("line")
      .attr("x1",  width - 100 + 30)
      .attr("y1", 10)
      .attr("x2", width + 30)
      .attr("y2", 10)
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("marker-end", "url(#triangle)")

  arrows.append("text")
        .attr("x", width - 40)
        .attr("y", 30)
        .html("A favor")

}
