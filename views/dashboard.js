$(document).ready(function () {
            var code;
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
                           arr.push(parsedJSON[i]["Name"] + " (" + parsedJSON[i]["Symbol"] + ")");
                       }
                        response(arr);
                    }
                });
            },
            minLength: 1,
            select: function (event, ui) {
                var re = /\(([^)]+)\)/;
                code = re.exec(ui.item.label)[1];
            },
            open: function () {
                $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
            },
            close: function () {
                $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
            }
            });
            
            $("#searchbutton").click(function(){
                if (typeof code !== undefined){
                    $.ajax({
                        url: "http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=" + code,
                        method: "post",
                        dataType: 'jsonp',
                        success: function(data) {
                            $("#companyName").html(data.Name);
                        }
                        
                    });
                }
            });
    });

