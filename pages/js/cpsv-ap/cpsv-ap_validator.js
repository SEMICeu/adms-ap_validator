/**
 * Utility functions for the CPSV-AP validator.
 * @license EUPL v1.1
 */

// Global variables
/**
 * SPARQL Endpoint url
 */
var sparqlEndpoint = "sparql-graph-crud";
/**
 * Homepage
 */
var homepage = "cpsv-ap_validator/";
/**
 * CPSV-AP server host
 */
var serverhost = "52.50.205.146";
/**
 * CPSV-AP server port
 */
var serverport = "3000";
/**
 * CPSV-AP server cookie days
 */
var servercookiedays = 1;
/**
 * CPSV-AP server cookie name
 */
var servercookiename = "cpsv-ap";
/**
 * CPSV-AP query file
 */
var queryfile = "cpsv-ap.txt";
/**
 * CPSV-AP sample ttl file
 */
var samplettlfile = "samples/sample-turtle.ttl";
/**
 * CPSV-AP sample rdf file
 */
var samplerdffile = "samples/sample-xml.rdf";
/**
 * CPSV-AP sample nt file
 */
var samplentfile = "samples/sample-n-triples.nt";
/**
 * CPSV-AP sample rdf file
 */
var samplejsonldfile = "samples/sample-json-ld.jsonld";

/**
 * Instances of the Codemirror used in the tabs.
 */
var editor, editortab1, editortab2, editortab3;
/**
 * Pattern to identify an XML file
 */
var pattern_xml = /^\s*<\?xml/;
/**
 * Pattern to identify an Turtle file
 */
var pattern_turtle = /^\s*@/;
/**
 * Pattern to identify an JSON-LD file
 */
var pattern_json_ld = /^\s*\{/;
/**
 * Pattern to identify an N3 file
 */
var pattern_n3 = /^\s*<http/;

function setCookie(graph, days) {
    Cookies.set(servercookiename, graph, { expires: days });
}

function getGraphFromCookie() {
    return Cookies.get(servercookiename);
}

/**
 * Uploads a file
 * @param {string} file - File to be added.
 * @param {string} graph - The graph of the RDF.
  *@param {string} endpoint -  SPARQL endpoint to be contacted.
 */
function uploadFile(file, graph, endpoint) {
    var xmlhttp, formData;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert(xmlhttp.status + ' ' + xmlhttp.statusText);
        }
    };
    formData = new FormData();
    formData.append('graph', graph);
    formData.append('file', file);
    xmlhttp.open('POST', endpoint, false);
    xmlhttp.send(formData);
}

/**
 * Retrieves a file from a given URL and loads it into the triple store.
 * WARNING: does only work on Chrome with proper security settings. We need to await HTML5.
 * @param {string} fileURL - URL of the file to be loaded.
 */
function getAndLoadFile(fileURL, graph, endpoint) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status !== 200) {
            alert(fileURL + ' was not loaded in the triple store: ' + this.readyState + ' HTTP' + this.status + ' ' + this.statusText);
        } else if (this.readyState === 4 && this.status === 200) {
            alert(this.readyState + ' HTTP' + this.status + ' ' + this.statusText + this.responseText);
            //var blob = new Blob(["<http:\/\/www.spdx.org\/licenses\/CDDL> <http:\/\/www.spdx.org\/licenses\/CDDL> <http:\/\/www.spdx.org\/licenses\/CDDL>."], { type: "text\/turtle"});
            var blob = new Blob([this.responseText], {type: "text\/xml"}); //text\/turtle   text\/xml
            uploadFile(blob, graph, endpoint);
        }
    };
    xmlhttp.responseType = "text/xml"; //text,document,arraybuffer
    xmlhttp.open("GET", fileURL, true);  //must be asynchronous - third parameter true
    xmlhttp.send();
}

/**
 * Runs an update query
 * @param {string} query - Query to be executed on the datastore.
 * @param {string} endpoint - SPARQL endpoint to be contacted.
 */
function runUpdateQuery(query, endpoint) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert(xmlhttp.status + ' ' + xmlhttp.statusText);
        }
    };
    xmlhttp.open("POST", endpoint + "/update", false); // must be false for casperjs tests
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8;');
    xmlhttp.send('update=' + encodeURIComponent(query));
}

function runUpdateQuery2(query, endpoint) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert(xmlhttp.status + ' ' + xmlhttp.statusText);
        }
    };
    xmlhttp.open("POST", endpoint + "", false); // must be false for casperjs tests
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8;');
    xmlhttp.send('query=' + encodeURIComponent(query));
}

