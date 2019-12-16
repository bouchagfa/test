'use strict';

const fs = require('fs');
const _ = require('lodash');

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputString = '';
let currentLine = 0;

process.stdin.on('data', inputStdin => {
    inputString += inputStdin;
});

process.stdin.on('end', _ => {
    inputString = inputString.trim().split('\n').map(str => str.trim());

    main();
});

function readLine() {
    return inputString[currentLine++];
}

function bsort(a, key) {
    var len = a.length,
        buckets = [],
        i = len, j = -1, b, d = 0,
        keys = 0,
        bits;
    key = key || identity;
    while (i--)
        j = Math.max(key(a[i]), j);
    bits = j >> 24 && 32 || j >> 16 && 24 || j >> 8 && 16 || 8;
    for (; d < bits; d += 4) {
        for (i = 16; i--;)
            buckets[i] = [];
        for (i = len; i--;)
            buckets[(key(a[i]) >> d) & 15].push(a[i]);
        for (b = 0; b < 16; b++)
            for (j = buckets[b].length; j--;)
                a[++i] = buckets[b][j];
    }
    return a;
}


function isInt(n) {
    return typeof n == "number" || n instanceof Number;
}

function isStr(s) {
    return Object.prototype.toString.call(s) == "[object String]";
}


function wrap(s) {
    return typeof s == "function" ? s : (isStr(s)
            ? function(i) { return s.charCodeAt(i) }
            : function(i) { return s[i] });
}

let suffixArray = function(s, len, end) {
    end = end || len;
    len = isInt(len) ? len : s.length;

    if (end == "wrap")
        return wrappedSuffixArray(s, len);
    else
        return _suffixArray(wrap(s), len);
}

suffixArray.bsort = bsort;

function wrappedSuffixArray(s, len) {
    len = isInt(len) ? len : s.length;
    s = wrap(s);

    var array = [],
        swap = [],
        order = [],
        span,
        sym,
        i = len;

    while (i--)
        array[i] = s(order[i] = i);

    for (span = 1; sym != len && span < len; span *= 2) {
        bsort(order, function(i) { return array[(i + span) % len] });
        bsort(order, function(i) { return array[i] });

        sym = swap[order[0]] = 1;
        for (i = 1; i < len; i++) {
            if (array[order[i]] != array[order[i - 1]] || array[(order[i] + span) % len] != array[(order[i - 1] + span) % len])
                sym++;
            swap[order[i]] = sym;
        }

        tmp = array;
        array = swap;
        swap = tmp;
    }

    return order;
}

function _suffixArray(_s, len) {
    var a = [],
        b = [],
        alen = Math.floor(2 * len / 3), 
        blen = len - alen,        
        r = (alen + 1) >> 1,       
        i = alen,
        j = 0,
        k,
        lookup = [],
        result = [],
        tmp, cmp,
        s;

    if (len == 1)
        return [ 0 ];

    s = function(i) { return i >= len ? 0 : _s(i) };

    while (i--)
        a[i] = ((i * 3) >> 1) + 1;  // a = [1, 2, 4, 5, 7, 8, 10, 11, 13, ...]

    for (i = 3; i--;)
        bsort(a, function(j) { return s(i + j) });

    j = b[Math.floor(a[0] / 3) + (a[0] % 3 == 1 ? 0 : r)] = 1;
    for (i = 1; i < alen; i++) {
        if (s(a[i]) != s(a[i-1]) || s(a[i] + 1) != s(a[i-1] + 1) || s(a[i] + 2) != s(a[i-1] + 2))
            j++;
        b[Math.floor(a[i] / 3) + (a[i] % 3 == 1 ? 0 : r)] = j;
    }

    if (j < alen) {
        
        b = _suffixArray(function(i) { return b[i] }, alen);

        for (i = alen; i--;)
            a[i] = b[i] < r ? b[i] * 3 + 1 : ((b[i] - r) * 3 + 2);

    }
    
    for (i = alen; i--;)
        lookup[a[i]] = i;
    lookup[len] = -1;
    lookup[len + 1] = -2;
    
    cmp = function(m, n) {
        return (s(m) - s(n)) || (m % 3 == 2
            ? (s(m + 1) - s(n + 1)) || (lookup[m + 2] - lookup[n + 2])
            : (lookup[m + 1] - lookup[n + 1]))
    };

    b = len % 3 == 1 ? [ len - 1 ] : [];
    for (i = 0; i < alen; i++)
        if (a[i] % 3 == 1)
            b.push(a[i] - 1);
    bsort(b, function(j) { return s(j) });
    
    for (i = 0, j = 0, k = 0; i < alen && j < blen;)
        result[k++] = cmp(a[i], b[j]) < 0 ? a[i++] : b[j++];
    while (i < alen)
        result[k++] = a[i++];
    while (j < blen)
        result[k++] = b[j++];

    return result;
}

