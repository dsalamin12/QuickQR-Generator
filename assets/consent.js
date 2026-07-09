document.addEventListener("DOMContentLoaded", () => {

  const banner = document.getElementById("qq-consent-banner");
  const accept = document.getElementById("qq-consent-accept");
  const decline = document.getElementById("qq-consent-decline");

  if (!banner) return;

  // Show banner if user has not chosen before
  if (!localStorage.getItem("quickqr_cookie_choice")) {
    banner.classList.add("show");
  }

  // Accept
  accept?.addEventListener("click", () => {
    localStorage.setItem("quickqr_cookie_choice", "accepted");
    banner.classList.remove("show");
  });

  // Decline
  decline?.addEventListener("click", () => {
    localStorage.setItem("quickqr_cookie_choice", "declined");
    banner.classList.remove("show");
  });

});
