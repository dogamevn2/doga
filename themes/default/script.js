function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function updatePage(title, header, buttons) {
  document.title = title + " | PS4 Exploit Host by Al-Azif";
  document.getElementById("title").innerHTML = title;
  document.getElementById("header").innerHTML = header;
  document.getElementById("buttons").innerHTML = buttons;
}

function resetPage() {
  history.pushState("", document.title, window.location.pathname + window.location.search);
  updatePage("Firmware Selection", "Firmware", firmwares);
}

function getFirmwares() {
  var firmwareSpoofs = {
    "5.51": "4.55",
    "5.07": "5.05"
  };
  var ua = navigator.userAgent;
  var currentFirmware = ua.substring(ua.indexOf("5.0 (") + 19, ua.indexOf(") Apple"));
  if (firmwareSpoofs.hasOwnProperty(currentFirmware)) {
    currentFirmware = firmwareSpoofs[currentFirmware];
  }
  var firmwares = "";
  x = 0;
  if (data["firmwares"].length == 1 && data["firmwares"][0] != "No Exploits Found" && data["firmwares"][0] != "I/O Error on Host") {
    window.location.hash = data["firmwares"][0];
  }
  for (var i = 0, len = data["firmwares"].length; i < len; i++) {
    if (data[data["firmwares"][i]].length > 1) {
      x += 1;
      if (currentFirmware == data["firmwares"][i]) {
        if(navigator.onLine) {
          firmwares += "<button class=\"btn btn-main\" onclick=\"window.location.hash = '" + data["firmwares"][i].replace(/ /g, "%20") + "'\">" + data["firmwares"][i] + "</button><div class=\"dropdown\"><button class=\"btn btn-dropdown\"><div class=\"dropdown-caret\">&#9660;</div></button><div class=\"dropdown-content\"><a href=\"#\" onclick=\"cacheFirmware('" + data["firmwares"][i] + "');\">Cache</a></div></div>";
        } else {
          firmwares += "<button class=\"btn btn-main btn-full\" onclick=\"window.location.hash = '" + data["firmwares"][i].replace(/ /g, "%20") + "'\">" + data["firmwares"][i] + "</button>";
        }
      } else {
        if(navigator.onLine) {
          firmwares += "<button class=\"btn btn-disabled\" onclick=\"window.location.hash = '" + data["firmwares"][i].replace(/ /g, "%20") + "'\">" + data["firmwares"][i] + "</button><div class=\"dropdown\"><button class=\"btn btn-dropdown-disabled\"><div class=\"dropdown-caret\">&#9660;</div></button><div class=\"dropdown-content\"><a href=\"#\" onclick=\"cacheFirmware('" + data["firmwares"][i] + "');\">Cache</a></div></div>";
        } else {
          firmwares += "<button class=\"btn btn-disabled btn-full\" onclick=\"window.location.hash = '" + data["firmwares"][i].replace(/ /g, "%20") + "'\">" + data["firmwares"][i] + "</button>";
        }
      }
      if (x >= 3) {
        firmwares += "<br>";
        x = 0;
      }
    }
  }
  return firmwares;
}

