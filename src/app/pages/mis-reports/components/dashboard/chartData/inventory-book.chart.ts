import { chart } from 'highcharts';

export function getInvBookChartData(data: any) {
    const orderPioptions: Highcharts.Options = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Order Book Summary of last ' + data.dash_data.length + ' days'
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
                    format: '<b>{point.name}</b><br>{point.y:.0f}',
                    distance: -30
                }
            }
        },
        series: [{
            name: 'Orders',
            data: [{
                name: 'Customer Order Book',
                y: data.inventoryData.CustomerOrderBook
            }, {
                name: 'Purchase Order Book',
                y: data.inventoryData.PurchaseOrderBook
            }, {
                name: 'Purchase Book',
                y: data.inventoryData.PurchaseBook
            }]
        }]
    }
    return orderPioptions;
}