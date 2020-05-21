import { chart } from 'highcharts';

export function getVisitingBrowserChartData(data) {
    const todayOrderChartOption: Highcharts.Options = {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Top Browser'
        },
        xAxis: {
            categories: data.browser,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: '',
                align: 'high'
            },
            labels: {
                formatter:function() {
                    var pcnt = (this.value / data.dataSum) * 100;
                    return pcnt.toFixed(2) + '%';
                }
            }
        },
        plotOptions: {
            series: {
                shadow: false,
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        var pcnt = (this.y / data.dataSum) * 100;
                        return pcnt.toFixed(2) + '%';
                    }
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
            name: 'Used to Visit',
            data: data.value
        }]
    };
    return todayOrderChartOption
}