/*
 * prerequisite : npm install optparse
 *
 */

exports.readCmdOptions = function() {
	var optparse = require('optparse');

	// Switches definition
	var SWITCHES = [
		['-m', '--metrics METRICS_FILE', "optional metrics JSON file (defaults to ./conf/metrics.json)"],
		['-c', '--credentials CREDENTIAL_FILE', "optional credential JSON file (defaults to ./conf/credential.json)"],
		['-H', '--help', "Shows this help section"],
	];
	var parser = new optparse.OptionParser(SWITCHES);
	
	parser.banner = 'Usage: '+process.argv[1]+' [options]';

	// Internal variable to store options.
	var options = {
		metrics_file: "./conf/metrics.json",
		credentials_file: "./conf/credentials.json"
	};

	// Handle the --metrics switch
	parser.on('metrics', function(name, value) {
	    options.metrics_file = value;
	});

	// Handle the --credentials switch
	parser.on('credentials', function(name, value) {
	    options.credentials_file = value;
	});

	// Handle the --help switch
	parser.on('help', function() {
	    console.log(parser.toString());
	    process.exit();
	});

	// Parse command line arguments
	parser.parse(process.argv);

	
	// read the config files
	var fs = require('fs');

	// 1) AWS credentials
	var creds_JSON = fs.readFileSync(options.credentials_file, "ascii");
	var creds = JSON.parse(creds_JSON);

	if (creds.accessKeyId == undefined || creds.accessKeyId.indexOf("REPLACE") == 0 || creds.secretAccessKey == undefined || creds.secretAccessKey.indexOf("REPLACE") == 0) {
		console.error("Error : aws credential file is missing or invalid : ./conf/credentials.json");
		process.exit();
	}
	// 2) metrics definitions
	var metrics_config_JSON = fs.readFileSync(options.metrics_file, "ascii");
	var metrics_config = JSON.parse(metrics_config_JSON);
	
	// all is appended to the "options" object.
	options.credentials = creds;
	options.metrics_config = metrics_config;
	
	return options;
};