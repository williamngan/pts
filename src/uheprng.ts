'use strict';
/* This code has been written by Steve Gibson and can be found here:
 *
 * https://www.grc.com/otg/uheprng.htm
 * 
 * The code has been converted to typescript and unused functions have 
 * been removed
 */

/*	============================================================================
                                    Gibson Research Corporation
                UHEPRNG - Ultra High Entropy Pseudo-Random Number Generator
    ============================================================================
    LICENSE AND COPYRIGHT:  THIS CODE IS HEREBY RELEASED INTO THE PUBLIC DOMAIN
    Gibson Research Corporation releases and disclaims ALL RIGHTS AND TITLE IN
    THIS CODE OR ANY DERIVATIVES. Anyone may be freely use it for any purpose.
    ============================================================================
    This is GRC's cryptographically strong PRNG (pseudo-random number generator)
    for JavaScript. It is driven by 1536 bits of entropy, stored in an array of
    48, 32-bit JavaScript variables.  Since many applications of this generator,
    including ours with the "Off The Grid" Latin Square generator, may require
    the deteriministic re-generation of a sequence of PRNs, this PRNG's initial
    entropic state can be read and written as a static whole, and incrementally
    evolved by pouring new source entropy into the generator's internal state.
    ----------------------------------------------------------------------------
    ENDLESS THANKS are due Johannes Baagoe for his careful development of highly
    robust JavaScript implementations of JS PRNGs.  This work was based upon his
    JavaScript "Alea" PRNG which is based upon the extremely robust Multiply-
    With-Carry (MWC) PRNG invented by George Marsaglia. MWC Algorithm References:
    http://www.GRC.com/otg/Marsaglia_PRNGs.pdf
    http://www.GRC.com/otg/Marsaglia_MWC_Generators.pdf
    ----------------------------------------------------------------------------
    The quality of this algorithm's pseudo-random numbers have been verified by
    multiple independent researchers. It handily passes the fermilab.ch tests as
    well as the "diehard" and "dieharder" test suites.  For individuals wishing
    to further verify the quality of this algorithm's pseudo-random numbers, a
    256-megabyte file of this algorithm's output may be downloaded from GRC.com,
    and a Microsoft Windows scripting host (WSH) version of this algorithm may be
    downloaded and run from the Windows command prompt to generate unique files
    of any size:
    The Fermilab "ENT" tests: http://fourmilab.ch/random/
    The 256-megabyte sample PRN file at GRC: https://www.GRC.com/otg/uheprng.bin
    The Windows scripting host version: https://www.GRC.com/otg/wsh-uheprng.js
    ----------------------------------------------------------------------------
    Qualifying MWC multipliers are: 187884, 686118, 898134, 1104375, 1250205,
    1460910 and 1768863. (We use the largest one that's < 2^21)
    ============================================================================ 
*/

/*	============================================================================
    This is based upon Johannes Baagoe's carefully designed and efficient hash
    function for use with JavaScript.  It has a proven "avalanche" effect such
    that every bit of the input affects every bit of the output 50% of the time,
    which is good.	See: http://baagoe.com/en/RandomMusings/hash/avalanche.xhtml
    ============================================================================
*/
function Mash() {
    var n = 0xefc8249d;
    var mash = function (data?: string) {
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
                n += h * 0x100000000; // 2^32
            }
            return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
        } else n = 0xefc8249d;
    };
    return mash;
}

export default function(seed: string) {
    var o = 48; // set the 'order' number of ENTROPY-holding 32-bit values
    var c = 1; // init the 'carry' used by the multiply-with-carry (MWC) algorithm
    var p = o; // init the 'phase' (max-1) of the intermediate variable pointer
    var s = new Array(o); // declare our intermediate variables array
    var i: number,
        j: number,
        k = 0; // general purpose locals

    // when our "uheprng" is initially invoked our PRNG state is initialized from the
    // browser's own local PRNG. This is okay since although its generator might not
    // be wonderful, it's useful for establishing large startup entropy for our usage.
    var mash = Mash(); // get a pointer to our high-performance "Mash" hash
    for (i = 0; i < o; i++) s[i] = mash(Math.random().toString()); // fill the array with initial mash hash values

    // if we want to provide a deterministic startup context for our PRNG,
    // but without directly setting the internal state variables, this allows
    // us to initialize the mash hash and PRNG's internal state before providing
    // some hashing input
    function initState() {
        mash(); // pass a null arg to force mash hash to init
        for (i = 0; i < o; i++) s[i] = mash(' '); // fill the array with initial mash hash values
        c = 1; // init our multiply-with-carry carry
        p = o; // init our phase
    }

    // this EXPORTED "clean string" function removes leading and trailing spaces and non-printing
    // control characters, including any embedded carriage-return (CR) and line-feed (LF) characters,
    // from any string it is handed. this is also used by the 'hashstring' function (below) to help
    // users always obtain the same EFFECTIVE uheprng seeding key.
    function cleanString(inStr: string) {
        inStr = inStr.replace(/(^\s*)|(\s*$)/gi, ''); // remove any/all leading spaces
        inStr = inStr.replace(/[\x00-\x1F]/gi, ''); // remove any/all control characters
        inStr = inStr.replace(/\n /, '\n'); // remove any/all trailing spaces
        return inStr; // return the cleaned up result
    }

    // this EXPORTED "hash string" function hashes the provided character string after first removing
    // any leading or trailing spaces and ignoring any embedded carriage returns (CR) or Line Feeds (LF)
    function hashString(inStr: string) {
        inStr = cleanString(inStr);
        mash(inStr); // use the string to evolve the 'mash' state
        for (i = 0; i < inStr.length; i++) {
            // scan through the characters in our string
            k = inStr.charCodeAt(i); // get the character code at the location
            for (j = 0; j < o; j++) {
                // 	"mash" it into the UHEPRNG state
                s[j] -= mash(k.toString());
                if (s[j] < 0) s[j] += 1;
            }
        }
    }

    initState();
    hashString(seed);

    return {
        /**
         * this (not anymore) PRIVATE (internal access only) function is the heart of the multiply-with-carry
         * (MWC) PRNG algorithm. When called it returns a pseudo-random number in the form of a
         * 32-bit JavaScript fraction (0.0 to <1.0) it is a PRIVATE function used by the default
         * [0-1] return function, and by the random 'string(n)' function which returns 'n'
         * characters from 33 to 126.
         * @returns a number between 0.0 and 1.0
         */
        random() {
            if (++p >= o) p = 0;
            var t = 1768863 * s[p] + c * 2.3283064365386963e-10; // 2^-32
            return (s[p] = t - (c = t | 0));
        }
    };
}
