// --- Theme Functions --------------------------------------------------------

function myAlert(type, message, wait) {
  let safeWait;

  const alertID = `alert-${uuid()}`;
  let alertString = `<div class="alert alert-${type} alert-dismissible fade collapse" id="${alertID}" role="alert">`;

  if (wait === undefined) {
    safeWait = 3000;
  } else {
    safeWait = wait;
  }
  alertString += message;
  alertString += '<button type="button" class="close" data-dismiss="alert">';
  alertString += '<span>&times;</span>';
  alertString += '</button>';
  alertString += '</div>';
  $('#alert-box').append(alertString);
  $(`#${alertID}`).collapse('show');
  // TODO: Alert systems to show multiple alerts that shift up when closed
  // Calculate top
  // $(`#alert-${randomID}`).css('top', ($('.alert').length));
  if (safeWait !== 0) {
    sleep(safeWait).then(() => {
      $(`#${alertID}`).alert('close');
      // TODO: Shift remaining alerts up
    });
  }
}

function newsAlert() {
  getJsonAsync('./news', (response) => {
    if (response) {
      const news = response;
      const date = getCookie('newsDate');
      if (news !== undefined && (date === undefined || news.Date > date)
        && news.Message !== undefined && news.Severity !== undefined) {
        if (autoloadCookie(window.Menu)) {
          // Alert will pause execution on the autoload redirect allowing users to see new news
          // eslint-disable-next-line no-alert
          alert(news.Message);
          setCookie('newsDate', news.Date);
        } else {
          myAlert(`${news.Severity} alert-news`, news.Message, 0);
          $('.alert-news [data-dismiss="alert"]').on('click', () => {
            setCookie('newsDate', news.Date);
          });
        }
      }
    }
  });
}

function buildHTML() {
  let htmlString = '';
  let buttonCount = 0;

  if ('error' in window.Menu && window.Menu.error === true && 'message' in window.Menu) {
    htmlString += '<div class="btn-group">';
    htmlString += `<button class="btn btn-primary btn-custom-main btn-custom-full">${window.Menu.message}</button>`;
    htmlString += '</div>';
    $('#buttons').html(htmlString);
    return;
  }

  if (window.Menu !== undefined) {
    htmlString += '<div id="category-buttons">';
    $.each(window.Menu, (i, field) => {
      htmlString += '<div class="btn-group">';
      htmlString += `<button class="btn btn-primary btn-custom-main category-button" data-category="${field.title}">${field.title}</button>`;
      htmlString += '<button type="button" class="btn btn-primary btn-custom-dropdown dropdown-toggle dropdown-toggle-split" data-toggle="dropdown"></button>';
      htmlString += '<div class="dropdown-menu">';
      htmlString += `<a class="dropdown-item about-button" href="javascript:void(0)" data-category="${field.title}">About</a>`;
      if (navigator.onLine && field.offline) {
        htmlString += '<div class="dropdown-divider"></div>';
        htmlString += `<a class="dropdown-item cache-button" href="javascript:void(0)" data-category="${field.title}">Cache</a>`;
      }
      htmlString += '</div>';
      htmlString += '</div>';
      buttonCount += 1;
      if (buttonCount % 3 === 0) {
        htmlString += '<br>';
      }
    });
    if (navigator.onLine) {
      htmlString += '<div class="btn-group">';
      htmlString += '<button class="btn btn-primary btn-custom-main btn-custom-full cache-all-button">[Cache All]</button>';
      htmlString += '</div>';
    }
    htmlString += '</div>';
    buttonCount = 0;

    $.each(window.Menu, (i, field) => {
      htmlString += `<div class="category-page" data-category="${field.title}">`;
      if ('error' in field.entries && field.entries.error === true && 'message' in field.entries) {
        htmlString += '<div class="btn-group">';
        htmlString += `<button class="btn btn-primary btn-custom-main btn-custom-full">${field.entries.message}</button>`;
        htmlString += '</div>';
      } else {
        $.each(field.entries, (j, entry) => {
          htmlString += '<div class="btn-group">';
          htmlString += `<button class="btn btn-primary btn-custom-main entry-button" data-category="${field.title}" data-entry="${entry.title}">${entry.title}</button>`;
          htmlString += '<button type="button" class="btn btn-primary btn-custom-dropdown dropdown-toggle dropdown-toggle-split" data-toggle="dropdown"></button>';
          htmlString += '<div class="dropdown-menu">';
          htmlString += `<a class="dropdown-item about-button" href="javascript:void(0)" data-category="${field.title}" data-entry="${entry.title}">About</a>`;
          htmlString += `<a class="dropdown-item autoload-button" href="javascript:void(0)" data-category="${field.title}" data-entry="${entry.title}">Autoload</a>`;
          if (navigator.onLine && field.offline) {
            htmlString += '<div class="dropdown-divider"></div>';
            htmlString += `<a class="dropdown-item cache-button" href="javascript:void(0)" data-category="${field.title}" data-entry="${entry.title}">Cache</a>`;
          }
          htmlString += '</div>';
          htmlString += '</div>';
          buttonCount += 1;
          if (buttonCount % 3 === 0) {
            htmlString += '<br>';
          }
        });
        if (navigator.onLine && field.offline) {
          htmlString += '<div class="btn-group">';
          htmlString += `<button class="btn btn-primary btn-custom-main btn-custom-full cache-all-button" data-category="${field.title}">[Cache All]</button>`;
          htmlString += '</div>';
        }
        htmlString += '</div>';
        buttonCount = 0;
      }
    });
  }

  $('#buttons').html(htmlString);
}

