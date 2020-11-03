<aura:application description="Test" extends="force:slds">

    <div class="slds-p-around_large">
        <h1>Bar Chart (Account: Number Of Employees)</h1>
        <c:d3HtmlBarChart/>
    </div>

    <div class="slds-p-around_large">
        <h1>Scatter Plot (Account: correlation between Number Of Employees and Annual Revenue)</h1>
        <c:d3ScatterPlot/>
    </div>

    <div class="slds-p-around_large">
        <h1>Horizontal Lollipop Chart (Account: Number of Employees)</h1>
        <c:d3HorizontalLollipopChart/>
    </div>
</aura:application>
