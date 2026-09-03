var sourceRoot = "https://github.com/williamngan/pts/blob/master/";
var _search = [];
// API comments are Markdown, never executable HTML. markdown-it also rejects
// unsafe link protocols such as javascript: by default.
var docsMarkdown = markdownit({ html: false });

function loadJSON(url, callback) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      try {
        callback(JSON.parse(request.responseText), "success");
      } catch (error) {
        callback(false, "parse error");
      }
    } else {
      callback(false, "server error");
    }
  };

  request.onerror = function () {
    callback(false, "connection error");
  };

  request.send();
}

loadJSON("./json/modules.json", (data, status) => {
  if (!data) return;

  let ms = [];
  let m_types = null;
  for (var k in data) {
    let m = [k];
    m.push(data[k]);

    if (k == "Types") {
      // Types should be last in list
      m_types = m;
    } else {
      ms.push(m);
    }
  }

  ms.sort(function (a, b) {
    return a[0] === b[0] ? 0 : a[0] < b[0] ? -1 : 1;
  });

  // push Types to last in list
  if (m_types) ms.push(m_types);

  app.modules = ms;

  let qsel = qs("p", 40);
  if (qsel) {
    loadContents(qsel, window.location.hash);
  }
});

loadJSON("./json/search.json", (data, status) => {
  _search = data || [];

  let se = document.querySelector("#search_input");
  se.addEventListener("input", function (evt) {
    if (!se.value) {
      app.search([], "");
    } else {
      app.search(getSearchResult(se.value), se.value);
    }
  });

  document
    .querySelector("#clearSearch")
    .addEventListener("click", function (evt) {
      app.search([], "");
      se.value = "";
    });
});

var app = Vue.createApp({
  data: function () {
    return {
      message: "",
      modules: [],
      searchResults: [],
      searchQuery: "",
      contents: {
        name: "",
        constructor: {},
        methods: [],
        accessors: [],
        variables: [],
        properties: [],
        type_alias: [],
        count: 0,
      },
      loadError: false,
      selected: "",
      selHash: "",
    };
  },

  methods: {
    navigate: function (event, page, hash) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      if (this.selected === page) this.jumpTo(hash);
      else loadContents(page, hash);
    },
    searchLink: function (link) {
      let n = link[0].split("#");
      if (this.selected && n[0] === this.selected) {
        this.jumpTo(n[1]);
      } else {
        window.location = getRoot() + "?p=" + link[0];
      }
    },

    test: function (m) {
      this.message = m;
    },

    loadClass: function (mod, cls) {
      loadContents(mod + "_" + cls);
    },

    jumpTo: function (id, ignoreHistory) {
      if (!id) {
        document.querySelector("#contents").scrollTo(0, 0);
        return;
      }
      let elem = document.getElementById(id);
      if (elem) {
        elem.scrollIntoView(true);
        if (!ignoreHistory) setHistory(app.selected, id);
      }
    },

    md: function (s) {
      if (!s || typeof s !== "string") return "";
      return docsMarkdown.render(s);
    },

    source: function (s) {
      return s && s.length > 0 ? `${sourceRoot}${s[0][0]}#L${s[0][1]}` : "#";
    },

    showSource: function (s) {
      var hide = !s || !s[0][0] || s[0][0].indexOf("node_modules") >= 0;
      return !hide;
    },

    params: function (sig) {
      if (sig && sig[0]) {
        var ls = [];
        var ps = sig[0].parameters || [];
        for (var i = 0, len = ps.length; i < len; i++) {
          ls.push(ps[i].name);
        }
        return ls.join(", ");
      }
      return "";
    },

    anchor: function (prefix, member) {
      return memberAnchor(prefix, member);
    },

    search: function (res, query) {
      app.searchResults = res;
      app.searchQuery = query;
      document.querySelector("#search").className =
        query.length > 0 ? "searching" : "";
      if (
        query &&
        getComputedStyle(document.querySelector("#toc")).display !== "none"
      )
        toggleMenu(true);
    },

    expandMemberPane: function () {
      return this.contents.count > 5 || this.searchQuery.length > 0;
    },

    clickTarget: function (evt) {
      if (
        evt.target.tagName.toLowerCase() === "code" &&
        evt.target.parentElement.getAttribute("href") === "#link"
      ) {
        evt.preventDefault();
        evt.stopPropagation();
        var currId = getParentID(evt.target, 0);
        if (currId && app.selected) setHistory(app.selected, currId);
        app.codeLink(evt.target.textContent);
        return false;
      }
    },

    codeLink: function (q) {
      loadFirstResult(q);
    },
  },

  updated: function () {
    if (this.selHash) {
      this.jumpTo(this.selHash, true);
    }
  },
}).mount("#docapp");

// ---

function qs(name, limit, path) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(path ? path : location.search);
  let q =
    results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  return clean_str(q, limit);
}

function qsHash(path) {
  let idx = path.lastIndexOf("#");
  return idx >= 0 ? path.substr(idx + 1) : "";
}

function clean_str(str, limit) {
  if (limit) str = str.substr(0, limit);
  return str.replace(/[^a-zA-Z0-9._\$]/g, "_");
}

function getParentID(elem, depth = 0) {
  if (depth > 5) return "";
  var id = elem.parentElement.getAttribute("id");
  return id ? id : getParentID(elem.parentElement, depth + 1);
}

