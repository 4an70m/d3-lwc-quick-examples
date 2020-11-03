import {LightningElement, wire} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {loadScript} from 'lightning/platformResourceLoader';
import D3 from '@salesforce/resourceUrl/d3';
import getAccounts from '@salesforce/apex/D3PlaygroundController.getAccounts';

export default class D3HtmlBarChart extends LightningElement {

    d3Initialized = false;

    @wire(getAccounts)
    data;

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
                this.renderBarChart(response);
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

    renderBarChart(data) {
        //selected an element with d3
        const divContainer = d3.select(this.template.querySelector('.barchart'));

        //normalized the results of NumberOfEmployees
        const y = d3.scaleLinear()
            .domain(d3.extent(data, d => d.NumberOfEmployees))
            .range([500, 1000])
            .interpolate(d3.interpolateRound);

        //present data
        divContainer.selectAll('div')
            .data(data)
            .enter()
            .append('div')
            .style('width', d => (y(d.NumberOfEmployees) || 0) + 'px')
            .text(d => `${d.Name}(${d.NumberOfEmployees})`);
    }
}