function clearOverlays() {
  $('#cache-overlay').hide();
  $('#bar-text').hide();
  $('#bar-back').hide();
  $('#bar-load').hide();
  $('#bar-load').html('');
  $('#bar-load').width('0%');
  $('#exploit-overlay').hide();
  $('#exploit-message').hide();
  $('#exploit-message').html('');
  $('#exploit-loader').hide();
}

function showCaching() {
  $('#cache-overlay').show();
  $('#bar-text').show();
  $('#bar-back').show();
  $('#bar-load').show();
}

function showLoader() {
  $('#exploit-overlay').show();
  $('#exploit-loader').show();
  $('#exploit-message').show();
}

// eslint-disable-next-line no-unused-vars
function exploitDone(message) {
  $('#exploit-loader').hide();
  $('#exploit-message').html(message);
  // TODO: Test this on PS4
  const pattern = /^https?:\/\/.*\/exploits\/(.*)\/(.*)\/index.html$/;
  const match = pattern.exec($('#ifr')[0].contentDocument.URL);
  const category = decodeURIComponent(match[1]);
  const entry = decodeURIComponent(match[2]);

  if (window.Menu[category].entries[entry].reload === true) {
    sleep(3000).then(() => {
      clearFrame();
      clearOverlays();
    });
  }
}

function displayHome() {
  $(document).prop('title', 'Category Selection | Exploit Host by Al Azif');
  window.history.pushState('', document.title, `${window.location.pathname}${window.location.search}`);

  $('#title').text('Category Selection');
  $('#header').text('Categories');

  $('.category-page').hide();
  $('#category-buttons').show();
}

function displayCategory(category) {
  $(document).prop('title', 'Exploit Selection | Exploit Host by Al Azif');
  window.history.pushState(null, null, `#${category}`);

  $('#title').text('Exploit Selection');
  $('#header').text(category);

  $('#category-buttons').hide();
  $('.category-page').hide();

  $('.category-page').each((i, field) => {
    if (String($(field).data('category')) === String(category)) {
      $(field).show();
    }
  });
}

// eslint-disable-next-line no-unused-vars
function cacheInterface(callback) {
  if (callback === 'ondownloading') {
    $('#bar-text').html('Caching...');
    showCaching();
  } else if (callback === 'ondownloading-theme') {
    $('#bar-text').html('Caching Theme...');
    showCaching();
  } else {
    clearFrame();
    clearOverlays();
    if (callback === 'oncached') {
      myAlert('success', 'Cached Successfully');
    } else if (callback === 'onupdateready') {
      myAlert('success', 'Cache updated');
    } else if (callback === 'onnoupdate') {
      myAlert('primary', 'No update available');
    } else if (callback === 'onerror') {
      myAlert('danger', 'Error caching resources');
    } else if (callback === 'onobsolete') {
      myAlert('danger', 'Manifest returned a 404, cache was deleted');
    } else if (callback === 'oncached-theme' || callback === 'onnoupdate-theme') {
      // Do Nothing
    } else if (callback === 'onupdateready-theme') {
      setCookie('newsDate', 0);
      window.location.reload(true);
    } else if (callback === 'onerror-theme') {
      myAlert('danger', 'Error caching theme resources');
    } else if (callback === 'onobsolete-theme') {
      myAlert('danger', 'Manifest returned a 404, theme cache was deleted');
    } else if (callback === 'onerror-appcache') {
      myAlert('danger', 'Browser does not support AppCache, nothing was cached');
    }
  }
}

