import { chart } from 'highcharts';

export function getOrderSummaryBarChartData(data: any) {
    const orderPioptions: Highcharts.Options = {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Order Summary'
        },
        xAxis: {
            categories: ['Order Summary']
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Number of orders'
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
                    format: '<b>{series.name}</b><br>{point.y:.0f} ',
                }
            }
        },
        series: data.series
    }
    return orderPioptions;
}