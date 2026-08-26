// Vedic astrology calculation engine for the standalone tool pages.
// Wraps the vendored astronomy-engine library (assets/vendor/astronomy.min.js,
// MIT) to produce real, computed positions — sidereal (Lahiri ayanamsa)
// planetary longitudes, Rashi/Nakshatra, Lagna, Panchang elements, Vimshottari
// Dasha, sunrise/sunset-based muhurtas — instead of a "development preview"
// notice. City lookup uses a trimmed world-cities dataset (assets/vendor/cities.js,
// MIT, derived from the city-timezones npm package).
//
// Load order required in each tool HTML page, before this file:
//   assets/vendor/astronomy.min.js
//   assets/vendor/cities.js
;(function (global) {
  'use strict'

  var A = global.Astronomy
  var DEG = Math.PI / 180

  function norm360(x) {
    x = x % 360
    if (x < 0) x += 360
    return x
  }

  function signedDelta(a, b) {
    // shortest signed difference b-a, wrapped to [-180, 180)
    return ((b - a + 540) % 360) - 180
  }

  // ---------- Timezone-aware date construction ----------

  // Converts a wall-clock date+time in a given IANA timeZone into the
  // correct UTC Date, using only Intl (no external tz database needed).
  function zonedTimeToUtc(dateStr, timeStr, timeZone) {
    var dParts = dateStr.split('-').map(Number)
    var tParts = (timeStr || '12:00').split(':').map(Number)
    var y = dParts[0], mo = dParts[1], da = dParts[2]
    var hh = tParts[0], mm = tParts[1] || 0

    var guess = new Date(Date.UTC(y, mo - 1, da, hh, mm, 0))
    for (var i = 0; i < 3; i++) {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).formatToParts(guess)
      var map = {}
      parts.forEach(function (p) { map[p.type] = p.value })
      var hour = Number(map.hour) === 24 ? 0 : Number(map.hour)
      var asIfUtc = Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day), hour, Number(map.minute), Number(map.second))
      var target = Date.UTC(y, mo - 1, da, hh, mm, 0)
      var diff = target - asIfUtc
      if (diff === 0) break
      guess = new Date(guess.getTime() + diff)
    }
    return guess
  }

  // ---------- City lookup ----------
  // window.CITY_DB entries: [city, province, iso2, lat, lng, timezone]

  function searchCities(query, limit) {
    limit = limit || 8
    var db = global.CITY_DB || []
    var q = (query || '').trim().toLowerCase()
    if (q.length < 2) return []
    var starts = []
    var contains = []
    for (var i = 0; i < db.length; i++) {
      var name = db[i][0].toLowerCase()
      if (name === q) { starts.unshift(db[i]); continue }
      if (name.indexOf(q) === 0) starts.push(db[i])
      else if (name.indexOf(q) !== -1) contains.push(db[i])
      if (starts.length >= limit * 3) break
    }
    var combined = starts.concat(contains).slice(0, limit)
    return combined.map(cityRecord)
  }

  function cityRecord(row) {
    return { city: row[0], province: row[1], country: row[2], lat: row[3], lng: row[4], timezone: row[5] }
  }

  function findCityExact(name) {
    var db = global.CITY_DB || []
    var q = (name || '').trim().toLowerCase()
    for (var i = 0; i < db.length; i++) {
      if (db[i][0].toLowerCase() === q) return cityRecord(db[i])
    }
    return null
  }

  function cityLabel(c) {
    return c.province ? (c.city + ', ' + c.province + ', ' + c.country) : (c.city + ', ' + c.country)
  }

  // ---------- Ayanamsa & sidereal conversion ----------

  // Lahiri (Chitrapaksha) ayanamsa, linear approximation anchored at J2000.0
  // (23.8531 deg) with the IAU general-precession rate (50.2388475"/yr).
  // Accurate to roughly +/-1-2 arcminutes across recent decades — adequate
  // for a free web tool; a professional reading should use full Swiss
  // Ephemeris-grade ayanamsa.
  function lahiriAyanamsa(t) {
    var years = t.ut / 365.25
    return 23.85333 + 0.0139533 * years
  }

  function toSidereal(tropicalLon, ayanamsa) {
    return norm360(tropicalLon - ayanamsa)
  }

  // ---------- Body positions (geocentric apparent ecliptic longitude) ----------

  var PLANET_BODIES = { mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn' }

  function geoEclipticLongitude(bodyName, t) {
    return norm360(A.Ecliptic(A.GeoVector(A.Body[bodyName], t, true)).elon)
  }

  function sunTropicalLongitude(t) {
    return norm360(A.SunPosition(t).elon)
  }

  function moonTropicalLongitude(t) {
    return norm360(A.EclipticGeoMoon(t).lon)
  }

  // Mean lunar node (Rahu); Ketu is exactly opposite.
  function meanNodeTropicalLongitude(t) {
    var T = t.tt / 36525
    var omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000
    return norm360(omega)
  }

  function tropicalLongitudes(t) {
    var out = { sun: sunTropicalLongitude(t), moon: moonTropicalLongitude(t) }
    Object.keys(PLANET_BODIES).forEach(function (key) {
      out[key] = geoEclipticLongitude(PLANET_BODIES[key], t)
    })
    out.rahu = meanNodeTropicalLongitude(t)
    out.ketu = norm360(out.rahu + 180)
    return out
  }

  function siderealLongitudes(t) {
    var aya = lahiriAyanamsa(t)
    var trop = tropicalLongitudes(t)
    var out = {}
    Object.keys(trop).forEach(function (key) { out[key] = toSidereal(trop[key], aya) })
    return out
  }

  var GRAHA_ORDER = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu']

  var GRAHA_LABEL = {
    sun: { en: 'Sun', hi: 'सूर्य' }, moon: { en: 'Moon', hi: 'चंद्र' }, mars: { en: 'Mars', hi: 'मंगल' },
    mercury: { en: 'Mercury', hi: 'बुध' }, jupiter: { en: 'Jupiter', hi: 'गुरु' }, venus: { en: 'Venus', hi: 'शुक्र' },
    saturn: { en: 'Saturn', hi: 'शनि' }, rahu: { en: 'Rahu', hi: 'राहु' }, ketu: { en: 'Ketu', hi: 'केतु' },
  }

  function isRetrograde(bodyKey, t) {
    if (bodyKey === 'sun' || bodyKey === 'moon') return false
    if (bodyKey === 'rahu' || bodyKey === 'ketu') return true
    var t2 = A.MakeTime(new Date(t.date.getTime() + 24 * 3600 * 1000))
    var lon1, lon2
    if (bodyKey === 'sun') { lon1 = sunTropicalLongitude(t); lon2 = sunTropicalLongitude(t2) }
    else { lon1 = geoEclipticLongitude(PLANET_BODIES[bodyKey], t); lon2 = geoEclipticLongitude(PLANET_BODIES[bodyKey], t2) }
    return signedDelta(lon1, lon2) < 0
  }

  // ---------- Rashi / Nakshatra ----------

  var RASHIS = [
    { en: 'Aries', hi: 'मेष', lord: 'mars', mode: 'movable' },
    { en: 'Taurus', hi: 'वृषभ', lord: 'venus', mode: 'fixed' },
    { en: 'Gemini', hi: 'मिथुन', lord: 'mercury', mode: 'dual' },
    { en: 'Cancer', hi: 'कर्क', lord: 'moon', mode: 'movable' },
    { en: 'Leo', hi: 'सिंह', lord: 'sun', mode: 'fixed' },
    { en: 'Virgo', hi: 'कन्या', lord: 'mercury', mode: 'dual' },
    { en: 'Libra', hi: 'तुला', lord: 'venus', mode: 'movable' },
    { en: 'Scorpio', hi: 'वृश्चिक', lord: 'mars', mode: 'fixed' },
    { en: 'Sagittarius', hi: 'धनु', lord: 'jupiter', mode: 'dual' },
    { en: 'Capricorn', hi: 'मकर', lord: 'saturn', mode: 'movable' },
    { en: 'Aquarius', hi: 'कुंभ', lord: 'saturn', mode: 'fixed' },
    { en: 'Pisces', hi: 'मीन', lord: 'jupiter', mode: 'dual' },
  ]

  var NAKSHATRAS = [
    { en: 'Ashwini', hi: 'अश्विनी' }, { en: 'Bharani', hi: 'भरणी' }, { en: 'Krittika', hi: 'कृत्तिका' },
    { en: 'Rohini', hi: 'रोहिणी' }, { en: 'Mrigashira', hi: 'मृगशिरा' }, { en: 'Ardra', hi: 'आर्द्रा' },
    { en: 'Punarvasu', hi: 'पुनर्वसु' }, { en: 'Pushya', hi: 'पुष्य' }, { en: 'Ashlesha', hi: 'आश्लेषा' },
    { en: 'Magha', hi: 'मघा' }, { en: 'Purva Phalguni', hi: 'पूर्वाफाल्गुनी' }, { en: 'Uttara Phalguni', hi: 'उत्तराफाल्गुनी' },
    { en: 'Hasta', hi: 'हस्त' }, { en: 'Chitra', hi: 'चित्रा' }, { en: 'Swati', hi: 'स्वाति' },
    { en: 'Vishakha', hi: 'विशाखा' }, { en: 'Anuradha', hi: 'अनुराधा' }, { en: 'Jyeshtha', hi: 'ज्येष्ठा' },
    { en: 'Mula', hi: 'मूल' }, { en: 'Purva Ashadha', hi: 'पूर्वाषाढ़ा' }, { en: 'Uttara Ashadha', hi: 'उत्तराषाढ़ा' },
    { en: 'Shravana', hi: 'श्रवण' }, { en: 'Dhanishta', hi: 'धनिष्ठा' }, { en: 'Shatabhisha', hi: 'शतभिषा' },
    { en: 'Purva Bhadrapada', hi: 'पूर्वाभाद्रपद' }, { en: 'Uttara Bhadrapada', hi: 'उत्तराभाद्रपद' }, { en: 'Revati', hi: 'रेवती' },
  ]

  var NAK_LORD_ORDER = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury']

  function rashiIndex(siderealLon) { return Math.floor(norm360(siderealLon) / 30) }
  function rashiInfo(idx) { return RASHIS[((idx % 12) + 12) % 12] }

  function nakshatraIndex(siderealLon) { return Math.floor(norm360(siderealLon) / (360 / 27)) }
  function nakshatraPada(siderealLon) {
    var within = norm360(siderealLon) % (360 / 27)
    return Math.floor(within / (360 / 27 / 4)) + 1
  }
  function nakshatraInfo(idx) {
    idx = ((idx % 27) + 27) % 27
    var base = NAKSHATRAS[idx]
    return { en: base.en, hi: base.hi, lord: NAK_LORD_ORDER[idx % 9] }
  }

  // ---------- Ascendant / Lagna ----------

  function ascendantTropical(t, latDeg, lonDeg) {
    var gstHours = A.SiderealTime(t)
    var ramc = norm360(gstHours * 15 + lonDeg) * DEG
    var eps = A.e_tilt(t).tobl * DEG
    var phi = latDeg * DEG
    var y = -Math.cos(ramc)
    var x = Math.sin(eps) * Math.tan(phi) + Math.cos(eps) * Math.sin(ramc)
    return norm360(Math.atan2(y, x) / DEG)
  }

  function ascendantSidereal(t, latDeg, lonDeg) {
    return toSidereal(ascendantTropical(t, latDeg, lonDeg), lahiriAyanamsa(t))
  }

  // ---------- Navamsa (D9) ----------

  function navamsaRashiIndex(siderealLon) {
    var lon = norm360(siderealLon)
    var signIdx = Math.floor(lon / 30)
    var withinSign = lon % 30
    var navamsaNum = Math.floor(withinSign / (30 / 9)) // 0-8
    var mode = RASHIS[signIdx].mode
    var startSign
    if (mode === 'movable') startSign = signIdx
    else if (mode === 'fixed') startSign = (signIdx + 8) % 12 // 9th from sign
    else startSign = (signIdx + 4) % 12 // dual: 5th from sign
    return (startSign + navamsaNum) % 12
  }

  // ---------- Full chart ----------

  function buildChart(t) {
    var aya = lahiriAyanamsa(t)
    var trop = tropicalLongitudes(t)
    var grahas = {}
    GRAHA_ORDER.forEach(function (key) {
      var sidereal = toSidereal(trop[key], aya)
      var rIdx = rashiIndex(sidereal)
      var nIdx = nakshatraIndex(sidereal)
      grahas[key] = {
        key: key,
        label: GRAHA_LABEL[key],
        tropicalLon: trop[key],
        siderealLon: sidereal,
        rashiIdx: rIdx,
        rashi: rashiInfo(rIdx),
        nakshatraIdx: nIdx,
        nakshatra: nakshatraInfo(nIdx),
        pada: nakshatraPada(sidereal),
        navamsaIdx: navamsaRashiIndex(sidereal),
        retrograde: isRetrograde(key, t),
      }
    })
    return { ayanamsa: aya, grahas: grahas }
  }

  function housesFromAscendant(ascRashiIdx, grahas) {
    var houses = {}
    Object.keys(grahas).forEach(function (key) {
      houses[key] = ((grahas[key].rashiIdx - ascRashiIdx + 12) % 12) + 1
    })
    return houses
  }

  // ---------- Panchang ----------

  var TITHI_NAMES = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi']
  var TITHI_NAMES_HI = ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी']

  function tithiInfo(t) {
    var diff = norm360(moonTropicalLongitude(t) - sunTropicalLongitude(t))
    var index = Math.floor(diff / 12) // 0-29
    var numInPaksha = (index % 15) + 1
    var shukla = index < 15
    var name, nameHi
    if (numInPaksha === 15) { name = shukla ? 'Purnima' : 'Amavasya'; nameHi = shukla ? 'पूर्णिमा' : 'अमावस्या' }
    else { name = TITHI_NAMES[numInPaksha - 1]; nameHi = TITHI_NAMES_HI[numInPaksha - 1] }
    return { index: index, number: numInPaksha, paksha: shukla ? 'Shukla' : 'Krishna', pakshaHi: shukla ? 'शुक्ल' : 'कृष्ण', en: name, hi: nameHi }
  }

  var KARANA_MOVABLE = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti']
  var KARANA_MOVABLE_HI = ['बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि']
  var KARANA_FIXED_START = { en: 'Kimstughna', hi: 'किंस्तुघ्न' }
  var KARANA_FIXED_END = [{ en: 'Shakuni', hi: 'शकुनि' }, { en: 'Chatushpada', hi: 'चतुष्पाद' }, { en: 'Naga', hi: 'नाग' }]

  function karanaInfo(t) {
    var diff = norm360(moonTropicalLongitude(t) - sunTropicalLongitude(t))
    var index = Math.floor(diff / 6) // 0-59
    if (index === 0) return { index: index, en: KARANA_FIXED_START.en, hi: KARANA_FIXED_START.hi }
    if (index >= 57) return { index: index, en: KARANA_FIXED_END[index - 57].en, hi: KARANA_FIXED_END[index - 57].hi }
    var i = (index - 1) % 7
    return { index: index, en: KARANA_MOVABLE[i], hi: KARANA_MOVABLE_HI[i] }
  }

  var YOGA_NAMES = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti']
  var YOGA_NAMES_HI = ['विष्कम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगंड', 'सुकर्मा', 'धृति', 'शूल', 'गंड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतिपात', 'वरीयान', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इन्द्र', 'वैधृति']

  function yogaInfo(t) {
    var sum = norm360(sunTropicalLongitude(t) + moonTropicalLongitude(t))
    var index = Math.floor(sum / (360 / 27))
    return { index: index, en: YOGA_NAMES[index], hi: YOGA_NAMES_HI[index] }
  }

  var WEEKDAYS = [
    { en: 'Sunday', hi: 'रविवार' }, { en: 'Monday', hi: 'सोमवार' }, { en: 'Tuesday', hi: 'मंगलवार' },
    { en: 'Wednesday', hi: 'बुधवार' }, { en: 'Thursday', hi: 'गुरुवार' }, { en: 'Friday', hi: 'शुक्रवार' }, { en: 'Saturday', hi: 'शनिवार' },
  ]

  // ---------- Sunrise / Sunset ----------

  // Given a local calendar date at (lat,lon), finds that day's sunrise and
  // sunset by searching from local midnight.
  function dayWindow(dateStr, lat, lon, timezone) {
    var localMidnight = zonedTimeToUtc(dateStr, '00:00', timezone)
    var t0 = A.MakeTime(localMidnight)
    var observer = new A.Observer(lat, lon, 0)
    var sunrise = A.SearchRiseSet(A.Body.Sun, observer, 1, t0, 2)
    var sunset = sunrise ? A.SearchRiseSet(A.Body.Sun, observer, -1, sunrise, 2) : null
    var nextSunrise = sunset ? A.SearchRiseSet(A.Body.Sun, observer, 1, sunset, 2) : null
    return {
      observer: observer,
      sunrise: sunrise ? sunrise.date : null,
      sunset: sunset ? sunset.date : null,
      nextSunrise: nextSunrise ? nextSunrise.date : null,
    }
  }

  // ---------- Day-part tables (Rahu Kaal, Yamaganda, Gulika, Choghadiya) ----------

  var RAHU_KAAL_SEGMENT = [8, 2, 7, 5, 6, 4, 3] // Sun..Sat, 1-indexed segment of 8
  var YAMAGANDA_SEGMENT = [5, 4, 3, 2, 1, 7, 6]
  var GULIKA_SEGMENT = [7, 6, 5, 4, 3, 2, 1]

  function segmentWindow(sunrise, sunset, segmentNumber1to8) {
    var duration = (sunset.getTime() - sunrise.getTime()) / 8
    var start = new Date(sunrise.getTime() + (segmentNumber1to8 - 1) * duration)
    var end = new Date(start.getTime() + duration)
    return { start: start, end: end }
  }

  function rahuKaal(sunrise, sunset, weekdayIdx) { return segmentWindow(sunrise, sunset, RAHU_KAAL_SEGMENT[weekdayIdx]) }
  function yamaganda(sunrise, sunset, weekdayIdx) { return segmentWindow(sunrise, sunset, YAMAGANDA_SEGMENT[weekdayIdx]) }
  function gulikaKaal(sunrise, sunset, weekdayIdx) { return segmentWindow(sunrise, sunset, GULIKA_SEGMENT[weekdayIdx]) }

  function abhijitMuhurat(sunrise, sunset) {
    var muhurta = (sunset.getTime() - sunrise.getTime()) / 15
    var start = new Date(sunrise.getTime() + 7 * muhurta)
    var end = new Date(start.getTime() + muhurta)
    return { start: start, end: end }
  }

  var CHOGHADIYA_ORDER = ['udveg', 'chal', 'labh', 'amrit', 'kaal', 'shubh', 'rog']
  var CHOGHADIYA_LABEL = {
    udveg: { en: 'Udveg', hi: 'उद्वेग', nature: 'inauspicious' },
    chal: { en: 'Chal', hi: 'चल', nature: 'neutral' },
    labh: { en: 'Labh', hi: 'लाभ', nature: 'auspicious' },
    amrit: { en: 'Amrit', hi: 'अमृत', nature: 'auspicious' },
    kaal: { en: 'Kaal', hi: 'काल', nature: 'inauspicious' },
    shubh: { en: 'Shubh', hi: 'शुभ', nature: 'auspicious' },
    rog: { en: 'Rog', hi: 'रोग', nature: 'inauspicious' },
  }
  var CHOGHADIYA_DAY_START = [0, 3, 6, 2, 5, 1, 4] // Sun..Sat index into CHOGHADIYA_ORDER

  function choghadiyaSegments(sunrise, sunset, nextSunrise, weekdayIdx) {
    var dayStart = CHOGHADIYA_DAY_START[weekdayIdx]
    var nightStart = CHOGHADIYA_DAY_START[(weekdayIdx + 4) % 7]
    var day = []
    for (var i = 0; i < 8; i++) {
      var w = segmentWindow(sunrise, sunset, i + 1)
      var name = CHOGHADIYA_ORDER[(dayStart + i) % 7]
      day.push({ start: w.start, end: w.end, name: name, label: CHOGHADIYA_LABEL[name] })
    }
    var night = []
    if (nextSunrise) {
      var nightDuration = (nextSunrise.getTime() - sunset.getTime()) / 8
      for (var j = 0; j < 8; j++) {
        var ns = new Date(sunset.getTime() + j * nightDuration)
        var ne = new Date(ns.getTime() + nightDuration)
        var nname = CHOGHADIYA_ORDER[(nightStart + j) % 7]
        night.push({ start: ns, end: ne, name: nname, label: CHOGHADIYA_LABEL[nname] })
      }
    }
    return { day: day, night: night }
  }

  // ---------- Vimshottari Dasha ----------

  var DASHA_YEARS = { ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16, saturn: 19, mercury: 17 }
  var DAYS_PER_YEAR = 365.2425

  function vimshottariSequence(moonSiderealLon, birthDate, cycles) {
    cycles = cycles || 2
    var nIdx = nakshatraIndex(moonSiderealLon)
    var lordIdx = nIdx % 9
    var span = 360 / 27
    var fracTraversed = (norm360(moonSiderealLon) % span) / span
    var balanceYears = (1 - fracTraversed) * DASHA_YEARS[NAK_LORD_ORDER[lordIdx]]

    var sequence = []
    var cursor = birthDate.getTime()
    var firstLord = NAK_LORD_ORDER[lordIdx]
    var firstEnd = cursor + balanceYears * DAYS_PER_YEAR * 86400000
    sequence.push({ lord: firstLord, start: new Date(cursor), end: new Date(firstEnd), years: balanceYears })
    cursor = firstEnd

    var idx = lordIdx
    var totalYears = balanceYears
    while (totalYears < 120 * cycles) {
      idx = (idx + 1) % 9
      var lord = NAK_LORD_ORDER[idx]
      var years = DASHA_YEARS[lord]
      var end = cursor + years * DAYS_PER_YEAR * 86400000
      sequence.push({ lord: lord, start: new Date(cursor), end: new Date(end), years: years })
      cursor = end
      totalYears += years
    }
    return sequence
  }

  function currentPeriod(sequence, atDate) {
    var t = atDate.getTime()
    for (var i = 0; i < sequence.length; i++) {
      if (t >= sequence[i].start.getTime() && t < sequence[i].end.getTime()) return sequence[i]
    }
    return sequence[sequence.length - 1]
  }

  function antardashaSequence(mahadasha) {
    var startIdx = NAK_LORD_ORDER.indexOf(mahadasha.lord)
    var totalDays = mahadasha.end.getTime() - mahadasha.start.getTime()
    var cursor = mahadasha.start.getTime()
    var out = []
    for (var i = 0; i < 9; i++) {
      var idx = (startIdx + i) % 9
      var lord = NAK_LORD_ORDER[idx]
      var fraction = DASHA_YEARS[lord] / 120
      var span = totalDays * fraction
      var start = cursor
      var end = cursor + span
      out.push({ lord: lord, start: new Date(start), end: new Date(end) })
      cursor = end
    }
    return out
  }

  // ---------- Planetary dignity ----------

  var EXALTATION = { sun: 0, moon: 1, mars: 9, mercury: 5, jupiter: 3, venus: 11, saturn: 6 }
  var DEBILITATION = { sun: 6, moon: 7, mars: 3, mercury: 11, jupiter: 9, venus: 5, saturn: 0 }
  var OWN_SIGNS = { sun: [4], moon: [3], mars: [0, 7], mercury: [2, 5], jupiter: [8, 11], venus: [1, 6], saturn: [9, 10] }

  var NATURAL_FRIENDSHIP = {
    sun: { friend: ['moon', 'mars', 'jupiter'], enemy: ['venus', 'saturn'] },
    moon: { friend: ['sun', 'mercury'], enemy: [] },
    mars: { friend: ['sun', 'moon', 'jupiter'], enemy: ['mercury'] },
    mercury: { friend: ['sun', 'venus'], enemy: ['moon'] },
    jupiter: { friend: ['sun', 'moon', 'mars'], enemy: ['mercury', 'venus'] },
    venus: { friend: ['mercury', 'saturn'], enemy: ['sun', 'moon'] },
    saturn: { friend: ['mercury', 'venus'], enemy: ['sun', 'moon', 'mars'] },
  }

  function planetDignity(key, rashiIdx) {
    if (EXALTATION[key] === rashiIdx) return 'exalted'
    if (DEBILITATION[key] === rashiIdx) return 'debilitated'
    if (OWN_SIGNS[key] && OWN_SIGNS[key].indexOf(rashiIdx) !== -1) return 'own'
    var signLord = RASHIS[rashiIdx].lord
    if (signLord === key) return 'own'
    var rel = NATURAL_FRIENDSHIP[key]
    if (!rel) return 'neutral'
    if (rel.friend.indexOf(signLord) !== -1) return 'friend'
    if (rel.enemy.indexOf(signLord) !== -1) return 'enemy'
    return 'neutral'
  }

  // ---------- Dosha checks ----------

  function manglikCheck(grahas, ascRashiIdx) {
    var houseFromLagna = ((grahas.mars.rashiIdx - ascRashiIdx + 12) % 12) + 1
    var houseFromMoon = ((grahas.mars.rashiIdx - grahas.moon.rashiIdx + 12) % 12) + 1
    var manglikHouses = [1, 2, 4, 7, 8, 12]
    return {
      fromLagna: manglikHouses.indexOf(houseFromLagna) !== -1,
      houseFromLagna: houseFromLagna,
      fromMoon: manglikHouses.indexOf(houseFromMoon) !== -1,
      houseFromMoon: houseFromMoon,
    }
  }

  function kaalSarpCheck(grahas) {
    var classical = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']
    var rahuLon = grahas.rahu.siderealLon
    var ketuLon = grahas.ketu.siderealLon
    // side = true if planet lies on the arc going forward from Rahu to Ketu
    var arc = norm360(ketuLon - rahuLon)
    var sides = classical.map(function (key) {
      var rel = norm360(grahas[key].siderealLon - rahuLon)
      return rel < arc
    })
    var allOneSide = sides.every(function (s) { return s === true }) || sides.every(function (s) { return s === false })
    return { present: allOneSide }
  }

  // ---------- Compatibility (partial Ashtakoot: Varna, Gana, Nadi, Bhakoot) ----------

  var VARNA_BY_RASHI = [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3] // 0=Shudra,1=Vaishya,2=Kshatriya,3=Brahmin (index by rashi 0-11)
  var VARNA_LABEL = [{ en: 'Shudra', hi: 'शूद्र' }, { en: 'Vaishya', hi: 'वैश्य' }, { en: 'Kshatriya', hi: 'क्षत्रिय' }, { en: 'Brahmin', hi: 'ब्राह्मण' }]

  var GANA_BY_NAKSHATRA = [
    'deva', 'manushya', 'rakshasa', 'manushya', 'deva', 'manushya', 'deva', 'deva', 'rakshasa',
    'rakshasa', 'manushya', 'manushya', 'deva', 'rakshasa', 'deva', 'rakshasa', 'deva', 'rakshasa',
    'rakshasa', 'manushya', 'manushya', 'deva', 'rakshasa', 'rakshasa', 'manushya', 'manushya', 'deva',
  ]
  var GANA_LABEL = { deva: { en: 'Deva', hi: 'देव' }, manushya: { en: 'Manushya', hi: 'मनुष्य' }, rakshasa: { en: 'Rakshasa', hi: 'राक्षस' } }

  function varnaScore(r1, r2) {
    var v1 = VARNA_BY_RASHI[r1], v2 = VARNA_BY_RASHI[r2]
    return v1 >= v2 ? 1 : 0 // boy's varna should be equal or higher than girl's (classical rule); shown as compatibility signal
  }

  function ganaScore(n1, n2) {
    var g1 = GANA_BY_NAKSHATRA[n1], g2 = GANA_BY_NAKSHATRA[n2]
    if (g1 === g2) return 6
    var pair = [g1, g2].sort().join('-')
    if (pair === 'deva-manushya') return 5
    if (pair === 'manushya-rakshasa') return 0
    if (pair === 'deva-rakshasa') return 0
    return 3
  }

  function nadiGroup(nakIdx) { return nakIdx % 3 } // 0 Aadi, 1 Madhya, 2 Antya
  var NADI_LABEL = [{ en: 'Aadi', hi: 'आदि' }, { en: 'Madhya', hi: 'मध्य' }, { en: 'Antya', hi: 'अंत्य' }]

  function nadiScore(n1, n2) { return nadiGroup(n1) === nadiGroup(n2) ? 0 : 8 }

  function bhakootScore(r1, r2) {
    var dist = ((r2 - r1 + 12) % 12) + 1
    var bad = [6, 8, 12].indexOf(dist) !== -1
    return bad ? 0 : 7
  }

  function ashtakootPartial(moon1, moon2) {
    var varna = varnaScore(moon1.rashiIdx, moon2.rashiIdx)
    var gana = ganaScore(moon1.nakshatraIdx, moon2.nakshatraIdx)
    var nadi = nadiScore(moon1.nakshatraIdx, moon2.nakshatraIdx)
    var bhakoot = bhakootScore(moon1.rashiIdx, moon2.rashiIdx)
    return {
      varna: { score: varna, max: 1 },
      gana: { score: gana, max: 6 },
      bhakoot: { score: bhakoot, max: 7 },
      nadi: { score: nadi, max: 8 },
      totalScored: varna + gana + bhakoot + nadi,
      totalMaxScored: 1 + 6 + 7 + 8,
      nadiDosha: nadi === 0,
      bhakootDosha: bhakoot === 0,
    }
  }

  // ---------- Public API ----------

  global.VedicEngine = {
    MakeTime: function (date) { return A.MakeTime(date) },
    zonedTimeToUtc: zonedTimeToUtc,
    searchCities: searchCities,
    findCityExact: findCityExact,
    cityLabel: cityLabel,
    norm360: norm360,

    lahiriAyanamsa: lahiriAyanamsa,
    tropicalLongitudes: tropicalLongitudes,
    siderealLongitudes: siderealLongitudes,
    buildChart: buildChart,
    housesFromAscendant: housesFromAscendant,
    ascendantSidereal: ascendantSidereal,
    navamsaRashiIndex: navamsaRashiIndex,

    RASHIS: RASHIS,
    NAKSHATRAS: NAKSHATRAS,
    GRAHA_ORDER: GRAHA_ORDER,
    GRAHA_LABEL: GRAHA_LABEL,
    rashiIndex: rashiIndex,
    rashiInfo: rashiInfo,
    nakshatraIndex: nakshatraIndex,
    nakshatraInfo: nakshatraInfo,
    nakshatraPada: nakshatraPada,

    tithiInfo: tithiInfo,
    karanaInfo: karanaInfo,
    yogaInfo: yogaInfo,
    WEEKDAYS: WEEKDAYS,

    dayWindow: dayWindow,
    rahuKaal: rahuKaal,
    yamaganda: yamaganda,
    gulikaKaal: gulikaKaal,
    abhijitMuhurat: abhijitMuhurat,
    choghadiyaSegments: choghadiyaSegments,

    vimshottariSequence: vimshottariSequence,
    currentPeriod: currentPeriod,
    antardashaSequence: antardashaSequence,
    DASHA_YEARS: DASHA_YEARS,
    NAK_LORD_ORDER: NAK_LORD_ORDER,

    planetDignity: planetDignity,
    manglikCheck: manglikCheck,
    kaalSarpCheck: kaalSarpCheck,

    VARNA_LABEL: VARNA_LABEL,
    GANA_LABEL: GANA_LABEL,
    NADI_LABEL: NADI_LABEL,
    nadiGroup: nadiGroup,
    ashtakootPartial: ashtakootPartial,
  }
})(typeof window !== 'undefined' ? window : globalThis)