function loadContents(id, hash, reloading) {
  if (!id) return;
  if (!hash) hash = "";
  if (hash.indexOf("#") === 0) hash = hash.substr(1);
  hash = clean_str(hash);

  loadJSON(`./json/class/${id}.json`, (data, status) => {
    if (!data) {
      resetContents();
      app.contents.name = "Page not found";
      app.contents.comment = `The requested documentation page \`${id}\` could not be loaded.`;
      app.loadError = true;
      app.selected = id;
      app.selHash = "";
      if (!reloading) setHistory(id, "");
      document.getElementById("members").scrollTo(0, 0);
      document.getElementById("contents").scrollTo(0, 0);
      return;
    }

    app.loadError = false;
    app.contents.name = data.name;
    app.contents.kind = data.kind;
    app.contents.comment = data.comment;
    app.contents.source = data.source;
    app.contents.extends = data.extends;
    app.contents.implements = data.implements;

    app.contents.constructor = data.constructor || [];
    app.contents.methods = data.methods ? data.methods.sort(sortInherited) : [];
    app.contents.accessors = data.accessors
      ? data.accessors.sort(sortInherited)
      : [];
    app.contents.variables = data.variables
      ? data.variables.sort(sortInherited)
      : [];
    app.contents.properties = data.properties
      ? data.properties.sort(sortInherited)
      : [];
    app.contents.type_alias = data.type_alias || [];
    app.contents.count =
      app.contents.methods.length +
      app.contents.accessors.length +
      app.contents.variables.length +
      app.contents.properties.length +
      app.contents.type_alias.length;

    app.selected = id;
    app.selHash = hash;

    if (!reloading) {
      setHistory(id, hash);
    }

    setTimeout(function () {
      document.getElementById("members").scrollTo(0, 0);
      document.getElementById("contents").scrollTo(0, 0);
      app.jumpTo(hash, reloading);
    }, 100);
  });
}

function getSearchResult(q) {
  let query = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (query.length === 0) return [];
  let res = _search.filter((v) => {
    let name = v[1].toLowerCase();
    return query.every((part) => name.indexOf(part) >= 0);
  });
  return res
    .sort((a, b) => b[3] * 100 - b[0].length - (a[3] * 100 - a[0].length))
    .slice(0, 50);
}

function loadFirstResult(q) {
  let skips = [
    "number",
    "boolean",
    "this",
    "string",
    "object",
    "void",
    "any",
    "Fn",
  ];
  for (let i = 0, len = skips.length; i < len; i++) {
    if (q.indexOf(skips[i]) === 0) return;
  }

  if (q.indexOf(" | ")) q = q.split(" ")[0];

  let res = getSearchResult(q);
  if (res && res[0]) {
    let qsel = qs("p", 40, "?p=" + res[0][0]);
    if (qsel) loadContents(qsel, qsHash(res[0][0]), false);
  }
}

function sortInherited(a, b) {
  return (
    (a.inherits ? 100000 : 0) -
    (b.inherits ? 100000 : 0) +
    a.name.localeCompare(b.name)
  );
}

function memberAnchor(prefix, member) {
  let qualifier =
    prefix === "function" && member.flags && member.flags.isStatic
      ? "static_"
      : "";
  return `${prefix}_${qualifier}${member.name}`;
}

function getRoot() {
  return (
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname
  );
}

var lastHistory = "";

function setHistory(id, hash) {
  if (id + hash === lastHistory) {
    return;
  } else {
    lastHistory = id + hash;
  }

  app.selected = id;

  if (history.pushState) {
    let pid = id ? "?p=" + id : "";
    if (pid.length > 0) {
      var newurl = getRoot() + pid + (hash ? "#" + hash : "");
      window.history.pushState({ path: newurl }, "", newurl);
      toggleMenu(false);
      if (!hash) document.querySelector("#contents").scrollTo(0, 0);
    }
  }
}

function resetContents() {
  app.contents = {
    name: " ",
    constructor: {},
    methods: [],
    accessors: [],
    variables: [],
    properties: [],
    type_alias: [],
    count: 0,
  };
  app.loadError = false;
}

var _menu_toggle = false;
var mobileMenu = window.matchMedia(
  "(max-width: 768px), (max-device-width: 768px)",
);

function syncMenuAccessibility() {
  const menu = document.querySelector("#menu");
  const hidden = mobileMenu.matches && !_menu_toggle;
  if (hidden && menu.contains(document.activeElement)) {
    document.querySelector("#contents").focus({ preventScroll: true });
  }
  menu.inert = hidden;
  menu.setAttribute("aria-hidden", String(hidden));
}

function toggleMenu(t) {
  _menu_toggle = t !== undefined ? t : !_menu_toggle;
  document.querySelector("#menu").className = _menu_toggle ? "visible" : "";
  document
    .querySelector("#toc")
    .setAttribute("aria-expanded", String(_menu_toggle));
  syncMenuAccessibility();
}

document.querySelector("#toc").addEventListener("click", function (evt) {
  toggleMenu();
  if (_menu_toggle) document.querySelector("#modules .item").focus();
});

mobileMenu.addEventListener("change", function () {
  toggleMenu(false);
});
syncMenuAccessibility();

document.querySelector("#close").addEventListener("click", function () {
  toggleMenu(false);
  document.querySelector("#toc").focus();
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && _menu_toggle) {
    toggleMenu(false);
    document.querySelector("#toc").focus();
  }
});

// Native hash links and history entries need not carry our pushState payload.
// The address bar, not optional history state, is the navigation source of truth.
window.addEventListener("popstate", function () {
  const qsel = qs("p", 40);
  if (qsel) {
    loadContents(qsel, window.location.hash, true);
  } else {
    resetContents();
    app.selected = "";
    app.selHash = "";
    lastHistory = "";
  }
});
