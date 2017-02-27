# dcat-ap_validator

This software performs the validation of <a href="https://joinup.ec.europa.eu/asset/dcat_application_profile/description">DCAT-AP</a> rdf files.
Validation is performed via a web form which loads a file (Turtle, RDF/XML, N-triples, JSON-LD) as graph in a triplestore and it queries the triple store with a SPARQL query.
The output of the validation can be in XML (HTML with xslt transformation), JSON, Text, CSV, TSV.

<h2>The validator</h2>
The validator is located in the <b>pages</b> folder.

The validator is based on the dcat-ap_validator.html file which includes the dcat.js file responsible for loading the SPARQL query (dcat-ap.rq) and contacting the triplestore (<a href="http://jena.apache.org/documentation/serving_data/">Fuseki</a>).
If the result of the query is in XML format there is an XSLT stylesheet applied (xml-to-html-dcat-ap).

<h2>Rules</h2>

The SPARQL query contains several rules which are based on those available here:
<a href="https://joinup.ec.europa.eu/asset/dcat_application_profile/asset_release/dcat-application-profile-data-portals-europe-final">DCAT-AP Final 1.1</a>

All the rules are stored in the <b>rules</b> folder. For almost each rule a test and a test data have been created.

Each rule is indicated with a progressive id number (starting from 0) and stored in a file named with the convention:

<code>rule-id.rq</code>

Therefore, for example, the rule 0 is stored in the file rule-0.rq.

Each rule is a SPARQL query which has been documented with <a href="https://github.com/ldodds/sparql-doc">sparql-doc</a> annotations and validated with the <a href="http://www.sparql.org/query-validator.html">online sparql validator</a>.

When a rule is validated it is added to the dcat-ap.rq file (locates inside the pages folder) which is then loaded into the the web form via the dcat-ap_validator.js file.

<h2>Structure of a test data</h2>
Test data are located in <b>tests-data</b> folder and they are xml/rdf files to be tested against.

Each test data is directly connected to the rule id number and stored in a file named with the convention:

<code>test-rule-id.rdf</code>

Therefore, for example, the test data related to the rule 0 is stored in the file test-rule-0.rdf
Not all the test data are implemented, for example literals are not tested.

<h2>Tests</h2>
Tests are located in <b>tests</b> folder and they are Javascript files.

A test exists only if the test-data has been created. A test file follows the name convention:

<code>test-rule-id.js</code>

Therefore, for example, the test which will validate again the test-rule-0.rdf will be called simply test-rule-0.js
This is important because each test uses the rule number to open the related test data file.

Each tests performs 2 checks:
<ol>
	<li>The number of results of the validation of test data is the one expected</li>
	<li>The rule ID of the results is the one expected</li>
</ol>

<h2>Installation instructions</h2>
<ol>
	<li>The validator uses Fuseki 1 as triple store which you can download from the <b>tools</b> directory (jena-fuseki1-1.1.2-distribution.zip) or from an <a href="http://www.apache.org/dist/jena/">Apache mirror site</a>.</li>
	<li>Unpack the binary distribution to your a <code>FUSEKI_HOME</code> folder of your choice.</li>
	<li>Copy the content of the <b>pages</b> folder under the <code>FUSEKI_HOME</code> folder. Keep the folder structure in tact. Verify that the file 'dcat-ap_validator.html' is in the <code>FUSEKI_HOME/pages</code> folder.</li>
	<li>Fuseki requires a <a href="http://www.oracle.com/technetwork/java/javase/downloads/java-se-jre-7-download-432155.html">Java Runtime Environment</a> to be installed on your machine</li>
</ol>

<h2>User guide</h2>
<ol>
	<li>Launch Fuseki using the command in 'start_dcat-ap_validator.bat'</li>
    <li>As of version 1.1.0 launch the node server using the command in 'start_dcat-ap_validator-server.bat'</li>
	<li>Direct your browser to <a href="http://localhost:3030/dcat-ap_validator.html">http://localhost:3030/dcat-ap_validator.html</a></li>
	<li>You get this page from Fuseki's internal web server.</li>
	<li>Select one or more RDF files that contain the software metadata to validate. Optionally, also controlled vocabularies can be incldued to verify correct usage of them.</li>
	<li>Optionally, you can set another SPARQL endpoint, output format, or even modify the SPARQL validation query. </li>
	<li>Hit the 'Validate' button. Fuseki returns the validation results within seconds.</li>