// eslint-disable-next-line no-unused-vars
function cacheProgress(percent) {
  $('#bar-load').width(`${percent}%`);
  $('#bar-load').html(`${percent}%`);
}

function exploitLoader(category, entry) {
  showLoader();
  loadEntry(category, entry, window.Menu[category].entries[entry].redirect);
}

function myAutoload(category, entry) {
  setAutoload(category, entry);

  if (navigator.onLine && window.Menu[category].offline
    && window.Menu[category].entries[entry].offline) {
    cacheEntry(category, entry);
    // TODO: myLoader should be called only the cache is complete
    // myLoader(category, entry);
  } else {
    exploitLoader(category, entry);
  }
}

function categoryMeta(category) {
  let uaMatch;
  let lang;
  let modalBody;
  let notes;
  let meta = window.Menu[category];

  const backHash = decodeURIComponent(window.location.hash.substring(1));

  if (typeof meta === 'undefined') {
    myAlert('danger', 'Unable to retrieve metadata');
    return;
  }

  // TODO: Object.assign is not reconized on PS4
  meta = Object.assign({
    title: '',
    device: '',
    firmware: '',
    user_agents: '',
    notes: {
      default: '',
    },
  }, meta);

  if (checkUAMatch(meta.user_agents)) {
    uaMatch = '<span class="badge badge-success">Match</span>';
  } else {
    uaMatch = '<span class="badge badge-danger">Mismatch</span>';
  }

  lang = getCookie('language');
  if (typeof lang !== 'string') {
    setCookie('language', 'en');
    lang = 'en';
  }

  if (typeof meta.notes[lang] === 'string') {
    notes = meta.notes[lang];
  } else {
    notes = meta.notes.default;
  }

  modalBody = `<div class="row"><div class="col-sm-3">Device:</div><div class="col-sm-9">${meta.device}</div></div>`;
  modalBody += `<div class="row"><div class="col-sm-3">Firmware:</div><div class="col-sm-9">${meta.firmware}</div></div>`;
  modalBody += `<div class="row"><div class="col-sm-3">UA Match?:</div><div class="col-sm-9">${uaMatch}</div></div>`;
  modalBody += `<div class="row"><div class="col-sm-3">Notes:</div><div class="col-sm-9">${notes}</div></div>`;

  $('#meta-modal-title').html(meta.title);
  $('#meta-modal-body').html(modalBody);

  $('#meta-modal').on('hide.bs.modal', () => {
    if (backHash === '') {
      displayHome();
    } else {
      displayCategory(backHash);
    }
  });

  window.history.pushState(null, null, '#meta');
  $('#meta-modal').modal('show');
}

function entryMeta(category, entry) {
  let lang;
  let description;
  let modalBody;
  let meta = window.Menu[category].entries[entry];

  const backHash = decodeURIComponent(window.location.hash.substring(1));

  if (typeof meta === 'undefined') {
    myAlert('danger', 'Unable to retrieve metadata');
    return;
  }

  // TODO: Object.assign is not reconized on PS4
  meta = Object.assign({
    title: '',
    version: '',
    updated: '',
    device: '',
    firmware: '',
    description: {
      default: '',
    },
    author: '',
    url: '',
  }, meta);

  lang = getCookie('language');
  if (typeof lang !== 'string') {
    setCookie('language', 'en');
    lang = 'en';
  }

  if (typeof meta.description[lang] === 'string') {
    description = meta.description[lang];
  } else {
    description = meta.description.default;
  }

  modalBody = `<div class="row"><div class="col-sm-3">Version:</div><div class="col-sm-9">${meta.version}</div></div>`;
  modalBody += `<div class="row"><div class="col-sm-3">Updated:</div><div class="col-sm-9">${meta.updated}</div></div>`;
  modalBody += `<div class="row"><div class="col-sm-3">Device:</div><div class="col-sm-9">${meta.device}</div></div>`;
  modalBody += `<div class="row"><div class="col-sm-3">Firmware:</div><div class="col-sm-9">${meta.firmware}</div></div>`;
  modalBody += `<div class="row"><div class="col-sm-3">Description:</div><div class="col-sm-9">${description}</div></div>`;
  modalBody += `<div class="row"><div class="col-sm-3">Author(s):</div><div class="col-sm-9">${meta.author}</div></div>`;
  modalBody += `<div class="row"><div class="col-sm-3">URL:</div><div class="col-sm-9"><a href="${meta.url}">${meta.url}</a></div></div>`;

  $('#meta-modal-title').html(meta.title);
  $('#meta-modal-body').html(modalBody);

  $('#meta-modal').on('hide.bs.modal', () => {
    if (backHash === '') {
      displayHome();
    } else {
      displayCategory(backHash);
    }
  });

  window.history.pushState(null, null, '#meta');
  $('#meta-modal').modal('show');
}