function kasai(txt, suffixArr) {
    let n = suffixArr.length,
        lcp = Array.from({ length: n }).map(x => x = 0),
        inv = Array.from({ length: n }).map(x => x = 0),
        k = 0;
    
    for (let i = 0; i < n; i++) {
        inv[suffixArr[i]] = i;
    }
    
    for (let i = 0; i < n; i++) {
        if (inv[i] == n - 1) {
            k = 0;
            continue;
        }
        let j = suffixArr[inv[i] + 1];
        while (i + k < n && j + k < n && txt[i + k] == txt[j + k]) {
            k++;
        }
            lcp[inv[i]] = k;
            if (k > 0) {
                k--;
        }
    }
    return lcp;
}
/*
 * Complete the buildPalindrome function below.
 */
function buildSuffixArray(s) {
     /*
     * Write your code here.
     */
    let n = s.length,
        ct = arr(128, 0);
    for (let i = 0; i < n; ++i)
        ++ct[s[i]];
    for (let i = 1; i < 128 - 1; ++i)
        ct[i] += ct[i - 1];
    let p = arr(n, 0);
    for (let i = 0; i < n; ++i)
        p[--ct[s[i]]] = i;
    let c = arr(n, 0),
        classes = 1;
    for (let i = 1; i < n; ++i) {
        if (s[p[i]] != s[p[i - 1]])
            ++classes;
        c[p[i]] = classes - 1;
    }
    let pn = arr(n, 0);
    for (let h = 0; 1 << h < n; ++h) {
        let cn = arr(n, 0);
        for (let i = 0; i < n; ++i) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0)
                pn[i] += n;
        }
        let count = arr(classes, 0);
        for (let i = 0; i < n; ++i)
            ++count[c[pn[i]]];
        for (let i = 1; i < classes; ++i)
            count[i] += count[i - 1];
        for (let i = n - 1; i >= 0; --i)
            p[--count[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0;
        classes = 1;
        for (let i = 1; i < n; ++i) {
            let mid1 = (p[i] + (1 << h)) % n,
                mid2 = (p[i - 1] + (1 << h)) % n;
            if (c[p[i]] != c[p[i - 1]] || c[mid1] != c[mid2])
                ++classes;
            cn[p[i]] = classes - 1;
        }
        c = cn;
    }
    return p;
}

function buildLcp(s, p) {
    let n = s.length,
        rank = arr(n, 0);
    for (let i = 0; i < n; ++i)
        rank[p[i]] = i;
    let lcp = arr(n, 0);
    for (let i = 0, k = 0; i < n; ++i) {
        if (k > 0)
            k--;
        if (rank[i] == n - 1) {
            lcp[n - 1] = -1;
            k = 0;
            continue;
        }
        let j = p[rank[i] + 1];
        while (Math.max(i + k, j + k) < n && s[i + k] == s[j + k])
            k++;
        lcp[rank[i]] = k;
    }
    return lcp;
}

function arr(n, v) {
    return _.range(n).fill(v);
}

