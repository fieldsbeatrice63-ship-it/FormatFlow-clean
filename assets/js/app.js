let currentTemplate = "resume-classic";
let currentZoom = 1;
let currentPage = 1;
let totalPages = 1;

function selectTemplate(template) {
  currentTemplate = template || "";
}

function setAssistantMessage(message) {
  const assistantBox = document.getElementById("assistantBox");
  if (assistantBox) {
    assistantBox.textContent = message;
  }
}

async function generateDocument() {
  const docTypeEl = document.getElementById("docType");
  const templateEl = document.getElementById("templateSelect");
  const input = document.getElementById("userInput");
  const preview = document.getElementById("preview");

  const docType = docTypeEl ? docTypeEl.value : "";
  const template = templateEl ? templateEl.value : "";
  const text = input ? input.value.trim() : "";

  if (!docType) {
    setAssistantMessage("Please select the type of document you want prepared so I can structure it correctly.");
    return;
  }

  if (!template) {
    setAssistantMessage("Please choose a template so I can format your document in the proper style.");
    return;
  }

  if (text.length < 20) {
    setAssistantMessage("I need a little more information before I can prepare this properly. Please add the details you want included, then generate again.");
    return;
  }

  setAssistantMessage("I’m preparing your document now. Please wait while I structure it professionally.");

  try {
    const response = await fetch("https://format-flow-backend.onrender.com/api/generate-document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: text
      })
    });

    const data = await response.json();

    preview.innerHTML = `
      <div class="preview-content">${data.output}</div>
      <div class="watermark">FormatFlow Preview</div>
    `;

    setAssistantMessage("Your document has been prepared in preview form. Review it below and refine it if needed.");

  } catch (error) {
    console.error(error);
    setAssistantMessage("There was a problem preparing your document. Please try again.");
  }
}

function formatDocTypeLabel(docType) {
  const map = {
    "resume": "resume",
    "cover-letter": "cover letter",
    "resignation-letter": "resignation letter",
    "legal": "legal document",
    "business": "business document",
    "ebook": "eBook or written content"
  };
  return map[docType] || "document";
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
    const pageIndicator = document.getElementById("pageIndicator");
    if (pageIndicator) pageIndicator.textContent = `Page ${currentPage}`;
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    const pageIndicator = document.getElementById("pageIndicator");
    if (pageIndicator) pageIndicator.textContent = `Page ${currentPage}`;
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
  setAssistantMessage(`The "${type}" refinement tool is present and ready for backend AI wiring.`);
}

function exportPDF() {
  setAssistantMessage("PDF export control is present and ready for backend/export wiring.");
}

function exportDOCX() {
  setAssistantMessage("DOCX export control is present and ready for backend/export wiring.");
}

function handleFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  const input = document.getElementById("userInput");
  const modeLabel = document.getElementById("previewModeLabel");

  if (!file) return;

  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".txt")) {
    const reader = new FileReader();
    reader.onload = function(e) {
      if (input) input.value = e.target.result;
      if (modeLabel) modeLabel.textContent = "Uploaded TXT Ready";
      setAssistantMessage("TXT file uploaded successfully. Review the content, then click Generate Document.");
    };
    reader.readAsText(file);
    return;
  }

  if (fileName.endsWith(".pdf")) {
    if (modeLabel) modeLabel.textContent = "PDF Upload Ready";
    setAssistantMessage("PDF upload detected. Full PDF preview wiring is the next backend/viewer step.");
    return;
  }

  if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
    if (modeLabel) modeLabel.textContent = "DOC/DOCX Upload Ready";
    setAssistantMessage("DOC/DOCX upload detected. Conversion and formatting wiring is the next backend step.");
    return;
  }

  if (fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
    if (modeLabel) modeLabel.textContent = "Image Upload Ready";
    setAssistantMessage("Image upload detected. Image preview wiring is the next viewer step.");
    return;
  }

  setAssistantMessage("Unsupported file type.");
}
function clearSession() {
  const docType = document.getElementById("docType");
  const template = document.getElementById("templateSelect");
  const input = document.getElementById("userInput");
  const preview = document.getElementById("preview");
  const fileUpload = document.getElementById("fileUpload");
  const modeLabel = document.getElementById("previewModeLabel");
  const pageIndicator = document.getElementById("pageIndicator");

  if (docType) docType.value = "";
  if (template) template.value = "";
  if (input) input.value = "";
  if (fileUpload) fileUpload.value = "";

  if (preview) {
    preview.innerHTML = `
      <div class="preview-content">Your document preview will appear here...</div>
      <div class="watermark">FormatFlow Preview</div>
    `;
  }

  if (modeLabel) modeLabel.textContent = "FormatFlow Preview";
  if (pageIndicator) pageIndicator.textContent = "Page 1";

  setAssistantMessage("Select a document type, choose a template, then upload, paste, or type your content. When ready, click Generate Document.");
}
document.addEventListener("DOMContentLoaded", function () {
  const fileUpload = document.getElementById("fileUpload");

  if (fileUpload) {
    fileUpload.addEventListener("change", handleFileUpload);
  }

  setAssistantMessage(
    "Select a document type, choose a template, then upload, paste, or type your content. When ready, click Generate Document."
  );
});
