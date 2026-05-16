const params = new URLSearchParams(window.location.search);
const slug = params.get("event");

const designForm = document.getElementById("designForm");
const previewCard = document.getElementById("previewCard");
const previewTitle = document.getElementById("previewTitle");
const previewTone = document.getElementById("previewTone");
const backToAdminLink = document.getElementById("backToAdminLink");
const viewInviteLinks = document.querySelectorAll(".viewInviteLink");
const designStatus = document.getElementById("designStatus");

const publishProgress = document.getElementById("publishProgress");
const publishProgressFill = document.getElementById("publishProgressFill");
const publishProgressText = document.getElementById("publishProgressText");
const saveDesignButton = designForm.querySelector('button[type="submit"]');

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

function setViewInviteEnabled(isEnabled) {
    viewInviteLinks.forEach((link) => {
        if (isEnabled) {
            link.setAttribute("aria-disabled", "false");
            link.removeAttribute("tabindex");
            link.classList.remove("btn--ghost");
            link.classList.add("btn--primary");
        } else {
            link.setAttribute("aria-disabled", "true");
            link.setAttribute("tabindex", "-1");
            link.classList.remove("btn--primary");
            link.classList.add("btn--ghost");
        }
    });
}

function startPublishDelay(seconds = 10) {
    return new Promise((resolve) => {
        let remaining = seconds;
        let elapsed = 0;

        publishProgress.hidden = false;
        publishProgressFill.style.width = "0%";
        publishProgressText.textContent = `Publishing invite update... ${remaining}s remaining.`;
        designStatus.hidden = false;
        designStatus.textContent = "Design update is publishing. View Invite will unlock when it is ready.";

        const timer = setInterval(() => {
            elapsed += 1;
            remaining -= 1;

            const percent = Math.min((elapsed / seconds) * 100, 100);
            publishProgressFill.style.width = `${percent}%`;
            publishProgressText.textContent = `Publishing invite update... ${Math.max(remaining, 0)}s remaining.`;

            if (elapsed >= seconds) {
                clearInterval(timer);
                publishProgressText.textContent = "Invite preview is ready.";
                designStatus.textContent = "Design update should now be live.";
                resolve();
            }
        }, 1000);
    });
}

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

    setViewInviteEnabled(false);
    saveDesignButton.disabled = true;

    designStatus.hidden = false;
    designStatus.textContent = "Sending design update...";
    publishProgress.hidden = false;
    publishProgressFill.style.width = "0%";
    publishProgressText.textContent = "Starting design update...";

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
            publishProgress.hidden = true;
            setViewInviteEnabled(true);
            saveDesignButton.disabled = false;
            return;
        }

        await startPublishDelay(10);

        setViewInviteEnabled(true);
        saveDesignButton.disabled = false;
    } catch (err) {
        designStatus.textContent = `Save failed: ${err.message}`;
        publishProgress.hidden = true;
        setViewInviteEnabled(true);
        saveDesignButton.disabled = false;
    }
});