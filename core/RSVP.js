export class RSVP {
  static bind(data) {
    const form = document.getElementById("rsvpForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = {
        event_slug: data.meta?.slug,
        ...Object.fromEntries(formData.entries())
      };

      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!result.ok) {
        alert(`RSVP failed: ${result.error}`);
        return;
      }

      form.reset();
      alert("RSVP saved.");
    });
  }
}
