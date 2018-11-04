function clearInputRPI() {
  $('#installURL').val('http://');
  $('#pkgSearch').val('');
  $('#uninstallID').val('');
  $('#uninstallRadioGame').prop('checked', true);
  $('#taskContentID').val('');
  $('#taskRadioGame').prop('checked', true);
  $('#taskID').val('');
}

function getServerIPRPI() {
  return $.ajax({
    dataType: 'text',
    url: '/api/serverip',
    async: false,
  }).responseText;
}

function getPKGListRPI() {
  return $.ajax({
    dataType: 'json',
    url: '/api/pkglist',
    async: false,
  }).responseJSON;
}

function showResponseRPI(type, message) {
  var color = '';

  if (type === 'fail') {
    color = ' text-danger';
  } else if (type === 'success') {
    color = ' text-success';
  }
  $('#responseText').html('<p class="text-center' + color + '">' + JSON.stringify(message) + '</p>');
}

function setLastIPRPI(element) {
  var result;

  var decodedCookie = decodeURIComponent(document.cookie);
  var cookies = decodedCookie.split(';');

  $.each(cookies, function (i, field) {
    while (field.charAt(0) === ' ') {
      field = field.substring(1);
    }
    if (field.indexOf('last_ip=') === 0) {
      result = field.substring('last_ip='.length, field.length);
    }
  });

  if (result !== undefined) {
    $(element).val(result);
  } else {
    $(element).val('0.0.0.0');
    document.cookie = 'last_ip=0.0.0.0; expires=Tue, 19 Jan 2038 03:14:07 UTC;';
  }
}

function validateInputRPI(inputType, value) {
  var pattern;

  if (inputType === 'IP') {
    pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
  } else if (inputType === 'URL') {
    pattern = /^http[s]?:\/\/.+/i;
  } else if (inputType === 'ContentID') {
    pattern = /^[A-Z]{2}[0-9]{4}-[A-Z]{4}[0-9]{5}_[0-9]{2}-[A-Z0-9]{16}$/;
  } else if (inputType === 'TitleID') {
    pattern = /^[A-Z]{4}[0-9]{5}$/;
  } else if (inputType === 'TaskID') {
    pattern = /^(?:[1-9][0-9]{3}|[1-9][0-9]{2}|[1-9][0-9]|[0-9])$/;
  } else {
    return false;
  }
  return pattern.test(value);
}

function sendCommandRPI(ip, endpoint, command) {
  var compiledCommand;

  if (validateInputRPI('IP', ip)) {
    document.cookie = 'last_ip=' + ip + '; expires=Tue, 19 Jan 2038 03:14:07 UTC;';
    compiledCommand = '{"IP": "' + ip + '", "Endpoint": "' + endpoint + '", "Command": ' + command + '}';
    return $.ajax({
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      url: '/api/remote_pkg',
      data: compiledCommand,
      async: false,
      beforeSend: function () {
        $('#sendingOverlay').show();
      },
      complete: function () {
        $('#sendingOverlay').hide();
      },
    }).responseJSON;
  }
  alert('Invalid IP');
  return undefined;
}

function isExistsRPI(ip, tid) {
  var response;
  var type;

  if (validateInputRPI('TitleID', tid.toUpperCase())) {
    response = sendCommandRPI(ip, 'is_exists', '{\\"title_id\\": \\"' + tid.toUpperCase() + '\\"}');
    type = response.status;
    // TODO: Parse response
    showResponseRPI(type, response);
    return;
  }
  alert('Validation Error');
}

function installRPI(ip, urlType, url) {
  var response;
  var type;

  if (validateInputRPI('URL', url)) {
    response = sendCommandRPI(ip, 'install', '{\\"type\\": \\"' + urlType + '\\", \\"url\\": \\"' + url + '\\"}');
    type = response.status;
    // TODO: Parse response
    showResponseRPI(type, response);
    return;
  }
  alert('Validation Error');
}

