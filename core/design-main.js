const designForm = document.getElementById("designForm");
const previewCard = document.getElementById("previewCard");
const previewTitle = document.getElementById("previewTitle");
const previewTone = document.getElementById("previewTone");

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

designForm.addEventListener("submit", (event) => {
    const selectedDesign = getSelectedDesign();

    if (!selectedDesign) {
        event.preventDefault();
        return;
    }

    const url = new URL(designForm.action, window.location.href);
    url.searchParams.set("design", selectedDesign.value);

    event.preventDefault();
    window.location.href = url.toString();
});