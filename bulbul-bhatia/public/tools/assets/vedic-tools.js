// UI wiring for the Vedic astrology tool pages: reads the existing
// name/DOB/TOB/place (or date/place, or two-person) forms, resolves place
// names to coordinates via the vendored city database, runs the real
// calculations in vedic-engine.js, and renders results. Registered on
// window.VedicCalculators, consumed by tools-shared.js's boot dispatcher.
//
// Load order required, after assets/vendor/astronomy.min.js,
// assets/vendor/cities.js and assets/vedic-engine.js, before this file:
//   assets/tools-data.js
//   assets/tools-shared.js
//   assets/vedic-tools.js
//
// Not implemented here (left as the "development preview" notice rather
// than shipping a guessed classical formula): ashtakavarga-calculator,
// shadbala-calculator, yogini-dasha-calculator. Their reference tables are
// intricate enough that a wrong transcription would look plausible but be
// incorrect, which matters more for astrology content than most bugs.
;(function () {
  'use strict'

  function V() { return window.VedicEngine }
  function TS() { return window.ToolsShared }
  function byId(id) { return document.getElementById(id) }
  function esc(s) { return TS().esc(s) }
  function locale() { return TS().getLocale() }
  function pick(en, hi) { return locale() === 'hi' ? hi : en }

  // ---------- Formatting (locale-neutral: Latin numerals, always legible) ----------

  function fmtTime(date, tz) {
    return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz }).format(date)
  }
  function fmtDate(date, tz) {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: tz }).format(date)
  }
  function fmtDateTime(date, tz) {
    return fmtDate(date, tz) + ', ' + fmtTime(date, tz)
  }

  // ---------- City autocomplete ----------

  var COMMON_TIMEZONES = [
    'Asia/Kolkata', 'Asia/Kathmandu', 'Asia/Dhaka', 'Asia/Karachi', 'Asia/Colombo', 'Asia/Dubai',
    'Asia/Singapore', 'Asia/Tokyo', 'Asia/Shanghai', 'Europe/London', 'Europe/Berlin', 'Europe/Moscow',
    'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Toronto', 'Australia/Sydney', 'Pacific/Auckland',
  ]

  function ensureTzDatalist() {
    var existing = byId('vedic-tz-list')
    if (existing) return
    var dl = document.createElement('datalist')
    dl.id = 'vedic-tz-list'
    dl.innerHTML = COMMON_TIMEZONES.map(function (tz) { return '<option value="' + esc(tz) + '"></option>' }).join('')
    document.body.appendChild(dl)
  }

  function isValidTimezone(tz) {
    if (!tz) return false
    try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true } catch (e) { return false }
  }

  function attachCitySearch(input) {
    if (!input || input._citySearchAttached) return
    input._citySearchAttached = true
    input.setAttribute('autocomplete', 'off')
    ensureTzDatalist()
    var wrap = input.parentElement
    wrap.classList.add('city-suggest-wrap')
    var list = document.createElement('div')
    list.className = 'city-suggest-list'
    list.style.display = 'none'
    wrap.appendChild(list)

    input.addEventListener('input', function () {
      input._city = null
      var matches = V().searchCities(input.value, 8)
      if (!matches.length) { list.style.display = 'none'; return }
      list.innerHTML = matches.map(function (c, i) {
        return '<div class="city-suggest-item" data-i="' + i + '">' + esc(V().cityLabel(c)) + '</div>'
      }).join('')
      list.style.display = 'block'
      Array.prototype.forEach.call(list.querySelectorAll('.city-suggest-item'), function (el, i) {
        el.addEventListener('mousedown', function (e) {
          e.preventDefault()
          input.value = V().cityLabel(matches[i])
          input._city = matches[i]
          input._manualCoords = null
          list.style.display = 'none'
        })
      })
    })
    input.addEventListener('blur', function () {
      setTimeout(function () { list.style.display = 'none' }, 150)
    })

    // Manual latitude/longitude fallback — the bundled city list only
    // covers ~5,600 larger world cities, so smaller towns (most of a state
    // like Madhya Pradesh, for example) won't be found by name. This lets
    // anyone enter their exact coordinates instead.
    var toggle = document.createElement('button')
    toggle.type = 'button'
    toggle.className = 'city-manual-toggle'
    toggle.setAttribute('data-en', "Can't find your city? Enter coordinates manually")
    toggle.setAttribute('data-hi', 'अपना शहर नहीं मिल रहा? निर्देशांक स्वयं दर्ज करें')
    toggle.textContent = pick("Can't find your city? Enter coordinates manually", 'अपना शहर नहीं मिल रहा? निर्देशांक स्वयं दर्ज करें')

    var panel = document.createElement('div')
    panel.className = 'city-manual-fields'
    panel.style.display = 'none'
    panel.innerHTML =
      '<div class="city-manual-row">' +
      '<input type="number" step="any" min="-90" max="90" class="city-manual-lat" data-en-placeholder="Latitude" data-hi-placeholder="अक्षांश" placeholder="' + esc(pick('Latitude', 'अक्षांश')) + '" />' +
      '<input type="number" step="any" min="-180" max="180" class="city-manual-lng" data-en-placeholder="Longitude" data-hi-placeholder="देशांतर" placeholder="' + esc(pick('Longitude', 'देशांतर')) + '" />' +
      '<input type="text" class="city-manual-tz" list="vedic-tz-list" value="Asia/Kolkata" data-en-placeholder="Timezone" data-hi-placeholder="समय क्षेत्र" placeholder="' + esc(pick('Timezone', 'समय क्षेत्र')) + '" />' +
      '</div>' +
      '<p class="error city-manual-error" style="display:none;" data-en="Enter a valid latitude (-90 to 90), longitude (-180 to 180) and timezone." data-hi="मान्य अक्षांश (-90 से 90), देशांतर (-180 से 180) एवं समय क्षेत्र दर्ज करें।">' + esc(pick('Enter a valid latitude (-90 to 90), longitude (-180 to 180) and timezone.', 'मान्य अक्षांश (-90 से 90), देशांतर (-180 से 180) एवं समय क्षेत्र दर्ज करें।')) + '</p>'

    toggle.addEventListener('click', function () {
      var showing = panel.style.display !== 'none'
      panel.style.display = showing ? 'none' : 'block'
    })

    wrap.appendChild(toggle)
    wrap.appendChild(panel)

    var latInput = panel.querySelector('.city-manual-lat')
    var lngInput = panel.querySelector('.city-manual-lng')
    var tzInput = panel.querySelector('.city-manual-tz')
    var manualErr = panel.querySelector('.city-manual-error')

    function syncManualCoords() {
      var lat = parseFloat(latInput.value)
      var lng = parseFloat(lngInput.value)
      var tz = tzInput.value.trim()
      var hasAnyInput = latInput.value !== '' || lngInput.value !== ''
      if (!hasAnyInput) { input._manualCoords = null; manualErr.style.display = 'none'; return }
      var valid = isFinite(lat) && lat >= -90 && lat <= 90 && isFinite(lng) && lng >= -180 && lng <= 180 && isValidTimezone(tz)
      if (valid) {
        input._manualCoords = { lat: lat, lng: lng, timezone: tz }
        input._city = null
        manualErr.style.display = 'none'
      } else {
        input._manualCoords = null
        manualErr.style.display = 'block'
      }
    }
    ;[latInput, lngInput, tzInput].forEach(function (el) {
      el.addEventListener('input', syncManualCoords)
      el.addEventListener('change', syncManualCoords)
    })
  }

  function resolveCity(input) {
    if (input._manualCoords) {
      var m = input._manualCoords
      return { city: input.value.trim() || pick('Custom location', 'कस्टम स्थान'), province: '', country: '', lat: m.lat, lng: m.lng, timezone: m.timezone }
    }
    if (input._city) return input._city
    var exact = V().findCityExact(input.value)
    if (exact) { input._city = exact; return exact }
    return null
  }

  // ---------- Form readers ----------

  function readPersonForm(prefix) {
    var nameInput = byId(prefix + '-name')
    var dobInput = byId(prefix + '-dob')
    var tobInput = byId(prefix + '-tob')
    var pobInput = byId(prefix + '-pob')
    var nameErr = byId(prefix + '-name-error')
    var dobErr = byId(prefix + '-dob-error')
    var pobErr = byId(prefix + '-pob-error')
    var ok = true

    if (nameInput) {
      if (!nameInput.value.trim()) { TS().showFieldError(nameInput, nameErr); ok = false }
      else TS().clearFieldError(nameInput, nameErr)
    }
    if (!dobInput.value) { TS().showFieldError(dobInput, dobErr); ok = false }
    else TS().clearFieldError(dobInput, dobErr)

    var city = resolveCity(pobInput)
    if (!city) { TS().showFieldError(pobInput, pobErr); ok = false }
    else TS().clearFieldError(pobInput, pobErr)

    if (!ok) return null
    return {
      name: nameInput ? nameInput.value.trim() : '',
      dobStr: dobInput.value,
      tobStr: tobInput && tobInput.value ? tobInput.value : null,
      hasTob: !!(tobInput && tobInput.value),
      city: city,
    }
  }

  function readDatePlaceForm() {
    var dateInput = byId('arch-date')
    var placeInput = byId('arch-place')
    var dateErr = byId('arch-date-error')
    var placeErr = byId('arch-place-error')
    var ok = true
    if (!dateInput.value) { TS().showFieldError(dateInput, dateErr); ok = false }
    else TS().clearFieldError(dateInput, dateErr)
    var city = resolveCity(placeInput)
    if (!city) { TS().showFieldError(placeInput, placeErr); ok = false }
    else TS().clearFieldError(placeInput, placeErr)
    if (!ok) return null
    return { dateStr: dateInput.value, city: city }
  }

  function wireCityInputsOnLoad() {
    ;['arch-pob', 'arch-place', 'p1-pob', 'p2-pob'].forEach(function (id) {
      var el = byId(id)
      if (el) attachCitySearch(el)
    })
  }

  function wireSubmit(handler) {
    var form = byId('calc-form')
    if (!form) return
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      handler()
    })
  }

  // ---------- Chart helpers ----------

  function buildPersonChart(person) {
    var utcDate = V().zonedTimeToUtc(person.dobStr, person.tobStr || '12:00', person.city.timezone)
    var t = V().MakeTime(utcDate)
    var chart = V().buildChart(t)
    var ascSidereal = V().ascendantSidereal(t, person.city.lat, person.city.lng)
    var ascIdx = V().rashiIndex(ascSidereal)
    var houses = V().housesFromAscendant(ascIdx, chart.grahas)
    return { t: t, birthDate: utcDate, chart: chart, ascSidereal: ascSidereal, ascIdx: ascIdx, houses: houses }
  }

  function timeCaveat(hasTob) {
    if (hasTob) return ''
    return '<p class="vedic-caveat" data-en="Time of birth was not provided, so 12:00 noon was used as a default. Moon/planet positions stay accurate for the date; the Ascendant and house placements are time-sensitive and may shift with your exact birth time." data-hi="जन्म समय नहीं दिया गया, इसलिए डिफ़ॉल्ट रूप से दोपहर 12:00 बजे का उपयोग किया गया। चंद्र/ग्रह स्थिति तिथि के अनुसार सटीक रहती है; लग्न एवं भाव समय के प्रति संवेदनशील हैं और सटीक जन्म समय से बदल सकते हैं।">' + esc(pick(
      'Time of birth was not provided, so 12:00 noon was used as a default. Moon/planet positions stay accurate for the date; the Ascendant and house placements are time-sensitive and may shift with your exact birth time.',
      'जन्म समय नहीं दिया गया, इसलिए डिफ़ॉल्ट रूप से दोपहर 12:00 बजे का उपयोग किया गया। चंद्र/ग्रह स्थिति तिथि के अनुसार सटीक रहती है; लग्न एवं भाव समय के प्रति संवेदनशील हैं और सटीक जन्म समय से बदल सकते हैं।'
    )) + '</p>'
  }

  // ---------- Rendering helpers ----------

  function bl(en, hi) { return '<span data-en="' + esc(en) + '" data-hi="' + esc(hi) + '">' + esc(pick(en, hi)) + '</span>' }

  function heroBlock(eyebrowEn, eyebrowHi, value, subEn, subHi) {
    return '<div class="vedic-hero"><span class="eyebrow" data-en="' + esc(eyebrowEn) + '" data-hi="' + esc(eyebrowHi) + '">' + esc(pick(eyebrowEn, eyebrowHi)) + '</span>' +
      '<div class="vedic-hero-value">' + esc(value) + '</div>' +
      (subEn ? (subHi !== undefined
        ? '<div class="vedic-hero-sub" data-en="' + esc(subEn) + '" data-hi="' + esc(subHi) + '">' + esc(pick(subEn, subHi)) + '</div>'
        : '<div class="vedic-hero-sub">' + esc(subEn) + '</div>') : '') +
      '</div>'
  }

  function card(titleEn, titleHi, innerHtml) {
    return '<div class="card vedic-card"><h3 data-en="' + esc(titleEn) + '" data-hi="' + esc(titleHi) + '">' + esc(pick(titleEn, titleHi)) + '</h3>' + innerHtml + '</div>'
  }

  function table(headers, rows) {
    var thead = '<tr>' + headers.map(function (h) {
      return '<th data-en="' + esc(h[0]) + '" data-hi="' + esc(h[1]) + '">' + esc(pick(h[0], h[1])) + '</th>'
    }).join('') + '</tr>'
    var tbody = rows.map(function (r) {
      return '<tr class="' + (r.cls || '') + '">' + r.cells.map(function (c) { return '<td>' + c + '</td>' }).join('') + '</tr>'
    }).join('')
    return '<div class="vedic-table-scroll"><table class="vedic-table"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table></div>'
  }

  function chip(cls, en, hi) {
    return '<span class="chip ' + cls + '" data-en="' + esc(en) + '" data-hi="' + esc(hi) + '">' + esc(pick(en, hi)) + '</span>'
  }

  function ctaBlock() {
    return '<div class="card" style="text-align:center;">' +
      '<p style="font-weight:600;margin-bottom:0.25rem;" data-en="Want Deeper Guidance?" data-hi="गहन मार्गदर्शन चाहिए?">' + esc(pick('Want Deeper Guidance?', 'गहन मार्गदर्शन चाहिए?')) + '</p>' +
      '<p class="vedic-caveat" data-en="This tool uses standard astronomical calculation (Lahiri ayanamsa) for general guidance. For a personalized, in-depth reading, consult Bulbul Bhatia." data-hi="यह टूल सामान्य मार्गदर्शन हेतु मानक खगोलीय गणना (लाहिड़ी अयनांश) का उपयोग करता है। व्यक्तिगत, गहन विश्लेषण हेतु बुलबुल भाटिया से परामर्श करें।">' + esc(pick('This tool uses standard astronomical calculation (Lahiri ayanamsa) for general guidance. For a personalized, in-depth reading, consult Bulbul Bhatia.', 'यह टूल सामान्य मार्गदर्शन हेतु मानक खगोलीय गणना (लाहिड़ी अयनांश) का उपयोग करता है। व्यक्तिगत, गहन विश्लेषण हेतु बुलबुल भाटिया से परामर्श करें।')) + '</p>' +
      '<div class="actions" style="display:flex;flex-wrap:wrap;justify-content:center;gap:0.75rem;margin-top:1rem;">' +
      '<a class="btn-primary btn-sm" href="../book?type=astrology" data-en="Book Astrology Consultation" data-hi="ज्योतिष परामर्श बुक करें">' + esc(pick('Book Astrology Consultation', 'ज्योतिष परामर्श बुक करें')) + '</a>' +
      '</div></div>'
  }

  // Rashi/Nakshatra/Graha proper nouns are shown in both languages together
  // (e.g. "Capricorn / मकर") so the name stays correct even if the viewer
  // toggles language after a result has already rendered.
  function rashiName(idx) { var r = V().RASHIS[idx]; return r.en + ' / ' + r.hi }
  function nakName(idx) { var n = V().nakshatraInfo(idx); return n.en + ' / ' + n.hi }
  function grahaName(key) { var g = V().GRAHA_LABEL[key]; return g.en + ' / ' + g.hi }

  function grahaTableRows(chart) {
    return V().GRAHA_ORDER.map(function (key) {
      var g = chart.grahas[key]
      return {
        cells: [
          esc(grahaName(key)) + (g.retrograde ? ' ' + chip('chip-retro', 'R', 'व') : ''),
          esc(rashiName(g.rashiIdx)),
          g.siderealLon.toFixed(2) + '&deg;',
          esc(nakName(g.nakshatraIdx)) + ' (' + g.pada + ')',
        ],
      }
    })
  }

  function setResult(html) {
    byId('result').innerHTML = html
    TS().applyLocale()
  }

  // =====================================================================
  // GROUP A — date + place tools
  // =====================================================================

  function withDayContext(fn) {
    return function () {
      wireCityInputsOnLoad()
      wireSubmit(function () {
        var f = readDatePlaceForm()
        if (!f) return
        var dw = V().dayWindow(f.dateStr, f.city.lat, f.city.lng, f.city.timezone)
        if (!dw.sunrise || !dw.sunset) {
          setResult('<div class="card"><p>' + esc(pick('Could not compute sunrise/sunset for this date and place.', 'इस तिथि एवं स्थान के लिए सूर्योदय/सूर्यास्त की गणना नहीं हो सकी।')) + '</p></div>')
          return
        }
        var weekdayIdx = new Date(f.dateStr + 'T12:00:00').getDay()
        var tSunrise = V().MakeTime(dw.sunrise)
        fn({ f: f, dw: dw, weekdayIdx: weekdayIdx, tSunrise: tSunrise })
      })
    }
  }

  var CALC = {}

  CALC['sunrise-sunset-calculator'] = withDayContext(function (ctx) {
    var html = heroBlock('Sunrise & Sunset', 'सूर्योदय एवं सूर्यास्त',
      fmtTime(ctx.dw.sunrise, ctx.f.city.timezone) + ' – ' + fmtTime(ctx.dw.sunset, ctx.f.city.timezone),
      V().cityLabel(ctx.f.city) + ' • ' + fmtDate(ctx.dw.sunrise, ctx.f.city.timezone))
    html += table([['Event', 'घटना'], ['Time', 'समय']], [
      { cells: [bl('Sunrise', 'सूर्योदय'), fmtTime(ctx.dw.sunrise, ctx.f.city.timezone)] },
      { cells: [bl('Sunset', 'सूर्यास्त'), fmtTime(ctx.dw.sunset, ctx.f.city.timezone)] },
      ctx.dw.nextSunrise ? { cells: [bl('Next Sunrise', 'अगला सूर्योदय'), fmtTime(ctx.dw.nextSunrise, ctx.f.city.timezone)] } : null,
    ].filter(Boolean))
    setResult(card('Today', 'आज', html) + ctaBlock())
  })

  CALC['tithi-calculator'] = withDayContext(function (ctx) {
    var tithi = V().tithiInfo(ctx.tSunrise)
    var html = heroBlock('Tithi (at sunrise)', 'तिथि (सूर्योदय पर)', tithi.number + ' — ' + pick(tithi.en, tithi.hi),
      pick(tithi.paksha + ' Paksha', tithi.pakshaHi + ' पक्ष') + ' • ' + V().cityLabel(ctx.f.city))
    html += table([['Detail', 'विवरण'], ['Value', 'मान']], [
      { cells: [bl('Tithi', 'तिथि'), bl(tithi.en, tithi.hi)] },
      { cells: [bl('Paksha', 'पक्ष'), bl(tithi.paksha, tithi.pakshaHi)] },
      { cells: [bl('Reference time', 'संदर्भ समय'), fmtTime(ctx.dw.sunrise, ctx.f.city.timezone) + ' (' + bl('sunrise', 'सूर्योदय') + ')'] },
    ])
    setResult(card('Panchang', 'पंचांग', html) + ctaBlock())
  })

  CALC['nakshatra-today'] = withDayContext(function (ctx) {
    var lon = V().siderealLongitudes(ctx.tSunrise).moon
    var nIdx = V().nakshatraIndex(lon)
    var pada = V().nakshatraPada(lon)
    var html = heroBlock("Today's Nakshatra", 'आज का नक्षत्र', nakName(nIdx), pick('Pada', 'पद') + ' ' + pada + ' • ' + V().cityLabel(ctx.f.city))
    html += table([['Detail', 'विवरण'], ['Value', 'मान']], [
      { cells: [bl('Nakshatra', 'नक्षत्र'), esc(nakName(nIdx))] },
      { cells: [bl('Pada', 'पद'), String(pada)] },
      { cells: [bl('Moon sign (Rashi)', 'चंद्र राशि'), esc(rashiName(V().rashiIndex(lon)))] },
      { cells: [bl('Reference time', 'संदर्भ समय'), fmtTime(ctx.dw.sunrise, ctx.f.city.timezone) + ' (' + bl('sunrise', 'सूर्योदय') + ')'] },
    ])
    setResult(card('Panchang', 'पंचांग', html) + ctaBlock())
  })

  CALC['panchang'] = withDayContext(function (ctx) {
    var tithi = V().tithiInfo(ctx.tSunrise)
    var karana = V().karanaInfo(ctx.tSunrise)
    var yoga = V().yogaInfo(ctx.tSunrise)
    var moonLon = V().siderealLongitudes(ctx.tSunrise).moon
    var nIdx = V().nakshatraIndex(moonLon)
    var weekday = V().WEEKDAYS[ctx.weekdayIdx]
    var html = heroBlock('Daily Panchang', 'दैनिक पंचांग', fmtDate(ctx.dw.sunrise, ctx.f.city.timezone), V().cityLabel(ctx.f.city))
    html += table([['Element', 'तत्व'], ['Value', 'मान']], [
      { cells: [bl('Weekday (Vaar)', 'वार'), bl(weekday.en, weekday.hi)] },
      { cells: [bl('Tithi', 'तिथि'), String(tithi.number) + ' ' + bl(tithi.en, tithi.hi) + ' (' + bl(tithi.paksha, tithi.pakshaHi) + ')'] },
      { cells: [bl('Nakshatra', 'नक्षत्र'), esc(nakName(nIdx))] },
      { cells: [bl('Yoga', 'योग'), bl(yoga.en, yoga.hi)] },
      { cells: [bl('Karana', 'करण'), bl(karana.en, karana.hi)] },
      { cells: [bl('Sunrise', 'सूर्योदय'), fmtTime(ctx.dw.sunrise, ctx.f.city.timezone)] },
      { cells: [bl('Sunset', 'सूर्यास्त'), fmtTime(ctx.dw.sunset, ctx.f.city.timezone)] },
    ])
    setResult(card('Panchang', 'पंचांग', html) + ctaBlock())
  })

  CALC['rahu-kaal'] = withDayContext(function (ctx) {
    var rk = V().rahuKaal(ctx.dw.sunrise, ctx.dw.sunset, ctx.weekdayIdx)
    var ym = V().yamaganda(ctx.dw.sunrise, ctx.dw.sunset, ctx.weekdayIdx)
    var gk = V().gulikaKaal(ctx.dw.sunrise, ctx.dw.sunset, ctx.weekdayIdx)
    var html = heroBlock('Rahu Kaal', 'राहु काल', fmtTime(rk.start, ctx.f.city.timezone) + ' – ' + fmtTime(rk.end, ctx.f.city.timezone), V().cityLabel(ctx.f.city) + ' • ' + fmtDate(ctx.dw.sunrise, ctx.f.city.timezone))
    html += table([['Inauspicious period', 'अशुभ काल'], ['Time', 'समय']], [
      { cells: [bl('Rahu Kaal', 'राहु काल'), fmtTime(rk.start, ctx.f.city.timezone) + ' – ' + fmtTime(rk.end, ctx.f.city.timezone)] },
      { cells: [bl('Yamaganda', 'यमगंड'), fmtTime(ym.start, ctx.f.city.timezone) + ' – ' + fmtTime(ym.end, ctx.f.city.timezone)] },
      { cells: [bl('Gulika Kaal', 'गुलिक काल'), fmtTime(gk.start, ctx.f.city.timezone) + ' – ' + fmtTime(gk.end, ctx.f.city.timezone)] },
    ])
    setResult(card('Today', 'आज', html) + ctaBlock())
  })

  CALC['abhijit-muhurat'] = withDayContext(function (ctx) {
    var am = V().abhijitMuhurat(ctx.dw.sunrise, ctx.dw.sunset)
    var html = heroBlock('Abhijit Muhurat', 'अभिजीत मुहूर्त', fmtTime(am.start, ctx.f.city.timezone) + ' – ' + fmtTime(am.end, ctx.f.city.timezone), V().cityLabel(ctx.f.city) + ' • ' + fmtDate(ctx.dw.sunrise, ctx.f.city.timezone))
    html += '<div class="card"><p class="vedic-caveat" data-en="Abhijit Muhurat is the 8th of the day\'s 15 muhurtas, straddling local apparent noon — traditionally considered auspicious for most activities, except on Wednesdays." data-hi="अभिजीत मुहूर्त दिन के 15 मुहूर्तों में से 8वां है, जो स्थानीय मध्याह्न के आसपास होता है — परंपरागत रूप से बुधवार को छोड़कर अधिकांश कार्यों के लिए शुभ माना जाता है।">' + esc(pick("Abhijit Muhurat is the 8th of the day's 15 muhurtas, straddling local apparent noon — traditionally considered auspicious for most activities, except on Wednesdays.", 'अभिजीत मुहूर्त दिन के 15 मुहूर्तों में से 8वां है, जो स्थानीय मध्याह्न के आसपास होता है — परंपरागत रूप से बुधवार को छोड़कर अधिकांश कार्यों के लिए शुभ माना जाता है।')) + '</p></div>'
    setResult(html + ctaBlock())
  })

  CALC['choghadiya'] = withDayContext(function (ctx) {
    var seg = V().choghadiyaSegments(ctx.dw.sunrise, ctx.dw.sunset, ctx.dw.nextSunrise, ctx.weekdayIdx)
    var now = new Date()
    function rows(list) {
      return list.map(function (s) {
        var isNow = now >= s.start && now < s.end
        var natureCls = s.label.nature === 'auspicious' ? 'chip-good' : s.label.nature === 'inauspicious' ? 'chip-bad' : 'chip-neutral'
        return {
          cls: isNow ? 'current-row' : '',
          cells: [
            fmtTime(s.start, ctx.f.city.timezone) + ' – ' + fmtTime(s.end, ctx.f.city.timezone),
            bl(s.label.en, s.label.hi) + ' ' + chip(natureCls, s.label.nature, s.label.nature === 'auspicious' ? 'शुभ' : s.label.nature === 'inauspicious' ? 'अशुभ' : 'सामान्य'),
          ],
        }
      })
    }
    var html = heroBlock('Choghadiya', 'चौघड़िया', V().cityLabel(ctx.f.city), fmtDate(ctx.dw.sunrise, ctx.f.city.timezone))
    html += card('Day Choghadiya', 'दिन चौघड़िया', table([['Time', 'समय'], ['Period', 'अवधि']], rows(seg.day)))
    if (seg.night.length) html += card('Night Choghadiya', 'रात्रि चौघड़िया', table([['Time', 'समय'], ['Period', 'अवधि']], rows(seg.night)))
    setResult(html + ctaBlock())
  })

  CALC['auspicious-muhurat-finder'] = withDayContext(function (ctx) {
    var am = V().abhijitMuhurat(ctx.dw.sunrise, ctx.dw.sunset)
    var seg = V().choghadiyaSegments(ctx.dw.sunrise, ctx.dw.sunset, ctx.dw.nextSunrise, ctx.weekdayIdx)
    var goodDay = seg.day.filter(function (s) { return s.label.nature === 'auspicious' })
    var rk = V().rahuKaal(ctx.dw.sunrise, ctx.dw.sunset, ctx.weekdayIdx)
    var html = heroBlock('Auspicious Windows', 'शुभ समय', fmtDate(ctx.dw.sunrise, ctx.f.city.timezone), V().cityLabel(ctx.f.city))
    var rows = [{ cells: [bl('Abhijit Muhurat', 'अभिजीत मुहूर्त'), fmtTime(am.start, ctx.f.city.timezone) + ' – ' + fmtTime(am.end, ctx.f.city.timezone)] }]
    goodDay.forEach(function (s) {
      rows.push({ cells: [bl(s.label.en, s.label.hi) + ' ' + bl('Choghadiya', 'चौघड़िया'), fmtTime(s.start, ctx.f.city.timezone) + ' – ' + fmtTime(s.end, ctx.f.city.timezone)] })
    })
    html += card('Recommended Windows', 'अनुशंसित समय', table([['Window', 'समय'], ['Time', 'अवधि']], rows))
    html += card('Avoid', 'बचें', table([['Period', 'काल'], ['Time', 'समय']], [
      { cells: [bl('Rahu Kaal', 'राहु काल'), fmtTime(rk.start, ctx.f.city.timezone) + ' – ' + fmtTime(rk.end, ctx.f.city.timezone)] },
    ]))
    setResult(html + ctaBlock())
  })

  // =====================================================================
  // GROUP B — single birth-detail tools
  // =====================================================================

  function withPersonContext(fn) {
    return function () {
      wireCityInputsOnLoad()
      wireSubmit(function () {
        var person = readPersonForm('arch')
        if (!person) return
        var ctx = buildPersonChart(person)
        ctx.person = person
        fn(ctx)
      })
    }
  }

  CALC['kundli-calculator'] = withPersonContext(function (ctx) {
    var html = heroBlock('Birth Chart Summary', 'जन्म कुंडली सारांश', rashiName(ctx.chart.grahas.moon.rashiIdx) + ' ' + pick('Moon', 'चंद्र'),
      ctx.person.name ? ctx.person.name : '')
    html += timeCaveat(ctx.person.hasTob)
    html += card('Key Points', 'मुख्य बिंदु', table([['Point', 'बिंदु'], ['Value', 'मान']], [
      { cells: [bl('Ascendant (Lagna)', 'लग्न'), esc(rashiName(ctx.ascIdx))] },
      { cells: [bl('Moon Sign (Rashi)', 'चंद्र राशि'), esc(rashiName(ctx.chart.grahas.moon.rashiIdx))] },
      { cells: [bl('Nakshatra', 'नक्षत्र'), esc(nakName(ctx.chart.grahas.moon.nakshatraIdx)) + ' (' + pick('Pada', 'पद') + ' ' + ctx.chart.grahas.moon.pada + ')'] },
      { cells: [bl('Sun Sign', 'सूर्य राशि'), esc(rashiName(ctx.chart.grahas.sun.rashiIdx))] },
    ]))
    html += card('Planetary Positions', 'ग्रह स्थिति', table([['Graha', 'ग्रह'], ['Rashi', 'राशि'], ['Longitude', 'देशांतर'], ['Nakshatra (Pada)', 'नक्षत्र (पद)']], grahaTableRows(ctx.chart)))
    html += card('Houses (Bhava)', 'भाव', table([['House', 'भाव'], ['Rashi', 'राशि'], ['Occupants', 'ग्रह']], houseRows(ctx)))
    setResult(html + ctaBlock())
  })

  CALC['rashi-calculator'] = withPersonContext(function (ctx) {
    var m = ctx.chart.grahas.moon
    var html = heroBlock('Your Moon Sign (Rashi)', 'आपकी चंद्र राशि', rashiName(m.rashiIdx), pick('Lord', 'स्वामी') + ': ' + grahaName(V().RASHIS[m.rashiIdx].lord))
    html += timeCaveat(ctx.person.hasTob)
    html += card('Details', 'विवरण', table([['Detail', 'विवरण'], ['Value', 'मान']], [
      { cells: [bl('Rashi', 'राशि'), esc(rashiName(m.rashiIdx))] },
      { cells: [bl('Sidereal longitude', 'सायन देशांतर'), m.siderealLon.toFixed(2) + '&deg;'] },
      { cells: [bl('Element', 'तत्व'), esc(V().RASHIS[m.rashiIdx].mode)] },
    ]))
    setResult(html + ctaBlock())
  })

  CALC['nakshatra-calculator'] = withPersonContext(function (ctx) {
    var m = ctx.chart.grahas.moon
    var html = heroBlock('Your Birth Nakshatra', 'आपका जन्म नक्षत्र', nakName(m.nakshatraIdx), pick('Pada', 'पद') + ' ' + m.pada + ' • ' + pick('Lord', 'स्वामी') + ': ' + grahaName(m.nakshatra.lord))
    html += timeCaveat(ctx.person.hasTob)
    html += card('Details', 'विवरण', table([['Detail', 'विवरण'], ['Value', 'मान']], [
      { cells: [bl('Nakshatra', 'नक्षत्र'), esc(nakName(m.nakshatraIdx))] },
      { cells: [bl('Pada', 'पद'), String(m.pada)] },
      { cells: [bl('Ruling planet', 'स्वामी ग्रह'), esc(grahaName(m.nakshatra.lord))] },
      { cells: [bl('Moon sign', 'चंद्र राशि'), esc(rashiName(m.rashiIdx))] },
    ]))
    setResult(html + ctaBlock())
  })

  CALC['pada-calculator'] = CALC['nakshatra-calculator']

  CALC['lagna-calculator'] = withPersonContext(function (ctx) {
    var html = heroBlock('Your Ascendant (Lagna)', 'आपका लग्न', rashiName(ctx.ascIdx), pick('Lord', 'स्वामी') + ': ' + grahaName(V().RASHIS[ctx.ascIdx].lord))
    html += timeCaveat(ctx.person.hasTob)
    html += card('Details', 'विवरण', table([['Detail', 'विवरण'], ['Value', 'मान']], [
      { cells: [bl('Ascendant sign', 'लग्न राशि'), esc(rashiName(ctx.ascIdx))] },
      { cells: [bl('Sidereal longitude', 'सायन देशांतर'), ctx.ascSidereal.toFixed(2) + '&deg;'] },
      { cells: [bl('Nakshatra of Lagna', 'लग्न नक्षत्र'), esc(nakName(V().nakshatraIndex(ctx.ascSidereal)))] },
    ]))
    setResult(html + ctaBlock())
  })

  function houseRows(ctx) {
    var byHouse = {}
    Object.keys(ctx.houses).forEach(function (key) {
      var h = ctx.houses[key]
      byHouse[h] = byHouse[h] || []
      byHouse[h].push(grahaName(key))
    })
    var rows = []
    for (var h = 1; h <= 12; h++) {
      var rIdx = (ctx.ascIdx + h - 1) % 12
      rows.push({ cells: [String(h), esc(rashiName(rIdx)), esc((byHouse[h] || []).join(', ') || '—')] })
    }
    return rows
  }

  CALC['bhava-calculator'] = withPersonContext(function (ctx) {
    var html = heroBlock('Houses (Bhava Chart)', 'भाव कुंडली', pick('Ascendant', 'लग्न') + ': ' + rashiName(ctx.ascIdx), '')
    html += timeCaveat(ctx.person.hasTob)
    html += card('12 Houses', '12 भाव', table([['House', 'भाव'], ['Rashi', 'राशि'], ['Occupants', 'ग्रह']], houseRows(ctx)))
    setResult(html + ctaBlock())
  })

  CALC['navamsa-calculator'] = withPersonContext(function (ctx) {
    var rows = V().GRAHA_ORDER.map(function (key) {
      var g = ctx.chart.grahas[key]
      return { cells: [esc(grahaName(key)), esc(rashiName(g.rashiIdx)), esc(rashiName(g.navamsaIdx))] }
    })
    var html = heroBlock('Navamsa (D9) Chart', 'नवमांश (D9) कुंडली', pick('Moon in Navamsa', 'नवमांश में चंद्र') + ': ' + rashiName(ctx.chart.grahas.moon.navamsaIdx), '')
    html += timeCaveat(ctx.person.hasTob)
    html += card('Rashi → Navamsa', 'राशि → नवमांश', table([['Graha', 'ग्रह'], ['Rashi (D1)', 'राशि (D1)'], ['Navamsa (D9)', 'नवमांश (D9)']], rows))
    setResult(html + ctaBlock())
  })

  CALC['planetary-positions-calculator'] = withPersonContext(function (ctx) {
    var html = heroBlock('Planetary Positions', 'ग्रह स्थिति', fmtDateTime(ctx.birthDate, ctx.person.city.timezone), V().cityLabel(ctx.person.city))
    html += timeCaveat(ctx.person.hasTob)
    html += card('Sidereal (Lahiri) Positions', 'सायन (लाहिड़ी) स्थिति', table([['Graha', 'ग्रह'], ['Rashi', 'राशि'], ['Longitude', 'देशांतर'], ['Nakshatra (Pada)', 'नक्षत्र (पद)']], grahaTableRows(ctx.chart)))
    setResult(html + ctaBlock())
  })

  // ---- Dasha ----

  function dashaTableRows(sequence, atDate) {
    var now = atDate || new Date()
    return sequence.map(function (p) {
      var isNow = now >= p.start && now < p.end
      return { cls: isNow ? 'current-row' : '', cells: [esc(grahaName(p.lord)), fmtDate(p.start), fmtDate(p.end)] }
    })
  }

  function dashaSummary(ctx) {
    var moonLon = ctx.chart.grahas.moon.siderealLon
    var seq = V().vimshottariSequence(moonLon, ctx.birthDate, 2)
    var current = V().currentPeriod(seq, new Date())
    var antar = V().antardashaSequence(current)
    var currentAntar = V().currentPeriod(antar, new Date())
    return { seq: seq, current: current, antar: antar, currentAntar: currentAntar }
  }

  CALC['vimshottari-dasha-calculator'] = withPersonContext(function (ctx) {
    var d = dashaSummary(ctx)
    var html = heroBlock('Current Mahadasha', 'वर्तमान महादशा', grahaName(d.current.lord), fmtDate(d.current.start) + ' – ' + fmtDate(d.current.end))
    html += timeCaveat(ctx.person.hasTob)
    html += card('Mahadasha Timeline', 'महादशा समयरेखा', table([['Lord', 'स्वामी'], ['Start', 'प्रारंभ'], ['End', 'समाप्ति']], dashaTableRows(d.seq)))
    html += card('Current Antardasha', 'वर्तमान अंतर्दशा', table([['Lord', 'स्वामी'], ['Start', 'प्रारंभ'], ['End', 'समाप्ति']], dashaTableRows(d.antar)))
    setResult(html + ctaBlock())
  })

  CALC['mahadasha-calculator'] = withPersonContext(function (ctx) {
    var d = dashaSummary(ctx)
    var html = heroBlock('Mahadasha Timeline', 'महादशा समयरेखा', grahaName(d.current.lord) + ' ' + pick('(current)', '(वर्तमान)'), '')
    html += timeCaveat(ctx.person.hasTob)
    html += card('Full Sequence', 'पूर्ण क्रम', table([['Lord', 'स्वामी'], ['Start', 'प्रारंभ'], ['End', 'समाप्ति']], dashaTableRows(d.seq)))
    setResult(html + ctaBlock())
  })

  CALC['antardasha-calculator'] = withPersonContext(function (ctx) {
    var d = dashaSummary(ctx)
    var html = heroBlock('Current Antardasha', 'वर्तमान अंतर्दशा', grahaName(d.currentAntar.lord), pick('within', 'के अंतर्गत') + ' ' + grahaName(d.current.lord) + ' ' + pick('Mahadasha', 'महादशा'))
    html += timeCaveat(ctx.person.hasTob)
    html += card(grahaName(d.current.lord) + ' — ' + pick('Antardasha Sequence', 'अंतर्दशा क्रम'), '', table([['Lord', 'स्वामी'], ['Start', 'प्रारंभ'], ['End', 'समाप्ति']], dashaTableRows(d.antar)))
    setResult(html + ctaBlock())
  })

  // ---- Dosha checks ----

  CALC['manglik-dosha'] = withPersonContext(function (ctx) {
    var m = V().manglikCheck(ctx.chart.grahas, ctx.ascIdx)
    var isManglik = m.fromLagna || m.fromMoon
    var html = heroBlock('Manglik (Kuja) Dosha', 'मांगलिक (कुज) दोष', isManglik ? pick('Present', 'उपस्थित') : pick('Not Present', 'अनुपस्थित'), '')
    html += timeCaveat(ctx.person.hasTob)
    html += card('Details', 'विवरण', table([['Check', 'जांच'], ['Mars House', 'मंगल भाव'], ['Result', 'परिणाम']], [
      { cells: [bl('From Lagna', 'लग्न से'), String(m.houseFromLagna), m.fromLagna ? chip('chip-bad', 'Manglik', 'मांगलिक') : chip('chip-good', 'Clear', 'शुद्ध')] },
      { cells: [bl('From Moon', 'चंद्र से'), String(m.houseFromMoon), m.fromMoon ? chip('chip-bad', 'Manglik', 'मांगलिक') : chip('chip-good', 'Clear', 'शुद्ध')] },
    ]))
    html += '<div class="card"><p class="vedic-caveat" data-en="Mars placed in houses 1, 2, 4, 7, 8 or 12 (from Lagna or Moon) is classically considered Manglik. Many traditions also weigh cancellation rules (e.g. Mars in its own or exalted sign) — discuss these nuances with an astrologer before drawing conclusions." data-hi="लग्न या चंद्र से 1, 2, 4, 7, 8 अथवा 12वें भाव में मंगल होने को परंपरागत रूप से मांगलिक माना जाता है। कई परंपराओं में निरसन नियम (जैसे मंगल का स्वराशि या उच्च राशि में होना) भी माने जाते हैं — निष्कर्ष से पहले ज्योतिषी से चर्चा करें।">' + esc(pick('Mars placed in houses 1, 2, 4, 7, 8 or 12 (from Lagna or Moon) is classically considered Manglik. Many traditions also weigh cancellation rules (e.g. Mars in its own or exalted sign) — discuss these nuances with an astrologer before drawing conclusions.', 'लग्न या चंद्र से 1, 2, 4, 7, 8 अथवा 12वें भाव में मंगल होने को परंपरागत रूप से मांगलिक माना जाता है। कई परंपराओं में निरसन नियम (जैसे मंगल का स्वराशि या उच्च राशि में होना) भी माने जाते हैं — निष्कर्ष से पहले ज्योतिषी से चर्चा करें।')) + '</p></div>'
    setResult(html + ctaBlock())
  })

  CALC['kaal-sarp-dosha-calculator'] = withPersonContext(function (ctx) {
    var k = V().kaalSarpCheck(ctx.chart.grahas)
    var html = heroBlock('Kaal Sarp Dosha', 'काल सर्प दोष', k.present ? pick('Present', 'उपस्थित') : pick('Not Present', 'अनुपस्थित'), '')
    html += timeCaveat(ctx.person.hasTob)
    html += card('Rahu–Ketu Axis', 'राहु–केतु अक्ष', table([['Graha', 'ग्रह'], ['Rashi', 'राशि']], [
      { cells: [esc(grahaName('rahu')), esc(rashiName(ctx.chart.grahas.rahu.rashiIdx))] },
      { cells: [esc(grahaName('ketu')), esc(rashiName(ctx.chart.grahas.ketu.rashiIdx))] },
    ]))
    html += '<div class="card"><p class="vedic-caveat" data-en="Kaal Sarp Dosha is classically present when all seven classical planets (Sun through Saturn) fall on one side of the Rahu-Ketu axis." data-hi="काल सर्प दोष तब माना जाता है जब सभी सात शास्त्रीय ग्रह (सूर्य से शनि तक) राहु-केतु अक्ष के एक ही ओर स्थित हों।">' + esc(pick('Kaal Sarp Dosha is classically present when all seven classical planets (Sun through Saturn) fall on one side of the Rahu-Ketu axis.', 'काल सर्प दोष तब माना जाता है जब सभी सात शास्त्रीय ग्रह (सूर्य से शनि तक) राहु-केतु अक्ष के एक ही ओर स्थित हों।')) + '</p></div>'
    setResult(html + ctaBlock())
  })

  CALC['rahu-ketu-dosha-calculator'] = withPersonContext(function (ctx) {
    var rahu = ctx.chart.grahas.rahu, ketu = ctx.chart.grahas.ketu
    var houseRahu = ctx.houses.rahu, houseKetu = ctx.houses.ketu
    var html = heroBlock('Rahu–Ketu Placement', 'राहु–केतु स्थिति', rashiName(rahu.rashiIdx) + ' / ' + rashiName(ketu.rashiIdx), pick('Houses', 'भाव') + ' ' + houseRahu + ' & ' + houseKetu)
    html += timeCaveat(ctx.person.hasTob)
    html += card('Details', 'विवरण', table([['Graha', 'ग्रह'], ['Rashi', 'राशि'], ['House', 'भाव'], ['Nakshatra', 'नक्षत्र']], [
      { cells: [esc(grahaName('rahu')), esc(rashiName(rahu.rashiIdx)), String(houseRahu), esc(nakName(rahu.nakshatraIdx))] },
      { cells: [esc(grahaName('ketu')), esc(rashiName(ketu.rashiIdx)), String(houseKetu), esc(nakName(ketu.nakshatraIdx))] },
    ]))
    var kaalSarp = V().kaalSarpCheck(ctx.chart.grahas)
    html += card('Kaal Sarp Check', 'काल सर्प जांच', '<p>' + (kaalSarp.present ? chip('chip-bad', 'Present', 'उपस्थित') : chip('chip-good', 'Not Present', 'अनुपस्थित')) + '</p>')
    setResult(html + ctaBlock())
  })

  // ---- Strength / dignity ----

  var CLASSICAL_PLANETS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']
  var DIGNITY_LABEL = {
    exalted: { en: 'Exalted', hi: 'उच्च', cls: 'chip-good' },
    own: { en: 'Own Sign', hi: 'स्वराशि', cls: 'chip-good' },
    friend: { en: 'Friendly Sign', hi: 'मित्र राशि', cls: 'chip-neutral' },
    neutral: { en: 'Neutral Sign', hi: 'सम राशि', cls: 'chip-neutral' },
    enemy: { en: 'Enemy Sign', hi: 'शत्रु राशि', cls: 'chip-bad' },
    debilitated: { en: 'Debilitated', hi: 'नीच', cls: 'chip-bad' },
  }

  CALC['planet-strength-calculator'] = withPersonContext(function (ctx) {
    var rows = CLASSICAL_PLANETS.map(function (key) {
      var g = ctx.chart.grahas[key]
      var dignity = V().planetDignity(key, g.rashiIdx)
      var d = DIGNITY_LABEL[dignity]
      return { cells: [esc(grahaName(key)), esc(rashiName(g.rashiIdx)), chip(d.cls, d.en, d.hi)] }
    })
    var html = heroBlock('Planetary Strength (Dignity)', 'ग्रह बल (गरिमा)', '', '')
    html += timeCaveat(ctx.person.hasTob)
    html += card('Sign Dignity', 'राशि गरिमा', table([['Graha', 'ग्रह'], ['Rashi', 'राशि'], ['Dignity', 'गरिमा']], rows))
    html += '<div class="card"><p class="vedic-caveat" data-en="This shows positional dignity (exaltation, own sign, friendly/neutral/enemy sign, debilitation) — a simplified, well-established indicator of planetary strength. A full Shadbala (six-fold strength) score also weighs directional, temporal and motional strength; for that level of detail, consult Bulbul Bhatia." data-hi="यह स्थिति-आधारित गरिमा (उच्च, स्वराशि, मित्र/सम/शत्रु राशि, नीच) दर्शाता है — ग्रह बल का एक सरल, सुस्थापित संकेतक। पूर्ण षड्बल (छह-गुना बल) दिशा, काल एवं गति बल को भी जोड़ता है; इस स्तर के विवरण हेतु बुलबुल भाटिया से परामर्श करें।">' + esc(pick('This shows positional dignity (exaltation, own sign, friendly/neutral/enemy sign, debilitation) — a simplified, well-established indicator of planetary strength. A full Shadbala (six-fold strength) score also weighs directional, temporal and motional strength; for that level of detail, consult Bulbul Bhatia.', 'यह स्थिति-आधारित गरिमा (उच्च, स्वराशि, मित्र/सम/शत्रु राशि, नीच) दर्शाता है — ग्रह बल का एक सरल, सुस्थापित संकेतक। पूर्ण षड्बल (छह-गुना बल) दिशा, काल एवं गति बल को भी जोड़ता है; इस स्तर के विवरण हेतु बुलबुल भाटिया से परामर्श करें।')) + '</p></div>'
    setResult(html + ctaBlock())
  })

  // ---- Transit / Gochar ----

  function currentChart() {
    var t = V().MakeTime(new Date())
    return V().buildChart(t)
  }

  CALC['gochar-transit-calculator'] = withPersonContext(function (ctx) {
    var moonRashi = ctx.chart.grahas.moon.rashiIdx
    var transit = currentChart()
    var rows = V().GRAHA_ORDER.map(function (key) {
      var g = transit.grahas[key]
      var houseFromMoon = ((g.rashiIdx - moonRashi + 12) % 12) + 1
      return { cells: [esc(grahaName(key)), esc(rashiName(g.rashiIdx)), String(houseFromMoon)] }
    })
    var html = heroBlock('Current Transits (Gochar)', 'वर्तमान गोचर', pick('Natal Moon Sign', 'जन्म चंद्र राशि') + ': ' + rashiName(moonRashi), fmtDate(new Date()))
    html += timeCaveat(ctx.person.hasTob)
    html += card('Transiting Planets', 'गोचर ग्रह', table([['Graha', 'ग्रह'], ['Current Rashi', 'वर्तमान राशि'], ['House from Moon', 'चंद्र से भाव']], rows))
    setResult(html + ctaBlock())
  })

  function transitPredictionTool(planetKey, titleEn, titleHi, effectsByHouse) {
    return withPersonContext(function (ctx) {
      var moonRashi = ctx.chart.grahas.moon.rashiIdx
      var transit = currentChart()
      var g = transit.grahas[planetKey]
      var house = ((g.rashiIdx - moonRashi + 12) % 12) + 1
      var effect = effectsByHouse[house]
      var html = heroBlock(titleEn, titleHi, rashiName(g.rashiIdx), pick('House ' + house + ' from your Moon', 'चंद्र से भाव ' + house))
      html += timeCaveat(ctx.person.hasTob)
      html += card('Current Position', 'वर्तमान स्थिति', table([['Detail', 'विवरण'], ['Value', 'मान']], [
        { cells: [bl('Transiting sign', 'गोचर राशि'), esc(rashiName(g.rashiIdx))] },
        { cells: [bl('House from natal Moon', 'जन्म चंद्र से भाव'), String(house)] },
        { cells: [bl('Retrograde', 'वक्री'), g.retrograde ? bl('Yes', 'हां') : bl('No', 'नहीं')] },
      ]))
      html += card('General Guidance', 'सामान्य मार्गदर्शन', '<p style="font-size:0.875rem;line-height:1.6;" data-en="' + esc(effect.en) + '" data-hi="' + esc(effect.hi) + '">' + esc(pick(effect.en, effect.hi)) + '</p>')
      setResult(html + ctaBlock())
    })
  }

  var JUPITER_HOUSE_EFFECTS = {
    1: { en: 'A favourable period for confidence, visibility and new beginnings.', hi: 'आत्मविश्वास, प्रतिष्ठा एवं नई शुरुआत के लिए अनुकूल समय।' },
    2: { en: 'Supportive for finances, family and speech — a good time to save and plan.', hi: 'वित्त, परिवार एवं वाणी के लिए सहायक — बचत एवं योजना के लिए अच्छा समय।' },
    3: { en: 'Encourages courage, communication and short journeys.', hi: 'साहस, संवाद एवं छोटी यात्राओं को प्रोत्साहित करता है।' },
    4: { en: 'Favourable for home, property and emotional comfort.', hi: 'घर, संपत्ति एवं भावनात्मक संतोष के लिए अनुकूल।' },
    5: { en: 'Good for learning, creativity, romance and children-related matters.', hi: 'शिक्षा, रचनात्मकता, प्रेम एवं संतान संबंधी मामलों के लिए अच्छा।' },
    6: { en: 'A period to focus on health, service and resolving disputes.', hi: 'स्वास्थ्य, सेवा एवं विवाद समाधान पर ध्यान देने का समय।' },
    7: { en: 'Favourable for partnerships, marriage and business relationships.', hi: 'साझेदारी, विवाह एवं व्यावसायिक संबंधों के लिए अनुकूल।' },
    8: { en: 'A transformative, introspective period — avoid major risks.', hi: 'परिवर्तनकारी, आत्मनिरीक्षण का समय — बड़े जोखिमों से बचें।' },
    9: { en: 'Classically one of the most favourable transits — luck, wisdom and higher learning.', hi: 'परंपरागत रूप से सबसे शुभ गोचरों में से एक — भाग्य, ज्ञान एवं उच्च शिक्षा।' },
    10: { en: 'Supportive for career growth and public recognition.', hi: 'करियर विकास एवं सार्वजनिक पहचान के लिए सहायक।' },
    11: { en: 'Classically favourable for gains, income and fulfilment of wishes.', hi: 'परंपरागत रूप से लाभ, आय एवं इच्छापूर्ति के लिए शुभ।' },
    12: { en: 'A period for rest, spirituality and closing old chapters.', hi: 'विश्राम, आध्यात्मिकता एवं पुराने अध्यायों को समाप्त करने का समय।' },
  }
  var SATURN_HOUSE_EFFECTS = {
    1: { en: 'Sade Sati-adjacent period — discipline and responsibility come into focus; pace yourself.', hi: 'साढ़े साती से जुड़ा समय — अनुशासन एवं जिम्मेदारी पर ध्यान केंद्रित होता है; गति संतुलित रखें।' },
    2: { en: 'Calls for financial discipline and careful speech.', hi: 'वित्तीय अनुशासन एवं सोच-समझकर बोलने की आवश्यकता।' },
    3: { en: 'Rewards sustained effort, courage and hard work.', hi: 'निरंतर प्रयास, साहस एवं परिश्रम का प्रतिफल देता है।' },
    4: { en: 'A period to tend to home and family responsibilities patiently.', hi: 'घर एवं पारिवारिक जिम्मेदारियों पर धैर्यपूर्वक ध्यान देने का समय।' },
    5: { en: 'Encourages disciplined study and careful decisions in romance.', hi: 'अनुशासित अध्ययन एवं प्रेम संबंधी निर्णयों में सावधानी को प्रोत्साहित करता है।' },
    6: { en: 'Favourable for overcoming obstacles and disciplined health routines.', hi: 'बाधाओं पर विजय एवं अनुशासित स्वास्थ्य दिनचर्या के लिए अनुकूल।' },
    7: { en: 'Tests and matures partnerships — patience and commitment matter.', hi: 'साझेदारियों की परीक्षा लेता है — धैर्य एवं प्रतिबद्धता महत्वपूर्ण।' },
    8: { en: 'A slow, introspective period; avoid major new commitments.', hi: 'धीमा, आत्मनिरीक्षण का समय; बड़ी नई प्रतिबद्धताओं से बचें।' },
    9: { en: 'Calls for patience with belief systems, higher study and long journeys.', hi: 'विश्वास प्रणाली, उच्च अध्ययन एवं लंबी यात्राओं में धैर्य आवश्यक।' },
    10: { en: 'Classic period of career-building through sustained, disciplined effort.', hi: 'निरंतर, अनुशासित प्रयास से करियर निर्माण का पारंपरिक समय।' },
    11: { en: 'Gains arrive steadily rather than suddenly — stay consistent.', hi: 'लाभ अचानक नहीं, धीरे-धीरे मिलता है — निरंतरता बनाए रखें।' },
    12: { en: 'Sade Sati-adjacent period — a time for rest, closure and reduced expenses.', hi: 'साढ़े साती से जुड़ा समय — विश्राम, समापन एवं व्यय कम करने का समय।' },
  }
  var NODE_HOUSE_EFFECTS = {
    1: { en: 'Brings a shift in self-image and identity; avoid impulsive reinvention.', hi: 'आत्म-छवि एवं पहचान में बदलाव लाता है; आवेगपूर्ण बदलाव से बचें।' },
    2: { en: 'Unsettles finances and family speech patterns — double-check commitments.', hi: 'वित्त एवं पारिवारिक संवाद में अस्थिरता — प्रतिबद्धताओं की दोबारा जांच करें।' },
    3: { en: 'Sharpens ambition and communication, sometimes restlessly.', hi: 'महत्वाकांक्षा एवं संवाद को तीव्र करता है, कभी-कभी बेचैनी के साथ।' },
    4: { en: 'Unsettles home and emotional foundations temporarily.', hi: 'घर एवं भावनात्मक आधार को अस्थायी रूप से अस्थिर करता है।' },
    5: { en: 'Brings unconventional ideas around romance, creativity and children.', hi: 'प्रेम, रचनात्मकता एवं संतान को लेकर अपरंपरागत विचार लाता है।' },
    6: { en: 'Good for tackling hidden health or work issues, but watch for anxiety.', hi: 'छुपी स्वास्थ्य या कार्य समस्याओं से निपटने के लिए अच्छा, पर चिंता से सावधान रहें।' },
    7: { en: 'Brings intense, sometimes unconventional partnership dynamics.', hi: 'तीव्र, कभी-कभी अपरंपरागत साझेदारी गतिशीलता लाता है।' },
    8: { en: 'A period of deep transformation and unexpected change.', hi: 'गहन परिवर्तन एवं अप्रत्याशित बदलाव का समय।' },
    9: { en: 'Shakes up belief systems and long-held plans — stay flexible.', hi: 'विश्वास प्रणाली एवं पुरानी योजनाओं को हिला देता है — लचीला रहें।' },
    10: { en: 'Brings sudden shifts in career direction or public image.', hi: 'करियर दिशा या सार्वजनिक छवि में अचानक बदलाव लाता है।' },
    11: { en: 'Unconventional gains and shifting social circles.', hi: 'अपरंपरागत लाभ एवं बदलते सामाजिक दायरे।' },
    12: { en: 'A period for inner work, closure and letting go.', hi: 'आंतरिक कार्य, समापन एवं त्याग का समय।' },
  }

  CALC['jupiter-transit-prediction'] = transitPredictionTool('jupiter', 'Jupiter Transit', 'गुरु गोचर', JUPITER_HOUSE_EFFECTS)
  CALC['saturn-transit-prediction'] = transitPredictionTool('saturn', 'Saturn Transit', 'शनि गोचर', SATURN_HOUSE_EFFECTS)
  CALC['rahu-ketu-transit-prediction'] = transitPredictionTool('rahu', 'Rahu Transit', 'राहु गोचर', NODE_HOUSE_EFFECTS)

  CALC['sade-sati-calculator'] = withPersonContext(function (ctx) {
    var moonRashi = ctx.chart.grahas.moon.rashiIdx
    var transit = currentChart()
    var saturnRashi = transit.grahas.saturn.rashiIdx
    var house = ((saturnRashi - moonRashi + 12) % 12) + 1
    var inSadeSati = house === 12 || house === 1 || house === 2
    var phase = house === 12 ? pick('Rising phase (12th from Moon)', 'आरंभिक चरण (चंद्र से 12वां)')
      : house === 1 ? pick('Peak phase (over Moon sign)', 'चरम चरण (चंद्र राशि पर)')
      : house === 2 ? pick('Setting phase (2nd from Moon)', 'समापन चरण (चंद्र से दूसरा)')
      : ''
    var html = heroBlock('Sade Sati Status', 'साढ़े साती स्थिति', inSadeSati ? pick('Active', 'सक्रिय') : pick('Not Active', 'निष्क्रिय'), phase)
    html += timeCaveat(ctx.person.hasTob)
    html += card('Details', 'विवरण', table([['Detail', 'विवरण'], ['Value', 'मान']], [
      { cells: [bl('Natal Moon Sign', 'जन्म चंद्र राशि'), esc(rashiName(moonRashi))] },
      { cells: [bl('Current Saturn Sign', 'वर्तमान शनि राशि'), esc(rashiName(saturnRashi))] },
      { cells: [bl('House from Moon', 'चंद्र से भाव'), String(house)] },
    ]))
    html += '<div class="card"><p class="vedic-caveat" data-en="Sade Sati refers to Saturn transiting the 12th, 1st, and 2nd houses from your natal Moon sign — a roughly 7.5 year cycle occurring a few times in life." data-hi="साढ़े साती का अर्थ है जन्म चंद्र राशि से 12वें, पहले एवं दूसरे भाव में शनि का गोचर — जीवन में कुछ बार होने वाला लगभग 7.5 वर्ष का चक्र।">' + esc(pick('Sade Sati refers to Saturn transiting the 12th, 1st, and 2nd houses from your natal Moon sign — a roughly 7.5 year cycle occurring a few times in life.', 'साढ़े साती का अर्थ है जन्म चंद्र राशि से 12वें, पहले एवं दूसरे भाव में शनि का गोचर — जीवन में कुछ बार होने वाला लगभग 7.5 वर्ष का चक्र।')) + '</p></div>'
    setResult(html + ctaBlock())
  })

  // ---- Marriage-focused (grounded, non-fabricated indicators) ----

  function marriageIndicators(ctx) {
    var seventhRashi = (ctx.ascIdx + 6) % 12
    var seventhLord = V().RASHIS[seventhRashi].lord
    var d = dashaSummary(ctx)
    var lordIsActive = d.current.lord === seventhLord || d.current.lord === 'venus' || d.current.lord === 'jupiter'
    var transit = currentChart()
    var jupiterHouseFrom7th = ((transit.grahas.jupiter.rashiIdx - seventhRashi + 12) % 12) + 1
    return { seventhRashi: seventhRashi, seventhLord: seventhLord, dasha: d, lordIsActive: lordIsActive, jupiterHouseFrom7th: jupiterHouseFrom7th }
  }

  function marriageTool(titleEn, titleHi) {
    return withPersonContext(function (ctx) {
      var m = marriageIndicators(ctx)
      var html = heroBlock(titleEn, titleHi, pick('7th House Lord', '7वें भाव के स्वामी') + ': ' + grahaName(m.seventhLord), pick('Current Dasha', 'वर्तमान दशा') + ': ' + grahaName(m.dasha.current.lord))
      html += timeCaveat(ctx.person.hasTob)
      html += card('Relevant Indicators', 'संबंधित संकेतक', table([['Indicator', 'संकेतक'], ['Value', 'मान']], [
        { cells: [bl('7th House Sign', '7वें भाव की राशि'), esc(rashiName(m.seventhRashi))] },
        { cells: [bl('7th House Lord', '7वें भाव के स्वामी'), esc(grahaName(m.seventhLord))] },
        { cells: [bl('Current Mahadasha', 'वर्तमान महादशा'), esc(grahaName(m.dasha.current.lord))] },
        { cells: [bl('Current Antardasha', 'वर्तमान अंतर्दशा'), esc(grahaName(m.dasha.currentAntar.lord))] },
        { cells: [bl('7th-lord / Venus / Jupiter period active', '7वें स्वामी / शुक्र / गुरु दशा सक्रिय'), m.lordIsActive ? chip('chip-good', 'Yes', 'हां') : chip('chip-neutral', 'No', 'नहीं')] },
      ]))
      html += '<div class="card"><p class="vedic-caveat" data-en="Marriage timing in classical astrology is judged from several factors together (7th house, its lord, Venus/Jupiter, and running dashas) and needs a full chart reading — this tool surfaces the real, computed factors most relevant to marriage, not a specific predicted date. For a complete reading, book a consultation." data-hi="विवाह का समय शास्त्रीय ज्योतिष में कई कारकों (7वां भाव, उसका स्वामी, शुक्र/गुरु, चल रही दशाएं) को मिलाकर देखा जाता है और इसके लिए पूर्ण कुंडली विश्लेषण आवश्यक है — यह टूल विवाह से जुड़े वास्तविक, गणना किए गए कारक दिखाता है, कोई विशेष भविष्यवाणी तिथि नहीं। पूर्ण विश्लेषण हेतु परामर्श बुक करें।">' + esc(pick('Marriage timing in classical astrology is judged from several factors together (7th house, its lord, Venus/Jupiter, and running dashas) and needs a full chart reading — this tool surfaces the real, computed factors most relevant to marriage, not a specific predicted date. For a complete reading, book a consultation.', 'विवाह का समय शास्त्रीय ज्योतिष में कई कारकों (7वां भाव, उसका स्वामी, शुक्र/गुरु, चल रही दशाएं) को मिलाकर देखा जाता है और इसके लिए पूर्ण कुंडली विश्लेषण आवश्यक है — यह टूल विवाह से जुड़े वास्तविक, गणना किए गए कारक दिखाता है, कोई विशेष भविष्यवाणी तिथि नहीं। पूर्ण विश्लेषण हेतु परामर्श बुक करें।')) + '</p></div>'
      setResult(html + ctaBlock())
    })
  }

  CALC['marriage-prediction-tool'] = marriageTool('Marriage Indicators', 'विवाह संकेतक')
  CALC['marriage-timing-analysis'] = marriageTool('Marriage Timing Analysis', 'विवाह समय विश्लेषण')

  // =====================================================================
  // GROUP C — two-person compatibility tools
  // =====================================================================

  function withCoupleContext(fn) {
    return function () {
      wireCityInputsOnLoad()
      wireSubmit(function () {
        var p1 = readPersonForm('p1')
        var p2 = readPersonForm('p2')
        if (!p1 || !p2) return
        var c1 = buildPersonChart(p1)
        var c2 = buildPersonChart(p2)
        fn({ p1: p1, p2: p2, c1: c1, c2: c2 })
      })
    }
  }

  function compatibilityCore(ctx) {
    var milan = V().ashtakootPartial(ctx.c1.chart.grahas.moon, ctx.c2.chart.grahas.moon)
    var lord1 = V().RASHIS[ctx.c1.chart.grahas.moon.rashiIdx].lord
    var lord2 = V().RASHIS[ctx.c2.chart.grahas.moon.rashiIdx].lord
    return { milan: milan, lord1: lord1, lord2: lord2 }
  }

  function milanCard(comp) {
    var m = comp.milan
    var rows = [
      { cells: [bl('Varna', 'वर्ण'), m.varna.score + ' / ' + m.varna.max] },
      { cells: [bl('Gana', 'गण'), m.gana.score + ' / ' + m.gana.max] },
      { cells: [bl('Bhakoot', 'भकूट'), m.bhakoot.score + ' / ' + m.bhakoot.max + (m.bhakootDosha ? ' ' + chip('chip-bad', 'Dosha', 'दोष') : '')] },
      { cells: [bl('Nadi', 'नाड़ी'), m.nadi.score + ' / ' + m.nadi.max + (m.nadiDosha ? ' ' + chip('chip-bad', 'Dosha', 'दोष') : '')] },
    ]
    var html = card('Guna Milan (Partial)', 'गुण मिलान (आंशिक)', table([['Koota', 'कूट'], ['Score', 'अंक']], rows))
    html += '<div class="card"><p class="vedic-caveat" data-en="This shows 4 of the 8 classical Kootas (Varna, Gana, Bhakoot, Nadi — 22 of 36 total points) computed from real Moon positions. The remaining Kootas (Vashya, Tara, Yoni, Graha Maitri) need additional reference tables and are not yet included — for a complete 36-point Guna Milan, please book a consultation." data-hi="यह 8 शास्त्रीय कूटों में से 4 (वर्ण, गण, भकूट, नाड़ी — कुल 36 में से 22 अंक) वास्तविक चंद्र स्थिति से गणना करके दिखाता है। शेष कूट (वश्य, तारा, योनि, ग्रह मैत्री) हेतु अतिरिक्त संदर्भ तालिकाएं आवश्यक हैं और अभी शामिल नहीं हैं — पूर्ण 36-बिंदु गुण मिलान हेतु कृपया परामर्श बुक करें।">' + esc(pick('This shows 4 of the 8 classical Kootas (Varna, Gana, Bhakoot, Nadi — 22 of 36 total points) computed from real Moon positions. The remaining Kootas (Vashya, Tara, Yoni, Graha Maitri) need additional reference tables and are not yet included — for a complete 36-point Guna Milan, please book a consultation.', 'यह 8 शास्त्रीय कूटों में से 4 (वर्ण, गण, भकूट, नाड़ी — कुल 36 में से 22 अंक) वास्तविक चंद्र स्थिति से गणना करके दिखाता है। शेष कूट (वश्य, तारा, योनि, ग्रह मैत्री) हेतु अतिरिक्त संदर्भ तालिकाएं आवश्यक हैं और अभी शामिल नहीं हैं — पूर्ण 36-बिंदु गुण मिलान हेतु कृपया परामर्श बुक करें।')) + '</p></div>'
    return html
  }

  function personSummaryTable(ctx) {
    return table([['Person', 'व्यक्ति'], ['Moon Sign', 'चंद्र राशि'], ['Nakshatra', 'नक्षत्र']], [
      { cells: [esc(ctx.p1.name || pick('Person 1', 'व्यक्ति 1')), esc(rashiName(ctx.c1.chart.grahas.moon.rashiIdx)), esc(nakName(ctx.c1.chart.grahas.moon.nakshatraIdx))] },
      { cells: [esc(ctx.p2.name || pick('Person 2', 'व्यक्ति 2')), esc(rashiName(ctx.c2.chart.grahas.moon.rashiIdx)), esc(nakName(ctx.c2.chart.grahas.moon.nakshatraIdx))] },
    ])
  }

  CALC['kundli-milan'] = withCoupleContext(function (ctx) {
    var comp = compatibilityCore(ctx)
    var html = heroBlock('Kundli Milan', 'कुंडली मिलान', comp.milan.totalScored + ' / ' + comp.milan.totalMaxScored, pick('(partial score — see note below)', '(आंशिक अंक — नीचे टिप्पणी देखें)'))
    html += card('Moon Signs', 'चंद्र राशि', personSummaryTable(ctx))
    html += milanCard(comp)
    setResult(html + ctaBlock())
  })

  CALC['ashtakoot-guna-milan-calculator'] = CALC['kundli-milan']

  function synastryTool(titleEn, titleHi) {
    return withCoupleContext(function (ctx) {
      var comp = compatibilityCore(ctx)
      var friendship = 'neutral'
      var NATURAL = { sun: ['moon', 'mars', 'jupiter'], moon: ['sun', 'mercury'], mars: ['sun', 'moon', 'jupiter'], mercury: ['sun', 'venus'], jupiter: ['sun', 'moon', 'mars'], venus: ['mercury', 'saturn'], saturn: ['mercury', 'venus'] }
      if (comp.lord1 === comp.lord2) friendship = 'same'
      else if (NATURAL[comp.lord1] && NATURAL[comp.lord1].indexOf(comp.lord2) !== -1) friendship = 'friend'
      var html = heroBlock(titleEn, titleHi, comp.milan.totalScored + ' / ' + comp.milan.totalMaxScored, '')
      html += card('Moon Signs', 'चंद्र राशि', personSummaryTable(ctx))
      html += card('Moon-Sign Lord Relationship', 'चंद्र राशि स्वामी संबंध', '<p style="font-size:0.875rem;">' + esc(grahaName(comp.lord1)) + ' &amp; ' + esc(grahaName(comp.lord2)) + ' — ' +
        (friendship === 'same' ? chip('chip-good', 'Same Lord', 'समान स्वामी') : friendship === 'friend' ? chip('chip-good', 'Natural Friends', 'प्राकृतिक मित्र') : chip('chip-neutral', 'Neutral', 'सामान्य')) + '</p>')
      html += milanCard(comp)
      setResult(html + ctaBlock())
    })
  }

  CALC['love-compatibility-calculator'] = synastryTool('Love Compatibility', 'प्रेम अनुकूलता')
  CALC['marriage-compatibility-calculator'] = synastryTool('Marriage Compatibility', 'विवाह अनुकूलता')

  window.VedicCalculators = CALC
})()
