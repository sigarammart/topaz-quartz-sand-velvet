<?php
/**
 * Plugin Name: XP App Install Button
 * Plugin URI: https://app.xplorepondy.com/get-app
 * Description: Shows a fixed Install XP App bar on xplorepondy.com. Opens the PWA at app.xplorepondy.com.
 * Version: 1.0.1
 * Author: Xplore Pondy
 * Author URI: https://xplorepondy.com
 * License: GPL-2.0-or-later
 * Text Domain: xp-app-install
 */
if (!defined("ABSPATH")) {
    exit;
}

add_action("wp_footer", "xp_app_install_bar", 99);

function xp_app_install_bar()
{
    if (is_admin()) {
        return;
    }
    ?>
<script>
(function () {
  if (window.__xpInstallBar) return;
  window.__xpInstallBar = true;
  var APP = "https://app.xplorepondy.com";
  if (/\/wp-admin|wp-login\.php/i.test(location.pathname || "")) return;
  if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return;
  if (navigator.standalone) return;
  try { if (localStorage.getItem("xp-hide-wp-install") === "1") return; } catch (e) {}
  var ua = navigator.userAgent || "";
  var isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var href = isIOS ? APP + "/?install=1&platform=ios" : APP + "/get-app";
  var hostEl = document.createElement("div");
  hostEl.id = "xp-install-host";
  hostEl.style.cssText = "all:initial;position:fixed;left:0;right:0;bottom:0;z-index:2147483000;";
  var shadow = hostEl.attachShadow({ mode: "open" });
  shadow.innerHTML =
    "<style>" +
    ":host{all:initial}" +
    "*{box-sizing:border-box;font-family:Figtree,system-ui,-apple-system,sans-serif}" +
    ".bar{margin:0 auto;max-width:28rem;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px))}" +
    ".card{display:flex;align-items:center;gap:10px;padding:8px 8px 8px 10px;border-radius:18px;background:#0b1213;color:#efe8dc;box-shadow:0 10px 28px rgba(0,0,0,.35)}" +
    "img{width:40px;height:40px;border-radius:12px;object-fit:cover;background:#000;flex:none}" +
    ".copy{min-width:0;flex:1}" +
    ".kicker{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#9aa5a2}" +
    ".title{display:block;font-size:14px;font-weight:650;line-height:1.25;color:#efe8dc}" +
    "a.btn{flex:none;display:inline-flex;align-items:center;justify-content:center;height:36px;padding:0 14px;border-radius:999px;background:#4db8bf;color:#072022;font-size:13px;font-weight:700;text-decoration:none}" +
    "button.close{flex:none;width:36px;height:36px;border:0;border-radius:999px;background:transparent;color:#9aa5a2;cursor:pointer;font-size:22px;line-height:1}" +
    "</style>" +
    '<div class="bar"><div class="card">' +
    '<img src="' + APP + '/icon-192.png" alt="" width="40" height="40">' +
    '<span class="copy"><span class="kicker">Xplore Pondy</span><span class="title">Install XP App</span></span>' +
    '<a class="btn" href="' + href + '">Install</a>' +
    '<button class="close" type="button" aria-label="Dismiss">×</button>' +
    "</div></div>";
  shadow.querySelector(".close").addEventListener("click", function () {
    try { localStorage.setItem("xp-hide-wp-install", "1"); } catch (e) {}
    hostEl.remove();
  });
  document.body.appendChild(hostEl);
})();
</script>
    <?php
}
