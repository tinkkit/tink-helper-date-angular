'use strict';
(function(module) {
  try {
    module = angular.module('tink.datehelper');
  } catch (e) {
    module = angular.module('tink.datehelper', ['tink.formathelper']);
  }
  module.factory('dateCalculator', function () {
  var nl = {
    'DAY': ['Zondag', 'Maandag', 'DinsDag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],
    'MONTH': ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
    'SHORTDAY': ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],
    'SHORTMONTH': ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug','Sep', 'Okt', 'Nov', 'Dec']
  },
  dateFormat = (function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    timezoneClip = /[^-+\dA-Z]/g,
    pad = function (val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) {
        val = '0' + val;
      }
      return val;
    };

        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc, lang) {
          var dF = dateFormat;

          // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
          if (arguments.length === 1 && Object.prototype.toString.call(date) === '[object String]' && !/\d/.test(date)) {
            mask = date;
            date = undefined;
          }

          // Passing date through Date applies Date.parse, if necessary
          date = date ? new Date(date) : new Date();
          if (isNaN(date)) {
            throw new SyntaxError('invalid date');
          }

          mask = String(dF.masks[mask] || mask || dF.masks['default']).toLowerCase();
          // Allow setting the utc argument via the mask
          if (mask.slice(0, 4) === 'UTC:') {
            mask = mask.slice(4);
            utc = true;
          }

          var _ = utc ? 'getUTC' : 'get',
          d = date[_ + 'Date'](),
          D = date[_ + 'Day'](),
          m = date[_ + 'Month'](),
          y = date[_ + 'FullYear'](),
          H = date[_ + 'Hours'](),
          M = date[_ + 'Minutes'](),
          s = date[_ + 'Seconds'](),
          L = date[_ + 'Milliseconds'](),
          o = utc ? 0 : date.getTimezoneOffset(),
          flags = {
            d: d,
            dd: pad(d),
            ddd: lang.SHORTDAY[D],
            dddd: lang.DAY[D],
            m: m + 1,
            mm: pad(m + 1),
            mmm: lang.SHORTMONTH[m],
            mmmm: lang.MONTH[m],
            yy: String(y).slice(2),
            yyyy: y,
            h: H % 12 || 12,
            hh: pad(H % 12 || 12),
            H: H,
            HH: pad(H),
            M: M,
            MM: pad(M),
            s: s,
            ss: pad(s),
            l: pad(L, 3),
            L: pad(L > 99 ? Math.round(L / 10) : L),
            t: H < 12 ? 'a' : 'p',
            tt: H < 12 ? 'am' : 'pm',
            T: H < 12 ? 'A' : 'P',
            TT: H < 12 ? 'AM' : 'PM',
            Z: utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
            o: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
            S: ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
          };

          return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
          });
        };
      }());

  // Some common format strings
  dateFormat.masks = {
    'default': 'ddd mmm dd yyyy HH:MM:ss',
    shortDate: 'dd/mm/yyyy',
    mediumDate: 'mmm d, yyyy',
    longDate: 'mmmm d, yyyy',
    fullDate: 'dddd, mmmm d, yyyy',
    shortTime: 'h:MM TT',
    mediumTime: 'h:MM:ss TT',
    longTime: 'h:MM:ss TT Z',
    isoDate: 'yyyy-mm-dd',
    isoTime: 'HH:MM:ss',
    isoDateTime: 'yyyy-mm-dd\'T\'HH:MM:ss',
    isoUtcDateTime: 'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\''
  };

  function stringToDate(_date, _format) {
    var _delimiter;
    if (_format.indexOf('/') !== -1) {
      _delimiter = '/';
    } else if (_format.indexOf('-') !== -1) {
      _delimiter = '-';
    } else if (_format.indexOf('.') !== -1) {
      _delimiter = '.';
    }
    var formatLowerCase = _format.toLowerCase();
    var formatItems = formatLowerCase.split(_delimiter);
    var dateItems = _date.split(_delimiter);
    var monthIndex = formatItems.indexOf('mm');
    var dayIndex = formatItems.indexOf('dd');
    var yearIndex = formatItems.indexOf('yyyy');
    var month = parseInt(dateItems[monthIndex]);
    month -= 1;
    var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
    if(month > 11){
      return null;
    }
    var lastDayOfMonth = new Date(dateItems[yearIndex], month+1, 0);
    if(dateItems[dayIndex] > lastDayOfMonth.getDate()){
      return null;
    }

    return formatedDate;
  }

  return {
    dateBeforeOther: function (first, last) {
      var firstDate = new Date(first);
      var lastDate = new Date(last);
      firstDate.setHours(0, 0, 0, 0);
      lastDate.setHours(0, 0, 0, 0);
      if (firstDate >= lastDate && lastDate !== null) {
        return true;
      } else {
        return false;
      }
    },
    splitRow: function (arr, size) {
      var arrays = [];
      while (arr.length > 0) {
        arrays.push(arr.splice(0, size));
      }
      return arrays;
    },
    daysBetween: function (first, last) {
      return Math.round(Math.abs((first.getTime() - last.getTime()) / (24 * 60 * 60 * 1000)));
    },
    isSameDate:function (a, b) {
      if (angular.isDate(a) && angular.isDate(b)) {
        a.setHours(0,0,0,0);
        b.setHours(0,0,0,0);
        return a.getTime() === b.getTime();
      } else {
        return false;
      }
    },
    isSameMonth:function (a, b) {
      if (angular.isDate(a) && angular.isDate(b)) {
        a.setHours(0,0,0,0);
        b.setHours(0,0,0,0);
        return (a.getMonth() === b.getMonth()) && (a.getFullYear() === b.getFullYear()) ;
      } else {
        return false;
      }
    },
    getDate: function (date, format) {
      if(!angular.isDefined(date) || !angular.isDefined(format) || date.trim()===''){
        return null;
      }
      date = stringToDate(date, format);

      if(date !== null && date.toString() !== 'Invalid Date'){
        return date;
      }else{
        return null;
      }
    },
    daysInMonth: function (month,year) {
      if(angular.isDate(month)){
        return new Date(month.getYear(), month.getMonth() + 1, 0).getDate();
      }else{
        return new Date(year, month, 0).getDate();
      }
    },
    daysInMonthNodays: function (month,year) {

      return new Date(year, month, 0).getDate();
    },
    format: function (date, format) {
      if(date === null || date === undefined || date === '' || date == 'Invalid Date'){
        return null;
      }else{
        return dateFormat(date, format, null, nl);
      }
    },
    formatDate: function (date, format) {
        return dateFormat(date, format,null,nl);
    },
    getShortDays: function (lang) {

      if (lang !== angular.isDefined(lang)) {
        lang = 'nl';
      }
      switch (lang.toLowerCase()) {
        case 'nl':
        return nl.SHORTDAY;
      }
    },
    getShortMonths: function (lang) {
      if (lang !== angular.isDefined(lang)) {
        lang = 'nl';
      }
      switch (lang.toLowerCase()) {
        case 'nl':
        return nl.SHORTMONTH;
      }
    },
    getDays: function (lang) {
      if (lang !== angular.isDefined(lang)) {
        lang = 'nl';
      }
      switch (lang.toLowerCase()) {
        case 'nl':
        return nl.DAY;
      }
    },
    getMonths: function (lang) {
      if (lang !== angular.isDefined(lang)) {
        lang = 'nl';
      }
      switch (lang.toLowerCase()) {
        case 'nl':
        return nl.MONTH;
      }
    }
  };
});
})();;'use strict';
(function(module) {
  try {
    module = angular.module('tink.datehelper');
  } catch (e) {
    module = angular.module('tink.datehelper', ['tink.formathelper']);
  }
  module.factory('calView',['dateCalculator',function (dateCalculator) {
  function isSameDate(a, b) {
    if (angular.isDate(a) && angular.isDate(b)) {
      a.setHours(0,0,0,0);
      b.setHours(0,0,0,0);
      return a.getTime() === b.getTime();
    } else {
      return false;
    }
  }
  function inRange(date, first, last) {

    if (angular.isDate(first) && angular.isDate(last) && angular.isDate(date)) {
      date.setHours(0,0,0,0);
      first.setHours(0,0,0,0);
      last.setHours(0,0,0,0);
      if (date > first && date < last) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  function mod(n, m) {
    return ((n % m) + m) % m;
  }
  function callCullateData(date) {

    var year = date.getFullYear(),
    month = date.getMonth();

    var firstDayOfMonth = new Date(year, month, 1);
    var firstDayOfWeek = new Date(+firstDayOfMonth - mod(firstDayOfMonth.getDay() - 1, 7) * 864e5);


    var offsetDayOfMonth = firstDayOfMonth.getTimezoneOffset();
    var offsetDayOfweek = firstDayOfWeek.getTimezoneOffset();

    if (offsetDayOfMonth !== offsetDayOfweek) {
      firstDayOfWeek = new Date(+firstDayOfWeek + (offsetDayOfweek - offsetDayOfMonth) * 60e3);
    }

    var daysToDraw = dateCalculator.daysInMonth(date) + dateCalculator.daysBetween(firstDayOfWeek, firstDayOfMonth);
    if (daysToDraw % 7 !== 0) {
      daysToDraw += 7 - (daysToDraw % 7);
    }

    return {days: daysToDraw, firstDay: firstDayOfWeek};
  }

  function split(arr, size) {
    var arrays = [];
    while(arr.length > 0) {
      arrays.push(arr.splice(0, size));
    }
    return arrays;
  }

  function daysInRows(date,selectedDate,before,after){
    var monthCall = callCullateData(date);
    var today = new Date();
    var days = [], day;
      for(var i = 0; i < monthCall.days; i++) { // < 7 * 6

        day = new Date(monthCall.firstDay.getFullYear(), monthCall.firstDay.getMonth(), monthCall.firstDay.getDate() + i);
        var isMuted = false;
        if(day.getMonth() !== date.getMonth()){
          isMuted = true;
        }
        var isSelected = false;
        if(angular.isDate(selectedDate)){
          isSelected = selectedDate.toDateString() === day.toDateString();
        }

        var disable = false;
        if(angular.isDate(before) && !dateCalculator.dateBeforeOther(day,before)){
          disable = true;
        }
        if(angular.isDate(after) && !dateCalculator.dateBeforeOther(after,day)){
          disable = true;
        }

        days.push({date: day,selected:isSelected, isToday: day.toDateString() === today.toDateString(), label: dateCalculator.formatDate(day, 'd'),isMuted:isMuted,disabled:disable});
    }
    var arrays = split(days, 7);
     return arrays;

  }

  function monthInRows(date,before,after){
    var months = [];
    var monthDate;
    if(angular.isDefined(before) && before !== null){
      before = new Date(before.getFullYear(),before.getMonth(),1);
    }
    if(angular.isDefined(after) && after !== null){
      after = new Date(after.getFullYear(),after.getMonth(),1);
    }
     for(var i = 0; i < 12; i++) {
      monthDate = new Date(date.getFullYear(),i,1);

    var disable = false;
    if(angular.isDate(before) && !dateCalculator.dateBeforeOther(monthDate,before)){
      disable = true;
    }
    if(angular.isDate(after) && !dateCalculator.dateBeforeOther(after,monthDate)){
      disable = true;
    }

      months.push({date: monthDate,label: dateCalculator.formatDate(monthDate, 'mmm'),disabled:disable});
     }
    var arrays = split(months, 4);
    return arrays;
  }

  function yearInRows(date,before,after){
    var years = [];
    var yearDate;

    if(angular.isDefined(before) && before !== null){
      before = new Date(before.getFullYear(),date.getMonth(),1);
    }
    if(angular.isDefined(after) && after !== null){
      after = new Date(after.getFullYear(),date.getMonth(),1);
    }

   for(var i = 11; i > -1; i--) {
    yearDate = new Date(date.getFullYear()-i,date.getMonth(),1);

    var disable = false;
    if(angular.isDate(before) && !dateCalculator.dateBeforeOther(yearDate,before)){
      disable = true;
    }
    if(angular.isDate(after) && !dateCalculator.dateBeforeOther(after,yearDate)){
      disable = true;
    }

    years.push({date: yearDate,label: dateCalculator.formatDate(yearDate, 'yyyy'),disabled:disable});
   }
    var arrays = split(years, 4);
    return arrays;
  }

  function createLabels(date, firstRange, lastRange,grayed,before,after) {
    var label = '',cssClass = '';
    if (label !== null && angular.isDate(date)) {
      label = date.getDate();
      if(grayed){
        cssClass = 'btn-grayed';
      }
      if (isSameDate(date, firstRange) || isSameDate(date, lastRange)) {
        if(grayed){
          cssClass = 'btn-grayed-selected-clicked';
        }else{
          cssClass = 'btn-selected-clicked';
        }
      } else if (inRange(date, firstRange, lastRange)) {
        if(grayed){
          cssClass = 'btn-grayed-selected';
        }else{
          cssClass = 'btn-selected';
        }
      } else if (isSameDate(date, new Date())) {
        if(grayed){
          cssClass = 'btn-grayed';
        }else{
          cssClass = 'btn-today';
        }
      }

      var disable = '';
      if(angular.isDate(before) && !dateCalculator.dateBeforeOther(date,before)){
        disable = 'disabled';
      }
      if(angular.isDate(after) && !dateCalculator.dateBeforeOther(after,date)){
        disable = 'disabled';
      }

      var month = ('0' + (date.getMonth() + 1)).slice(-2);
      var day = ('0' + (date.getDate())).slice(-2);
      return '<td><button '+disable+' ng-click="$select(\''+date.getFullYear()+'/'+month+'/'+day+'\')" class="btn ' + cssClass + '"><span>' + label + '</span></button></td>';
    } else{
      return '<td></td>';
    }

       }

      return {
        createMonthDays: function (date, firstRange, lastRange,control,before,after) {
          var domElem = '', monthCall = callCullateData(date), label;
          //var tr = createTR();
          var tr = '<tr>';
          for (var i = 0; i < monthCall.days; i++) {
            var day = new Date(monthCall.firstDay.getFullYear(), monthCall.firstDay.getMonth(), monthCall.firstDay.getDate() + i);
            label = createLabels(null, firstRange, lastRange,false,before,after);
            if(control === 'prevMonth'){
              if(day.getMonth() !== date.getMonth() && dateCalculator.dateBeforeOther(date,day)){
                label = createLabels(day, firstRange, lastRange,true,before,after);
              }
            } else if(control === 'nextMonth'){
              if(day.getMonth() !== date.getMonth() && dateCalculator.dateBeforeOther(day,date)){
                label = createLabels(day, firstRange, lastRange,true,before,after);
              }
            }
            if(day.getMonth() === date.getMonth()){
              label = createLabels(day, firstRange, lastRange,false,before,after);
            }

            //tr.appendChild(label);
            tr += label;
            if ((i + 1) % 7 === 0) {
              tr += '</tr>';
              domElem += tr;
              tr = '<tr>';
              //tr = createTR();
            }
          }
          domElem = '<tbody id="secondCal">' + domElem + '</tbody>';
          return domElem;


        },
        daysInRows: function(date,model,before,last){
         return daysInRows(date,model,before,last);
        },
        monthInRows:function(date,before,last){
          return monthInRows(date,before,last);
        },
        yearInRows:function(date,before,last){
          return yearInRows(date,before,last);
        }
      };
    }]);
})();;