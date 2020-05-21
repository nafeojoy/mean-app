export function getSalesPurchaseSummaryBarChartData(data: any) {

    const orderPioptions: Highcharts.Options = {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Sales vs Purchase Summary'
        },
        xAxis: {
            categories: ['Sales vs Purchase']
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Comparative Values'
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: 'gray'
                }
            }
        },
        legend: {
            align: 'right',
            x: -30,
            verticalAlign: 'top',
            y: 25,
            floating: true,
            backgroundColor: 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    color: 'white',
                    formatter:function(){return this.series.name+' '+this.y+' Tk.<br>'+this.series.options.label}
                }
            }
        },
        series: data.series
    }
    
    return orderPioptions;
}