$(document).ready(function () {
            var code;

            /* Get current stock holdings */
            $.ajax({
                url: '/getholdings',
                method: 'get',
                success: function (data) {
                    // console.log(data);/
                    for(var i = 0; i < data.length; i++) {
                        var stockPrice;
                        $.ajax({
                            url: "http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=" + data[i].symbol + "&callback=renderTableRow",
                            method: "post",
                            async: false,
                            dataType: 'jsonp',
                            success: function(stockData) {
                                stockPrice = stockData.LastPrice;
                            }
                        });
                        var tableRow = '<tr>' +
                            '<td>' + data[i].company_name + '</td><td>' + data[i].count + '</td><td>' + data[i].spent +
                            '</td><td>' + stockPrice + '</td><td>' + data[i].spent - (stockPrice *
                            data[i].count) + '</td></tr>';
                        $('#stock-holdings-table tr:last').after(tableRow);
                    }
                }
            });


            function renderTableRow(stockData) {

            }
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
                            $("#companySymbol").html(data.Symbol);
                            $("#companyLastPrice").html(data.LastPrice);
                            $("#companyChange").html(data.Change);
                            $("#companyDateTime").html(data.Timestamp);
                            $("#companyMarketCap").html(data.MarketCap);
                            $("#companyVolume").html(data.Volume);
                            $("#companyChangeYTD").html(data.ChangeYTD);
                            $("#companyHighPrice").html(data.High);
                            $("#companyLowPrice").html(data.Low);
                            $("#companyOpenPrice").html(data.Open);
                            
                        }
                        
                    });
                }
            });
    });

