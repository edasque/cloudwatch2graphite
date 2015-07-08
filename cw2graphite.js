var config = require('./lib/readConfig.js').readCmdOptions();

// Now using the official Amazon Web Services SDK for Javascript
var AWS = require("aws-sdk");

// We'll use the Cloudwatch API
var cloudwatch = new AWS.CloudWatch(config.awsCredentials);

// pulling all of lodash for _.sortBy(), does it matter? Do we even need to sort?
var _ = require('lodash');

// TODO: do we need both those libraries, do we need any?
var dateFormat = require('dateformat');
require('./lib/date');

// getting 10 minutes worth of data & 1 minute
var interval = 11;

// Between now and 11 minutes ago
var now = new Date();
var then = (interval).minutes().ago();
var end_time = dateFormat(now, "isoUtcDateTime");
var start_time = dateFormat(then, "isoUtcDateTime");

// We used to use this when looking at Billing metrics
// if ( metric.Namespace.match(/Billing/) ) {
//     then.setHours(then.getHours() - 30)
// }
// if ( metric.Namespace.match(/Billing/) ) {
//     options["Period"] = '28800'
// }

var metrics = config.metricsConfig.metrics;

for (var index in metrics) {
    printMetric(metrics[index], start_time, end_time);
}

function printMetric(metric, get_start_time, get_end_time) {

    var getMetricStatistics_param = metric;

    getMetricStatistics_param.StartTime = get_start_time;
    getMetricStatistics_param.EndTime = get_end_time;

    cloudwatch.getMetricStatistics(getMetricStatistics_param, function (err, data) {
        if (err) {
            console.error(err, err.stack); // an error occurred
            console.error("on:\n" + JSON.stringify(getMetricStatistics_param, null, 2));
        }
        else {

            var dimension_prefix = "";
            for (var dim_index in getMetricStatistics_param.Dimensions) {
                dimension_prefix += "." + getMetricStatistics_param.Dimensions[dim_index].Name;
                dimension_prefix += "_" + getMetricStatistics_param.Dimensions[dim_index].Value;
            }

            sorted_data = _.sortBy(data.Datapoints, function (n) {
                return n.Timestamp.getTime();
            });
            for (var point in sorted_data) {
                console.log("%s %s %s", getMetricStatistics_param.Namespace.replace("/", ".") + dimension_prefix + "." + getMetricStatistics_param.MetricName, sorted_data[point].Sum, parseInt(new Date(sorted_data[point].Timestamp).getTime() / 1000.0));
            }
        }
    });
}
