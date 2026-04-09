let currentTemplate = "";
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
  content: text,
  docType,
  template
})
    });

    const data = await response.json();

    preview.innerHTML = `
      <div class="preview-content">${data.output}</div>
      <div class="watermark">FormatFlow Preview</div>
    `;

    setAssistantMessage("Your document has been prepared in preview form. Review it below and refine it if needed.");
    applyZoom();

  } catch (error) {
    console.error(error);
    setAssistantMessage("There was a problem preparing your document. Please try again.");
  }
}

async function rewrite(type) {
  const preview = document.getElementById("preview");

  if (!preview) return;

  const content = preview.innerText.trim();

  if (!content || content.length < 20) {
    setAssistantMessage("There is no document available to refine yet. Please generate a document first.");
    return;
  }

  setAssistantMessage("Refining your document now. Please wait.");

  try {
    const response = await fetch("https://format-flow-backend.onrender.com/api/rewrite-document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content,
        type
      })
    });

    const data = await response.json();

    preview.innerHTML = `
      <div class="preview-content">${data.output}</div>
      <div class="watermark">FormatFlow Preview</div>
    `;

    setAssistantMessage("Your document has been refined successfully.");
    applyZoom();

  } catch (error) {
    console.error(error);
    setAssistantMessage("There was a problem refining your document.");
  }
}

function clearSession() {
  const docType = document.getElementById("docType");
  const template = document.getElementById("templateSelect");
  const input = document.getElementById("userInput");
  const preview = document.getElementById("preview");
  const fileUpload = document.getElementById("fileUpload");
  const modeLabel = document.getElementById("previewModeLabel");
  const pageIndicator = document.getElementById("pageIndicator");

  currentTemplate = "";
  currentZoom = 1;
  currentPage = 1;
  totalPages = 1;

  if (docType) docType.value = "";
  if (template) template.value = "";
  if (input) input.value = "";
  if (fileUpload) fileUpload.value = "";

  if (preview) {
    preview.innerHTML = `
      <div class="preview-content">Your document preview will appear here...</div>
      <div class="watermark">FormatFlow Preview</div>
    `;
    preview.style.transform = "scale(1)";
    preview.style.transformOrigin = "top center";
  }

  if (modeLabel) modeLabel.textContent = "FormatFlow Preview";
  if (pageIndicator) pageIndicator.textContent = "Page 1";

  setAssistantMessage("Select a document type, choose a template, then upload, paste, or type your content. When ready, click Generate Document.");
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

function exportPDF() {
  setAssistantMessage(
    "Your document has been prepared successfully. 🎉\n\nA polished version is ready for download.\n\nYou may access your formatted PDF for $2.99, or continue with one of the available access plans for extended use."
  );
}

function exportDOCX() {
  setAssistantMessage(
    "Your document is complete and professionally structured. 🎉\n\nYou can download the editable version for $2.99, or continue with one of the available access plans for ongoing document creation and refinement."
  );
}
async function handleFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  const input = document.getElementById("userInput");
  const modeLabel = document.getElementById("previewModeLabel");

  if (!file) return;

  setAssistantMessage("Uploading and processing your file. Please wait...");

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("https://format-flow-backend.onrender.com/api/parse-upload", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!data.extractedText) {
      setAssistantMessage("I couldn’t extract readable content from that file. Please try another file or paste your content.");
      return;
    }

    if (input) input.value = data.extractedText;

    if (modeLabel) modeLabel.textContent = "Document Loaded";

    setAssistantMessage("Your document has been successfully loaded. You can now refine or generate it professionally.");

  } catch (error) {
    console.error(error);
    setAssistantMessage("There was a problem processing your file. Please try again.");
  }
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
