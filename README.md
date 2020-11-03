# D3 Quick Start Guide

## What?
D3 - is a presentation library, capable of manipulating DOM in order to display visual data. It consists of modules to transform data and to translate it into nodes of DOM or CSV objects.

## Why?
D3 is a toolkit rather than a solution to a specific problem. It offers a number of tools to present data to an end-user in a friendly way.

## How?
To start working with d3 in lwc:
1. Load [the library](https://github.com/d3/d3/releases/latest) in static resources
1. Include the library in your component with this snippet:

```js
...
import {loadScript} from 'lightning/platformResourceLoader';
import D3 from '@salesforce/resourceUrl/d3';
...
export default class D3Component extends LightningElement {
   d3Initialized = false;
   renderedCallback() {
       if (this.d3Initialized) {
           return;
       }
       this.d3Initialized = true;
       loadScript(this, D3 + '/d3.min.js')
       .then(() => {
               //create your graphs
           })
           .catch(error => {
               this.dispatchEvent(
                   new ShowToastEvent({
                       title: 'Error loading D3',
                       message: error.message,
                       variant: 'error'
                   })
               );
           });
   }
...
}
```

To render anything with d3, the dom element you are trying to render into must have lwc:dom=manual derective to work. 
E.g.:
```html
<div class="barchart" lwc:dom="manual"></div>
```

## Examples

Firtly, clone/download the repo and install it into your org.

### Horizontal Bar Chart (lwc: d3HtmlBarChart)
A simple chart which uses divs to display horizontal bars to visually represent Accounts in the system, while width of each bar represents the _Account: NumberOfEmployees_ values.

The the markup, the component has a div to append elements into:
```html
<div class="barchart" lwc:dom="manual"></div>
```

After the library and accounts from the server are loaded, d3 is used to display a chart.
First, we select a parent dom element to render our chart into:
```
const divContainer = d3.select(this.template.querySelector('.barchart'));
```
We should always use `this.template.querySelector` in order to select a dom element of a tempalte.

Then, with 
```js
const y = d3.scaleLinear()
            .domain(d3.extent(data, d => d.NumberOfEmployees))
            .range([500, 1000])
            .interpolate(d3.interpolateRound);
```
The values of _Account: NumberOfEmployees_ fields are mapped to a range of 500 to 1000 and rounded. This is needed so that we won't have huge spikes in our data. E.g. 
> Account1(NumberOfEmployees = 100)

> Account2(NumberOfEmployees = 100000)

With this setup and without normaliztion of the values, we would have a huge spike on the bar of Account2.

Lets break down each command that we execute.
1. `d3.scaleLinear()` - is a function, which creates a normzlization function. Result, returned from `d3.scaleLinear` would be a function, which we will later use in order to propperly convert values of Account: NumberOfEmployees.
2. `.domain()` - is a function, which sets an initial edge values of the data we have. Combined with `.range()`, they allow mapping of the range of values from the `domain()` to the range of values in `range()`.
3. `d3.extent(data, d => d.NumberOfEmployees)` - is a simple funciton to extract the edge values from a data array. Namely, we would extract the min and max values from array of the accounts, based in the _Account: NumberOfEmployees_ field values.
4. `.interpolate(d3.interpolateRound);` - applys rounding function to the end results of value mapping.
 
Example of linear scale:
```js
//we creat a scaling function
const y = d3.scaleLinear()
            .domain([0, 5])
            .range([0, 100]);
//the we apply it to any walues from the 'domain', to get the mapped value from 'range'            
 console.log(y(0)); // 0
 console.log(y(1)); // 20
 console.log(y(3)); // 60
 console.log(y(5)); // 100
```

Finally, we draw a barchart
```js
divContainer
    .selectAll('div') //we 'reserv places' for new div elements
    .data(data) //we set the data for iteration
    .enter() //we start writing the sort-of 'macros' to apply to each new element, based on data
    .append('div') //we create a new div in reserved space
    .style('width', d => (y(d.NumberOfEmployees) || 0) + 'px') //we set the width
    .text(d => `${d.Name}(${d.NumberOfEmployees})`); //and we set the text in the div
```
That is all for a simple horizontal barchart!

### Horizontal Lollipop Chart (lwc: d3HorizontalLollipopChart)
A chart which uses svg and additional svg elements to to visually represent Accounts in the system, while width of each bar represents the _Account: NumberOfEmployees_ values.

The chart has simmilar approach to the horizontal barchat approach, but it uses a predefined `svg` element in markup and uses `svg` elements to display the resulting chart.

First, we select an `svg` element for us to draw on.
```js
const svg = d3.select(this.template.querySelector('.horizontal-lollipop-chart'))
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform',
                'translate(' + margin.left + ',' + margin.top + ')');
```
We set required attributes and create a base `svg` element, which would be used as a container - `g`.

Next we create two functions which would convert values into 'x' and 'y' axis. 
For x-axis, we use the number-oriented function, familiar from the horizontal barchart:
```js
const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.NumberOfEmployees))
            .range([0, width])
            .interpolate(d3.interpolateRound);
```

And for y-axis, we use a text frunction, which maps height to a specific _Account: Name_
```js
const y = d3.scaleBand()
            .range([0, height])
            .domain(data.map(d => d.Name))
            .padding(1);
```

Next, all the rendering magic happens:
1. X-axis
2. Y-axis
3. Lines for the chart
4. Circles for the chart

```js
//x-axis
 svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-45)')
            .style('text-anchor', 'end');
//y-axis
 svg.append('g')
            .call(d3.axisLeft(y))
            
//lines
svg.selectAll('myline')
            .data(data)
            .enter()
            .append('line')
            .attr('x1', d => x(d.NumberOfEmployees))
            .attr('x2', x(0))
            .attr('y1', d => y(d.Name))
            .attr('y2', d => y(d.Name))
            .attr('stroke', 'grey')
            
//circles
 svg.selectAll('mycircle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', d => x(d.NumberOfEmployees))
            .attr('cy', d => y(d.Name))
            .attr('r', '4')
            .style('fill', '#69b3a2')
            .attr('stroke', 'black');
```
This concludes the horizontal lollipop chart

### Scatter Plot (lwc: d3ScatterPlot)
A plot which shows how _Account: NumberOfEmployees_ correlate with _Account: AnnualRevenue_. It uses the same priciples as were used with other chart, except there are several differences.

For instance for the markup, we use a div container, were we append an svg element:
```html
    <div class="scatterplot" lwc:dom="manual"></div>
```
```js
 const svg = d3.select(this.template.querySelector('.scatterplot'))
            .append('svg')
            ...
```
This would create a new svg element inside a div container, where we will be adding our other svg elements.

Other difference, is that we have an overlay tooltip on hover over the elements in our scatter plot.
```js
const tooltip = d3.select(this.template.querySelector('.scatterplot'))
            .append('span')
            .style('opacity', 0)
            .attr('class', 'tooltip')
            .style('font-size', '16px');
```

This will create an invisible span block that we would reuse as a floating tooltip.
Next, we add a couple of mouse event listeners:

```js
const mouseover = (e, d) => { //e - is a pointer event, d - is the data element (Account record)
            tooltip
                .transition()
                .duration(200)
                .style('opacity', 1);
            tooltip
                .html(`<span style='color:grey'>${d.Name}</span>`)
                .style('left', (d3.pointer(e)[0] + 30) + 'px')
                .style('top', (d3.pointer(e)[1] + 30) + 'px');
        }
        const mousemove = (e) => {
            tooltip
                .style('left', (d3.pointer(e)[0] + 30) + 'px')
                .style('top', (d3.pointer(e)[1] + 30) + 'px')
        }
        const mouseleave = (e) => {
            tooltip
                .transition()
                .duration(200)
                .style('opacity', 0)
        }
```
And finally, integrate them into our points:
```js
svg.append('g')
            .selectAll('dot')
            .data(data)
            .enter()
            ...
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
```
This conclues the scatterplot.
