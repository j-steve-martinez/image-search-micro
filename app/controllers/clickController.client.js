'use strict';

(function () {

   var addButton = document.querySelector('.btn-add');
   var deleteButton = document.querySelector('.btn-delete');
   var clickNbr = document.querySelector('#click-nbr');

   var base = document.URL;
   var nLoc = base + 'api/google/dog';
   var gLoc = base + 'api/recent'
   var natural = document.getElementById('natural');
   var google = document.getElementById('google');
   natural.innerHTML = nLoc;
   natural.href = nLoc;
   google.innerHTML = gLoc;
   google.href = gLoc;

   var apiUrl = base + 'api/clicks';

   function ready (fn) {
      if (typeof fn !== 'function') {
         return;
      }

      if (document.readyState === 'complete') {
         return fn();
      }

      document.addEventListener('DOMContentLoaded', fn, false);
   }

   function ajaxRequest (method, url, callback) {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function () {
         if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            callback(xmlhttp.response);
         }
      };

      xmlhttp.open(method, url, true);
      xmlhttp.send();
   }

   function updateClickCount (data) {
      var clicksObject = JSON.parse(data);
      clickNbr.innerHTML = clicksObject.clicks;
   }

   ready(ajaxRequest('GET', apiUrl, updateClickCount));

   addButton.addEventListener('click', function () {

      ajaxRequest('POST', apiUrl, function () {
         ajaxRequest('GET', apiUrl, updateClickCount);
      });

   }, false);

   deleteButton.addEventListener('click', function () {

      ajaxRequest('DELETE', apiUrl, function () {
         ajaxRequest('GET', apiUrl, updateClickCount);
      });

   }, false);

})();
