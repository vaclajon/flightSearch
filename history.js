// JavaScript Document
  $(document).ajaxStart(function () {
        $(".glyphicon").css("display", "inline-block");
});
$(document).ajaxStop(function () {
     $(" .glyphicon").css("display","none");
}
);
(function ($, document) {
  var apiSpartEndPoint = "https://flightsearchvaclajon.apispark.net/v1/";
  var username = "bac39818-a436-4eb6-a142-a215b5372642";
  var password = "5819031b-c013-4790-95aa-80d4860d21e1";
  var results = [];
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  var header = "<thead><tr><th>From</th><th>To</th><th>Radius</th><th>Min day in</th><th>Max days in</th><th>Date</th></tr></thead>";
  var headerOneWay = "<thead><tr><th>From</th><th>To</th><th>Date</th><th>Departs at</th><th>Duration</th><th>Price</th></tr></thead>";
  var headerReturn = "<thead><tr><th>From</th><th>To</th><th>Date</th><th>Departs at</th><th>Duration</th><th>Return from</th><th>Return to</th><th>Return date</th><th>Departs at</th><th>Return duration</th><th>Price</th></tr></thead>";
 
  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }

  today = dd + '/' + mm + '/' + yyyy;
  $.ajax({
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
      },
      url: apiSpartEndPoint + 'flights',
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: $.param({"$size":1000}),
      dataType: 'json',      
      success: function (data) {
        console.log("server response:");
        console.log(data);
        displayHistory(data);
      }
    });
    
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
    function ms2hours(ms) {
    var d = new Date(ms * 1000);
    var mm = d.getMinutes();
    var hh = d.getHours(); //January is 0!   
     if (mm < 10) {
      mm = '0' + mm;
    }
    if (hh < 10) {
      hh = '0' + hh;
    }
    return hh + ':' + mm;
  }
  function displayResults(newData, typeFlight) {
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
      row.append($("<td>").html(ms2hours(value.dTimeUTC)));
      row.append($("<td>").html(value.fly_duration));

      if (typeFlight === "return") {
        returnFrom = value.route[idx].flyFrom;
        returnDate = ms2date(value.route[idx].dTimeUTC);
        returnHours = ms2hours(value.route[idx].dTimeUTC);        
        for (var i = idx; i < value.route.length; i++) {
          returnTo = value.route[i].flyTo;
        }
        row.append($("<td>").html(returnFrom));
        row.append($("<td>").html(returnTo));
        row.append($("<td>").html(returnDate));
        row.append($("<td>").html(returnHours));
        row.append($("<td>").html(value.return_duration));
                
      }
      row.append($("<td>").html(value.price));

      rows.push(row);
    });
    $table.html("");
    $table.html(thead);
    $tbody.append(rows);
    $table.append($tbody);
    $tbody.append(rows);
    $table.append($tbody);
  }
  ;
  function searchFlights(url, type) {


    return $.get(url).done(function (data) {      
      var res = data.data;
      displayResults(res, type);

    });


  }
  ;
  function displayHistory(newData) {
    var $table = $("#history-table");
    var $tbody = $("<tbody>");
    var rows = [];
    var thead = header;
 
    $.each(newData.reverse(), function (index, value) {
      var row = $("<tr>");
      var valueTo = value.to;
      var link = 'https://api.skypicker.com/flights' +"?" +decodeURIComponent($.param(value, false)); 
      if(valueTo === ""){
        if(value.latitudeTo !== null){
          valueTo = value.latitudeTo.substring(0,5) + " " +value.longitudeTo.substring(0,5);
        }
        else{
        valueTo = "Arbitrary";}
      }
      row.append($("<td>").append($("<a>").attr("data-uri",link).html(value.flyFrom || value.latitudeFrom.substring(0,5) + " " +value.longitudeFrom.substring(0,5))));
      row.append($("<td>").html(valueTo));
      row.append($("<td>").html(value.radiusTo || "-"));
        row.append($("<td>").html(value.daysInDestinationFrom || "-"));        
        row.append($("<td>").html(value.daysInDestinationTo || "-"));
        var dates="";
        $.each(value.dateFrom.split(";"), function(index, date){
          dates+=date+"<br>";
        });
                                       if(dates === "<br>"){
                                       dates = "-";
                                       }
        row.append($("<td>").html(dates));
        
    


      rows.push(row);
    });
    $table.html("");
    $table.html(thead);
    $tbody.append(rows);
    $table.append($tbody).css("display", "block");
  }
  ;
  function getParameterByName( name,href )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( href );
  if( results == null )
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}
  $("body").on("click", "a", function(){
    var link = $(this).attr("data-uri");
    results=[];
    var type = getParameterByName("typeFlight", link);
    var dates = getParameterByName("dateFrom", link);4
    $('html, body').animate({
      scrollTop: 0
    }, 1000);
    $.each(dates.split(";"), function(value, date){
        link.replace(/(dateFrom=).*?(&)/,'$1' + date + '$2');
        link.replace(/(dateTo=).*?(&)/,'$1' + date + '$2');
        searchFlights(link, type);
    });
    
  });
  
  
})(jQuery, document);