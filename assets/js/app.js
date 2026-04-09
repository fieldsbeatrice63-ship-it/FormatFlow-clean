let currentTemplate = "resume-classic";
let currentZoom = 1;
let currentPage = 1;
let totalPages = 1;

function selectTemplate(template) {
  currentTemplate = template;
}

function setAssistantMessage(message) {
  const assistantBox = document.getElementById("assistantBox");
  if (assistantBox) {
    assistantBox.textContent = message;
  }
}

function getMissingInfo(docType, text) {
  const lowerText = text.toLowerCase();

  if (!docType) {
    return ["Please select a document type before generating your document."];
  }

  if (text.trim().length < 20) {
    return ["More information is needed before FormatFlow can generate a professional document."];
  }

  const missing = [];

  if (docType === "resume") {
    if (!lowerText.includes("name")) missing.push("full name");
    if (!lowerText.includes("experience")) missing.push("work experience");
    if (!lowerText.includes("skill")) missing.push("skills");
    if (!lowerText.includes("education")) missing.push("education");
  }

  if (docType === "cover-letter") {
    if (!lowerText.includes("position")) missing.push("position or role");
    if (!lowerText.includes("company")) missing.push("company name");
    if (!lowerText.includes("experience")) missing.push("relevant experience");
  }

  if (docType === "resignation-letter") {
    if (!lowerText.includes("position")) missing.push("current position");
    if (!lowerText.includes("date")) missing.push("effective date");
  }

  if (docType === "legal") {
    if (!lowerText.includes("date")) missing.push("relevant date");
    if (!lowerText.includes("party")) missing.push("parties involved");
    if (!lowerText.includes("term")) missing.push("terms or purpose");
  }

  if (docType === "business") {
    if (!lowerText.includes("company")) missing.push("company name");
    if (!lowerText.includes("purpose")) missing.push("document purpose");
    if (!lowerText.includes("audience")) missing.push("audience or recipient");
  }

  if (docType === "ebook") {
    if (!lowerText.includes("topic")) missing.push("topic");
    if (!lowerText.includes("purpose")) missing.push("purpose or goal");
  }

  return missing;
}

async function generateDocument() {
  const input = document.getElementById("userInput");
  const preview = document.getElementById("preview");

  const text = input.value.trim();

  if (text.length < 20) {
    setAssistantMessage("More information is needed to generate a professional document.");
    return;
  }

  setAssistantMessage("Generating professional document...");

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

    setAssistantMessage("Document generated successfully.");

  } catch (error) {
    console.error(error);
    setAssistantMessage("An error occurred while generating the document.");
  }
}

    if (missing.length === 1 && missing[0].includes("More information is needed")) {
      setAssistantMessage(
        "More information is needed before FormatFlow can generate this document. Please provide additional details so the document can be structured professionally."
      );
      return;
    }

    setAssistantMessage(
      `More information is needed to generate this professional ${formatDocTypeLabel(docType)}. Please add: ${missing.join(", ")}.`
    );
    return;
  }

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

  setAssistantMessage(
    `Your ${formatDocTypeLabel(docType)} has been generated in preview form. You can now refine it using the available tools.`
  );

  applyZoom();
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
  setAssistantMessage(
    `The "${type}" refinement tool is present and ready for backend AI wiring.`
  );
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

document.addEventListener("DOMContentLoaded", function () {
  const fileUpload = document.getElementById("fileUpload");
  const templateSelect = document.getElementById("templateSelect");

  if (fileUpload) {
    fileUpload.addEventListener("change", handleFileUpload);
  }

  if (templateSelect) {
    templateSelect.value = currentTemplate;
  }

  setAssistantMessage(
    "Select a document type, then upload, paste, or type your content. When ready, click Generate Document."
  );
});
