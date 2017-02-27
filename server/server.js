/**
 * CPSV-AP validator server.
 * @license EUPL v1.1
 */

var http = require('http');
var url = require('url');
var request = require('request');
var fs = require('fs');

/**
 * Server port (for example 3000)
 */
var serverport = process.argv[2];

/**
 * JSON file keeping the graphs created
 */
var outputFilename = process.argv[3];

/**
 * Days (or fraction 0.00348 (5 min)) after dropping a graph
 */
var daystodiscard = process.argv[4];

/**
 * Fuseki host (for example localhost)
 */
var fusekihost = process.argv[5];

/**
 * Fuseki port(for example 3030)
 */
var fusekiport = process.argv[6];

/**
 * Fuseki endpoint (for example cpsv-ap_validator)
 */
var sparqlEndpoint = process.argv[7];

/**
 * BaseURL (for example http://localhost:3030) used to allow connections only from Fuseki
 */
var baseURL = "http://" + fusekihost;

/**
 * defaultEndpoint (for example http://localhost:3030/cpsv-ap_validator) used to drop graph
 */
var defaultEndpoint = baseURL + "/" + sparqlEndpoint;

/**
 * oneDay in milliseconds (used to calculate the difference between 2 dates)
 */
var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

/**
 * Used to drop a graph in the triplestore
 * @param {string} query - Query used to drop the graph
  *@param {string} endpoint -  SPARQL endpoint to be contacted.
 */
function postCode(query, endpoint) {
    var post_data = 'update=' + encodeURIComponent(query),
        post_options = {
            host: fusekihost,
            port: fusekiport,
            path: endpoint + '/update',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
            }
        },
        post_req = http.request(post_options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log("[LOG] Data received, chunk:" + chunk);
            });
        });
    // post the data
    post_req.write(post_data);
    post_req.end();
}

/**
 * Used to remove a graph from the json file and from the triplestore
 * @param {Object} jsonContent - JSON object representing the file
 */
function removeOldGraphs(jsonContent) {
    var graph, value, now, diffDays;
    for (graph in jsonContent) {
        if (jsonContent[graph] !== "") {
            value = jsonContent[graph];
            now = new Date().getTime();
            diffDays = Math.abs((now - value) / oneDay);
            if (diffDays > daystodiscard) {
                delete jsonContent[graph];
                postCode('DROP GRAPH <' + graph + '>', defaultEndpoint); //wipes the named graph in the triple store
                console.log("[LOG] Dropping graph: " + graph);
            }
        }
    }
}

/**
 * Function which accepts requests from the CPSV-AP validator
 * @param {Object} req - http request
 * @param {Object} res - http response
 */
function onRequest(req, res) {
    var url_parts = url.parse(req.url), queryData, graphid, creationdate, data, jsonContent;
    if (url_parts.pathname === "/getfile") {
        queryData = url.parse(req.url, true).query;
        if (queryData.url) {
            console.log("[LOG] Serving: " + queryData.url);
            request({
                url: queryData.url
            }).on('error', function (err) {
                res.end(err);
                console.log("[LOG] There was a problem with the request " + queryData.url + "see: " + err);
            }).pipe(res);
            res.setHeader('Access-Control-Allow-Origin', baseURL);
        } else {
            res.end("No url found");
        }
    } else if (url_parts.pathname === "/registergraph") {
        queryData = url.parse(req.url, true).query;
        graphid = queryData.graphid;
        creationdate = graphid.substring(graphid.lastIndexOf("/") + 1);
       // var creationdate = queryData.creationdate;
        try {
            data = fs.readFileSync(outputFilename);
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log("[LOG] File " + outputFilename + " not found!");
                fs.writeFileSync(outputFilename, "{}");
                console.log("[LOG] File " + outputFilename + " created");
                data = fs.readFileSync(outputFilename);
            } else {
                console.log("[LOG] There was a problem in reading the file " + outputFilename + "see: " + err);
                throw err;
            }
        }
        jsonContent = JSON.parse(data);
        jsonContent[graphid] = creationdate;
        console.log("[LOG] Adding graph: " + graphid);
        removeOldGraphs(jsonContent);
        fs.writeFile(outputFilename, JSON.stringify(jsonContent, null, 4), function (err) {
            if (err) {
                console.log("[LOG] There was a problem in writing the file " + outputFilename + "see: " + err);
            } else {
                console.log("[LOG] JSON saved to " + outputFilename);
            }
        });
        res.setHeader('Access-Control-Allow-Origin', baseURL);
        res.end("Session logged");
    } else {
        console.log("[LOG] Not a good request:" + req.url);
        res.end("Request not accepted");
    }
}

http.createServer(onRequest).listen(serverport);
console.log("[LOG] Ready to accept requests...");
