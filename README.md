AWS Cloudwatch2Graphite
==================

TODO
------------------
1. Update Dockerfile to create a crontab so as to sendMetrics every 10 minutes
2. ~~https://github.com/edasque/cloudwatch2graphite was written as a generic utility. When I recently moved it to using 'aws-sdk' instead of the unofficial 'aws2js', I hacked the genericity/configurability out. cw2graphite should again be configurable for multiple metrics~~
    - This configurability should use the native node-config instead of optparse
3. ~~Collect all 6 metrics from Cloudfront: Requests, BytesDownloaded,BytesUploaded, TotalErrorRate, 4xxErrorRate,5xxErrorRate~~
4. Cloudwatch documentation says the Error metrics should be Average/Percent but setting the Statistics as Average leads to Undefined - let's figure it out
4. Deploy to cloudfront2graphite.ctct.net qa Open Stack instance and make sure it works for a while
5. Deploy to a production OpenStack instance (you need Centos 6.6 for Docker) that sends metics to the production Graphite instance
6. Update the Cloudfront only dashboard
7. Add Cloudfront metrics to the appropriate MLP dashboards

What is this for?
--------------------

This application will output graphite counters for a list of AWS CloudWatch metrics. All you need to do is :

* copy `conf/metrics.json.sample` into `conf/metrics.json`
* copy `conf/credentials.json.sample` into `conf/credentials.json` and set up your `accessKeyId`, `secretAccessKey` and `region`.

You'll find here the [reference](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html "Amazon AWS Cloudwatch reference to NameSpaces, metrics, units and dimensions") to NameSpaces, metrics, units and dimensions you'll want to refer to to set up your `metrics.json` (`metrics.json.sample` is a good starting point). Thus far this has been tested with EC2, ELB & DynamoDB.

This software is governed by the Apache 2.0 license.

Usage
-------------------

typically, to test you should simply run:

	node cw2graphite.js

to test with all options:

	node cw2graphite.js [--region region_name] [--credentials credentials_file] [--metrics metrics_file] | --help

	region_name is the AWS region, ie. eu-west-1 (default : us-east-1)
	credentials_file contains the AWS access key & secret key (default : ./conf/credentials.json)
	metrics_file contains the metrics definition (defaults : ./conf/metrics.json)

Pre-requisites
--------------
You'll need to install a few modules, including:
* dateformat
* aws2js
* optparse

	simply running this should do the job :
	> npm install


Example output
--------------

	aws.dynamodb.rad_impressions.throttledrequests.updateitem.sum.count 28.0 1359407920
	aws.elb.radimp.requestcount.sum.count 933.0 1359407920
	aws.dynamodb.rad_impressions.consumedwritecapacityunits.sum.count 890.0 1359407920

Sending to Graphite
-------------------

typically, in a cron, you'd run:

	node cw2graphite.js | nc host 2003
