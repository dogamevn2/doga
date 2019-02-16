function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === "function" &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? "symbol"
        : typeof obj;
    };
  }
  return _typeof(obj);
}

// --- Theme Functions --------------------------------------------------------
function myAlert(type, message, wait) {
  var safeWait;
  var alertID = "alert-".concat(uuid());
  var alertString = '<div class="alert alert-'
    .concat(type, ' alert-dismissible fade collapse" id="')
    .concat(alertID, '" role="alert">');

  if (wait === undefined) {
    safeWait = 3000;
  } else {
    safeWait = wait;
  }

  alertString += message;
  alertString +=
    '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
  alertString += '<span aria-hidden="true">&times;</span>';
  alertString += "</button>";
  alertString += "</div>";
  $("#alertBox").append(alertString);
  $("#".concat(alertID)).collapse("show"); // TODO: Alert systems to show multiple alerts that shift up when closed
  // Calculate top
  // $("#alert-" + randomID).css("top", ($(".alert").length));

  if (safeWait !== 0) {
    sleep(safeWait).then(function() {
      $("#".concat(alertID)).alert("close"); // TODO: Shift remaining alerts up
    });
  }
}

function newsAlert() {
  var news = getJson("/news");
  var date = getStorage("newsDate");

  if (
    news !== undefined &&
    (date === undefined || news.Date > date) &&
    news.Message !== undefined &&
    news.Severity !== undefined
  ) {
    if (autoloadCookie(window.Menu)) {
      // Alert will pause execution on the autoload redirect allowing users to see new news
      // eslint-disable-next-line no-alert
      alert(news.Message);
      setStorage("newsDate", news.Date, "number");
    } else {
      myAlert("".concat(news.Severity, " alert-news"), news.Message, 0);
      $('.alert-news [data-dismiss="alert"]').on("click", function() {
        setStorage("newsDate", news.Date, "number");
      });
    }
  }
}

function buildHTML() {
  var htmlString = "";
  var buttonCount = 0;

  if (
    "error" in window.Menu &&
    window.Menu.error === true &&
    "message" in window.Menu
  ) {
    htmlString += '<div class="btn-group">';
    htmlString += '<button class="btn btn-primary btn-custom-main btn-custom-full">'.concat(
      window.Menu.message,
      "</button>"
    );
    htmlString += "</div>";
    $("#buttons").html(htmlString);
    return;
  }

  if (window.Menu !== undefined) {
    htmlString += '<div id="category-buttons">';
    $.each(window.Menu, function(i, field) {
      htmlString += '<div class="btn-group">';
      htmlString += '<button class="btn btn-primary btn-custom-main category-button" data-category="'
        .concat(field.title, '">')
        .concat(field.title, "</button>");
      htmlString +=
        '<button type="button" class="btn btn-primary btn-custom-dropdown dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>';
      htmlString += '<div class="dropdown-menu">';
      htmlString += '<a class="dropdown-item about-button" href="javascript:void(0)" data-category="'.concat(
        field.title,
        '">About</a>'
      );

      if (navigator.onLine && field.offline) {
        htmlString += '<div class="dropdown-divider"></div>';
        htmlString += '<a class="dropdown-item cache-button" href="javascript:void(0)" data-category="'.concat(
          field.title,
          '">Cache</a>'
        );
      }

      htmlString += "</div>";
      htmlString += "</div>";
      buttonCount += 1;

      if (buttonCount % 3 === 0) {
        htmlString += "<br>";
      }
    });

    if (navigator.onLine) {
      htmlString += '<div class="btn-group">';
      htmlString +=
        '<button class="btn btn-primary btn-custom-main btn-custom-full cache-all-button">[Cache All]</button>';
      htmlString += "</div>";
    }

    htmlString += "</div>";
    buttonCount = 0;
    $.each(window.Menu, function(i, field) {
      htmlString += '<div class="category-page" data-category="'.concat(
        field.title,
        '">'
      );
      $.each(field.entries, function(j, entry) {
        htmlString += '<div class="btn-group">';
        htmlString += '<button class="btn btn-primary btn-custom-main entry-button" data-category="'
          .concat(field.title, '" data-entry="')
          .concat(entry.title, '">')
          .concat(entry.title, "</button>");
        htmlString +=
          '<button type="button" class="btn btn-primary btn-custom-dropdown dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>';
        htmlString += '<div class="dropdown-menu">';
        htmlString += '<a class="dropdown-item about-button" href="javascript:void(0)" data-category="'
          .concat(field.title, '" data-entry="')
          .concat(entry.title, '">About</a>');
        htmlString += '<a class="dropdown-item autoload-button" href="javascript:void(0)" data-category="'
          .concat(field.title, '" data-entry="')
          .concat(entry.title, '">Autoload</a>');

        if (navigator.onLine && field.offline) {
          htmlString += '<div class="dropdown-divider"></div>';
          htmlString += '<a class="dropdown-item cache-button" href="javascript:void(0)" data-category="'
            .concat(field.title, '" data-entry="')
            .concat(entry.title, '">Cache</a>');
        }

        htmlString += "</div>";
        htmlString += "</div>";
        buttonCount += 1;

        if (buttonCount % 3 === 0) {
          htmlString += "<br>";
        }
      });

      if (navigator.onLine && field.offline) {
        htmlString += '<div class="btn-group">';
        htmlString += '<button class="btn btn-primary btn-custom-main btn-custom-full cache-all-button" data-category="'.concat(
          field.title,
          '">[Cache All]</button>'
        );
        htmlString += "</div>";
      }

      htmlString += "</div>";
      buttonCount = 0;
    });
  }

  $("#buttons").html(htmlString);
}

