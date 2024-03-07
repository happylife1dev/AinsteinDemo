// based on https://observablehq.com/@harrystevens/conditional-probability-as-a-tidy-tree@388
export default function define(runtime, observer) {
  const main = runtime.module();

  main.variable(observer()).define(["d3","DOM","width","innerHeight","margin","tree","scale","jz"], function(d3,DOM,width,innerHeight,margin,tree,scale,jz)
{
  const svg = d3.select(DOM.svg(width, innerHeight + margin.top + margin.bottom));
  
  const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  const links = g.selectAll(".link")
      .data(tree.links())
    .enter().append("path")
      .attr("class", "link")
      .attr("d", d => d3.linkVertical()({source: [d.source.x, d.source.y], target: [d.target.x, d.target.y]}))
      .style("stroke-width", d => scale(d.target.value)/100)
      .filter(function(d){
        return d.target.depth-2;
      })
      ;

  const nodes = g.selectAll(".node-g")
      .data(tree.descendants())
      .enter().append("g")
      .attr("class", d => "node-g node-" + d.data.uid)
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .on("mouseover", over)
      .on("mouseout", out)
      .on("click", click)
      .filter(function(d){
        return d.depth;
      })
      ;

  nodes.append("circle")
      .attr("r", d => scale(d.value)/100);
//      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
      
  nodes.append("text")
      .attr("class", "label bg")
      .attr("dy", -14)
      .text(d => d.data.name)

  nodes.append("text")
      .attr("class", "label fg")
      .attr("dy", -14)
      .text(d => d.data.name);  
  
  // nodes.append("text")
  //     .attr("class", "number bg")
  //     .attr("dy", 6)
  //     .text(d => jz.str.numberCommas(d.value));  

  // nodes.append("text")
  //     .attr("class", "number fg")
  //     .attr("dy", 6)
  //     .text(d => jz.str.numberCommas(d.value));

  nodes.append("text")
      .attr("class", "number pct bg")
      .attr("dy", 24)
      .text(pctText);

  nodes.append("text")
      .attr("class", "number pct fg")
      .attr("dy", 24)
      .text(pctText);
  
      
  function pctText(d){
    return `${Math.round(d.value / tree.value * 100)}%`
  }
  
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  // Toggle children on click.
// those in _children are not displayed
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

  function over(d){    
    d3.selectAll(".pct")
        .text(d0 => {
          if (isAncestor(d, d0)){
            return "100%";
          }
          else if (isDescendant(d, d0)){
            return `${Math.round(d0.value / d.value * 100)}%`;
          }
          else {
            return "0%";
          }
        })
        ;

    nodes.classed("active", d0 => isAncestor(d, d0) || isDescendant(d, d0));
    
    links.classed("active", d0 => isAncestor(d, d0.target) || isDescendant(d, d0.target));
    
    function isAncestor(d, d0){
      return d.ancestors().map(d1 => d1.data.uid).includes(d0.data.uid)
    }
    function isDescendant(d, d0){
      return d.descendants().map(d1 => d1.data.uid).includes(d0.data.uid);
    }
  }
  function out(){
    d3.selectAll(".pct").text(pctText)
    nodes.classed("active", 0);
    links.classed("active", 0);
  }
  
  return svg.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`(c) AinsteinAI 2020`
)});

  main.variable(observer("data")).define("data", function(){return(
{
  name: " ",
  uid: 0,
  children: [
    {
      name: "Technology",
      uid: 1,
      children: [
        {
          name: "Technology",
          uid: 2,
          children: [
            {
              name: "Software & Services",
              value: 117131,
              uid: 3
            },
            {
              name: "Networking",
              value: 4683,
              uid: 3
            },
            {
              name: "Internet Products & Services",
              value: 2376,
              uid: 3
            },
            {
              name: "Computers",
              value: 1148,
              uid: 3
            },
            {
              name: "Computer Peripherals",
              value: 622,
              uid: 4
            }
          ]
        },
        {
          name: "Telecom",
          uid: 5,
          children: [
            {
              name: "Cellular & Telephone Services",
              value: 3348,
              uid: 6
            },
            {
              name: "Telephone",
              value: 2547,
              uid: 6
            },
            {
              name: "Internet Access Providers",
              value: 666,
              uid: 6
            },
            {
              name: "Communications Equipment",
              value: 666,
              uid: 7
            }
          ]
        },
        {
          name: "Aerospace & Defense",
          uid: 5,
          children: [
            {
              name: "Defense",
              value: 2480,
              uid: 6
            },
            {
              name: "Aerospace",
              value: 1588,
              uid: 7
            }
          ]
        }        
      ]
    },
    {
      name: "Consumer Non Cyclical",
      value: 65982,
      uid: 8
    },
    {
      name: "Consumer Cyclical",
      value: 42099,
      uid: 5
    },
    {
      name: "Finance",
      value: 41037,
      uid: 5
    },
    {
      name: "Industrial",
      value: 34522,
      uid: 5
    },
    {
      name: "Utilities",
      value: 7327,
      uid: 5
    },
    {
      name: "Basic Materials",
      value: 7096,
      uid: 5
    },
    {
      name: "Energy",
      value: 6973,
      uid: 5
    }
  ]
}
)});
  main.variable(observer("hierarchy")).define("hierarchy", ["d3","data"], function(d3,data){return(
d3.hierarchy(data).sum(d => d.value)
)});
  main.variable(observer("tree")).define("tree", ["d3","innerWidth","innerHeight","hierarchy"], function(d3,innerWidth,innerHeight,hierarchy){return(
d3.tree()
  .size([innerWidth, innerHeight])
  (hierarchy)
)});
  main.variable(observer("margin")).define("margin", function(){return(
{left: 0, right: 0, top: 40, bottom: 30}
)});
  main.variable(observer("innerWidth")).define("innerWidth", ["width","margin"], function(width,margin){return(
width - margin.left - margin.right
)});
  main.variable(observer("innerHeight")).define("innerHeight", ["margin"], function(margin){return(
700 - margin.top - margin.bottom
)});
  main.variable(observer("scale")).define("scale", ["d3"], function(d3){return(
d3.scaleLinear()
    .domain([0, 760])
    .range([0, 30])
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<style>
.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 1.5px;
}
.link.active {
  stroke: #bbb;
}
.node-g circle {
  fill: #ddd;
  stroke: steelblue;
  stroke-width: 1.5px;
}
.node-g text {
  text-anchor: middle;
}
.node-g text.label {
  font-family: "Helvetica Neue", sans-serif;
  font-weight: bold;
  font-size: 14px;
}
.node-g text.number {
  font-family: monospace;
}
.node-g text.fg {
  fill: #000;
}
.node-g text.bg {
  fill: none;
  stroke: #fff;
  stroke-width: 2px;
}
.node-g text.pct {
  font-size: 14px;
}
.node-g.active circle {
  fill: #bbb;
}
</style>`
)});
  main.variable(observer("jz")).define("jz", ["require"], function(require){return(
require("jeezy")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3-array", "d3-hierarchy", "d3-scale", "d3-selection", "d3-shape", "d3-textwrap")
)});
  return main;
}
