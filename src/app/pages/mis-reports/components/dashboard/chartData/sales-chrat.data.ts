import { chart } from 'highcharts';

export function getSalesChartData(data: any) {
    const salesBaroptions: Highcharts.Options = {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Sales and purchase chart'
        },
        xAxis: {
            categories: data.varXaxisData
        },
        yAxis: {
            title: {
                text: 'Tk'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true,
                },
                enableMouseTracking: false
            }
        },
        series: [
            {
                name: 'Sales',
                data: data.sales
            },
            {
                name: 'Purchase',
                data: data.purchase
            }
        ]
    }
    return salesBaroptions
}