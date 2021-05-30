'use strict';
function Mash() {
    var n = 0xefc8249d;
    var mash = function (data) {
        if (data) {
            data = data.toString();
            for (var i = 0; i < data.length; i++) {
                n += data.charCodeAt(i);
                var h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 0x100000000;
            }
            return (n >>> 0) * 2.3283064365386963e-10;
        }
        else
            n = 0xefc8249d;
    };
    return mash;
}
export default function (seed) {
    var o = 48;
    var c = 1;
    var p = o;
    var s = new Array(o);
    var i, j, k = 0;
    var mash = Mash();
    for (i = 0; i < o; i++)
        s[i] = mash(Math.random().toString());
    function initState() {
        mash();
        for (i = 0; i < o; i++)
            s[i] = mash(' ');
        c = 1;
        p = o;
    }
    function cleanString(inStr) {
        inStr = inStr.replace(/(^\s*)|(\s*$)/gi, '');
        inStr = inStr.replace(/[\x00-\x1F]/gi, '');
        inStr = inStr.replace(/\n /, '\n');
        return inStr;
    }
    function hashString(inStr) {
        inStr = cleanString(inStr);
        mash(inStr);
        for (i = 0; i < inStr.length; i++) {
            k = inStr.charCodeAt(i);
            for (j = 0; j < o; j++) {
                s[j] -= mash(k.toString());
                if (s[j] < 0)
                    s[j] += 1;
            }
        }
    }
    initState();
    hashString(seed);
    return {
        random() {
            if (++p >= o)
                p = 0;
            var t = 1768863 * s[p] + c * 2.3283064365386963e-10;
            return (s[p] = t - (c = t | 0));
        }
    };
}
//# sourceMappingURL=uheprng.js.map