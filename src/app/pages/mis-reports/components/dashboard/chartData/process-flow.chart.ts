import { chart } from 'highcharts';

export function getProcessFlowChartData(data) {

    const todayOrderChartOption: Highcharts.Options = {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Average Order Process Consuming Time (Last 30 days)'
        },
        subtitle: {
            text: 'Total Order: ' + data.total
        },
        xAxis: {
            categories: data.status,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Hour(Avg)',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            valueSuffix: ''
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -40,
            y: 80,
            floating: true,
            borderWidth: 1,
            shadow: true
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Average Hour',
            data: data.order
        }]
    };
    return todayOrderChartOption
}