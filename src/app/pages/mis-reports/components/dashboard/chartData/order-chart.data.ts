import { chart } from 'highcharts';

export function getOrderChartData(data: any) {
    const orderPioptions: Highcharts.Options = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Order Summary of ' + data.dash_data.length + ' days'
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
                    format: '<b>{point.name}</b>: {point.y:.0f}',
                }
            }
        },
        series: [{
            name: 'Orders',
            data: [{
                name: 'Pending',
                y: data.orderData.Pending
            }, {
                name: 'Cancelled',
                y: data.orderData.Cancelled
            }, {
                name: 'Confirmed',
                y: data.orderData.Confirmed
            }, {
                name: 'Delivered',
                y: data.orderData.Delivered
            }, {
                name: 'Inshipment',
                y: data.orderData.Inshipment
            }, {
                name: 'OrderClosed',
                y: data.orderData.OrderClosed
            },
            {
                name: 'ReturnRequest',
                y: data.orderData.ReturnRequest
            }]
        }]
    }
    return orderPioptions;
}