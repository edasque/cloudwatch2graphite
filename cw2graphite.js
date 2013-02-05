var dateFormat = require('dateformat');
require('./lib/date');

var fs = require('fs');
var metrics_config_JSON = fs.readFileSync('./metrics.json', "ascii");

var metrics_config = JSON.parse(metrics_config_JSON);

var accessKeyId = metrics_config.accessKeyId
var secretAccessKey = metrics_config.secretAccessKey

var cloudwatch = require('aws2js').load('cloudwatch', accessKeyId, secretAccessKey);

cloudwatch.setRegion(metrics_config.region);
var interval = 11;

var metrics = metrics_config.metrics

for(index in metrics) {
	getOneStat(metrics[index]);
}

function getOneStat(metric) {

	var now = new Date();
	var then = (interval).minutes().ago()
	var end_time = dateFormat(now, "isoUtcDateTime");
	var start_time = dateFormat(then, "isoUtcDateTime");


	var options = {
		Namespace: metric.Namespace,
		MetricName: metric.MetricName,
		Period: '60',
		StartTime: start_time,
		EndTime: end_time,
		"Statistics.member.1": metric["Statistics.member.1"],
		Unit: metric.Unit,
		"Dimensions.member.1.Name": metric["Dimensions.member.1.Name"],
		"Dimensions.member.1.Value": metric["Dimensions.member.1.Value"],
		"Dimensions.member.2.Name": metric["Dimensions.member.2.Name"],
		"Dimensions.member.2.Value": metric["Dimensions.member.2.Value"],

	}

	metric.name = (metrics_config.carbonNameSpacePrefix != undefined) ? metrics_config.carbonNameSpacePrefix + "." : "";

	metric.name += metric.Namespace.replace("/", ".");
	metric.name += "." + metric["Dimensions.member.1.Value"];
	metric.name += "." + metric.MetricName;
	if (metric["Dimensions.member.2.Value"]!==undefined) 
		metric.name += "." + metric["Dimensions.member.2.Value"];


	
	metric.name += "." + metric["Statistics.member.1"];
	metric.name += "." + metric.Unit;

	metric.name = metric.name.toLowerCase()

	// console.log(metric);
	cloudwatch.request('GetMetricStatistics', options, function(error, response) {
		if(error) {
			console.error("ERROR ! ",error);

		} else {


			var memberObject = response.GetMetricStatisticsResult.Datapoints.member;
			if (memberObject != undefined) {

				var memberObj;
				if(memberObject.length === undefined) {
					memberObj = memberObject; 
				} else {
					// samples might not be sorted in chronological order
					memberObject.sort(function(m1,m2){
						var d1 = new Date(m1.Timestamp), d2 = new Date(m2.Timestamp);
						return d1 - d2
					});
					memberObj = memberObject[memberObject.length - 1];
				}

				metric.value = memberObj[metric["Statistics.member.1"]]
				metric.ts = parseInt(new Date().getTime(memberObj.TimeStamp) / 1000);
				
				console.log("%s %s %s", metric.name, metric.value, metric.ts);

				if ((metric === undefined)||(metric.value === undefined)) {
					console.dir(response);
					console.dir(response.GetMetricStatisticsResult.Datapoints.member);
					console.log("[1]")
					console.dir(response.GetMetricStatisticsResult.Datapoints.member[1]);
					console.log("length=" + response.GetMetricStatisticsResult.Datapoints.member.length);

					console.log(typeof response.GetMetricStatisticsResult.Datapoints.member);

				}
			} //if(memberObject != undefined)

		}
	});
}