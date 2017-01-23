$(document).ready(function () {
            $("#searchinput").autocomplete({
            source: function (request, response) {
                $.ajax({
                    url: "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/jsonp?input=" + request.term,
                    type: "GET",
                    dataType: "jsonp",
                   success: function (data){
                       console.log(data);
                       var parsedJSON = data;
                       var arr = [];
                       for (var i=0;i<parsedJSON.length;i++) {
                           arr.push(parsedJSON[i]["Name"]);
                       }
                        response(arr);
                    }
                });
            },
            minLength: 1,
            select: function (event, ui) {
                var str1 = ui.item.label;
            },
            open: function () {
                $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
            },
            close: function () {
                $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
            }
            });    
    });