$(document).ready(function () {
    var code;

    /* Get current stock holdings */
    $.ajax({
        url: '/getholdings',
        method: 'get',
        success: function (data) {
            // console.log(data);/
            // window.company_data = data;
            if (data.length > 0) {
                $("#stock-holdings").show();
                $("#no-holdings").hide();
            }
            for (var i = 0; i < data.length; i++) {
                var tableRow = '<tr>' +
                    '<td>' + data[i].company_name + '</td><td>' + data[i].count + '</td><td>' + data[i].spent +
                    '</td><td id="rate-' + data[i].symbol + '"></td><td id="profit-' + data[i].symbol + '"></td></tr>';
                $('#stock-holdings-table tr:last').after(tableRow);
            }
            getCompanyDetails(data);
        }
    });

    function getCompanyDetails(data) {
        window.company_data = data;
        window.index = 0;
        for (var i = 0; i < window.company_data.length; i++) {
            $.ajax({
                url: "http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=" + window.company_data[window.index].symbol,
                method: "post",
                async: false,
                dataType: 'jsonp',
                success: function (stockData) {
                    $("#rate-" + stockData.Symbol).html(stockData.LastPrice);
                    $("#profit-" + stockData.Symbol).html(window.company_data[window.index].spent - (stockData.LastPrice *
                        window.company_data[window.index].count));
                    window.index += 1;
                }
            });
        }
    }


    $("#searchinput").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/jsonp?input=" + request.term,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    console.log(data);
                    var parsedJSON = data;
                    var arr = [];
                    for (var i = 0; i < parsedJSON.length; i++) {
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
    
    $("#gotodashboard").click(function () {
        window.location.href = "/dashboard";
    });

    $("#searchbutton").click(function () {
        $("#stock-holdings").hide();
        $("#company-search").show();
        if (typeof code !== undefined) {
            $.ajax({
                url: "http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=" + code,
                method: "post",
                dataType: 'jsonp',
                success: function (data) {
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

                    window.selectedCompany = {rate: data.LastPrice, symbol: data.Symbol, name: data.Name}
                }

            });
        }
    });

    $("#buybutton").click(function () {
        var numberShares = $("#buysellinput").val();
        if (numberShares != undefined) {
            numberShares = parseInt(numberShares);
            $.ajax({
                url: "/buy",
                method: "post",
                data: {
                    shares: numberShares,
                    rate: window.selectedCompany.rate,
                    companySymbol: window.selectedCompany.symbol,
                    companyName: window.selectedCompany.name
                },
                success: function (data) {
                    if(data.success) {
                        $("#balance").html(data.balance);
                        $("#success-msg").show();
                        setTimeout(function () {
                            $("#success-msg").hide();
                        }, 5000);
                    } else {
                        $("#failure-msg").html(data.message);
                        $("#failure-msg").show();
                        setTimeout(function () {
                            $("#failure-msg").hide();
                        }, 5000);
                    }
                }
            })
        }
    });
});