function uninstallRPI(ip, endpoint, uid) {
  var response;
  var type;

  if (endpoint === 'uninstall_game' || endpoint === 'uninstall_patch') {
    if (validateInputRPI('TitleID', uid.toUpperCase())) {
      response = sendCommandRPI(ip, endpoint, '{\\"title_id\\": \\"' + uid.toUpperCase() + '\\"}');
      type = response.status;
      // TODO: Parse response
      showResponseRPI(type, response);
      return;
    }
  } else if (endpoint === 'uninstall_ac' || endpoint === 'uninstall_theme') {
    if (validateInputRPI('ContentID', uid.toUpperCase())) {
      response = sendCommandRPI(ip, endpoint, '{\\"content_id\\": \\"' + uid.toUpperCase() + '\\"}');
      type = response.status;
      // TODO: Parse response
      showResponseRPI(type, response);
      return;
    }
  }
  alert('Validation Error');
}

function findTaskRPI(ip, taskType, cid) {
  var response;
  var type;

  if (validateInputRPI('ContentID', cid.toUpperCase())) {
    response = sendCommandRPI(ip, 'find_task', '{\\"content_id\\": \\"' + cid.toUpperCase() + '\\", \\"sub_type\\": ' + taskType + '}');
    type = response.status;
    // TODO: Parse response
    showResponseRPI(type, response);
    return;
  }
  alert('Validation Error');
}

function taskRPI(ip, taskType, taskID) {
  var response;
  var type;

  if (validateInputRPI('TaskID', taskID)) {
    response = sendCommandRPI(ip, taskType, '{\\"task_id\\": ' + taskID + '}');
    type = response.status;
    // TODO: Parse response
    showResponseRPI(type, response);
    return;
  }
  alert('Validation Error');
}

function makePkgButtonRPI(pkgName, pkgSize) {
  var i;
  var formattedSize;
  var output;

  var truncateLength = 43;
  var pkgURL = 'https://' + getServerIPRPI() + '/pkgs/' + encodeURIComponent(pkgName);
  var truncatedName = pkgName.substring(0, truncateLength - 3);

  if (pkgName.length > truncateLength) {
    truncatedName += '...';
  }

  i = pkgSize === 0 ? 0 : Math.floor(Math.log(pkgSize) / Math.log(1024));
  formattedSize = (pkgSize / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  output = '<button type="button" class="list-group-item list-group-item-action p-0 pb-1 pl-2" ';
  output += 'onclick="$(\'#installURL\').val(\'' + pkgURL + '\');">';
  output += truncatedName + '<span class="badge badge-primary ml-1">' + formattedSize + '</span></button>';

  return output;
}

function makePkgArrayRPI(pkgJson) {
  var output = '';

  if (pkgJson !== undefined) {
    $.each(pkgJson, function (i, field) {
      if (field === 'No PKGs Found') {
        output = '<p class="text-center text-danger">No PKGs found on host</p>';
      } else if (field === 'I/O Error on Host') {
        output = '<p class="text-center text-danger">I/O error on host</p>';
      } else if (field === 'No results') {
        output = '<p class="text-center text-danger">No results</p>';
      } else {
        output += makePkgButtonRPI(field.Filename, field.Filesize);
      }
    });
  }

  if (output === '') {
    output = '<p class="text-center text-danger">Error connecting to host</p>';
  }
  return output;
}

$(function () {
  var pkgJson;
  var searchJson;
  var searchTerm;

  if (!navigator.onLine) {
    $('#offlineOverlay').show();
    return;
  }

  setLastIPRPI('#ip');
  clearInputRPI();
  pkgJson = getPKGListRPI();

  $('a[data-toggle="pill"]').click(function () {
    clearInputRPI();
    $('#header').text($(this).text());
  });

  $('#pkgSearch').keyup(function () {
    searchJson = [];
    if (pkgJson != 'No PKGs Found' && pkgJson != 'I/O Error on Host') {
      searchTerm = $('#pkgSearch').val().toUpperCase();
      $.each(pkgJson, function (i, field) {
        if (field.Filename.toUpperCase().indexOf(searchTerm) > -1) {
          searchJson.push(field);
        }
      });

      if (pkgJson !== undefined && searchJson.length === 0) {
        searchJson = ['No results'];
      }
      $('#pkg-list').html(makePkgArrayRPI(searchJson));
    }
  });

  $('#pkg-list').html(makePkgArrayRPI(pkgJson));
});
/*
Copyright (c) 2017-2018 Al Azif, https://github.com/Al-Azif/ps4-exploit-host

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