/**
 * Deletes a graph
 * @param {string} graph - Graph to be deleted.
  *@param {string} endpoint - SPARQL endpoint to be contacted.
 */
function deleteGraph(graph, endpoint) {
    if (graph === 'default') {
        runUpdateQuery('CLEAR DEFAULT', endpoint); //wipes the default graph in the triple store
    } else {
        runUpdateQuery2('DELETE FROM <' + graph + '> { ?s ?p ?o.} WHERE { GRAPH <' + graph + '> { ?s ?p ?o.} }', endpoint); //wipes the named graph in the triple store
    }
}

/**
 * Runs a query (not used here)
 * @param {string} query - Query to be executed on the datastore.
 * @returns {string} The response of the query
 */
function runQuery(endpoint, query) {
    var xmlhttp, url;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert(xmlhttp.status + ' ' + xmlhttp.statusText);
        }
    };
    url = endpoint + "/query?" + encodeURIComponent(query);
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}

/**
 * Gets SPARQL query from file
 * @param {string} file - file containing the query
 * @param {string} endpoint - endpoint of the triplestore
 */
function getQuery(file, graph) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert('Error when opening the file: ' + file + ' - ' + xmlhttp.status + ' ' + xmlhttp.statusText);
        } else if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            //$(textarea).text(xmlhttp.responseText);
            var query = xmlhttp.responseText;
            query = query.replace("@@@TOKEN-GRAPH@@@", graph);
            editortab1.setValue(query);
            editortab2.setValue(query);
            editortab3.setValue(query);
        }
    };
    xmlhttp.open("GET", file, true);
    xmlhttp.send();
    return xmlhttp.responseText;
}

/**
 * Fills in the direct input area with some samples
 * @param {string} file - file containing the sample
 */
function loadFile(file) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert('Error when opening the file: ' + file + ' - ' + xmlhttp.status + ' ' + xmlhttp.statusText);
        } else if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            editor.setValue(xmlhttp.responseText);
        }
    };
    xmlhttp.open("GET", file, true);
    xmlhttp.send();
    return xmlhttp.responseText;
}

/**
 * Checks if a file ends with a particular suffix
 * @param {string} suffix - suffix searched in the string
 */
String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/**
 * Checks if a file has been uploaded
 * @param {string} metadatafile - JQuery selector for the field of the file uploaded
 * @param {string} metadatafileerror -  JQuery selector for the error field of the file uploaded
 */
function validateMetadata(metadatafile, metadatafileerror) {
    var isFilled = $(metadatafile).get(0).files.length > 0;
    if (isFilled) {
        $(metadatafileerror).text("");
        return true;
    }
    if (!isFilled) {
        $(metadatafileerror).text("The RDF file is a required field.");
        return false;
    }
}

/**
 * Checks if the endpoint is empty and it is a valid URL
 * @param {string} endpoint - JQuery selector for the field of the endpoint
 * @param {string} endpointerror -  JQuery selector for the error field of the endpoint
 * @param {string} subject -  string to name the endpoint field
 */
function validateEndpoint(endpoint, endpointerror, subject) {
    var value = $(endpoint).val(),
        urlRegex = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        isFilled = value.length > 0,
        isUrl = urlRegex.test(value);
    if (isFilled && isUrl) {
        $(endpointerror).text("");
        return true;
    }
    if (!isFilled) {
        $(endpointerror).text("The " + subject + " is a required field.");
        return false;
    }
    if (!isUrl) {
        $(endpointerror).text("The " + subject + " is not a valid URL.");
        return false;
    }
}

/**
 * Checks if the sparql query is not empty
 * @param {string} query - JQuery selector for the field of the query
 * @param {string} queryerror -  JQuery selector for the error field of the query
 * @param {string} subject -  string to name the query field
 */
function validateQuery(query, queryerror, subject) {
    var isFilled = query.getValue().trim() !== "";
    if (isFilled) {
        $(queryerror).text("");
        return true;
    }
    if (!isFilled) {
        $(queryerror).text("The " + subject + " is a required field.");
        return false;
    }
}

$("#metadatafile").change(function () {
    validateMetadata("#metadatafile", "#metadatafileerror");
});

$("#tab1endpoint").focusout(function () {
    validateEndpoint("#tab1endpoint", "#tab1endpointerror", "SPAQL endpoint");
});

$("#address").focusout(function () {
    validateEndpoint("#address", "#addresserror", "address of the RDF file");
});

$("#tab2endpoint").focusout(function () {
    validateEndpoint("#tab2endpoint", "#tab2endpointerror", "SPAQL endpoint");
});

