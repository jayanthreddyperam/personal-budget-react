import React, { useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS } from "chart.js/auto";
import * as d3 from "d3";
import { pie, arc } from "d3-shape";
import { scaleOrdinal } from "d3-scale";


function HomePage() {

  var dataSource = {
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#ffcd56',
          '#ff6384',
          '#36a2eb',
          '#fd6b19',
          '#ff5733',
          '#4caf50',
          '#9c27b0',
        ],
      },
    ],
    labels: [],
  };

  function createChart() {
    var ctx = document.getElementById("myChart").getContext("2d");
    var myPieChart = new ChartJS(ctx, {
      type: "pie",
      data: dataSource,
    });
  }
  

  function getBudget() {
    axios.get("/budget.json").then(function (res) {
      console.log(res);
      for (var i = 0; i < res.data.myBudget.length; i++) {
        dataSource.datasets[0].data[i] = res.data.myBudget[i].budget;
        dataSource.labels[i] = res.data.myBudget[i].title;
      }
      //drawChart(randomData(res.data.myBudget));
      createChart();
      //createD3Chart();
    }).catch(function (error) {
      console.error("Error fetching budget data: ", error);
    });
  }  
  

  // var colors = [
  //   "#ccff66", "#ff0066", "##00ff00", "#6600ff", "#003300", "#ff0000", "#ff8c00" 
  // ];

  function randomData(budgetData) {
    return budgetData.map(function (data) {
      return { label: data.title, value: data.budget };
    });
  }
  
  function createD3Chart() {

      let arrTitle = [];
      let arrBudget = [];

      var svgElement = document.getElementById("d3Chart");
      if (svgElement === null) {
        // If svgElement is null, return early to prevent further execution.
        return;
      }

      if(!svgElement.hasChildNodes()){
          var svg = d3.select("#d3Chart")
              .append("svg")
              .append("g")

          svg.append("g")
              .attr("width", 100)
              .attr("height", 100)
              .attr("viewBox", "0 0 1000 1000")
          svg.append("g")
              .attr("class", "slices");
          svg.append("g")
              .attr("class", "labels");
          svg.append("g")
              .attr("class", "lines");

          var width = 900,
              height = 400,
              radius = Math.min(width, height) / 2;

              var pie = d3.pie()
              .sort(null)
              .value(function(d) {
                return d.value;
              });
          
            var arc = d3.arc()
              .outerRadius(radius * 0.6)
              .innerRadius(radius * 0.3);
          
            var outerArc = d3.arc()
              .innerRadius(radius * 0.7)
              .outerRadius(radius * 0.7);

            svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            var key = function(d){ return d.data.label; };

            d3.json("http://localhost:3000/budget")
            .then(function(data) {
              var color = d3.scaleOrdinal()
                .domain(data.map(function(d) { return d.title; }))
                .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

              function randomData() {
                return pie(data).map(function(d) {
                  return { label: d.data.title, value: d.data.budget };
                });
              }

              change(randomData());

              function change(data) {
                  var slice = svg.select(".slices").selectAll("path.slice")
                      .data(pie(data), key);

                  slice.enter()
                      .insert("path")
                      .style("fill", function(d) { return color(d.data.label); })
                      .attr("class", "slice");

                  slice		
                      .transition().duration(1000)
                      .attrTween("d", function(d) {
                          this._current = this._current || d;
                          var interpolate = d3.interpolate(this._current, d);
                          this._current = interpolate(0);
                          return function(t) {
                              return arc(interpolate(t));
                          };
                      })

                  slice.exit()
                      .remove();

                  var text = svg.select(".labels").selectAll("text")
                      .data(pie(data), key);

                  text.enter()
                      .append("text")
                      .attr("dy", ".35em")
                      .text(function(d) {
                          return d.data.label;
                      });
                  
                  function midAngle(d){
                      return d.startAngle + (d.endAngle - d.startAngle)/2;
                  }

                  text.transition().duration(1000)
                      .attrTween("transform", function(d) {
                          this._current = this._current || d;
                          var interpolate = d3.interpolate(this._current, d);
                          this._current = interpolate(0);
                          return function(t) {
                              var d2 = interpolate(t);
                              var pos = outerArc.centroid(d2);
                              pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                              return "translate("+ pos +")";
                          };
                      })
                      .styleTween("text-anchor", function(d){
                          this._current = this._current || d;
                          var interpolate = d3.interpolate(this._current, d);
                          this._current = interpolate(0);
                          return function(t) {
                              var d2 = interpolate(t);
                              return midAngle(d2) < Math.PI ? "start":"end";
                          };
                      });

                      text.exit()
                          .remove();

                      var polyline = svg.select(".lines").selectAll("polyline")
                          .data(pie(data), key);

                      polyline.enter()
                          .append("polyline");

                      polyline.transition().duration(1000)
                          .attrTween("points", function(d){
                              this._current = this._current || d;
                              var interpolate = d3.interpolate(this._current, d);
                              this._current = interpolate(0);
                              return function(t) {
                                  var d2 = interpolate(t);
                                  var pos = outerArc.centroid(d2);
                                  pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                                  return [arc.centroid(d2), outerArc.centroid(d2), pos];
                              };			
                          });

                      polyline.exit()
                          .remove();
                }
          });
      }
  }

  useEffect(() => {
    console.log("useEffect is running!");
    getBudget();
    createD3Chart();
    

    // // Ensure the DOM is fully loaded before executing D3 code
    // document.addEventListener("DOMContentLoaded", createD3Chart);

    // Cleanup event listener when the component is unmounted
    return () => {
      document.removeEventListener("DOMContentLoaded", createD3Chart);
    };
  }, []);
  
  return (
    <main className="center" id="main">
    <div className="page-area">
      <section aria-roledescription="Budget1">
        <article>
          <h1>Stay on track</h1>
          <p>
            Do you know where you are spending your money? If you really stop
            to track it down, you would get surprised! Proper budget
            management depends on real data... and this app will help you with
            that!
          </p>
        </article>

        <article>
          <h1>Alerts</h1>
          <p>
            What if your clothing budget ended? You will get an alert. The
            goal is to never go over the budget.
          </p>
        </article>
      </section>

      <section aria-roledescription="App Perks">
        <article>
          <h1>Results</h1>
          <p>
            People who stick to a financial plan, budgeting every expense, get
            out of debt faster! Also, they to live happier lives... since they
            expend without guilt or fear... because they know it is all good
            and accounted for.
          </p>
        </article>

        <article>
          <h1>Free</h1>
          <p>
            This app is free!!! And you are the only one holding your data!
          </p>
        </article>
      </section>

      <section aria-roledescription="Budget2">
        <article>
          <h1>Stay on track</h1>
          <p>
            Do you know where you are spending your money? If you really stop
            to track it down, you would get surprised! Proper budget
            management depends on real data... and this app will help you with
            that!
          </p>
        </article>

        <article>
          <h1>Alerts</h1>
          <p>
            What if your clothing budget ended? You will get an alert. The
            goal is to never go over the budget.
          </p>
        </article>
      </section>

      <article>
        <h1>Results</h1>
        <p>
          People who stick to a financial plan, budgeting every expense, get
          out of debt faster! Also, they to live happier lives... since they
          expend without guilt or fear... because they know it is all good and
          accounted for.
        </p>
      </article>

      <div className="chart-container">
        <article aria-roledescription="Chart1">
          <h1>Chart1</h1>
          <p>
            <canvas id="myChart" width="400" height="400"></canvas>
          </p>
        </article>
            
        <article aria-roledescription="Chart2">
          <h1>Chart2</h1>
          <h3></h3>
        </article>
      </div>
  </div>
  </main>
  );
}

export default HomePage;