function clearOverlays() {
  $("#cacheOverlay").hide();
  $("#barText").hide();
  $("#barBack").hide();
  $("#barLoad").hide();
  $("#barLoad").html("");
  $("#barLoad").width("0%");
  $("#exploitOverlay").hide();
  $("#exploitMessage").hide();
  $("#exploitMessage").html("");
  $("#exploitLoader").hide();
}

function showCaching() {
  $("#cacheOverlay").show();
  $("#barText").show();
  $("#barBack").show();
  $("#barLoad").show();
}

function showLoader() {
  $("#exploitOverlay").show();
  $("#exploitLoader").show();
  $("#exploitMessage").show();
}

function exploitDone(message) {
  $("#exploitLoader").hide();
  $("#exploitMessage").html(message);
  sleep(3000).then(function() {
    if (
      $("#exploitMessage").html() !== "Waiting..." &&
      $("#exploitMessage").html() !== "Awaiting Payload..."
    ) {
      clearFrame();
      clearOverlays();
    }
  });
}

function displayHome() {
  window.history.replaceState(
    "",
    document.title,
    "".concat(window.location.pathname).concat(window.location.search)
  );
  $("#title").text("Category Selection");
  $("#header").text("Categories");
  $(".category-page").hide();
  $("#category-buttons").show();
}

function displayCategory(category) {
  window.history.pushState(null, null, "#".concat(category));
  $("#title").text("Exploit Selection");
  $("#header").text(category);
  $("#category-buttons").hide();
  $(".category-page").hide();
  $(".category-page").each(function(i, field) {
    if (String($(field).data("category")) === String(category)) {
      $(field).show();
    }
  });
}

function cacheInterface(callback) {
  if (callback === "ondownloading") {
    $("#barText").html("Caching...");
    showCaching();
  } else if (callback === "ondownloading-redirect") {
    $("#barText").html("Caching Redirect...");
    showCaching();
  } else if (callback === "ondownloading-theme") {
    $("#barText").html("Caching Theme...");
    showCaching();
  } else {
    clearFrame();
    clearOverlays();
    window.cacheLock = false;
    window.autoloadLock = false;

    if (callback === "oncached") {
      myAlert("success", "Cached Successfully");
    } else if (callback === "onupdateready") {
      myAlert("success", "Cache updated");
    } else if (callback === "onnoupdate") {
      myAlert("primary", "No update available");
    } else if (callback === "onerror") {
      myAlert("danger", "Error caching resources");
    } else if (callback === "onobsolete") {
      myAlert("danger", "Manifest returned a 404, cache was deleted");
    } else if (
      callback === "oncached-redirect" ||
      callback === "onupdateready-redirect" ||
      callback === "onnoupdate-redirect"
    ) {
      hostRedirect();
    } else if (callback === "onerror-redirect") {
      myAlert("danger", "Error caching redirect");
    } else if (callback === "onobsolete-redirect") {
      myAlert("danger", "Manifest returned a 404, redirect was deleted");
    } else if (
      callback === "oncached-theme" ||
      callback === "onnoupdate-theme"
    ) {
      // Do Nothing
    } else if (callback === "onupdateready-theme") {
      setStorage("newsDate", 0, _typeof(1));
      window.location.reload(true);
    } else if (callback === "onerror-theme") {
      myAlert("danger", "Error caching theme resources");
    } else if (callback === "onobsolete-theme") {
      myAlert("danger", "Manifest returned a 404, theme cache was deleted");
    }
  }
}