</ol>
<h2>Development</h2>
The development process is based on:
<ol>
	<li><a href="https://jenkins-ci.org/">Jenkins</a> 1.6.2.1 to automate the launch of Ant and get the code from Github. Jenkins has been installed with:
		<ol>
			<li>the Github plugin, to download the code from GitHub</li>
			<li>the Violation plugin, to monitor the JSLint errors (inside the lib/csslint/jslint.xml file) and CSSlint erros (inside the lib/jslint/csslint.xml file)</li>
			<li>the Xunit plugin, to monitor the result of the test execution; the Xunit plugin reads the xunit.xml file locatd in <b>tests-execution</b> folder which is generated by casperjs ant task.</li>
			<li>the HTML publisher plugin, to create a link to JSDOC (lib/jsdoc/output/global.html) and Sparql-doc (sparql-doc/index.html) files on the jenkins job.</li>
			</ol>
	</li>
	<li><a href="http://ant.apache.org/">Ant</a> 1.9.6, which executes the build.xml to automate all the development process</li>
	<li><a href="https://code.google.com/p/jslint4java/">jslint4java</a> 2.0.5 which validates the javascript used by the validator accordingly to JSLint rules.</li>
	<li><a href="https://github.com/CSSLint/csslint">csslint</a> 0.10.0 (with rhino 1.7.6) to evaluate css errors</li>
	<li><a href="https://github.com/jannon/jsdoc3-ant-task">jsdoc3-ant-task-1.0</a> to generate jsdoc documentation</li>
	<li><a href="https://github.com/ldodds/sparql-doc">sparql-doc</a> 0.0.4 which generates HTML documentation based on rules (SPARQL queries). Sparql-doc is installed on Windows machine after <a href="http://railsinstaller.org/en">Railsinstaller</a> 2.2.5 for Ruby 1.9 (required by sparql-doc) with the command:<code>gem install sparql-doc</code></li>
	<li><a href="http://claude.betancourt.us/compress-javascript-and-css-as-part-of-your-build-process/">YUI compressor</a> to compress css and javascript files</li>
	<li><a href="https://jqueryui.com/">Jquery UI</a> to display tabs</li>
	<li><a href="https://codemirror.net/mode/index.html">Codemirror</a> for syntax highlight in direct input tab and in the SPARQL query text area</li>
	<li><a href="https://www.datatables.net/">DataTables</a> 1.10 to display results with ordering, pagination and search.</li>
	<li><a href="https://casperjs.org">casperjs</a> 1.1 beta (based on phantomjs 1.9.2) to execute all the tests.</li>
	<li><a href="https://nodejs.org/en/">Node</a> v4.2.1 for server requests with module request.</li>
	<li><a href="https://github.com/js-cookie/js-cookie">JavaScript Cookie</a> v2.0.3 for cookie management.</li>
</ol>

<h2>TO DO</h2>
<table>
	<tr><th>Action</th><th>Priority</th><th>Status</th></tr>
	<tr><td>Add compatibility with virtuoso, see api at: http://virtuoso.openlinksw.com/dataspace/doc/dav/wiki/Main/VirtGraphProtocolCURLExamples</td><td>High</td><td>Not done</td></tr>
	<tr><td>Add automatic tests for file url and direct input</td><td>Medium</td><td>Not done</td></tr>
	<tr><td>Improve quality of the tests: parametrize comments, categorization by node (dataset, agent, etc.)</td><td>Medium</td><td>Not done</td></tr>
	<tr><td>Add <a href="https://datatables.net/examples/api/show_hide.html">toggle columns</a> in the results (in case more data are returned->better queries)</td><td>Medium</td><td>Not done</td></tr>
	<tr><td>Add possible html compressor such as: https://code.google.com/p/htmlcompressor/</td><td>Low</td><td>Not done</td></tr>
	<tr><td>Homogenize css between build.css, dcat-ap_validator.css and dcat-ap_validator-results.css</td><td>Low</td><td>Not done</td></tr>
	<tr><td>Improve W3C and WCAG 2.0 validation for the results</td><td>Low</td><td>Not done</td></tr>
</table>

<h2>Licence</h2>
This software is released with EUPL licence: https://joinup.ec.europa.eu/community/eupl/home