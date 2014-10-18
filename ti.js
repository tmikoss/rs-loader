// Lifted from https://github.com/jmalinens/rigas-satiksme-api and trimmed down

var ti = {
    stops: 0,
    routes: 0,
    specialDates: {},
    asciiStops: {},
    FLD_ID: 0,
    FLD_CITY: 1,
    FLD_AREA: 2,
    FLD_STREET: 3,
    FLD_NAME: 4,
    FLD_INFO: 5,
    FLD_LNG: 6,
    FLD_LAT: 7,
    FLD_STOPS: 8,
    FLD_DIRS: 9,
    RT_ROUTEID: 0,
    RT_ORDER: 1,
    RT_ROUTENUM: 2,
    RT_AUTHORITY: 3,
    RT_CITY: 4,
    RT_TRANSPORT: 5,
    RT_OPERATOR: 6,
    RT_VALIDITYPERIODS: 7,
    RT_SPECIALDATES: 8,
    RT_ROUTETAG: 9,
    RT_ROUTETYPE: 10,
    RT_COMMERCIAL: 11,
    RT_ROUTENAME: 12,
    RT_WEEKDAYS: 13,
    RT_ENTRY: 14,
    RT_STREETS: 15,
    RT_ROUTESTOPS: 16,
    accent_map: {
        "ą": "a",
        "ä": "a",
        "ā": "a",
        "č": "c",
        "ę": "e",
        "ė": "e",
        "į": "i",
        "ų": "u",
        "ū": "u",
        "ü": "u",
        "ž": "z",
        "ē": "e",
        "ģ": "g",
        "ī": "i",
        "ķ": "k",
        "ļ": "l",
        "ņ": "n",
        "ö": "o",
        "õ": "o",
        "š": "s",
        "а": "a",
        "б": "b",
        "в": "v",
        "г": "g",
        "д": "d",
        "е": "e",
        "ё": "e",
        "ж": "zh",
        "з": "z",
        "и": "i",
        "й": "j",
        "к": "k",
        "л": "l",
        "м": "m",
        "н": "n",
        "о": "o",
        "п": "p",
        "р": "r",
        "с": "s",
        "т": "t",
        "у": "u",
        "ф": "f",
        "х": "x",
        "ц": "c",
        "ч": "ch",
        "ш": "sh",
        "щ": "shh",
        "ъ": !0,
        "ы": "y",
        "ь": !0,
        "э": "je",
        "ю": "ju",
        "я": "ja",
        "–": "-",
        "—": "-",
        "̶": "-",
        "­": "-",
        "˗": "-",
        "“": !0,
        "”": !0,
        "„": !0,
        "'": !0,
        "\"": !0
    }
};

ti.SERVER = 1;

ti.toAscii = function(a, b) {
    var c = a.toLowerCase(),
        d = c.split(""),
        e, f = ti.accent_map;
    for (var g = d.length; --g >= 0;)
        (e = f[d[g]]) ? (d[g] = e === !0 ? "" : e, c = !1) : b === !0 && d[g] === " " && (d[g] = "", c = !1);
    b === 2 && (c = d.join("").trim().replace(/\s+-/g, "-").replace(/-\s+/g, "-"));
    return c || d.join("")
};

ti.loadStops = function(a) {
    a = a.split("\n");
    var b = "",
        c = "",
        d = "",
        e = "",
        f = "",
        g = "",
        h = "",
        i = {},
        j = {},
        k = [],
        l = a.length,
        m = a[0].toUpperCase().split(";"),
        n = {};
    for (var o = m.length; --o >= 0;)
        n[m[o]] = o;
    n.ID = 0;
    for (var o = 1; o < l; o++)
        if (a[o].length > 1) {
            var p = a[o].split(";"),
                q = p[n.CITY];
            q && (c = q === "0" ? "" : q.trim());
            var r = b + ti.toAscii(p[n.ID], !0);
            if (q = p[n.AREA])
                d = q === "0" ? "" : q.trim();
            if (q = p[n.STREET])
                e = q === "0" ? "" : q.trim();
            if (q = p[n.NAME]) {
                f = q === "0" ? "" : q, g = ti.toAscii(q);
                var s = j[g];
                j[g] = s ? s + "," + r : r
            } else
                j[g] += "," + r;
            if (q = p[n.INFO])
                h = q === "0" ? "" : q;
            b && (p[n.STOPS] = b + (p[n.STOPS] || "").replace(/,/g, "," + b));
            var t = {
                id: r,
                lat: +p[n.LAT] / 1e5,
                lng: +p[n.LNG] / 1e5,
                name: f,
                city: c
            };
            ti.SERVER && (t.routes = [], t.neighbours = p[n.STOPS] ? p[n.STOPS].split(",") : []), i[r] = t, k.push(t)
        }

    ti.stops = i, ti.asciiStops = j, k.sort(function(a, b) {
        return a.lat < b.lat ? -1 : a.lat > b.lat ? 1 : 0
    });
    for (o = k.length; --o > 0;)
        if (k[o].city === "intercity") {
            var u = k[o].lat;
            for (var v = o - 1; --v >= 0;) {
                var w = u - k[v].lat;
                if (w > .015)
                    break;
                var x = k[o].lng - k[v].lng;
                x > -.015 && x < .015 && (k[o].neighbours.push(k[v].id), k[v].neighbours.push(k[o].id))
            }
        }
};