function cacheProgress(percent) {
  $("#barLoad").width("".concat(percent, "%"));
  $("#barLoad").html("".concat(percent, "%"));
}

function myLoader(category, entry) {
  showLoader();
  loadEntry(category, entry, window.Menu[category].entries[entry].redirect);
}

function myAutoload(category, entry) {
  setAutoload(category, entry);

  if (
    navigator.onLine &&
    window.Menu[category].offline &&
    window.Menu[category].entries[entry].offline
  ) {
    cacheEntry(category, entry);
    window.autoloadLock = true; // TODO: Fix this part(?)

    while (true) {
      if (!window.autoloadLock) {
        myLoader(category, entry);
        break;
      }
    }
  } else {
    myLoader(category, entry);
  }
}

function myCategoryMeta(category) {
  var title;
  var device;
  var firmware;
  var lang;
  var notes;
  var modalBody;
  var uaMatch = '<span class="badge badge-danger">Mismatch</span>';
  var meta = window.Menu[category];

  if (meta === undefined) {
    myAlert("danger", "Unable to retrieve metadata");
    return;
  }

  if (meta.title !== undefined) {
    title = meta.title;
  }

  if (meta.device !== undefined) {
    device = meta.device;
  }

  if (meta.firmware !== undefined) {
    firmware = meta.firmware;
  }

  if (checkUAMatch(meta.user_agents)) {
    uaMatch = '<span class="badge badge-success">Match</span>';
  }

  lang = getLanguage();

  if (lang === undefined) {
    setLanguage("default");
    lang = "default";
  }

  notes = meta.notes[lang];

  if (notes === undefined) {
    notes = meta.notes.default;
  }

  if (notes === undefined) {
    notes = "";
  }

  modalBody = '<div class="row"><div class="col-sm-3">Device:</div><div class="col-sm-9">'.concat(
    device,
    "</div></div>"
  );
  modalBody += '<div class="row"><div class="col-sm-3">Firmware:</div><div class="col-sm-9">'.concat(
    firmware,
    "</div></div>"
  );
  modalBody += '<div class="row"><div class="col-sm-3">UA Match?:</div><div class="col-sm-9">'.concat(
    uaMatch,
    "</div></div>"
  );
  modalBody += '<div class="row"><div class="col-sm-3">Notes:</div><div class="col-sm-9">'.concat(
    notes,
    "</div></div>"
  );
  $("#metaModalTitle").html(title);
  $("#metaModalBody").html(modalBody);
  $("#metaModal").modal("show");
}