$("#tab3endpoint").focusout(function () {
    validateEndpoint("#tab3endpoint", "#tab3endpointerror", "SPAQL endpoint");
});

/**
 * Validates the Form1
 */
function validateForm1() {
    var cond_metadata = validateMetadata("#metadatafile", "#metadatafileerror"),
        cond_endpoint = validateEndpoint("#tab1endpoint", "#tab1endpointerror", "SPAQL endpoint"),
        cond_query = validateQuery(editortab1, "#editortab1error", "SPARQL query");
    if (cond_metadata && cond_endpoint && cond_query) {
        return true;
    }
    return false;
}

/**
 * Validates the Form2
 */
function validateForm2() {
    var cond_address = validateEndpoint("#address", "#addresserror", "address of the RDF file"),
        cond_endpoint = validateEndpoint("#tab2endpoint", "#tab2endpointerror", "SPAQL endpoint"),
        cond_query = validateQuery(editortab2, "#editortab2error", "SPARQL query");
    if (cond_address && cond_endpoint && cond_query) {
        return true;
    }
    return false;
}

/**
 * Validates the Form3
 */
function validateForm3() {
    var cond_input = validateQuery(editor, "#editorerror", "direct RDF input"),
        cond_endpoint = validateEndpoint("#tab3endpoint", "#tab3endpointerror", "SPAQL endpoint"),
        cond_query = validateQuery(editortab3, "#editortab3error", "SPARQL query");
    if (cond_input && cond_endpoint && cond_query) {
        return true;
    }
    return false;
}

/**
 * Removes eventual spaces from the direct input
 * @param {string} inputString - string containing possible spaces
 * @returns {string} string without the spaces
 */
function filterInput(inputString) {
    var outputString = inputString.replace(/[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000]/g, '');
    return outputString;
}

/**
 * Gets the baseURL from the current page
 * @returns {string} string containing the baseURL
 */
function getBaseURL() {
    if (location.origin === 'undefined') {
        location.origin = location.protocol + '//' + location.host;
    }
    return location.origin;
}

/**
 * Convert a string to blob depending on the type
 * @param {string} inputString - string to be converted
 * @returns {Object} blob of a certain type
 */
function stringToBlob(inputString) {
    var blob;
    if (pattern_xml.test(inputString)) {
        blob = new Blob([inputString], {type: "application/rdf+xml"});
    } else if (pattern_turtle.test(inputString)) {
        blob = new Blob([inputString], {type: "text\/turtle"});
    } else if (pattern_json_ld.test(inputString)) {
        blob = new Blob([inputString], {type: "application\/json"});
    } else if (pattern_n3.test(inputString)) {
        blob = new Blob([inputString], {type: "application\/n-triples"});
    }
    return blob;
}

/**
 * Contact the CPSV-AP server to act as proxy to download a file
 * @param {string} fileURL - URL of the file to be downloaded
 * @param {string} graph - graph on which upload the file
 * @param {string} endpoint - endpoint of the triplestore
 */
function callWebService(fileURL, graph, endpoint) {
    //var url = "http://localhost/cpsv-ap_validator/cpsv-ap_validator.php?",
    var url = "http://" + serverhost + ":" + serverport + "/getfile?",
        list = "url=" + encodeURIComponent(fileURL),
        address = url + list,
        xmlhttp = null,
        blob;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {// for Internet Explorer
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status !== 200) {
            alert(address + ' was not loaded in the triple store: ' + this.readyState + ' HTTP' + this.status + ' ' + this.statusText);
        } else if (this.readyState === 4 && this.status === 200) {
            //alert(this.readyState + ' HTTP' + this.status + ' ' + this.statusText + this.responseText);
            blob = stringToBlob(this.responseText);
            uploadFile3(blob, graph, endpoint,editortab2.getValue());
        }
    };
    //xmlhttp.responseType = "text"; //text,document,arraybuffer, IE11 doesn't like it
    xmlhttp.open("GET", address, false);  //must be asynchronous - third parameter true
    xmlhttp.send();
}

/**
 * Register a graph in the CPSV-AP server
 * @param {string} graph - graph to be registered
 */
