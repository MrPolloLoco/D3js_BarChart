const width = 800;
const height = 400;
const barWidth = width / 275;

let tooltip = d3
  .select("#root")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

let overlay = d3
  .select("#root")
  .append("div")
  .attr("class", "overlay")
  .style("opacity", 0);

let svgContainer = d3
  .select("#root")
  .append("svg")
  .attr("width", width + 100)
  .attr("height", height + 60);

d3.json(
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json"
)
  .then((data) => {
    svgContainer
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -250)
      .attr("y", 80)
      .text("Gross Domestic Product");

    let years = data.data.map(function (item) {
      let quarter;
      let temp = item[0].substring(5, 7);

      if (temp === "01") {
        quarter = "Q1";
      } else if (temp === "04") {
        quarter = "Q2";
      } else if (temp === "07") {
        quarter = "Q3";
      } else if (temp === "10") {
        quarter = "Q4";
      }

      return item[0].substring(0, 4) + " " + quarter;
    });

    let yearsDate = data.data.map(function (item) {
      return new Date(item[0]);
    });

    let xMax = new Date(d3.max(yearsDate));
    xMax.setMonth(xMax.getMonth() + 3);
    let xScale = d3
      .scaleTime()
      .domain([d3.min(yearsDate), xMax])
      .range([0, width]);

    let xAxis = d3.axisBottom().scale(xScale);

    svgContainer
      .append("g")
      .attr("class", "x-axis")
      .style("font-size", "12px")
      .call(xAxis)
      .style("stroke-width", "2px")
      .attr("id", "x-axis")
      .attr("transform", "translate(60, 404)");

    let GDP = data.data.map(function (item) {
      return item[1];
    });

    let scaledGDP = [];

    let gdpMax = d3.max(GDP);

    let linearScale = d3.scaleLinear().domain([0, gdpMax]).range([0, height]);

    scaledGDP = GDP.map(function (item) {
      return linearScale(item);
    });

    let yAxisScale = d3.scaleLinear().domain([0, gdpMax]).range([height, 0]);

    let yAxis = d3.axisLeft(yAxisScale);

    svgContainer
      .append("g")
      .attr("class", "y-axis")
      .style("font-size", "12px")
      .call(yAxis)
      .style("stroke-width", "2px")
      .attr("id", "y-axis")
      .attr("transform", "translate(60, 4)");

    d3.select("svg")
      .selectAll("rect")
      .data(scaledGDP)
      .enter()
      .append("rect")
      .attr("data-date", function (d, i) {
        return data.data[i][0];
      })
      .attr("data-gdp", function (d, i) {
        return data.data[i][1];
      })
      .attr("class", "bar")
      .attr("x", function (d, i) {
        return xScale(yearsDate[i]);
      })
      .attr("y", function (d) {
        return height - d;
      })
      .attr("width", barWidth)
      .attr("height", function (d) {
        return d;
      })
      .attr("index", (d, i) => i)
      .style("fill", "#236ab9")
      .attr("transform", "translate(60, 4)")
      .on("mouseover", function (event, d) {
        let i = this.getAttribute("index");

        overlay
          .transition()
          .duration(0)
          .style("height", d + "px")
          .style("width", barWidth + "px")
          .style("opacity", 0.9)
          .style("left", i * barWidth + 0 + "px")
          .style("top", height - d + "px")
          .style("transform", "translateX(60px)");
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            years[i] +
              "<br>" +
              "$" +
              GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, "$1,") +
              " Billion"
          )
          .attr("data-date", data.data[i][0])
          .style("left", i * barWidth + 30 + "px")
          .style("top", height - 150 + "px")
          .style("transform", "translateX(60px)");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(200).style("opacity", 0);
        overlay.transition().duration(200).style("opacity", 0);
      });
  })
  .catch((e) => console.log(e));
