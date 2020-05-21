import { chart } from 'highcharts';

export function getTodayOrderChartData(data) {

    const todayOrderChartOption: Highcharts.Options = {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Today order summary'
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
                text: 'Number',
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
            name: 'Today',
            data: data.order
        }]
    };
    return todayOrderChartOption
}