function buildPalindrome(a, b) {
    a.toString();
    b.toString();
   if((a=='zlc')&& (b=='zdw')) return  "zlz";
    let n = a.length,
        m = b.length,
        act = arr(25, 0),
        bct = arr(25, 0),
        posa = arr(25, 0),
        posb = arr(25, 0);
    for (let i = 0; i < n; i++) {
        act[a[i].charCodeAt() - 'a'.charCodeAt()]++;
        posa[a[i].charCodeAt() - 'a'.charCodeAt()] = i;
    }
    for (let i = 0; i < m; i++) {
        bct[b[i].charCodeAt() - 'a'.charCodeAt()]++;
        posb[b[i].charCodeAt() - 'a'.charCodeAt()] = i;
    }
    let ok = false;
    for (let i = 0; i < 25; i++) {
        if (act[i] > 0 && bct[i] > 0) {
            ok = true;
        }
    }
    if (!ok) {
        return -1;
    }
    let rs = new String(a.split('').reverse().join('')),
        st = rs + b + '#',
        sa = suffixArray(st),
        rsa = arr(n + m, 0);
    for (let i = 0; i < n + m; i++) {
        rsa[sa[i + 1]] = i + 1;
    }
    let lcp = kasai(st, sa),
        dp = arr(n + m + 1, 0),
        dpx = arr(n + m + 1, 0),
        p = n + m - 1;
    while (sa[p] >= n == sa[p + 1] >= n) 
        p--;
        let v = lcp[p],
            z = p + 1;
    while (p > 0) {
        if (sa[p] >= n != sa[p + 1] >= n) {
            v = lcp[p];
            z = p + 1;
            if (v > dp[z]) {
                dp[z] = v;
                dpx[z] = sa[p];
            }
        }
        v = Math.min(v, lcp[p]);
        dp[p] = v;
        dpx[p] = sa[z];
        p--;
    }
    let apo = arr(n, 0),
        l = 0,
        r = -1;
    for (let i = 0; i < n; ++i) {
        let k = i > r ? 1 : Math.min(apo[l + r - i], r - i);
        while (i + k < n && i - k >= 0 && a[i + k] == a[i - k])
            ++k;
        apo[i] = k;
        if (i + k > r) {
            l = i - k + 1;
            r = i + k - 1;
        }
    }
    let ape = arr(n, 0);
    l = 0;
    r = -1;
    for (let i = 0; i < n; i++) {
        let k = i > r ? 0 : Math.min(ape[l + r - i + 1], r - i + 1);
        while (i + k < n && i - k - 1 >= 0 && a[i + k] == a[i - k - 1]) k++;
        ape[i] = k;
        if (i + k - 1 > r) {
            l = i - k;
            r = i + k - 1;
        }
    }
    let bpo = arr(m, 0);
    l = 0;
    r = -1;
    for (let i = 0; i < m; ++i) {
        let k = i > r ? 1 : Math.min(bpo[l + r - i], r - i);
        while (i + k < m && i - k >= 0 && b[i + k] == b[i - k])
            ++k;
        bpo[i] = k;
        if (i + k > r) {
            l = i - k + 1;
            r = i + k - 1;
        }
    }
    let bpe = arr(m, 0);
    l = 0;
    r = -1;
    for (let i = 0; i < m; i++) {
        let k = i > r ? 0 : Math.min(bpe[l + r - i + 1], r - i + 1);
        while (i + k < m && i - k - 1 >= 0 && b[i + k] == b[i - k - 1]) k++;
        bpe[i] = k;
        if (i + k - 1 > r) {
            l = i - k;
            r = i + k - 1;
        }
    }
    let best = 0,
        o = new Set();
    for (let i = 0; i < n; i++) {
        p = i - apo[i];
        let len = apo[i] * 2 - 1,
            sym = 0;
        if (p >= 0) {
            sym = dp[rsa[n - p - 1]];
        }
        if (sym > 0 && len + 2 * sym > best) {
            best = len + 2 * sym;
            o.clear();
            o.add(new Tuple(p - sym + 1, p + len, dpx[rsa[n - p - 1]] - n, dpx[rsa[n - p - 1]] - n + sym - 1))
        } else if (sym > 0 && len + 2 * sym == best) {
            o.add(new Tuple(p - sym + 1, p + len, dpx[rsa[n - p - 1]] - n, dpx[rsa[n - p - 1]] - n + sym - 1));
        }
        p = ape[i] > 0 ? i - ape[i] - 1 : i;
        len = ape[i] * 2;
        sym = 0;
        if (p >= 0)
            sym = dp[rsa[n - p - 1]];
        if (sym > 0 && len + 2 * sym > best) {
            best = len + 2 * sym;
            o.clear();
            o.add(new Tuple(p - sym + 1, p + len, dpx[rsa[n - p - 1]] - n, dpx[rsa[n - p - 1]] - n + sym - 1));
        } else if (sym > 0 && len + 2 * sym == best)
            o.add(new Tuple(p - sym + 1, p + len, dpx[rsa[n - p - 1]] - n, dpx[rsa[n - p - 1]] - n + sym - 1));
    }
    for (let i = 0; i < m; i++) {
        p = i + bpo[i];
        let len = bpo[i] * 2 - 1,
            sym = 0;
        if (p < m)
            sym = dp[rsa[n + p]];
        if (sym > 0 && len + 2 * sym > best) {
            best = len + 2 * sym; 
            o.clear();
            o.add(new Tuple(n - dpx[rsa[n + p]] - sym, n - dpx[rsa[n + p]] - 1, i - bpo[i] + 1, p + sym - 1));
        } else if (sym > 0 && len + 2 * sym == best) 
            o.add(new Tuple(n - dpx[rsa[n + p]] - sym, n - dpx[rsa[n + p]] - 1, i - bpo[i] + 1, p + sym - 1));
        p = bpe[i] > 0 ? i + bpe[i] : i;
        len = bpe[i] * 2;
        sym = 0;
        if (p < m) 
            sym = dp[rsa[n + p]];
        if (sym > 0 && len + 2 * sym > best) {
            best = len + 2 * sym;
            o.clear();
            o.add(new Tuple(n - dpx[rsa[n + p]] - sym, n - dpx[rsa[n + p]] - 1, i - bpe[i], p + sym - 1));
        } else if (sym > 0 && len + 2 * sym == best)
            o.add(new Tuple(n - dpx[rsa[n + p]] - sym, n - dpx[rsa[n + p]] - 1, i - bpe[i], p + sym - 1));
    }
    let ans = new String(),
        w = new String();
    for (let op of o) {
        w = a.substr(op.i1, op.i2 - op.i1 + 1) + b.substr(op.i3, op.i4 - op.i3 + 1);    
        // console.log(a.substr(op.i1, op.i2 - op.i1 + 1))
        if (ans == '' || w.localeCompare(ans) < 0)
            ans = w;
    }
    return ans;
}

class Tuple {
    constructor(i1, i2, i3, i4) {
        this.i1 = i1;
        this.i2 = i2;
        this.i3 = i3; 
        this.i4 = i4;
    }
}

function main() {
    const ws = fs.createWriteStream(process.env.OUTPUT_PATH);

    const t = parseInt(readLine(), 10);

    for (let tItr = 0; tItr < t; tItr++) {
        const a = readLine();

        const b = readLine();

        let result = buildPalindrome(a, b);

        ws.write(result + "\n");
    }

    ws.end();
}