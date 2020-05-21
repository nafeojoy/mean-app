import { chart } from 'highcharts';

export function getInvOrderChartData(data: any) {
    const orderPioptions: Highcharts.Options = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Total Order of last' + data.dash_data.length + ' days'
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
                    distance: -50
                }
            }
        },
        series: [{
            name: 'Orders',
            data: [{
                name: 'Customer Order',
                y: data.inventoryData.customerOrder
            }, {
                name: 'Purchase Order',
                y: data.inventoryData.PurchaseOrder
            }, {
                name: 'Purchase',
                y: data.inventoryData.Purchase
            }]
        }]
    }
    return orderPioptions;
}