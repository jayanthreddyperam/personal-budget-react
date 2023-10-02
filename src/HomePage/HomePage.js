import React, { useEffect, useRef } from "react";
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
      createChart();
      createD3Chart(res.data.myBudget); // Pass the budget data to createD3Chart
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

  const svgRef = useRef(null);

  function createD3Chart(data) {
    const svg = d3.select(svgRef.current);
  
    // Get the width and height of the parent container
    const parentWidth = svgRef.current.parentElement.clientWidth;
    const parentHeight = svgRef.current.parentElement.clientHeight;
  
    // Set the width and height of the SVG element based on the parent container's size
    const width = 1200;
    const height = 1200;
    const radius = Math.min(width, height) / 2;
  
    svg.attr("width", width).attr("height", height);
  
    const color = d3.scaleOrdinal()
    .domain(data.map(d => d.title))
    .range(["#ffcd56", "#ff6384", "#36a2eb", "#fd6b19", "#ff5733", "#4caf50", "#9c27b0"]);

  
    const pieGenerator = pie().value(d => d.budget);
    const pathGenerator = arc().outerRadius(radius * 0.6).innerRadius(radius * 0.3);
  
    const arcs = pieGenerator(data);
  
    svg.selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", pathGenerator)
      .attr("fill", d => color(d.data.title))
      .attr("stroke", "white")
      .style("stroke-width", "2px");
    
    console.log("SVG Width:", width);
    console.log("SVG Height:", height);
      
  }
  
  

  useEffect(() => {
    console.log("useEffect is running!");
    getBudget();
    //createD3Chart(dataSource.datasets[0].data);
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
          <svg ref={svgRef} width={1400} height={900}></svg>
        </article>
      </div>
  </div>
  </main>
  );
}

export default HomePage;