function settingsModal() {
  if ($('#settings-modal').is(':visible')) {
    return;
  }

  $('.modal').modal('hide');

  const backHash = decodeURIComponent(window.location.hash.substring(1));

  getSettingsAsync((settingsArray) => {
    if (settingsArray && !('error' in settingsArray)) {
      const currentLanguage = getCookie('language');
      const currentTheme = getCookie('theme');

      const languageKeys = Object.keys(settingsArray.languages);
      $('#language-selection').html('');
      for (let i = 0; i < languageKeys.length; i += 1) {
        $('#language-selection').append(`<option value="${settingsArray.languages[languageKeys[i]]}">${languageKeys[i]}</option>`);
      }

      try {
        $(`#language-selection option[value='${currentLanguage}']`).attr('selected', true);
      } catch (e) { /* Purposely Left Blank */ }

      $('#theme-selection').html('');
      for (let i = 0; i < settingsArray.themes.length; i += 1) {
        $('#theme-selection').append(`<option value="${settingsArray.themes[i]}">${settingsArray.themes[i]}</option>`);
      }

      try {
        $(`#theme-selection option[value='${currentTheme}']`).attr('selected', true);
      } catch (e) { /* Purposely Left Blank */ }
    }

    if (navigator.onLine) {
      $('#custom-theme-options').show();
    } else {
      $('#custom-theme-options').hide();
    }

    const backgroundURL = getStorage('background-image-url');
    const cssURL = getStorage('custom-css-url');
    const jsURL = getStorage('custom-js-url');

    if (backgroundURL) {
      $('#background-image-url').val(backgroundURL);
    }
    if (cssURL) {
      $('#custom-css-url').val(cssURL);
    }
    if (jsURL) {
      $('#custom-js-url').val(jsURL);
    }

    $('#settings-modal').on('hide.bs.modal', () => {
      if (backHash === '') {
        displayHome();
      } else {
        displayCategory(backHash);
      }
    });

    $('#submit-language').on('click', () => {
      setCookie('language', $('#language-selection').val());
    });

    $('#submit-theme').on('click', () => {
      if (getCookie('theme') !== $('#theme-selection').val()) {
        setCookie('theme', $('#theme-selection').val());
        window.location.reload();
      }
    });

    $('#submit-background-image').on('click', () => {
      if ($('#background-image-url').val() === '') {
        $('body').css('background-image', '');
        deleteStorage('background-image-url');
        deleteStorage('background-image');
      } else { // TODO: Check if input is a valid URL
        imageToBackground($('#background-image-url').val(), (backgroundData) => {
          setStorage('background-image-url', $('#background-image-url').val(), 'string');
          setStorage('background-image', backgroundData, 'string');
          $('body').css('background-image', `url('${backgroundData}')`);
        }, false);
      }
    });

    $('#submit-css').on('click', () => {
      $('style').remove();
      if ($('#custom-css-url').val() === '') {
        deleteStorage('custom-css-url');
        deleteStorage('custom-css');
      } else { // TODO: Check if input is a valid URL
        getDataAsync($('#custom-css-url').val(), (cssData) => {
          setStorage('custom-css', cssData, 'string');
          setStorage('custom-css-url', $('#custom-css-url').val(), 'string');
          $('head').append(`<style>${cssData}</style>`);
        }, true);
      }
    });

    $('#submit-js').on('click', () => {
      if ($('#custom-js-url').val() === '') {
        deleteStorage('custom-js-url');
        deleteStorage('custom-js');
        window.location.reload();
      } else { // TODO: Check if input is a valid URL
        getDataAsync($('#custom-js-url').val(), (jsData) => {
          setStorage('custom-js', jsData, 'string');
          setStorage('custom-js-url', $('#custom-js-url').val(), 'string');
          window.location.reload();
        }, true);
      }
    });

    $('#reload-page').on('click', () => {
      window.location.reload();
    });

    $('#reset-defaults').on('click', () => {
      deleteStorage('background-image-url');
      deleteStorage('background-image');
      deleteStorage('custom-css-url');
      deleteStorage('custom-css');
      deleteStorage('custom-js-url');
      deleteStorage('custom-js');
      window.location.reload();
    });

    window.history.pushState(null, null, '#settings');
    $('#settings-modal').modal('show');
  });
}