function registerGraph(graph) {
    //var url = "http://localhost/cpsv-ap_validator/cpsv-ap_validator.php?",
    var url = "http://" + serverhost + ":" + serverport + "/registergraph?",
        localgraph = "graphid=" + encodeURIComponent(graph),
        address = url + localgraph,
        xmlhttp = null,
        response = "";
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {// for Internet Explorer
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status !== 200) {
            alert(address + ' was not reachable: ' + this.readyState + ' HTTP' + this.status + ' ' + this.statusText);
        } else if (this.readyState === 4 && this.status === 200) {
            //alert(this.readyState + ' HTTP' + this.status + ' ' + this.statusText + this.responseText);
            response = this.responseText;
        }
    };
    //xmlhttp.responseType = "text"; //text,document,arraybuffer, IE11 doesn't like it
    xmlhttp.open("GET", address, true);  //must be asynchronous - third parameter true
    xmlhttp.send();
}

/**
 * This function is called before submitting the form1. It validates the input data, wipes the triple store, and uploads the metadata validation file, the CPSV-AP schema, and the taxonomies.
 * @param {Object} form - HTML form used for the validation.
 * @returns {boolean} True if the operation succeeded, false otherwise
 */
function onForm1Submit(form) {
    var fileInput, endpoint, localgraph, i, file, blob;
    if (validateForm1()) {
        try {
            fileInput = document.getElementById('metadatafile');
            endpoint = document.getElementById('tab1endpoint').value;
            localgraph = getGraphFromCookie();
            deleteGraph(localgraph, "http://52.50.205.146/sparql");
            //getAndLoadFile(admssw_taxonomies); //gets the taxonomies from the webserver and loads it into the triple store
            //getAndLoadFile(admssw_schema); //gets the schema file from the webserver and loads it into the triple store
            for (i = 0; i < fileInput.files.length; i = i + 1) {
                file = fileInput.files[i];
                if (file.name.endsWith("json") || file.name.endsWith("jsonld")) {
                    blob = new Blob([file], {type: "application/ld+json"});
                    uploadFile3(blob, localgraph, endpoint,editortab1.getValue());
                } else {
                    uploadFile3(file, localgraph, endpoint,editortab1.getValue()); //uploads the metadata file
                }
            }
            form.action = '/sparql'; //The validation query will be called from the form
            return true;
            //}
        } catch (e) {
            alert('Error: ' + e.message);
            return false;
        }
        return true;
    }
    return false;
}

/**
 * This function is called before submitting the form2. It validates the input data, wipes the triple store, and uploads the metadata validation file, the CPSV-AP schema, and the taxonomies.
 * @param {Object} form - HTML form used for the validation.
 * @returns {boolean} True if the operation succeeded, false otherwise
 */
function onForm2Submit(form) {
    var fileURL, endpoint, localgraph;
    if (validateForm2()) {
        try {
            fileURL = document.getElementById('address').value;
            endpoint = document.getElementById('tab2endpoint').value;
            localgraph = getGraphFromCookie();
            deleteGraph(localgraph, "http://52.50.205.146/sparql");
            //getAndLoadFile(admssw_taxonomies); //gets the taxonomies from the webserver and loads it into the triple store
            //getAndLoadFile(admssw_schema); //gets the schema file from the webserver and loads it into the triple store
            //file = getFileFromURL(fileURL);
            //getAndLoadFile(fileURL,form); //uploads the metadata file
            callWebService(fileURL, localgraph, endpoint);
            form.action = '/sparql'; //The validation query will be called from the form
            return true;
            //}
        } catch (e) {
            alert('Error: ' + e.message);
            return false;
        }
        return true;
    }
    return false;
}

function uploadFile3(file, graph, endpoint,query) {
    var xmlhttp, formData;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && (xmlhttp.status !== 201)) {
            //alert(xmlhttp.status + ' ' + xmlhttp.statusText);
        }
    };
    //formData = new FormData();
    //formData.append('query', query);
    //formData.append('body', file);
    xmlhttp.open('POST', endpoint + "?graph-uri="+graph, false);
    xmlhttp.send(file);
}

/**
 * This function is called before submitting the form3. It validates the input data, wipes the triple store, and uploads the metadata validation file, the CPSV-AP schema, and the taxonomies.
 * @param {Object} form - HTML form used for the validation.
 * @returns {boolean} True if the operation succeeded, false otherwise
 */
function onForm3Submit(form) {
    var directfile, endpoint, localgraph, blob;
    if (validateForm3()) {
        try {
            directfile = filterInput(editor.getValue());
            endpoint = document.getElementById('tab3endpoint').value;
            localgraph = getGraphFromCookie();
            deleteGraph(localgraph, "http://52.50.205.146/sparql");
            //getAndLoadFile(admssw_taxonomies); //gets the taxonomies from the webserver and loads it into the triple store
            //getAndLoadFile(admssw_schema); //gets the schema file from the webserver and loads it into the triple store
            //See https://jena.apache.org/documentation/io/rdf-input.html
            blob = stringToBlob(directfile);
            uploadFile3(blob, localgraph, endpoint,editortab3.getValue());
            form.action = '/sparql'; //The validation query will be called from the form
            return true;
        } catch (e) {
            alert('Error: ' + e.message);
            return false;
        }
        return true;
    }
    return false;
}

