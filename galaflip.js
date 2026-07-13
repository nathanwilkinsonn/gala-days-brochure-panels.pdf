/* Berwick & District Gala Days - Flipbook engine
   Hosted externally so WordPress cannot mangle quotes.
   Renders the panel PDF into a simple, reliable page viewer. */
(function () {
  var PDF_URL = "https://nathanwilkinsonn.github.io/gala-days-brochure-panels.pdf/gala-days-brochure-panels.pdf";
  var PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  var WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  function boot() {
    var root = document.getElementById("galaFlip3");
    if (!root) return;
    var loading = root.querySelector("#gf3Loading");
    var viewport = root.querySelector("#gf3Viewport");
    var controls = root.querySelector("#gf3Controls");
    var hint = root.querySelector("#gf3Hint");
    var curEl = root.querySelector("#gf3Cur");
    var totEl = root.querySelector("#gf3Tot");

    function fail(msg) { if (loading) loading.innerHTML = '<div class="gf3-err">' + msg + "</div>"; }

    if (!window.pdfjsLib) { fail("The viewer library did not load."); return; }
    pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;

    var images = [], ratio = 0.5, idx = 0, total = 0, spread = false, animating = false;

    function computeSize() {
      var maxW = Math.min(root.clientWidth - 44, 1000);
      spread = window.innerWidth >= 760;
      var pageW = spread ? Math.min(maxW / 2, 460) : maxW;
      var pageH = pageW / ratio;
      var maxH = Math.min(window.innerHeight * 0.8, 900);
      if (pageH > maxH) { pageH = maxH; pageW = pageH * ratio; }
      return { w: Math.round(pageW), h: Math.round(pageH) };
    }

    function makePage(i, size) {
      var d = document.createElement("div");
      d.className = "gf3-page";
      d.style.width = size.w + "px";
      d.style.height = size.h + "px";
      if (images[i]) {
        var img = document.createElement("img");
        img.src = images[i];
        img.alt = "Brochure page " + (i + 1);
        img.draggable = false;
        d.appendChild(img);
      } else {
        d.style.background = "transparent";
        d.style.boxShadow = "none";
      }
      return d;
    }

    function render() {
      var size = computeSize();
      viewport.innerHTML = "";
      if (spread) {
        viewport.appendChild(makePage(idx, size));
        if (idx + 1 < total) viewport.appendChild(makePage(idx + 1, size));
      } else {
        viewport.appendChild(makePage(idx, size));
      }
      curEl.textContent = (idx + 1);
      controls.querySelector("#gf3Prev").disabled = (idx <= 0);
      controls.querySelector("#gf3Next").disabled = (idx >= total - (spread ? 2 : 1));
    }

    function step(dir) {
      if (animating) return;
      var advance = spread ? 2 : 1;
      var next = idx + dir * advance;
      if (next < 0) next = 0;
      if (next > total - 1) return;
      idx = next;
      animating = true;
      viewport.classList.add(dir > 0 ? "flipping-next" : "flipping-prev");
      setTimeout(render, 180);
      setTimeout(function () {
        viewport.classList.remove("flipping-next", "flipping-prev");
        animating = false;
      }, 520);
    }

    pdfjsLib.getDocument(PDF_URL).promise.then(function (pdf) {
      total = pdf.numPages;
      totEl.textContent = total;
      var scaleTarget = 2;

      function renderOne(n) {
        return pdf.getPage(n).then(function (page) {
          var vp1 = page.getViewport({ scale: 1 });
          if (n === 1) ratio = vp1.width / vp1.height;
          var vp = page.getViewport({ scale: scaleTarget });
          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d");
          canvas.width = vp.width; canvas.height = vp.height;
          return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
            images[n - 1] = canvas.toDataURL("image/jpeg", 0.9);
          });
        });
      }

      var chain = Promise.resolve();
      for (var i = 1; i <= total; i++) {
        (function (n) { chain = chain.then(function () { return renderOne(n); }); })(i);
      }

      return chain.then(function () {
        loading.style.display = "none";
        viewport.style.display = "flex";
        controls.style.display = "flex";
        hint.style.display = "block";
        render();

        controls.querySelector("#gf3Prev").onclick = function () { step(-1); };
        controls.querySelector("#gf3Next").onclick = function () { step(1); };
        controls.querySelector("#gf3Full").onclick = function () {
          if (!document.fullscreenElement) {
            (root.requestFullscreen || root.webkitRequestFullscreen || function () {}).call(root);
          } else {
            (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
          }
        };
        root.setAttribute("tabindex", "0");
        root.addEventListener("keydown", function (e) {
          if (e.key === "ArrowLeft") step(-1);
          if (e.key === "ArrowRight") step(1);
        });
        var rt;
        window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(render, 200); });
      });
    }).catch(function (e) {
      fail("Could not load the brochure PDF. (" + (e && e.message ? e.message : "unknown error") + ")");
    });
  }

  // Load pdf.js, then boot
  function loadScript(src, cb) {
    var s = document.createElement("script");
    s.src = src; s.onload = cb; s.onerror = function () {
      var l = document.querySelector("#galaFlip3 #gf3Loading");
      if (l) l.innerHTML = '<div class="gf3-err">Could not load the viewer library.</div>';
    };
    document.head.appendChild(s);
  }

  if (window.pdfjsLib) { boot(); }
  else { loadScript(PDFJS, boot); }
})();
