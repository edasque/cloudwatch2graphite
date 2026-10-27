var config = require('./lib/readConfig.js').readCmdOptions();

// Now using the official Amazon Web Services SDK for Javascript (v3)
var { CloudWatchClient, GetMetricStatisticsCommand } = require("@aws-sdk/client-cloudwatch");

// We'll use the Cloudwatch API
var creds = config.awsCredentials;
var cloudwatch = new CloudWatchClient({
    region: creds.region,
    credentials: {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
        sessionToken: creds.sessionToken
    }
});

// pulling all of lodash for _.sortBy(), does it matter? Do we even need to sort?
var _ = require('lodash');

require('./lib/date');

// getting 10 minutes worth of data & 1 minute
var interval = 11;

// Between now and 11 minutes ago (SDK v3 expects Date objects)
var end_time = new Date();
var start_time = (interval).minutes().ago();

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

    cloudwatch.send(new GetMetricStatisticsCommand(getMetricStatistics_param)).then(function (data) {

        var dimension_prefix = "";
        for (var dim_index in getMetricStatistics_param.Dimensions) {
            dimension_prefix += "." + getMetricStatistics_param.Dimensions[dim_index].Name;
            dimension_prefix += "_" + getMetricStatistics_param.Dimensions[dim_index].Value;
        }

        sorted_data = _.sortBy(data.Datapoints, function (n) {
            return n.Timestamp.getTime();
        });
        for (var point in sorted_data) {
            for (var stat_index in getMetricStatistics_param.Statistics) {
                var statistic = getMetricStatistics_param.Statistics[stat_index];
                console.log("%s %s %s", getMetricStatistics_param.Namespace.replace("/", ".") + dimension_prefix + "." + getMetricStatistics_param.MetricName, sorted_data[point][statistic], parseInt(new Date(sorted_data[point].Timestamp).getTime() / 1000.0));
            }
        }
    }).catch(function (err) {
        console.error(err, err.stack); // an error occurred
        console.error("on:\n" + JSON.stringify(getMetricStatistics_param, null, 2));
    });
}
