const resultBox = document.getElementById("resultBox");

document.getElementById("createForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    slug: document.getElementById("slug").value,
    title: document.getElementById("title").value,
    host: document.getElementById("host").value,
    date_display: document.getElementById("dateDisplay").value,
    city: document.getElementById("city").value,
    arrival_time: document.getElementById("arrivalTime").value,
    venue_name: document.getElementById("venueName").value,
    address_line1: document.getElementById("addressLine1").value,
    address_line2: document.getElementById("addressLine2").value,
    google_maps_url: document.getElementById("mapUrl").value,
    dress_code: document.getElementById("dressCode").value
  };

  const res = await fetch("/api/create-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": document.getElementById("adminSecret").value
    },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  resultBox.textContent = JSON.stringify(result, null, 2);
});
