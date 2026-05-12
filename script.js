    // ── Configuration ────────────────────────────────────────────────────────
    // Replace this URL after deploying Code.gs as a Web App.
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzAiC9RUfzXOMJxBP_Ruh6pgezHulstv3Lp0Nuczkt_nApfu1TwdlB7snYsyCxlLoE8Pg/exec";

    // ── Inline feedback styles (injected once, reused on every submit) ───────
    const FEEDBACK_STYLES = {
      base: [
        "border-radius: 12px",
        "padding: 18px 24px",
        "font-family: 'DM Sans', system-ui, sans-serif",
        "font-size: 0.9375rem",
        "line-height: 1.6",
        "margin-top: 16px",
        "border: 1.5px solid",
        "animation: fadeIn 0.3s ease"
      ].join(";"),
      success: "background:#D1FAE5; border-color:#059669; color:#065F46;",
      error:   "background:#FEE2E2; border-color:#DC2626; color:#7F1D1D;"
    };

    // Inject keyframe for the feedback fade-in (once)
    const styleTag = document.createElement("style");
    styleTag.textContent = "@keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}";
    document.head.appendChild(styleTag);

    // ── Utility: show feedback banner inside the form card ───────────────────
    function showFeedback(type, html) {
      const el = document.getElementById("form-feedback");
      el.setAttribute("style",
        FEEDBACK_STYLES.base + ";" + FEEDBACK_STYLES[type]);
      el.innerHTML = html;
      el.style.display = "block";

      // Insert the banner just above the submit button for visibility
      const form   = document.querySelector(".form");
      const submit = document.querySelector(".form__submit");
      form.insertBefore(el, submit);

      // Scroll the banner into view smoothly
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // ── Utility: toggle the submit button loading state ──────────────────────
    function setSubmitting(isSubmitting) {
      const btn = document.querySelector(".form__submit");
      btn.disabled = isSubmitting;
      btn.textContent = isSubmitting ? "Sending…" : "Request my demo →";
      btn.style.opacity = isSubmitting ? "0.7" : "1";
      btn.style.cursor  = isSubmitting ? "wait" : "pointer";
    }

    // ── Main form handler ────────────────────────────────────────────────────
    document.addEventListener("DOMContentLoaded", function () {
      const form = document.querySelector(".form");
      if (!form) return;

      form.addEventListener("submit", async function (event) {
        event.preventDefault(); // stop native browser submission

        // Hide any previous feedback
        const feedback = document.getElementById("form-feedback");
        feedback.style.display = "none";

        // ── Collect field values ──────────────────────────────────────────
        const payload = {
          full_name:  form.querySelector("#full-name").value.trim(),
          email:      form.querySelector("#work-email").value.trim(),
          company:    form.querySelector("#company-name").value.trim(),
          job_title:  form.querySelector("#job-title").value.trim(),
          team_size:  form.querySelector("#team-size").value,
          main_goal:  form.querySelector("#main-goal").value.trim()
        };

        // ── Client-side validation ────────────────────────────────────────
        if (!payload.full_name || !payload.email || !payload.company || !payload.team_size) {
          showFeedback("error",
            "<strong>Please fill in all required fields</strong> before submitting.");
          return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(payload.email)) {
          showFeedback("error",
            "<strong>Please enter a valid work email address.</strong>");
          return;
        }

        // ── Submit ────────────────────────────────────────────────────────
        setSubmitting(true);

        try {
          const response = await fetch(SCRIPT_URL, {
            method:  "POST",
            // Apps Script requires "text/plain" to bypass CORS preflight
            // while still allowing us to send JSON in the body.
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body:    JSON.stringify(payload)
          });

          // Apps Script always returns HTTP 200 even for logical errors,
          // so we check the JSON body for success/failure.
          let data;
          try {
            data = await response.json();
          } catch {
            throw new Error("Unexpected response from server.");
          }

          if (data.success) {
            // ── Success path ──────────────────────────────────────────────
            showFeedback("success", [
              "<strong>✓ Your demo request has been submitted!</strong><br>",
              "We'll review your details and reach out within <strong>1 business day</strong>.",
              data.id ? "<br><small style='opacity:0.7'>Reference ID: " + data.id + "</small>" : ""
            ].join(" "));

            form.reset(); // clear all fields

          } else {
            // ── Server returned a logical error ───────────────────────────
            throw new Error(data.error || "Submission failed. Please try again.");
          }

        } catch (err) {
          // ── Network or parse error ────────────────────────────────────
          showFeedback("error",
            "<strong>Something went wrong.</strong> " + err.message +
            "<br><small>If the problem persists, please email us directly.</small>"
          );
          console.error("FlowDesk form error:", err);

        } finally {
          setSubmitting(false);
        }
      });
    });

  const menuToggle = document.querySelector(".nav__toggle");
const nav = document.querySelector(".nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", function () {
    nav.classList.toggle("nav--open");

    const isOpen = nav.classList.contains("nav--open");
    menuToggle.setAttribute("aria-expanded", isOpen);
  });
}