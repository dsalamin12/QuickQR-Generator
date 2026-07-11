// ==========================================
// QuickQR Cookie Consent Banner
// Banner is a non-blocking fixed card (no backdrop/overlay), so visitors
// can keep scrolling and using the site without tapping Accept or Decline.
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  const banner = document.getElementById("qq-consent-banner");
  const accept = document.getElementById("qq-consent-accept");
  const decline = document.getElementById("qq-consent-decline");

  if (!banner) return;

  if (!localStorage.getItem("quickqr_cookie_choice")) {
    banner.classList.add("show");
  }

  accept?.addEventListener("click", () => {
    localStorage.setItem("quickqr_cookie_choice", "accepted");
    banner.classList.remove("show");
  });

  decline?.addEventListener("click", () => {
    localStorage.setItem("quickqr_cookie_choice", "declined");
    banner.classList.remove("show");
  });

});
