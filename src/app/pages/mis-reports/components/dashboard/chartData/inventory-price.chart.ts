import { chart } from 'highcharts';

export function getInvPriceOrderChartData(data: any) {
    const orderPioptions: Highcharts.Options = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Order Price Summary of last ' + data.dash_data.length + ' days'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y:.0f}</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b><br>{point.y:.0f} TK.',
                    distance: -30
                }
            }
        },
        series: [{
            name: 'Orders Price',
            data: [{
                name: 'Customer Order Price',
                y: data.inventoryData.CustomerOredrPrice
            }, {
                name: 'Purchase Price',
                y: data.inventoryData.PurchasePrice
            }]
        }]
    }
    return orderPioptions;
}