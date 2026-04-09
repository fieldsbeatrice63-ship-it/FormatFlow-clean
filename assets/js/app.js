let currentTemplate = "resume-classic";
let currentZoom = 1;
let currentPage = 1;
let totalPages = 1;

function selectTemplate(template) {
  currentTemplate = template;
  updatePreview();
}

function updatePreview() {
  const input = document.getElementById("userInput");
  const preview = document.getElementById("preview");
  const modeLabel = document.getElementById("previewModeLabel");
  const pageIndicator = document.getElementById("pageIndicator");

  if (!preview) return;

  const text = input && input.value.trim()
    ? input.value.trim()
    : "Your document preview will appear here...";

  preview.className = "document-page " + currentTemplate;
  preview.innerHTML = `
    <div class="preview-content">${escapeHtml(text)}</div>
    <div class="watermark">FormatFlow Preview</div>
  `;

  if (modeLabel) {
    modeLabel.textContent = "FormatFlow Preview";
  }

  if (pageIndicator) {
    pageIndicator.textContent = `Page ${currentPage}`;
  }

  applyZoom();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, "<br>");
}

function applyZoom() {
  const preview = document.getElementById("preview");
  if (!preview) return;
  preview.style.transform = `scale(${currentZoom})`;
  preview.style.transformOrigin = "top center";
}

function zoomIn() {
  currentZoom = Math.min(currentZoom + 0.1, 2);
  applyZoom();
}

function zoomOut() {
  currentZoom = Math.max(currentZoom - 0.1, 0.5);
  applyZoom();
}

function zoomReset() {
  currentZoom = 1;
  applyZoom();
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    updatePreview();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    updatePreview();
  }
}

function expandPreview() {
  const viewport = document.getElementById("previewViewport");
  if (!viewport) return;

  if (!document.fullscreenElement) {
    viewport.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function rewrite(type) {
  alert("Rewrite function placeholder: " + type);
}

function exportPDF() {
  alert("PDF export coming next");
}

function exportDOCX() {
  alert("DOCX export coming next");
}

function handleFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  const modeLabel = document.getElementById("previewModeLabel");
  const input = document.getElementById("userInput");

  if (!file) return;

  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".txt")) {
    const reader = new FileReader();
    reader.onload = function(e) {
      if (input) {
        input.value = e.target.result;
      }
      if (modeLabel) {
        modeLabel.textContent = "Uploaded TXT → Formatted Preview";
      }
      updatePreview();
    };
    reader.readAsText(file);
    return;
  }

  if (fileName.endsWith(".pdf")) {
    if (modeLabel) {
      modeLabel.textContent = "PDF Upload Ready for Preview";
    }
    alert("PDF preview structure is ready. Full PDF rendering can be wired next.");
    return;
  }

  if (
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx")
  ) {
    if (modeLabel) {
      modeLabel.textContent = "DOC/DOCX Upload Ready for Conversion";
    }
    alert("DOC/DOCX conversion flow is the next wiring step.");
    return;
  }

  if (
    fileName.endsWith(".png") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg")
  ) {
    if (modeLabel) {
      modeLabel.textContent = "Image Upload Ready for Preview";
    }
    alert("Image preview flow can be wired next.");
    return;
  }

  alert("Unsupported file type.");
}

document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("userInput");
  const fileUpload = document.getElementById("fileUpload");
  const templateSelect = document.getElementById("templateSelect");

  if (input) {
    input.addEventListener("input", updatePreview);
  }

  if (fileUpload) {
    fileUpload.addEventListener("change", handleFileUpload);
  }

  if (templateSelect) {
    templateSelect.value = currentTemplate;
  }

  updatePreview();
});
