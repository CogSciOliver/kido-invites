const params = new URLSearchParams(window.location.search);
const slug = params.get("event");

const designForm = document.getElementById("designForm");
const previewCard = document.getElementById("previewCard");
const previewTitle = document.getElementById("previewTitle");
const previewTone = document.getElementById("previewTone");
const backToAdminLink = document.getElementById("backToAdminLink");
const viewInviteLinks = document.querySelectorAll(".viewInviteLink");
const designStatus = document.getElementById("designStatus");

if (!slug) {
    document.body.innerHTML = "<main class='designPage'><p>Missing event.</p></main>";
    throw new Error("Missing event slug");
}

if (backToAdminLink) {
    backToAdminLink.href = `./admin.html?event=${encodeURIComponent(slug)}`;
}

viewInviteLinks.forEach((link) => {
    link.href = `./invite.html?event=${encodeURIComponent(slug)}`;
});

function updatePreview(input) {
    if (!input) return;

    const title = input.dataset.previewTitle || "Selected Design";
    const tone = input.dataset.previewTone || "";

    previewTitle.textContent = title;
    previewTone.textContent = tone;

    previewCard.dataset.design = input.value;
}

function getSelectedDesign() {
    return designForm.querySelector('input[name="design"]:checked');
}

document.querySelectorAll('input[name="design"]').forEach((input) => {
    input.addEventListener("change", () => {
        updatePreview(input);
    });
});

designForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const selectedDesign = getSelectedDesign();
    const adminSecret = document.getElementById("adminSecret")?.value.trim() || "";


    if (!selectedDesign) {
        designStatus.hidden = false;
        designStatus.textContent = "Choose a design first.";
        return;
    }

    if (!adminSecret) {
        designStatus.hidden = false;
        designStatus.textContent = "Admin secret is required.";
        return;
    }

    designStatus.hidden = false;
    designStatus.textContent = "Saving design...";

    try {
        const res = await fetch("/api/update-event", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-secret": adminSecret
            },
            body: JSON.stringify({
                event_slug: slug,
                design_template: selectedDesign.value
            })
        });

        const result = await res.json();

        if (!result.ok) {
            designStatus.textContent = `Save failed: ${result.error}`;
            return;
        }

        designStatus.textContent = "Design saved.";
    } catch (err) {
        designStatus.textContent = `Save failed: ${err.message}`;
    }
});