function randomBackground() {
  // TODO: Holiday images for certain dates
  const imageArray = [
    'url("./themes/Default/images/0.png")',
    'url("./themes/Default/images/1.png")',
    'url("./themes/Default/images/2.png")',
    'url("./themes/Default/images/3.png")',
    'url("./themes/Default/images/4.png")',
  ];

  $('body').css('background-image', imageArray[Math.floor(Math.random() * imageArray.length)]);
}

// --- On Ready ---------------------------------------------------------------

$(() => {
  // randomBackground();
  const customBackgroundImage = getStorage('background-image');
  const customCSS = getStorage('custom-css');
  const customJS = getStorage('custom-js');

  if (customBackgroundImage) {
    $('body').css('background-image', `url(${customBackgroundImage})`);
  }
  if (customCSS) {
    $('head').append(`<style>${customCSS}</style>`);
  }
  if (customJS) {
    $('head').append(`<script>${customJS}</script>`);
  }

  // Blank out iFrame
  $('#ifr').attr('src', './blank.html');

  // Cache theme
  if (navigator.onLine) {
    // TODO: This is not blocking so it's possible the autoload could trigger before caching changes is completed
    cacheTheme();
  }

  // Build window.Menu
  getMenuAsync((response) => {
    if (response !== undefined) {
      window.Menu = response;

      // Display new alert if online.
      if (navigator.onLine) {
        newsAlert();
      }

      // Try to autoload if autoload cookie is present
      const autoload = autoloadCookie(window.Menu);
      if (autoload) {
        const autoloadCategory = autoload.split('/')[0];
        const autoloadEntry = autoload.split('/')[1];

        if (!navigator.onLine) {
          if (!window.Menu[autoloadCategory].offline
            || !window.Menu[autoloadCategory].entries[autoloadEntry].offline) {
            myAlert('danger', 'Could not autoload, payload is online only (Currently running from cache)');
          }
        } else {
          myAutoload(autoloadCategory, autoloadEntry);
        }
      }

      // Build HTML
      buildHTML();

      // Load preselected page based on URI hash and redirect to category if there is only one.
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
      }

      // --- Handlers ---------------------------------------------------------

      $(window).on('keyup', (event) => {
        if (event.keyCode === 27) {
          clearFrame();
          clearOverlays();
          // TODO: This is broken on PS4
          const backHash = decodeURIComponent(window.location.hash.substr(1));
          if (backHash === 'meta' || backHash === 'settings') {
            $('.modal').modal('hide');
          } else if (backHash !== '') {
            displayHome();
          }
        } else if (event.keyCode === 117) {
          $('#settings-modal').modal('show');
        }
      });

      $('.category-button').on('click', (event) => {
        displayCategory($(event.target).data('category'));
      });

      $('.entry-button').on('click', (event) => {
        exploitLoader($(event.target).data('category'), $(event.target).data('entry'));
      });

      $('.about-button').on('click', (event) => {
        if ($(event.target).data('entry')) {
          entryMeta($(event.target).data('category'), $(event.target).data('entry'));
        } else {
          categoryMeta($(event.target).data('category'));
        }
      });

      $('.autoload-button').on('click', (event) => {
        myAutoload($(event.target).data('category'), $(event.target).data('entry'));
      });

      $('.cache-button').on('click', (event) => {
        if ($(event.target).data('entry')) {
          cacheEntry($(event.target).data('category'), $(event.target).data('entry'));
        } else {
          cacheCategory($(event.target).data('category'));
        }
      });

      $('.cache-all-button').on('click', (event) => {
        if ($(event.target).data('category')) {
          cacheCategory($(event.target).data('category'));
        } else {
          cacheAll();
        }
      });

      $('#settings-modal').on('show.bs.modal', settingsModal);
    } else {
      $(document).prop('title', 'Menu Error | Exploit Host by Al Azif');

      $('#title').text('Menu Error');
      $('#header').text('');

      let htmlString = '<div class="btn-group">';
      htmlString += '<button class="btn btn-primary btn-custom-main btn-custom-full">Unable to Retrieve Menu</button>';
      htmlString += '</div>';
      $('#buttons').html(htmlString);
    }
  });
});
/*
Copyright (c) 2017-2019 Al Azif, https://github.com/Al-Azif/ps4-exploit-host

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
