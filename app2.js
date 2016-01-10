// JavaScript Document
$(document).ajaxStart(function () {
        $("#search .glyphicon").css("display", "inline-block");
});
$(document).ajaxStop(function () {
     $("#search .glyphicon").css("display","none");
}
);
(function ($, document) {
  var apiSpartEndPoint = "https://flightsearchvaclajon.apispark.net/v1/";
  var username = "bac39818-a436-4eb6-a142-a215b5372642";
  var password = "5819031b-c013-4790-95aa-80d4860d21e1";


  var dates = '';
  var results = [];
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  var headerOneWay = "<thead><tr><td>From</td><td>To</td><td>Date</td><td>Duration</td><td>Price</td></tr></thead>";
  var headerReturn = "<thead><tr><td>From</td><td>To</td><td>Date</td><td>Duration</td><td>Return from</td><td>Return to</td><td>Return date</td><td>Return duration</td><td>Price</td></tr></thead>";
  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }

  today = dd + '/' + mm + '/' + yyyy;
  var queryParams = function queryParams() {
    return {
      "v": "2",
      "sort": "price",
      "asc": "1",
      "locale": "cz",
      "daysInDestinationFrom": "",
      "daysInDestinationTo": "",
      "affilid": "",
      "children": "0",
      "infants": "0",
      "flyFrom": "PRG",
      "to": "",
      "dateFrom": today,
      "dateTo": today,
      "typeFlight": "oneway",
      "one_per_date": "0",
      "oneforcity": "0",
      "wait_for_refresh": "1",
      "adults": "1",
      "limit": "10"
    };
  };

  $('.input-group.date').datepicker({
    format: "dd/mm/yyyy",
    todayBtn: "linked",
    startDate: today,
    clearBtn: true,
    multidate: true,
    multidateSeparator: ";",
    todayHighlight: true,
    toggleActive: true
  });

  $("#search").click( function () {
    results = [];
    var query = queryParams();
    var flyFrom = $('#from').val();
    var radius = $('#radius').val();
    if (coor.length >= 1 && parseFloat(flyFrom.split(";")[0]) === coor[0].lat) {
      query["flyFrom"] = "";
      query["longitudeFrom"] = coor[0].lng;
      query["latitudeFrom"] = coor[0].lat;
      query["radiusFrom"] = radius;
    } else if (flyFrom === "") {
      alert("From has to be filled in!");
      return;
    }
    else {
      query["flyFrom"] = flyFrom;
    }

    to = $('#to').val();
    if (coor.length >= 2 && parseFloat(to.split(";")[0]) === coor[1].lat) {

      query["longitudeTo"] = coor[1].lng;
      query["latitudeTo"] = coor[1].lat;
      query["radiusTo"] = radius;
    }
    else {
      query["to"] = to;
    }





    var nightFrom = $("#nightsFrom").val();
    var nightTo = $("#nightsTo").val();
    if (nightFrom !== "" || nightTo !== "") {
      query["typeFlight"] = "return";
      query["daysInDestinationFrom"] = nightFrom;
      query["daysInDestinationTo"] = nightTo;
    }


    dates = $('#dates').val();
    $.each(dates.split(';'), function (index, value) {
      query["dateFrom"] = value;
      query["dateTo"] = value;
      searchFlights(query);


    });
  });

  function saveQuery(query) {
    console.log(query);
    return $.ajax({
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
      },
      url: apiSpartEndPoint + 'flights',
      method: "POST",
      type: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: JSON.stringify(query),
      dataType: "json",
      success: function (data) {
        console.log("query saved with params:");
        console.log(query);
        console.log("server response:");
        console.log(data);
      }
    });

  }
  ;
  function searchFlights(options) {


    return $.get('https://api.skypicker.com/flights', decodeURIComponent($.param(options, false))).done(function (data) {
      var table = $("#search-results");
      var res = data.data;
      if (res.length > 0) {
        saveQuery(options);
      }
      displayResults(res, data.currency, options["typeFlight"]);

    });


  }
  ;
  function ms2date(ms) {
    var d = new Date(ms * 1000);
    var dd = d.getDate();
    var mm = d.getMonth() + 1; //January is 0!
    var yyyy = d.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    return dd + '.' + mm + '.' + yyyy;
  }

  function displayResults(newData, currency, typeFlight) {
    var $table = $("#search-results");
    var $tbody = $("<tbody>");
    var rows = [];
    var thead = headerOneWay;
    if (typeFlight === "return") {
      thead = headerReturn;
    }
    ;
    results = results.concat(newData);
    results.sort(function (a, b) {
      return a.price - b.price;
    });
    $.each(results, function (index, value) {
      var row = $("<tr>");
      var from = value.flyFrom;
      var to = value.flyTo;
      var airportTo = from;
      var returnFrom, returnTo, returnDate;
      var idx = 0;
      while (airportTo !== to) {
        airportTo = value.route[idx].flyTo;

        idx++;
      }

      row.append($("<td>").html(value.flyFrom));
      row.append($("<td>").html(airportTo));
      row.append($("<td>").html(ms2date(value.dTimeUTC)));
      row.append($("<td>").html(value.fly_duration));
      if (typeFlight === "return") {
        returnFrom = value.route[idx].flyFrom;
        returnDate = ms2date(value.route[idx].dTimeUTC);
        for (var i = idx; i < value.route.length; i++) {
          returnTo = value.route[i].flyTo;
        }
        row.append($("<td>").html(returnFrom));
        row.append($("<td>").html(returnTo));
        row.append($("<td>").html(returnDate));
        row.append($("<td>").html(value.return_duration));
      }
      row.append($("<td>").html(value.price + " " + currency));

      rows.push(row);
    });
    $table.html("");
    $table.html(thead);
    $tbody.append(rows);
    $table.append($tbody);
  }
  ;
})(jQuery, document);