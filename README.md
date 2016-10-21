AWS Cloudwatch2Graphite
==================

[![Join the chat at https://gitter.im/edasque/cloudwatch2graphite](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/edasque/cloudwatch2graphite?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![npm](https://img.shields.io/npm/dm/cloudwatch2graphite.svg)]() [![npm](https://img.shields.io/npm/dt/cloudwatch2graphite.svg)]()


TODO
------------------
1. ~~https://github.com/edasque/cloudwatch2graphite was written as a generic utility. When I recently moved it to using 'aws-sdk' instead of the unofficial 'aws2js', I hacked the genericity/configurability out. cw2graphite should again be configurable for multiple metrics~~
    ~~- This configurability should use the native node-config instead of optparse~~

What is this for?
--------------------

This application will output graphite counters for a list of AWS CloudWatch metrics. All you need to do is :

* copy `config/default.json,sample` into `config/default.json` and set up your `accessKeyId`, `secretAccessKey` and `region` as well as metrics.

You'll find here the [reference](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html "Amazon AWS Cloudwatch reference to NameSpaces, metrics, units and dimensions") to NameSpaces, metrics, units and dimensions you'll want to refer to to set up your `metrics.json` (`metrics.json.sample` is a good starting point). Thus far this has been tested with EC2, ELB & DynamoDB.

This software is governed by the Apache 2.0 license.

Usage
-------------------

typically, to test you should simply run:

	node cw2graphite.js


Pre-requisites
--------------
You'll need to install a few modules, including:
* dateformat
* aws-sdk
* minimist & config

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