/**
 * This function is called when updating the syntax highlighting of the codemirror editor.
   * @param {Object} editor_instance - the editor to be updated.
 */
function updateEditor() {
    var editor_value = editor.getValue();
    if (pattern_xml.test(editor_value)) {
        editor.setOption("mode", "xml");
    } else if (pattern_turtle.test(editor_value)) {
        editor.setOption("mode", "text/turtle");
    } else if (pattern_json_ld.test(editor_value)) {
        editor.setOption("mode", "application/ld+json");
    } else if (pattern_n3.test(editor_value)) {
        editor.setOption("mode", "text/n-triples");
    }
}
/**
 * This function is called when a "more option" menu is expanded or contracted.
  * @param {string} taboption - the tab option selector.
  * @param {Object} editortab - the instance of the codemirror editor to be refreshed
 */
function toggle(taboption, editortab) {
    var $icon = $(taboption + " img.toggleicon"),
        $content = $(taboption).next();

    //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
    $content.slideToggle(300, function () {
        //execute this after slideToggle is done
        if ($content.is(":visible")) {
            $icon.attr('src', './images/arrow-open.png');
            editortab.refresh();
        } else {
            $icon.attr('src', './images/arrow-closed.png');
        }
    });
}

$(document).ready(function () {

    var defaultEndpoint = getBaseURL() + "/" + sparqlEndpoint,
        graph = encodeURI("http://cpsv-ap/" + new Date().getTime()), //encodeURI('http://joinup.ec.europa.eu/cesar/adms#graph');
        pending;

    $("#tab1endpoint").val(defaultEndpoint);
    $("#tab2endpoint").val(defaultEndpoint);
    $("#tab3endpoint").val(defaultEndpoint);

    $("#logobanner").attr('href', "/" + homepage);

    if (getGraphFromCookie()  === undefined) {
        setCookie(graph, servercookiedays);
        registerGraph(graph);
    }

    getQuery(queryfile, getGraphFromCookie());

    editortab1 = CodeMirror.fromTextArea(document.getElementById("tab1validationquery"), {
        mode: "turtle",
        lineNumbers: true
    });

    editortab2 = CodeMirror.fromTextArea(document.getElementById("tab2validationquery"), {
        mode: "turtle",
        lineNumbers: true
    });

    editor = CodeMirror.fromTextArea(document.getElementById("directinput"), {
        mode: "turtle",
        lineNumbers: true,
        extraKeys: {
            "F11": function (cm) {
                cm.setOption("fullScreen", !cm.getOption("fullScreen"));
            },
            "Esc": function (cm) {
                if (cm.getOption("fullScreen")) {
                    cm.setOption("fullScreen", false);
                }
            }
        }
    });

    editortab3 = CodeMirror.fromTextArea(document.getElementById("tab3validationquery"), {
        mode: "turtle",
        lineNumbers: true
    });

    // tabs creation needs to be after codemirror otherwise the gutter (rulers) is flat
    $("#tabs").tabs();

    $("#tab1options div.more").click(function () {
        toggle("#tab1options div.more", editortab1);
    });

    $("#tab2options div.more").click(function () {
        toggle("#tab2options div.more", editortab2);
    });

    $("#tab3options div.more").click(function () {
        toggle("#tab3options div.more", editortab3);
    });

    $("#loadsample1").click(function () {
        loadFile(samplettlfile);
    });

    $("#loadsample2").click(function () {
        loadFile(samplerdffile);
    });

    $("#loadsample3").click(function () {
        loadFile(samplentfile);
    });

    $("#loadsample4").click(function () {
        loadFile(samplejsonldfile);
    });

    editortab1.on("change", function () {
        validateQuery(editortab1, "#editortab1error", "SPARQL query");
    });

    editortab2.on("change", function () {
        validateQuery(editortab2, "#editortab2error", "SPARQL query");
    });

    editor.on("change", function () {
        validateQuery(editor, "#editorerror", "direct RDF input");
        clearTimeout(pending);
        pending = setTimeout(updateEditor(), 400);
    });

    editortab3.on("change", function () {
        validateQuery(editortab3, "#editortab3error", "SPARQL query");
    });

});
