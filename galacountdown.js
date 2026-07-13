/* Berwick & District Gala Days - Countdown engine
   Hosted externally so WordPress cannot mangle quotes. */
(function () {
  // Opening day: Wednesday, September 2, 2026, 7:00 PM (Opening Ceremony)
  var TARGET = new Date("2026-09-02T19:00:00-03:00").getTime(); // Atlantic time

  function boot() {
    var root = document.getElementById("galaCountdown");
    if (!root) return;
    var dEl = root.querySelector("#gcDays");
    var hEl = root.querySelector("#gcHours");
    var mEl = root.querySelector("#gcMins");
    var sEl = root.querySelector("#gcSecs");
    var msgEl = root.querySelector("#gcMsg");
    var gridEl = root.querySelector("#gcGrid");

    function pad(n) { return (n < 10 ? "0" : "") + n; }

    function tick() {
      var now = Date.now();
      var diff = TARGET - now;

      if (diff <= 0) {
        // Festival window is ~6 days (Sept 2-7). Show a live message during, then wrap-up after.
        var endWindow = new Date("2026-09-08T00:00:00-03:00").getTime();
        if (now < endWindow) {
          gridEl.style.display = "none";
          msgEl.style.display = "block";
          msgEl.innerHTML = "It&rsquo;s happening now &mdash; see you at the Valley! &#127822;";
        } else {
          gridEl.style.display = "none";
          msgEl.style.display = "block";
          msgEl.innerHTML = "Thanks for celebrating with us &#127822; See you next year!";
        }
        return;
      }

      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      var secs = Math.floor((diff % 60000) / 1000);

      dEl.textContent = days;
      hEl.textContent = pad(hours);
      mEl.textContent = pad(mins);
      sEl.textContent = pad(secs);
    }

    tick();
    setInterval(tick, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
