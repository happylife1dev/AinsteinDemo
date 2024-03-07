$(document).ready(function() {
    $.ajax("data/table-data.json").done(function(res) {
        var template = Handlebars.compile($("#table-template").html());
        $('#table-data-body').html(template(res.data));
    });
});