ti.loadRoutes = function(a) {
    if (typeof ti.stops !== "object")
        ti.routes = a;
    else {
        a = a.split("\n");
        var b = [],
            c = ti.stops,
            d = {},
            e = "",
            f = "",
            g = "",
            h = "",
            i = "",
            j = "",
            k = "",
            l = "",
            m = "",
            n = "",
            o = "",
            p = "",
            q = 0,
            r = a[0].toUpperCase().split(";"),
            s = {};
        for (var t = r.length; --t >= 0;)
            s[r[t]] = t;
        s.ROUTENUM = 0;
        var u = -1,
            v = a.length;
        for (var t = 1; t < v; t++)
            if (a[t].charAt(0) === "#") {
                var w = a[t].split("#"),
                    x = null,
                    y = null,
                    z = new Date;
                w[1] !== "" && (x = new Date(w[1])), w[2] !== "" && (y = new Date(w[2]));
                if ((!x || x <= z) && (!y || y >= z)) {
                    var A = {
                        comment: w[3]
                    };
                    w[4] && (A.departures = w[4]), w[5] && (A.weekdays = w[5]), w[6] && (A.directions = w[6]);
                    var B = b[u];
                    B.comments ? B.comments.push(A) : B.comments = [A]
                }
            } else if (a[t].length > 1) {
            var w = a[t].split(";"),
                C;
            if (C = w[s.AUTHORITY])
                g = C === "0" ? "" : C;
            if (g === "SpecialDates") {
                var D = {},
                    E = w[s.VALIDITYPERIODS].split(","),
                    F = 0,
                    G = 0;
                for (var H = -1, I = E.length; ++H < I;)
                    E[H] && (F = +E[H]), G += F, D[G] = !0;
                ti.specialDates[w[s.ROUTENUM]] = D;
                continue
            }
            ++q, ++u;
            if (C = w[s.ROUTENUM])
                e = C === "0" ? "" : C, q = 1;
            if (C = w[s.ROUTENAME])
                f = C;
            if (C = w[s.CITY])
                h = C === "0" ? "" : C, k = h + "_" + j, q = 1;
            if (C = w[s.TRANSPORT])
                j = C === "0" ? "" : C, k = h + "_" + j, q = 1;
            k && (k = "");
            if (C = w[s.OPERATOR])
                l = C === "0" ? "" : C;
            if (C = w[s.VALIDITYPERIODS])
                m = C === "0" ? "" : C;
            if (C = w[s.SPECIALDATES])
                n = C === "0" ? "" : C;
            if (C = w[s.WEEKDAYS])
                o = C === "0" ? "" : C;
            p = s.STREETS ? w[s.STREETS] : "";
            var J = ti.toAscii(w[s.ROUTESTOPS], !0).split(","),
                K = !1;
            for (var L = 0, M = J.length; L < M; ++L) {
                var N = J[L];
                N.charAt(0) === "e" ? (K || (K = []), K[L] = "1", N = N.substring(1), J[L] = N) : N.charAt(0) === "x" ? (K || (K = []), K[L] = "2", N = N.substring(1), J[L] = N) : K && (K[L] = "0"), i && (N = J[L] = i + N);
                var O = c[N];
                ti.SERVER = true;
                O ? (d[N] = !0, O.raw_data += ";" + u + ";" + L, (!0 || ti.SERVER) && O.routes.push(u, L)) : ( /*J.splice(L, 1),*/ --M, --L)
            }
            ++t
            b[u] = {
                id: u,
                authority: g,
                city: h,
                transport: j,
                num: e,
                name: f,
                stops: J,
                entry: K && K.join("") || "",
                specialDates: n.split(","),
                times: ti.explodeTimes(a[t]),
                direction: ti.toAscii(w[s.ROUTETYPE])
            }
        }
        ti.routes = b;
    }
};

ti.explodeTimes = function(a) {
    var b = [],
        c = [],
        d = [],
        e = [],
        f, g, h = a.split(","),
        i, j, k = h.length,
        l = [],
        m = "+",
        n = "-";
    for (i = -1, f = 0, g = 0, j = 0; ++i < k;) {
        var o = h[i];
        if (o == "")
            break;
        var p = o.charAt(0);
        p === m ? l[i] = o.charAt(1) === "0" && o !== "+0" ? "2" : "1" : p === n && o.charAt(1) === "0" && (l[i] = o.charAt(2) === "0" ? "2" : "1"), j += +o, b[f++] = j
    }
    for (var q = l.length; --q >= 0;)
        l[q] || (l[q] = "0");
    for (var q = 0; ++i < k;) {
        var r = +h[i],
            s = h[++i];
        s === "" ? (s = f - q, k = 0) : s = +s;
        while (s-- > 0)
            d[q++] = r
    }
    --i;
    for (var q = 0, k = h.length; ++i < k;) {
        var r = +h[i],
            s = h[++i];
        s === "" ? (s = f - q, k = 0) : s = +s;
        while (s-- > 0)
            e[q++] = r
    }
    --i;
    for (var q = 0, k = h.length; ++i < k;) {
        var t = h[i],
            s = h[++i];
        s === "" ? (s = f - q, k = 0) : s = +s;
        while (s-- > 0)
            c[q++] = t
    }
    --i, g = 1;
    for (var q = f, u = f, v = 5, k = h.length; ++i < k;) {
        v += +h[i] - 5;
        var s = h[++i];
        s !== "" ? (s = +s, u -= s) : (s = u, u = 0);
        while (s-- > 0)
            b[q] = v + b[q - f], ++q;
        u <= 0 && (u = f, v = 5, ++g)
    }
    final_data = {
        workdays: c,
        times: b,
        tag: l.join(""),
        valid_from: d,
        valid_to: e
    };
    return final_data
};

module.exports = ti;
