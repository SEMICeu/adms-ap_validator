/**
 * Utility functions for the results of CPSV-AP validator.
 * @license EUPL v1.1
 */

/**
 * Homepage
 */
var homepage = "cpsv-ap_validator/";
/**
 * CAT-AP server cookie name
 */
var servercookiename = "cpsv-ap";

/**
 * Set the result message
 * @param {String} container_id - ID of the container
 */
function setMessage(rows, container_id) {
    var subject_index = $('thead th:contains("Subject")').index();
    if (subject_index !== 0) {
        if (rows === 0) {
            $(container_id).after('<h2 id="congratulations">Congratulations! No Error Found.</h2>');
            $('#congratulations').css({'background-color': '#55B05A', 'color': 'white', 'font-size': '1.17em'});
        } else {
            $(container_id).after('<h2 id="sorry">Sorry! We found the following violations (' + rows + ')</h2>');
            $('#sorry').css({'background-color': '#D23D24', 'color': 'white', 'font-size': '1.17em'});
        }
    } else {
        $('#description').hide();
    }
}

function getGraphFromCookie() {
    return Cookies.get(servercookiename);
}

$(document).ready(function () {
    $("#logobanner").attr('href', "/" + homepage);
    //align the first 3 columns to the center (better before datatables otherwise the 2nd page is not aligned)
    $('tbody td:nth-child(1), tbody td:nth-child(2), tbody td:nth-child(3)').css('text-align', 'center');
    $('table').css({"border": "0px", "padding-top": "10px", "padding-bottom": "10px"});
    $('thead th:first-child').css({"border-top-left-radius": "10px"});
    $('thead th:last-child').css({"border-top-right-radius": "10px"});
    $('tbody tr:last-child th:first-child').css({"border-top-left-radius": "10px"});
    $('thead').css({"background": "linear-gradient(white, #eaeaea)"});
    $('tfoot').css({"background": "#eaeaea"});
    $('thead th').each(function () {
        return $(this).text($(this).text().replace('_', ' '));
    });

    //improve xslt transformation on subject, predicate object
    var table,
        subject_index = $('thead th:contains("Subject")').index() + 1,
        predicate_index = $('thead th:contains("Predicate")').index() + 1,
        object_index = $('thead th:contains("Object")').index() + 1,
        graph = getGraphFromCookie();
    $('tbody td:nth-child(' + subject_index + '), tbody td:nth-child(' + predicate_index + '), tbody td:nth-child(' + object_index + ')').each(function () {
        var $cell = $(this), $anchor = $cell.find('a'), text, query, query_param, link;
        if ($anchor.length) {
            text = $cell.text().trim();
            query = 'SELECT (<' + text + '> AS ?Subject) ?Predicate ?Object WHERE { GRAPH <' + graph + '> {<' + text + '> ?Predicate ?Object }}';
            query_param = '&output=xml&xslt-uri=http://cpsv-ap.semic.eu/cpsv-ap_validator/xml-to-html-cpsv-ap.xsl';
            link = '<a href="?query=' + encodeURIComponent(query) + query_param + '">' + text + '</a>';
            $(this).html(link);
        }
    });

    // DataTable, ordering by severity
    table = $('#results').DataTable({"order": [[ 2, "asc" ]], "dom": 'irptflp'});

    $('tfoot th').each(function () {
        var $cell = $(this), title, label, input;
        title = $('thead th').eq($cell.index()).text();
        label = '<label class="hiddenlabel" for="' + title + '">' + title + '</label>';
        input = '<input type="text" id="' + title + '" placeholder="Search ' + title + '" />';
        $cell.html(label + input);
    });

    table.columns().every(function () {
        var that = this;
        $('input', this.footer()).on('keyup change', function () {
            that.search(this.value).draw();
        });
    });

    setMessage(table.data().length, '.banner');

});
