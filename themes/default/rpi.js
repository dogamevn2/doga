var _this = this;

function _instanceof(left, right) {
  if (
    right != null &&
    typeof Symbol !== "undefined" &&
    right[Symbol.hasInstance]
  ) {
    return right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
}

function _classCallCheck(instance, Constructor) {
  if (!_instanceof(instance, Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var TMDB =
  /*#__PURE__*/
  (function() {
    "use strict";

    function TMDB() {
      _classCallCheck(this, TMDB);

      this.url = "";
      this.json = "";
    }

    _createClass(TMDB, [
      {
        key: "update",
        value: function update(url) {
          if (url !== this.url) {
            this.url = url;
            this.json = $.ajax({
              dataType: "json",
              url: this.url,
              async: false
            }).responseJSON;
          }
        }
      },
      {
        key: "icon",
        get: function get() {
          if (this.json !== undefined) {
            return this.json.icons[0].icon;
          }

          return undefined;
        }
      },
      {
        key: "name",
        get: function get() {
          if (this.json !== undefined) {
            return this.json.names[0].name;
          }

          return undefined;
        }
      }
    ]);

    return TMDB;
  })();

function clearInputRPI() {
  $("#meta-info").hide();
  $("#installURL").val("http://");
  $("#pkgSearch").val("");
  $("#uninstallID").val("");
  $("#uninstallRadioGame").prop("checked", true);
  $("#taskContentID").val("");
  $("#taskRadioGame").prop("checked", true);
  $("#taskID").val("");
}

function getPKGListRPI() {
  return $.ajax({
    dataType: "json",
    url: "/api/pkglist",
    async: false
  }).responseJSON;
}

function showResponseRPI(type, message) {
  var color = "";

  if (type === "fail") {
    color = " text-danger";
  } else if (type === "success") {
    color = " text-success";
  }

  $("#responseText").html(
    '<p class="text-center'
      .concat(color, '">')
      .concat(JSON.stringify(message), "</p>")
  );
}

function getTMDBURLRPI(tid) {
  var sha1HMAC;
  var tmdbHash;
  var tmdbURL; // Insert key here (In hex format). It will be automatically checked against the correct hash

  var key =
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
  key = key.toUpperCase();
  var sha256 = new jsSHA("SHA-256", "TEXT");
  sha256.update(key);
  var keyHash = sha256.getHash("HEX");

  if (
    keyHash.toUpperCase() ===
    "2AB0555FABF50901A5D7CD56962769F0274374FA56C7E81E77EC386B22834AFB"
  ) {
    sha1HMAC = new jsSHA("SHA-1", "TEXT");
    sha1HMAC.setHMACKey(key, "HEX");
    sha1HMAC.update(tid);
    tmdbHash = sha1HMAC.getHMAC("HEX");
    tmdbHash = tmdbHash.toUpperCase();
    tmdbURL = "https://tmdb.np.dl.playstation.net/tmdb2/"
      .concat(tid, "_")
      .concat(tmdbHash, "/")
      .concat(tid, ".json");
  } else {
    tmdbURL = "http://0.0.0.0";
  }

  return tmdbURL;
}

function displayTIDMetaRPI(tid) {
  window.Meta.update(getTMDBURLRPI(tid));

  if (window.Meta.icon !== undefined) {
    $("#meta-icon").attr("src", window.Meta.icon);
  }

  if (window.Meta.name !== undefined) {
    $("#meta-name").text(window.Meta.name);
  }

  if (window.Meta.icon === undefined && window.Meta.name === undefined) {
    $("#meta-info").hide();
  } else {
    $("#meta-info").show();
  }
}

function setLastIPRPI(element) {
  var result;
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookies = decodedCookie.split(";");
  $.each(cookies, function(i, field) {
    while (field.charAt(0) === " ") {
      field = field.substring(1);
    }

    if (field.indexOf("last_ip=") === 0) {
      result = field.substring("last_ip=".length, field.length);
    }
  });

  if (result !== undefined) {
    $(element).val(result);
  } else {
    $(element).val("0.0.0.0");
    document.cookie = "last_ip=0.0.0.0; expires=Tue, 19 Jan 2038 03:14:07 UTC;";
  }
}

function validateInputRPI(inputType, value) {
  var pattern;

  if (inputType === "IP") {
    pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
  } else if (inputType === "URL") {
    pattern = /^http[s]?:\/\/.+/i;
  } else if (inputType === "ContentID") {
    pattern = /^[A-Z]{2}[0-9]{4}-[A-Z]{4}[0-9]{5}_[0-9]{2}-[A-Z0-9]{16}$/;
  } else if (inputType === "TitleID") {
    pattern = /^[A-Z]{4}[0-9]{5}$/;
  } else if (inputType === "TaskID") {
    pattern = /^(?:[1-9][0-9]{3}|[1-9][0-9]{2}|[1-9][0-9]|[0-9])$/;
  } else {
    return false;
  }

  return pattern.test(value);
}

function sendCommandRPI(ip, endpoint, command) {
  var compiledURL = "http://".concat(ip, ":12800/api/").concat(endpoint);

  if (validateInputRPI("IP", ip)) {
    document.cookie = "last_ip=".concat(
      ip,
      "; expires=Tue, 19 Jan 2038 03:14:07 UTC;"
    );
    return $.ajax({
      type: "POST",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      url: compiledURL,
      data: command,
      async: false,
      beforeSend: function beforeSend() {
        $("#sendingOverlay").show();
      },
      complete: function complete() {
        $("#sendingOverlay").hide();
      }
    }).responseJSON;
  } // eslint-disable-next-line no-alert

  alert("Invalid IP");
  return undefined;
}

function isExistsRPI(ip, tid) {
  var response;
  var type;

  if (validateInputRPI("TitleID", tid.toUpperCase())) {
    response = sendCommandRPI(
      ip,
      "is_exists",
      '{"title_id": "'.concat(tid.toUpperCase(), '"}')
    );
    type = response.status; // TODO: Parse response

    showResponseRPI(type, response);
    return;
  } // eslint-disable-next-line no-alert

  alert("Validation Error");
}

function installRPI(ip, urlType, url) {
  var response;
  var type;

  if (validateInputRPI("URL", url)) {
    if (urlType === "direct") {
      response = sendCommandRPI(
        ip,
        "install",
        '{"type": "direct", "packages": ["'.concat(url, '"]}')
      );
    } else if (urlType === "ref_pkg_url") {
      response = sendCommandRPI(
        ip,
        "install",
        '{"type": "ref_pkg_url", "url": "'.concat(url, '"}')
      );
    }

    type = response.status; // TODO: Parse response

    showResponseRPI(type, response);
    return;
  } // eslint-disable-next-line no-alert

  alert("Validation Error");
}

function uninstallRPI(ip, endpoint, uid) {
  var response;
  var type;

  if (endpoint === "uninstall_game" || endpoint === "uninstall_patch") {
    if (validateInputRPI("TitleID", uid.toUpperCase())) {
      response = sendCommandRPI(
        ip,
        endpoint,
        '{"title_id": "'.concat(uid.toUpperCase(), '"}')
      );
      type = response.status; // TODO: Parse response

      showResponseRPI(type, response);
      return;
    }
  } else if (endpoint === "uninstall_ac" || endpoint === "uninstall_theme") {
    if (validateInputRPI("ContentID", uid.toUpperCase())) {
      response = sendCommandRPI(
        ip,
        endpoint,
        '{"content_id": "'.concat(uid.toUpperCase(), '"}')
      );
      type = response.status; // TODO: Parse response

      showResponseRPI(type, response);
      return;
    }
  } // eslint-disable-next-line no-alert

  alert("Validation Error");
}

function findTaskRPI(ip, taskType, cid) {
  var response;
  var type;

  if (validateInputRPI("ContentID", cid.toUpperCase())) {
    response = sendCommandRPI(
      ip,
      "find_task",
      '{"content_id": "'
        .concat(cid.toUpperCase(), '", "sub_type": ')
        .concat(taskType, "}")
    );
    type = response.status; // TODO: Parse response

    showResponseRPI(type, response);
    return;
  } // eslint-disable-next-line no-alert

  alert("Validation Error");
}

function taskRPI(ip, taskType, taskID) {
  var response;
  var type;

  if (validateInputRPI("TaskID", taskID)) {
    response = sendCommandRPI(ip, taskType, '{"task_id": '.concat(taskID, "}"));
    type = response.status; // TODO: Parse response

    showResponseRPI(type, response);
    return;
  } // eslint-disable-next-line no-alert

  alert("Validation Error");
}

function makePkgButtonRPI(pkgName, pkgSize, pkgURL) {
  var output;
  var truncateLength = 43;
  var truncatedName = pkgName.substring(0, truncateLength - 3);

  if (pkgName.length > truncateLength) {
    truncatedName += "...";
  }

  var i = pkgSize === 0 ? 0 : Math.floor(Math.log(pkgSize) / Math.log(1024));
  var formattedSize = ""
    .concat((pkgSize / 1024 ** i).toFixed(2) * 1, " ")
    .concat(["B", "kB", "MB", "GB", "TB"][i]);
  output =
    '<button type="button" class="btn-pkg-list list-group-item list-group-item-action p-0 pb-1 pl-2" ';
  output += 'data-pkg-url="'.concat(pkgURL, '">');
  output += ""
    .concat(truncatedName, '<span class="badge badge-primary ml-1">')
    .concat(formattedSize, "</span></button>");
  return output;
}

function makePkgArrayRPI(pkgJson) {
  var output = "";

  if (pkgJson !== undefined) {
    $.each(pkgJson, function(i, field) {
      if (field === "No PKGs Found") {
        output = '<p class="text-center text-danger">No PKGs found on host</p>';
      } else if (field === "I/O Error on Host") {
        output = '<p class="text-center text-danger">I/O error on host</p>';
      } else if (field === "No results") {
        output = '<p class="text-center text-danger">No results</p>';
      } else {
        output += makePkgButtonRPI(
          field.Filename,
          field.Filesize,
          field.File_URL
        );
      }
    });
  }

  if (output === "") {
    output = '<p class="text-center text-danger">Error connecting to host</p>';
  }

  return output;
}

function checkPkgLink() {
  var match;
  var patternCID = /[A-Z]{2}[0-9]{4}-([A-Z]{4}[0-9]{5}_[0-9]{2})-[A-Z0-9]{16}/i;
  var patternTID = /([A-Z]{4}[0-9]{5})/i;

  if (patternCID.test($("#installURL").val())) {
    match = patternCID.exec($("#installURL").val());
    match = match[1].toUpperCase();
    displayTIDMetaRPI(match);
  } else if (patternTID.test($("#installURL").val())) {
    match = patternTID.exec($("#installURL").val());
    match = "".concat(match[1].toUpperCase(), "_00");
    displayTIDMetaRPI(match);
  } else {
    $("#meta-info").hide();
  }
}

$(function() {
  var searchJson;
  var searchTerm;
  window.Meta = new TMDB();

  if (!navigator.onLine) {
    $("#offlineOverlay").show();
    return;
  }

  setLastIPRPI("#ip");
  clearInputRPI();
  var pkgJson = getPKGListRPI();
  $('a[data-toggle="pill"]').click(function() {
    clearInputRPI();
    $("#header").text($(_this).text());
  });
  $("#pkgSearch").keyup(function() {
    searchJson = [];

    if (pkgJson !== "No PKGs Found" && pkgJson !== "I/O Error on Host") {
      searchTerm = $("#pkgSearch")
        .val()
        .toUpperCase();
      $.each(pkgJson, function(i, field) {
        if (field.Filename.toUpperCase().indexOf(searchTerm) > -1) {
          searchJson.push(field);
        }
      });

      if (pkgJson !== undefined && searchJson.length === 0) {
        searchJson = ["No results"];
      }

      $("#pkg-list").html(makePkgArrayRPI(searchJson));
    }
  });
  $("#installURL").keyup(checkPkgLink);
  $("#btn-exists").click(function() {
    isExistsRPI($("#ip").val(), $("#existID").val());
  });
  $("#btn-install-cdn").click(function() {
    installRPI($("#ip").val(), "ref_pkg_url", $("#installURL").val());
  });
  $("#btn-install-url").click(function() {
    installRPI($("#ip").val(), "direct", $("#installURL").val());
  });
  $("#btn-uninstall").click(function() {
    uninstallRPI(
      $("#ip").val(),
      $("input[name='uninstallRadios']:checked").val(),
      $("#uninstallID").val()
    );
  });
  $("#btn-task-find").click(function() {
    findTaskRPI(
      $("#ip").val(),
      $("input[name='taskRadios']:checked").val(),
      $("#taskContentID").val()
    );
  });
  $("#btn-task-star").click(function() {
    taskRPI($("#ip").val(), "start_task", $("#taskID").val());
  });
  $("#btn-task-stop").click(function() {
    taskRPI($("#ip").val(), "stop_task", $("#taskID").val());
  });
  $("#btn-task-pause").click(function() {
    taskRPI($("#ip").val(), "pause_task", $("#taskID").val());
  });
  $("#btn-task-resume").click(function() {
    taskRPI($("#ip").val(), "resume_task", $("#taskID").val());
  });
  $("#btn-task-unregister").click(function() {
    taskRPI($("#ip").val(), "unregister_task", $("#taskID").val());
  });
  $("#btn-task-progress").click(function() {
    taskRPI($("#ip").val(), "get_task_progress", $("#taskID").val());
  });
  $("#pkg-list").html(makePkgArrayRPI(pkgJson));
  $(".btn-pkg-list").click(function(event) {
    $("#installURL").val($(event.target).data("pkg-url"));
    checkPkgLink();
  });
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