function myEntryMeta(category, entry) {
  var lang;
  var description;
  var url;
  var modalBody;
  var title = "";
  var version = "";
  var updated = "";
  var device = "";
  var firmware = "";
  var author = "";
  var meta = window.Menu[category].entries[entry];

  if (meta === undefined) {
    myAlert("danger", "Unable to retrieve metadata");
    return;
  }

  if (meta.title !== undefined) {
    title = meta.title;
  }

  if (meta.version !== undefined) {
    version = meta.version;
  }

  if (meta.updated !== undefined) {
    updated = meta.updated;
  }

  if (meta.device !== undefined) {
    device = meta.device;
  }

  if (meta.firmware !== undefined) {
    firmware = meta.firmware;
  }

  lang = getLanguage();

  if (lang === undefined) {
    setLanguage("default");
    lang = "default";
  }

  description = meta.description[lang];

  if (description === undefined) {
    description = meta.description.default;
  }

  if (description === undefined) {
    description = "";
  }

  if (meta.author !== undefined) {
    author = meta.author;
  }

  if (meta.url !== undefined) {
    url = meta.url;
  }

  modalBody = '<div class="row"><div class="col-sm-3">Version:</div><div class="col-sm-9">'.concat(
    version,
    "</div></div>"
  );
  modalBody += '<div class="row"><div class="col-sm-3">Updated:</div><div class="col-sm-9">'.concat(
    updated,
    "</div></div>"
  );
  modalBody += '<div class="row"><div class="col-sm-3">Device:</div><div class="col-sm-9">'.concat(
    device,
    "</div></div>"
  );
  modalBody += '<div class="row"><div class="col-sm-3">Firmware:</div><div class="col-sm-9">'.concat(
    firmware,
    "</div></div>"
  );
  modalBody += '<div class="row"><div class="col-sm-3">Description:</div><div class="col-sm-9">'.concat(
    description,
    "</div></div>"
  );
  modalBody += '<div class="row"><div class="col-sm-3">Author(s):</div><div class="col-sm-9">'.concat(
    author,
    "</div></div>"
  );
  modalBody += '<div class="row"><div class="col-sm-3">URL:</div><div class="col-sm-9"><a href="'
    .concat(url, '">')
    .concat(url, "</a></div></div>");
  $("#metaModalTitle").html(title);
  $("#metaModalBody").html(modalBody);
  $("#metaModal").modal("show");
} // --- On Ready ---------------------------------------------------------------

$(function() {
  var customBackgroundImage = getStorage("background-image");

  if (customBackgroundImage) {
    $("body").css(
      "background-image",
      "url(".concat(customBackgroundImage, ")")
    );
  }

  window.cacheLock = true; // Blank out iFrame

  $("#ifr").attr("src", "/blank.html"); // Cache theme

  cacheTheme(); // Build window.Menu
  // TODO: This line should be blocking until the theme caching is complete.
  // while (true) {
  //   if (!window.cacheLock) {

  window.Menu = getMenu(); //     break;
  //   }
  // }
  // Display new alert if online.

  if (navigator.onLine) {
    newsAlert();
  } // Try to autoload if autoload cookie is present

  var autoload = autoloadCookie(window.Menu);

  if (autoload) {
    var autoloadCategory = autoload.split("/")[0];
    var autoloadEntry = autoload.split("/")[1];

    if (!navigator.onLine) {
      if (
        window.Menu[autoloadCategory].offline &&
        window.Menu[autoloadCategory].entries.offline
      ) {
        myAlert(
          "danger",
          "Could not autoload, payload is online only (Currently running from cache)"
        );
      }
    } else {
      myAutoload(autoloadCategory, autoloadEntry);
    }
  } // Build HTML

  buildHTML(); // Load preselected page based on URI hash and redirect to category if there is only one.

  if (window.location.hash) {
    if (decodeURIComponent(window.location.hash.substr(1)) in window.Menu) {
      displayCategory(decodeURIComponent(window.location.hash.substr(1)));
    } else {
      displayHome();
    }
  } else if (Object.keys(window.Menu).length === 1) {
    displayCategory(Object.keys(window.Menu)[0]);
  } else {
    displayHome();
  } // --- Handlers -------------------------------------------------------------

  $(window).on("keyup", function(event) {
    if (event.keyCode === 27) {
      clearFrame();
      clearOverlays();
      displayHome();
    }
  });
  $(".category-button").on("click", function(event) {
    displayCategory($(event.target).data("category"));
  });
  $(".entry-button").on("click", function(event) {
    myLoader($(event.target).data("category"), $(event.target).data("entry"));
  });
  $(".about-button").on("click", function(event) {
    if ($(event.target).data("entry")) {
      myEntryMeta(
        $(event.target).data("category"),
        $(event.target).data("entry")
      );
    } else {
      myCategoryMeta($(event.target).data("category"));
    }
  });
  $(".autoload-button").on("click", function(event) {
    setAutoload(
      $(event.target).data("category"),
      $(event.target).data("entry")
    );
  });
  $(".cache-button").on("click", function(event) {
    if ($(event.target).data("entry")) {
      cacheEntry(
        $(event.target).data("category"),
        $(event.target).data("entry")
      );
    } else {
      cacheCategory($(event.target).data("category"));
    }
  });
  $(".cache-all-button").on("click", function(event) {
    if ($(event.target).data("category")) {
      cacheCategory($(event.target).data("category"));
    } else {
      cacheAll();
    }
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
