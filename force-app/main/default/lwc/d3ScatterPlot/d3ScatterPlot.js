import {LightningElement} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {loadScript} from 'lightning/platformResourceLoader';
import D3 from '@salesforce/resourceUrl/d3';
import getAccounts from '@salesforce/apex/D3PlaygroundController.getAccounts';


/**
 * Example taken from https://www.d3-graph-gallery.com/graph/scatter_basic.html
 */
export default class D3ScatterPlot extends LightningElement {

    d3Initialized = false;

    renderedCallback() {
        if (this.d3Initialized) {
            return;
        }
        this.d3Initialized = true;
        loadScript(this, D3 + '/d3.min.js')
            .then(() => {
                return getAccounts();
            })
            .then((response) => {
                this.renderScatterPlot(response);
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

    renderScatterPlot(data) {

        // set the dimensions and margins of the graph
        const margin = {top: 10, right: 30, bottom: 30, left: 160},
            width = 760 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        const svg = d3.select(this.template.querySelector('.scatterplot'))
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform',
                'translate(' + margin.left + ',' + margin.top + ')');


        // Add X axis
        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.NumberOfEmployees))
            .range([0, width]);
        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain(d3.extent(data, d => d.AnnualRevenue))
            .range([height, 0]);
        svg.append('g')
            .call(d3.axisLeft(y));


        // create a tooltip
        const tooltip = d3.select(this.template.querySelector('.scatterplot'))
            .append('span')
            .style('opacity', 0)
            .attr('class', 'tooltip')
            .style('font-size', '16px')
        // Three function that change the tooltip when user hover / move / leave a point
        const mouseover = (e, d) => {
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


        // Add dots
        svg.append('g')
            .selectAll('dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', d => x(d.NumberOfEmployees))
            .attr('cy', d => y(d.AnnualRevenue))
            .attr('title', d => d.Name)
            .attr('r', 4)
            .style('fill', '#69b3a2')
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);


    }
}