function getExploits() {
  var hash = window.location.hash.substr(1).replace(/\%20/g, " ");
  var exploits = "";
  x = 0;
  for (var i = 0, len = data[hash].length; i < len; i++) {
    x += 1;
    if (data[hash][i] == "[Back]") {
      exploits += "<button class=\"btn btn-main btn-full\" onclick=\"window.location.hash = 'back'\">[Back]</button>";
    }  else {
      if (navigator.onLine) {
        exploits += "<button class=\"btn btn-main\" onClick=\"loadExploit('" + hash + "', '" + data[hash][i] + "');\">" + data[hash][i] + "</button><div class=\"dropdown\"><button class=\"btn btn-dropdown\"><div class=\"dropdown-caret\">&#9660;</div></button><div class=\"dropdown-content\"><a href=\"#" + hash +"\" onclick=\"cacheExploit('" + hash + "', '" + data[hash][i] + "');\">Cache</a><a href =\"#" + hash + "\" onclick=\"setAutoload('" + hash + "', '" + data[hash][i] + "');\">Autoload</a><a href=\"#" + hash + "\" onclick=\"getExploitInfo('" + hash + "', '" + data[hash][i] + "');\">About</a></div></div>";
      } else {
        exploits += "<button class=\"btn btn-main\" onClick=\"loadExploit('" + hash + "', '" + data[hash][i] + "');\">" + data[hash][i] + "</button><div class=\"dropdown\"><button class=\"btn btn-dropdown\"><div class=\"dropdown-caret\">&#9660;</div></button><div class=\"dropdown-content\"><a href =\"#" + hash + "\" onclick=\"setAutoload('" + hash + "', '" + data[hash][i] + "');\">Autoload</a><a href=\"#" + hash + "\" onclick=\"getExploitInfo('" + hash + "', '" + data[hash][i] + "');\">About</a></div></div>";
      }
    }
    if (x >= 3) {
      exploits += "<br>";
      x = 0;
    }
  }
  return exploits;
}

function cacheFirmware(firmware) {
  document.getElementById("ifr").setAttribute("src", "/cache/firmware/" + firmware + "/index.html");
}

function cacheExploit(firmware, exploit) {
  document.getElementById("ifr").setAttribute("src", "/cache/exploit/" + firmware + "/" + exploit + "/index.html");
}

function getExploitInfo(firmware, exploit) {
  var modal = document.getElementById("infoModal");
  var closer = document.getElementsByClassName("close")[0];

  closer.onclick = function() {
    modal.style.display = "none";
  };

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  var url = "/exploits/" + firmware + "/" + exploit + "/meta.json";
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, false);
  xhr.send(null);

  if (xhr.status === 200) {
    var metadata = JSON.parse(xhr.responseText);
    document.getElementById("modalTitle").innerHTML = metadata["Name"] + " Metadata";
    var description = metadata["Description"]["default"];
    if (metadata["Description"][lang] !== null) {
      description = metadata["Description"][lang];
    }
    document.getElementsByClassName("modalBody")[0].innerHTML = "<div><div class=\"modalCategory\">Version:</div><div class=\"modalText\">" + metadata["Version"] + "</div><div class=\"clear\"></div></div><div><div class=\"modalCategory\">Device:</div><div class=\"modalText\">" + metadata["Device"] + "</div><div class=\"clear\"></div></div><div><div class=\"modalCategory\">Firmware:</div><div class=\"modalText\">" + metadata["Firmware"] + "</div><div class=\"clear\"></div></div><div><div class=\"modalCategory\">Description:</div><div class=\"modalText\">" + description + "</div><div class=\"clear\"></div></div><div><div class=\"modalCategory\">URL:</div><div class=\"modalText\"><a href=\"" + metadata["URL"] + "\">" + metadata["URL"] + "</a></div><div class=\"clear\"></div></div>";
    modal.style.display = "block";
  } else {
    alert("Error retrieving metadata!");
  }
}

