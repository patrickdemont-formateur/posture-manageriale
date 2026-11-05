/* ==========================================================================
   qr.js - Générateur de QR Code autonome (aucune dépendance, aucun réseau)

   - Norme QR Code Model 2, mode « octets » (UTF-8), niveau de correction M
   - Versions 1 à 20 (jusqu'à 666 octets) : largement suffisant pour un lien
   - API :
       QR.encode(texte)                -> { size, version, modules } ou null si trop long
       QR.svgElement(resultat, libelle) -> élément <svg> prêt à insérer
   ========================================================================== */
(function (global) {
  "use strict";

  /* Niveau M : octets de correction par bloc et nombre de blocs, par version */
  var ECC_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26];
  var NUM_BLOCKS    = [-1,  1,  1,  1,  2,  2,  4,  4,  4,  5,  5,  5,  8,  9,  9, 10, 10, 11, 13, 14, 16];
  var MAX_VERSION = 20;
  var FORMAT_BITS_M = 0; /* indicateur de niveau M dans les bits de format */

  function getBit(x, i) { return ((x >>> i) & 1) !== 0; }

  function rawDataModules(ver) {
    var r = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var n = Math.floor(ver / 7) + 2;
      r -= (25 * n - 10) * n - 55;
      if (ver >= 7) { r -= 36; }
    }
    return r;
  }

  function dataCodewords(ver) {
    return Math.floor(rawDataModules(ver) / 8) - ECC_PER_BLOCK[ver] * NUM_BLOCKS[ver];
  }

  function utf8Bytes(str) {
    var enc = encodeURIComponent(str);
    var out = [];
    for (var i = 0; i < enc.length; i++) {
      if (enc.charAt(i) === "%") {
        out.push(parseInt(enc.substr(i + 1, 2), 16));
        i += 2;
      } else {
        out.push(enc.charCodeAt(i));
      }
    }
    return out;
  }

  function pushBits(arr, value, count) {
    for (var i = count - 1; i >= 0; i--) { arr.push((value >>> i) & 1); }
  }

  /* ---------- Reed-Solomon sur GF(256), polynôme 0x11D ---------- */
  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }

  function rsDivisor(degree) {
    var result = [];
    for (var i = 0; i < degree; i++) { result.push(0); }
    result[degree - 1] = 1;
    var root = 1;
    for (var k = 0; k < degree; k++) {
      for (var j = 0; j < degree; j++) {
        result[j] = gfMul(result[j], root);
        if (j + 1 < degree) { result[j] ^= result[j + 1]; }
      }
      root = gfMul(root, 0x02);
    }
    return result;
  }

  function rsRemainder(data, divisor) {
    var result = divisor.map(function () { return 0; });
    data.forEach(function (b) {
      var factor = b ^ result.shift();
      result.push(0);
      divisor.forEach(function (coef, i) { result[i] ^= gfMul(coef, factor); });
    });
    return result;
  }

  function addEccAndInterleave(data, ver) {
    var nb = NUM_BLOCKS[ver];
    var eccLen = ECC_PER_BLOCK[ver];
    var raw = Math.floor(rawDataModules(ver) / 8);
    var nShort = nb - (raw % nb);
    var shortLen = Math.floor(raw / nb);
    var blocks = [];
    var div = rsDivisor(eccLen);
    var k = 0;
    for (var i = 0; i < nb; i++) {
      var dat = data.slice(k, k + shortLen - eccLen + (i < nShort ? 0 : 1));
      k += dat.length;
      var ecc = rsRemainder(dat, div);
      if (i < nShort) { dat.push(0); }
      blocks.push(dat.concat(ecc));
    }
    var result = [];
    for (var c = 0; c < blocks[0].length; c++) {
      for (var b = 0; b < blocks.length; b++) {
        if (c !== shortLen - eccLen || b >= nShort) { result.push(blocks[b][c]); }
      }
    }
    return result;
  }

  /* ---------- Pénalités pour le choix du masque ---------- */
  function linePenalty(line) {
    var res = 0;
    var run = 1;
    var i, j;
    for (i = 1; i <= line.length; i++) {
      if (i < line.length && line[i] === line[i - 1]) { run++; }
      else { if (run >= 5) { res += 3 + (run - 5); } run = 1; }
    }
    var pat = [1, 0, 1, 1, 1, 0, 1];
    for (i = 0; i + 7 <= line.length; i++) {
      var ok = true;
      for (j = 0; j < 7; j++) {
        if ((line[i + j] ? 1 : 0) !== pat[j]) { ok = false; break; }
      }
      if (!ok) { continue; }
      var before = true;
      var after = true;
      for (j = 1; j <= 4; j++) {
        if (i - j >= 0 && line[i - j]) { before = false; }
        if (i + 6 + j < line.length && line[i + 6 + j]) { after = false; }
      }
      if (before) { res += 40; }
      if (after) { res += 40; }
    }
    return res;
  }

  function penalty(m, size) {
    var res = 0;
    var dark = 0;
    var x, y, line;
    for (y = 0; y < size; y++) { res += linePenalty(m[y]); }
    for (x = 0; x < size; x++) {
      line = [];
      for (y = 0; y < size; y++) { line.push(m[y][x]); }
      res += linePenalty(line);
    }
    for (y = 0; y < size - 1; y++) {
      for (x = 0; x < size - 1; x++) {
        var c = m[y][x];
        if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) { res += 3; }
      }
    }
    for (y = 0; y < size; y++) {
      for (x = 0; x < size; x++) { if (m[y][x]) { dark++; } }
    }
    var total = size * size;
    res += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
    return res;
  }

  /* ---------- Encodage ---------- */
  function encode(text) {
    var data = utf8Bytes(String(text));
    var ver = 0;
    var ccBits = 8;
    for (var v = 1; v <= MAX_VERSION; v++) {
      var cc = v < 10 ? 8 : 16;
      if (4 + cc + data.length * 8 <= dataCodewords(v) * 8) { ver = v; ccBits = cc; break; }
    }
    if (!ver) { return null; }

    var bits = [];
    pushBits(bits, 0x4, 4);
    pushBits(bits, data.length, ccBits);
    data.forEach(function (b) { pushBits(bits, b, 8); });
    var capBits = dataCodewords(ver) * 8;
    pushBits(bits, 0, Math.min(4, capBits - bits.length));
    pushBits(bits, 0, (8 - (bits.length % 8)) % 8);
    for (var pad = 0xEC; bits.length < capBits; pad ^= 0xEC ^ 0x11) { pushBits(bits, pad, 8); }

    var dataCw = [];
    for (var i = 0; i < bits.length; i += 8) {
      var byte = 0;
      for (var j = 0; j < 8; j++) { byte = (byte << 1) | bits[i + j]; }
      dataCw.push(byte);
    }
    var all = addEccAndInterleave(dataCw, ver);

    var size = ver * 4 + 17;
    var modules = [];
    var isFn = [];
    for (var y = 0; y < size; y++) {
      var r1 = [];
      var r2 = [];
      for (var x = 0; x < size; x++) { r1.push(false); r2.push(false); }
      modules.push(r1);
      isFn.push(r2);
    }

    function setFn(x, y, dark) { modules[y][x] = dark; isFn[y][x] = true; }

    function drawFinder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) {
        for (var dx = -4; dx <= 4; dx++) {
          var dist = Math.max(Math.abs(dx), Math.abs(dy));
          var xx = cx + dx;
          var yy = cy + dy;
          if (xx >= 0 && xx < size && yy >= 0 && yy < size) { setFn(xx, yy, dist !== 2 && dist !== 4); }
        }
      }
    }

    function drawAlign(cx, cy) {
      for (var dy = -2; dy <= 2; dy++) {
        for (var dx = -2; dx <= 2; dx++) {
          setFn(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }

    function alignPositions() {
      if (ver === 1) { return []; }
      var n = Math.floor(ver / 7) + 2;
      var step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
      var res = [6];
      for (var pos = size - 7; res.length < n; pos -= step) { res.splice(1, 0, pos); }
      return res;
    }

    function drawFormat(mask) {
      var d = (FORMAT_BITS_M << 3) | mask;
      var rem = d;
      for (var k = 0; k < 10; k++) { rem = (rem << 1) ^ ((rem >>> 9) * 0x537); }
      var fb = ((d << 10) | rem) ^ 0x5412;
      var i2;
      for (i2 = 0; i2 <= 5; i2++) { setFn(8, i2, getBit(fb, i2)); }
      setFn(8, 7, getBit(fb, 6));
      setFn(8, 8, getBit(fb, 7));
      setFn(7, 8, getBit(fb, 8));
      for (i2 = 9; i2 < 15; i2++) { setFn(14 - i2, 8, getBit(fb, i2)); }
      for (i2 = 0; i2 < 8; i2++) { setFn(size - 1 - i2, 8, getBit(fb, i2)); }
      for (i2 = 8; i2 < 15; i2++) { setFn(8, size - 15 + i2, getBit(fb, i2)); }
      setFn(8, size - 8, true);
    }

    function drawVersion() {
      if (ver < 7) { return; }
      var rem = ver;
      for (var k = 0; k < 12; k++) { rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25); }
      var vb = (ver << 12) | rem;
      for (var i3 = 0; i3 < 18; i3++) {
        var bit = getBit(vb, i3);
        var a = size - 11 + (i3 % 3);
        var b = Math.floor(i3 / 3);
        setFn(a, b, bit);
        setFn(b, a, bit);
      }
    }

    var s;
    for (s = 0; s < size; s++) { setFn(6, s, s % 2 === 0); setFn(s, 6, s % 2 === 0); }
    drawFinder(3, 3);
    drawFinder(size - 4, 3);
    drawFinder(3, size - 4);
    var pos = alignPositions();
    var n = pos.length;
    for (var a1 = 0; a1 < n; a1++) {
      for (var a2 = 0; a2 < n; a2++) {
        if (!((a1 === 0 && a2 === 0) || (a1 === 0 && a2 === n - 1) || (a1 === n - 1 && a2 === 0))) {
          drawAlign(pos[a1], pos[a2]);
        }
      }
    }
    drawFormat(0);
    drawVersion();

    /* Placement des octets en zigzag */
    var idx = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) { right = 5; }
      for (var vert = 0; vert < size; vert++) {
        for (var jj = 0; jj < 2; jj++) {
          var xx = right - jj;
          var upward = ((right + 1) & 2) === 0;
          var yy = upward ? size - 1 - vert : vert;
          if (!isFn[yy][xx] && idx < all.length * 8) {
            modules[yy][xx] = getBit(all[idx >>> 3], 7 - (idx & 7));
            idx++;
          }
        }
      }
    }

    function applyMask(mask) {
      for (var y2 = 0; y2 < size; y2++) {
        for (var x2 = 0; x2 < size; x2++) {
          var inv;
          switch (mask) {
            case 0: inv = (x2 + y2) % 2 === 0; break;
            case 1: inv = y2 % 2 === 0; break;
            case 2: inv = x2 % 3 === 0; break;
            case 3: inv = (x2 + y2) % 3 === 0; break;
            case 4: inv = (Math.floor(x2 / 3) + Math.floor(y2 / 2)) % 2 === 0; break;
            case 5: inv = (x2 * y2) % 2 + (x2 * y2) % 3 === 0; break;
            case 6: inv = ((x2 * y2) % 2 + (x2 * y2) % 3) % 2 === 0; break;
            default: inv = ((x2 + y2) % 2 + (x2 * y2) % 3) % 2 === 0; break;
          }
          if (!isFn[y2][x2] && inv) { modules[y2][x2] = !modules[y2][x2]; }
        }
      }
    }

    var best = 0;
    var bestPen = Infinity;
    for (var mask = 0; mask < 8; mask++) {
      applyMask(mask);
      drawFormat(mask);
      var pen = penalty(modules, size);
      if (pen < bestPen) { best = mask; bestPen = pen; }
      applyMask(mask); /* annule le masque */
    }
    applyMask(best);
    drawFormat(best);

    return { size: size, version: ver, modules: modules };
  }

  /* ---------- Rendu SVG (sans innerHTML) ---------- */
  function svgElement(qr, label) {
    var ns = "http://www.w3.org/2000/svg";
    var border = 4; /* zone de silence imposée par la norme */
    var dim = qr.size + border * 2;
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 " + dim + " " + dim);
    svg.setAttribute("class", "qr-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", label || "QR code");
    svg.setAttribute("shape-rendering", "crispEdges");
    var bg = document.createElementNS(ns, "rect");
    bg.setAttribute("width", String(dim));
    bg.setAttribute("height", String(dim));
    bg.setAttribute("fill", "#ffffff");
    svg.appendChild(bg);
    var d = "";
    for (var y = 0; y < qr.size; y++) {
      var x = 0;
      while (x < qr.size) {
        if (qr.modules[y][x]) {
          var start = x;
          while (x < qr.size && qr.modules[y][x]) { x++; }
          d += "M" + (start + border) + "," + (y + border) + "h" + (x - start) + "v1h-" + (x - start) + "z";
        } else {
          x++;
        }
      }
    }
    var path = document.createElementNS(ns, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "#000000");
    svg.appendChild(path);
    return svg;
  }

  global.QR = { encode: encode, svgElement: svgElement, maxVersion: MAX_VERSION };
})(typeof window !== "undefined" ? window : globalThis);