function loadExploit(firmware, exploit) {
  // iFrame Method
  // showLoader();
  // document.getElementById("ifr").setAttribute("src", "/exploits/" + firmware + "/" + exploit +"/index.html");

  // Redirect Method
  window.location.replace("/exploits/" + firmware + "/" + exploit +"/index.html");
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setAutoload(firmware, exploit) {
  document.cookie = "autoload=/exploits/" + firmware + "/" + exploit + "/index.html;";

  // iFrame Method
  //showLoader();
  //document.getElementById("ifr").setAttribute("src", exploit);

  //Redirect Method
  window.location.replace("/exploits/" + firmware + "/" + exploit +"/index.html");
}

function firmwareSelected() {
  var hash = window.location.hash.substr(1);
  if (!isInArray(hash, firmwares)) {
    resetPage();
  } else {
    updatePage("Exploit Selection", hash, getExploits());
  }
}

function clearFrame() {
  document.getElementById("ifr").setAttribute("src", "");
}

function clearOverlays() {
  document.getElementById("cacheOverlay").style.display = "none";
  document.getElementById("barText").style.display = "none";
  document.getElementById("barBack").style.display = "none";
  document.getElementById("barLoad").style.display = "none";
  document.getElementById("exploitOverlay").style.display = "none";
  document.getElementById("exploitMessage").innerHTML = "";
  document.getElementById("exploitMessage").style.display = "none";
  document.getElementById("exploitLoader").style.display = "none";
}

function showCaching() {
  document.getElementById("cacheOverlay").style.display = "block";
  document.getElementById("barText").style.display = "block";
  document.getElementById("barBack").style.display = "block";
  document.getElementById("barLoad").style.display = "block";
}

function showLoader() {
  document.getElementById("exploitMessage").innerHTML = "";
  document.getElementById("exploitOverlay").style.display = "block";
  document.getElementById("exploitLoader").style.display = "block";
  document.getElementById("exploitMessage").style.display = "block";
}

function ondownloading() {
  showCaching();
}

function onprogress(percent) {
  document.getElementById("barLoad").style.width = percent + "%";
  document.getElementById("barLoad").innerHTML = percent + "%";
}

function oncached() {
  clearFrame();
  clearOverlays();
  alert("Application cached successfully!");
}

function onupdateready() {
  clearFrame();
  clearOverlays();
  alert("Cache updated! Press Ok to reload the page.");
}

function onnoupdate() {
  clearFrame();
  clearOverlays();
  alert("No update available");
}

function onerror() {
  clearFrame();
  clearOverlays();
  alert("Error caching resources!");
}

function onobsolete() {
  clearFrame();
  clearOverlays();
  alert("Manifest returned a 404, cache was deleted");
}

function hideLoader(message, wait) {
  document.getElementById("exploitLoader").style.display = "none";
  document.getElementById("exploitMessage").innerHTML = message;
  sleep(wait).then(() => {
    if (document.getElementById("exploitMessage").innerHTML == "Success") {
      document.getElementById("forceRefresh").value = 1;
      window.location.reload();
    } else if (document.getElementById("exploitMessage").innerHTML == "Waiting..." || document.getElementById("exploitMessage").innerHTML == "Awaiting payload...") {
      // Just sit here
    } else {
      clearFrame();
      clearOverlays();
    }
  });
}

function autoloadCookie() {
  if (getCookie("autoload")) {
    var autoload = getCookie("autoload");
    try {
      if (!isInArray(autoload.split("/")[3], data[autoload.split("/")[2]])) {
        document.cookie = "autoload=;";
        alert("The exploit being autoloaded no longer exists! Cookie cleared");
      } else {
        // iFrame Method
        // showLoader();
        // document.getElementById("ifr").setAttribute("src", autoload);

        // Redirect Method
        window.location.replace(autoload);
      }
    } catch(e) {
      document.cookie = "autoload=;";
      alert("The exploit being autoloaded no longer exists! Cookie cleared");
    }
  }
}

function checkForceRefresh() {
  if (document.getElementById("forceRefresh").value == 1) {
    window.location.replace("./");
  }
}

function bootstrap(input) {
  if (localStorage.getItem("language") === null) {
    localStorage.setItem("language", "en");
  }

  lang = localStorage.getItem("language");
  data = input;
  firmwares = getFirmwares();

  window.onload = function () {
    if (window.location.hash) {
      firmwareSelected();
    } else {
      resetPage();
    }
  };

  window.document.addEventListener("keyup", function (event) {
    if (event.keyCode === 27) {
      if (window.getComputedStyle(document.getElementById("infoModal")).getPropertyValue("display") == "block") {
        document.getElementById("infoModal").style.display = "none";
      } else if (window.getComputedStyle(document.getElementById("exploitOverlay")).getPropertyValue("display") == "none" && document.getElementById("title").innerHTML != "Firmware Selection") {
        window.location.hash = "back";
      }
      clearFrame();
      clearOverlays();
    }
  });

  window.applicationCache.onupdateready = function (n) {
    window.location.reload(true);
  };
}
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
