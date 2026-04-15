let currentTemplate = "";
let currentZoom = 1;
let currentPage = 1;
let totalPages = 1;

function selectTemplate(template) {
  currentTemplate = template || "";
  if (template === "resume-classic") {
  currentTemplate = "resume-plain";
}

  const preview = document.getElementById("outputPreview");
  if (!preview || !template) return;

  if (template === "resume-classic") {
    preview.innerHTML = renderTemplatePreview("resume-plain", "");
    return;
  }

  if (template === "essay-standard") {
    preview.innerHTML = renderTemplatePreview("essay-standard", "");
    return;
  }

  if (template === "ebook-clean") {
    preview.innerHTML = renderTemplatePreview("ebook-clean", "");
    return;
  }

  if (
    template === "legal-3-day-notice" ||
    template === "legal-lease-agreement" ||
    template === "legal-demand-letter" ||
    template === "legal-complaint-letter" ||
    template === "legal-eviction-notice" ||
    template === "legal-standard"
  ) {
    preview.innerHTML = renderTemplatePreview("legal-standard", "");
    return;
  }

  if (
    template === "business-proposal" ||
    template === "business-letter" ||
    template === "business-invoice-request" ||
    template === "business-scope-of-work" ||
    template === "business-partnership-letter" ||
    template === "business-formal"
  ) {
    preview.innerHTML = renderTemplatePreview("business-formal", "");
    return;
  }

  if (template === "general-professional") {
    preview.innerHTML = renderTemplatePreview("general-professional", "");
  }
}

function updateTemplateOptions(category) {
  const templateSelect = document.getElementById("templateSelect");
  if (!templateSelect) return;

  const options = {
    resume: [
      { value: "resume-classic", label: "Standard Resume" }
    ],
    essay: [
      { value: "essay-standard", label: "Standard Essay" }
    ],
    ebook: [
      { value: "ebook-clean", label: "Standard eBook" }
    ],
    legal: [
      { value: "legal-3-day-notice", label: "3-Day Notice" },
      { value: "legal-lease-agreement", label: "Lease Agreement" },
      { value: "legal-demand-letter", label: "Demand Letter" },
      { value: "legal-complaint-letter", label: "Complaint Letter" },
      { value: "legal-eviction-notice", label: "Eviction Notice" },
      { value: "legal-standard", label: "General Legal Document" }
    ],
    business: [
      { value: "business-proposal", label: "Business Proposal" },
      { value: "business-letter", label: "Formal Business Letter" },
      { value: "business-invoice-request", label: "Invoice Request" },
      { value: "business-scope-of-work", label: "Scope of Work" },
      { value: "business-partnership-letter", label: "Partnership Letter" },
      { value: "business-formal", label: "General Business Document" }
    ],
    other: [
      { value: "general-professional", label: "General Professional Document" }
    ]
  };

  templateSelect.innerHTML = `<option value="">Select Subtype Detail</option>`;
  currentTemplate = "";

  if (!category || !options[category]) return;

  options[category].forEach(function (item) {
    const opt = document.createElement("option");
    opt.value = item.value;
    opt.textContent = item.label;
    templateSelect.appendChild(opt);
  });
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
 const preview = document.getElementById("outputPreview");

  const docType = docTypeEl ? docTypeEl.value : "";
 const template = (templateEl && templateEl.value)
  ? templateEl.value
  : (currentTemplate || getTemplateFromURL() || localStorage.getItem("selectedTemplate") || "");
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

let finalOutput = data.output || "";

if (
  docType === "resume" ||
  docType === "legal" ||
  docType === "business" ||
  docType === "cover-letter" ||
  docType === "resignation-letter"

) {
  const rewriteResponse = await fetch("https://format-flow-backend.onrender.com/api/rewrite-document", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: finalOutput,
      type: "professional"
    })
  });

  const rewriteData = await rewriteResponse.json();
  finalOutput = rewriteData.output || finalOutput;
}

let renderMode = template;
if (docType === "resume") {
  preview.innerHTML = renderTemplatePreview("resume-plain", finalOutput);
  return;
}
    preview.innerHTML = renderTemplatePreview(template, finalOutput);
setAssistantMessage("Your document has been prepared in preview form. Review it below and refine it if needed.");
applyZoom();

  } catch (error) {
    console.error(error);
    setAssistantMessage("There was a problem preparing your document. Please try again.");
  }
}

async function rewrite(type) {
 const preview = document.getElementById("outputPreview");
const outputBox = document.getElementById("outputBox");

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

    preview.innerHTML = renderTemplatePreview(currentTemplate || "general-professional", data.output);

    setAssistantMessage("Your document has been refined successfully.");
    applyZoom();

  } catch (error) {
    console.error(error);
    setAssistantMessage("There was a problem refining your document.");
  }
}

function clearSession() {
  const docType = document.getElementById("docType");
const templateCategory = document.getElementById("templateCategory");
const template = document.getElementById("templateSelect");
const input = document.getElementById("userInput");
 const preview = document.getElementById("outputPreview");
  const fileUpload = document.getElementById("fileUpload");
  const modeLabel = document.getElementById("previewModeLabel");
  const pageIndicator = document.getElementById("pageIndicator");

  currentTemplate = "";
  currentZoom = 1;
  currentPage = 1;
  totalPages = 1;

  if (docType) docType.value = "";
if (templateCategory) templateCategory.value = "";
if (template) template.innerHTML = `<option value="">Select Subtype Detail</option>`;
if (input) input.value = "";
if (fileUpload) fileUpload.value = "";
currentTemplate = "";
  if (preview) {
    preview.innerHTML = `
     preview.innerHTML = `
  <div class="preview-content">Your document preview will appear here...</div>
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
  const preview = document.getElementById("outputPreview");
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

function openUnlockModal(message, link) {
  const modal = document.getElementById("unlockModal");
  const unlockMessage = document.getElementById("unlockMessage");
  const singleUnlockBtn = document.getElementById("singleUnlockBtn");

  if (unlockMessage) unlockMessage.textContent = message;
  if (singleUnlockBtn) singleUnlockBtn.href = link || "#";
  if (modal) modal.classList.remove("hidden");
}

function closeUnlockModal() {
  const modal = document.getElementById("unlockModal");
  if (modal) modal.classList.add("hidden");
}
function getSmartPdfBlocksFromPreview(previewEl) {
  const raw = (previewEl.innerText || previewEl.textContent || "")
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .trim();

  if (!raw) return [];

  const chunks = raw
    .split(/\n\s*\n+/)
    .map(block => block.trim())
    .filter(Boolean);

  return chunks.map(block => {
    const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
    const firstLine = lines[0] || "";

    const isHeading =
      lines.length === 1 &&
      (
        firstLine.length <= 60 ||
        /^[A-Z0-9 &/-]+$/.test(firstLine) ||
        /summary|skills|experience|education|profile|objective|business document|legal document|ebook title|essay title/i.test(firstLine)
      );

    return {
      text: lines.join(" "),
      type: isHeading ? "heading" : "paragraph"
    };
  });
}

async function exportPDF() {
  const preview = document.getElementById("outputPreview");

  if (!preview) {
    setAssistantMessage("No document to export.");
    return;
  }

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "pt", "letter");

    const pageWidth = 612;
    const pageHeight = 792;

    const marginLeft = 54;
    const marginRight = 54;
    const marginTop = 60;
    const marginBottom = 60;

    const usableWidth = pageWidth - marginLeft - marginRight;
    const maxY = pageHeight - marginBottom;

    const blocks = getSmartPdfBlocksFromPreview(preview);

    pdf.setFont("times", "normal");

    let y = marginTop;

    blocks.forEach((block, index) => {
      const isHeading = block.type === "heading";

      pdf.setFont("times", isHeading ? "bold" : "normal");
      pdf.setFontSize(isHeading ? 14 : 11);

      const lineHeight = isHeading ? 20 : 16;
      const spaceBefore = isHeading ? 14 : 6;
      const spaceAfter = isHeading ? 8 : 10;

      const lines = pdf.splitTextToSize(block.text, usableWidth);
      const blockHeight = lines.length * lineHeight;

      if (y + spaceBefore + blockHeight + spaceAfter > maxY) {
        pdf.addPage();
        y = marginTop;
      }

      y += spaceBefore;

      lines.forEach(line => {
        if (y + lineHeight > maxY) {
          pdf.addPage();
          y = marginTop;
        }

        pdf.text(line, marginLeft, y);
        y += lineHeight;
      });

      y += spaceAfter;
    });

    pdf.save("formatflow-document.pdf");
    setAssistantMessage("PDF exported successfully.");
  } catch (err) {
    console.error(err);
    setAssistantMessage("PDF export failed.");
  }
}
function exportDOCX() {
  openUnlockModal(
    "Your editable document is ready for secure access. You may unlock this completed document for $5.99 per document, or review the available plans for continued use.",
    "https://buy.stripe.com/6oU6oG0B5dZ7dZq9wZ3ks05"
  );
}

document.addEventListener("DOMContentLoaded", function () {
  const fileUpload = document.getElementById("fileUpload");
  const templateSelect = document.getElementById("templateSelect");
  const preview = document.getElementById("outputPreview");

  if (fileUpload) {
    fileUpload.addEventListener("change", handleFileUpload);
  }

  if (templateSelect && !templateSelect.querySelector('option[value="template-library"]')) {
    const opt = document.createElement("option");
    opt.value = "template-library";
    opt.textContent = "Choose From Template Library";
    templateSelect.insertBefore(opt, templateSelect.options[1]);
  }

  if (preview) {
    preview.addEventListener("copy", function (e) {
      e.preventDefault();
      setAssistantMessage("Preview is protected. Use secure access to download your document.");
    });

    preview.addEventListener("cut", function (e) {
      e.preventDefault();
    });

    preview.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      setAssistantMessage("Preview actions are limited. Use the download option for full access.");
    });

    preview.addEventListener("mousedown", function (e) {
      if (e.detail > 1) e.preventDefault();
    });
  }

  setAssistantMessage(
    "Select a document type, choose a template, then upload, paste, or type your content. When ready, click Generate Document."
  );
});
// ===== TEMPLATE LOADER =====

function getTemplateFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("template") || localStorage.getItem("selectedTemplate");
}

function loadSelectedTemplate() {
  const template = getTemplateFromURL();

  if (!template) return;

  const preview = document.getElementById("outputPreview");
  const outputBox = document.getElementById("outputBox");
  const templateSelect = document.getElementById("templateSelect");

  if (!preview) return;

 const templateMap = {
  "classic-professional": "resume-classic",
  "modern-sidebar": "resume-modern",
  "business-proposal": "business-formal",
  "lease-agreement": "legal-standard"
};

const resolvedTemplate = templateMap[template] || template;

if (templateSelect) {
  templateSelect.value = resolvedTemplate;
}

currentTemplate = resolvedTemplate;

  if (template === "classic-professional") {
    preview.innerHTML = `
      <div style="padding:40px; font-family:Arial;">
        <h1>John Doe</h1>
        <p>Professional Summary</p>
        <hr/>
        <p>Experience and details will generate here...</p>
      </div>
    `;
  }

  if (template === "modern-sidebar") {
    preview.innerHTML = `
      <div style="display:flex; height:100%;">
        <div style="width:30%; background:#19a2b8; color:#fff; padding:20px;">
          <h2>John Doe</h2>
          <p>Skills</p>
        </div>
        <div style="padding:30px;">
          <h3>Experience</h3>
          <p>Content will populate here...</p>
        </div>
      </div>
    `;
  }

  if (template === "lease-agreement") {
    preview.innerHTML = `
      <div style="padding:40px; font-family:Georgia;">
        <h2 style="text-align:center;">Lease Agreement</h2>
        <p>This agreement is between...</p>
      </div>
    `;
  }

  if (template === "business-proposal") {
    preview.innerHTML = `
      <div style="padding:40px;">
        <h2>Business Proposal</h2>
        <p>Overview, scope, deliverables...</p>
      </div>
    `;
  }
if (template === "resume-classic") {
  return `
    <div style="padding:40px; font-family:Arial; background:#fff; min-height:100%;">
      <div style="line-height:1.8; color:#222;"><p>${formattedContent}</p></div>
    </div>
  `;
}
  if (outputBox) {
    outputBox.value = preview.textContent.trim();
  }

  localStorage.removeItem("selectedTemplate");
}


// run when page loads
document.addEventListener("DOMContentLoaded", loadSelectedTemplate);
function renderTemplatePreview(template, content = "") {
  const safeContent = content || "";
const formattedContent = escapeHtml(safeContent)
  .replace(/\n{2,}/g, "</p><p>")
  .replace(/\n/g, "<br>");  
const resumeData = parseResumeSections(content);

  if (template === "resume-plain") {
  return `
    <div style="padding:40px; font-family:Arial; background:#fff; min-height:100%;">
      <div style="line-height:1.8; color:#222;"><p>${formattedContent}</p></div>
    </div>
  `;
}
if (template === "resume-classic") {
  return `
    <div style="padding:40px; font-family:Arial; background:#fff; min-height:100%;">
      <h1 style="margin:0 0 8px; color:#111;">${resumeData.name}</h1>
      <p style="margin:0 0 18px; color:#555;">${resumeData.contact}</p>

      <h3 style="margin:0 0 8px; color:#111;">Professional Summary</h3>
      <div style="margin:0 0 18px; color:#444; line-height:1.7;">
        ${resumeData.summary || "Your summary will appear here..."}
      </div>

      <h3 style="margin:0 0 8px; color:#111;">Skills</h3>
      <div style="margin:0 0 18px; color:#444; line-height:1.7;">
        ${resumeData.skills || "Your skills will appear here..."}
      </div>

      <h3 style="margin:0 0 8px; color:#111;">Experience</h3>
      <div style="margin:0 0 18px; color:#444; line-height:1.7;">
        ${resumeData.experience || "Your experience will appear here..."}
      </div>

      <h3 style="margin:0 0 8px; color:#111;">Education</h3>
      <div style="margin:0; color:#444; line-height:1.7;">
        ${resumeData.education || "Your education will appear here..."}
      </div>
    </div>
  `;
}

  if (template === "resume-modern") {
    return `
      <div style="display:flex; min-height:100%; background:#fff;">
        <div style="width:28%; background:#19a2b8; color:#fff; padding:22px;">
          <h2 style="margin:0 0 14px;">Your Name</h2>
          <p style="margin:0 0 10px;">Skills</p>
          <p style="margin:0;">Communication • Leadership • Service</p>
        </div>
        <div style="flex:1; padding:30px;">
          <h3 style="margin:0 0 8px;">Professional Summary</h3>
          <div style="margin:0; line-height:1.7;">${safeContent}</div>
        </div>
      </div>
    `;
  }

  if (template === "resume-executive") {
    return `
      <div style="padding:0; background:#fff; min-height:100%; font-family:Arial;">
        <div style="background:#173b79; color:#fff; padding:24px 34px;">
          <h1 style="margin:0 0 6px;">Your Name</h1>
          <p style="margin:0;">Executive Resume • Email • Phone • Location</p>
        </div>
        <div style="padding:34px;">
          <h3 style="margin:0 0 8px; color:#173b79;">Executive Profile</h3>
          <div style="margin:0; color:#444; line-height:1.7;">${safeContent}</div>
        </div>
      </div>
    `;
  }

  if (template === "resume-dark-header") {
    return `
      <div style="padding:0; background:#fff; min-height:100%; font-family:Arial;">
        <div style="background:#111827; color:#fff; padding:22px 34px;">
          <h1 style="margin:0 0 6px;">Your Name</h1>
          <p style="margin:0;">Professional Resume • Email • Phone</p>
        </div>
        <div style="padding:34px;">
          <h3 style="margin:0 0 8px; color:#111827;">Summary</h3>
          <div style="margin:0; color:#444; line-height:1.7;">${safeContent}</div>
        </div>
      </div>
    `;
  }

  if (template === "resume-gold-accent") {
    return `
      <div style="padding:0; background:#fff; min-height:100%; font-family:Arial;">
        <div style="height:16px; background:#d4af37;"></div>
        <div style="padding:30px 34px 10px;">
          <h1 style="margin:0 0 6px; color:#111;">Your Name</h1>
          <p style="margin:0 0 18px; color:#777;">Email • Phone • Location</p>
          <h3 style="margin:0 0 8px; color:#b3871e;">Professional Summary</h3>
          <div style="margin:0; color:#444; line-height:1.7;">${safeContent}</div>
        </div>
      </div>
    `;
  }

  if (template === "resume-ats") {
    return `
      <div style="padding:40px; font-family:Arial; background:#fff; min-height:100%;">
        <h1 style="margin:0 0 8px; color:#111;">Your Name</h1>
        <p style="margin:0 0 18px; color:#555;">Email | Phone | Location</p>
        <hr style="border:none; border-top:1px solid #ccc; margin:0 0 18px;">
        <h3 style="margin:0 0 8px; color:#111;">Summary</h3>
        <div style="margin:0; color:#444; line-height:1.7;">${safeContent}</div>
      </div>
    `;
  }

  if (template === "essay-standard") {
    return `
      <div style="padding:40px; font-family:Georgia;">
        <h2 style="text-align:center;">Essay Title</h2>
        <div style="line-height:1.8;"><p>${formattedContent}</p></div>
      </div>
    `;
  }

  if (template === "ebook-clean") {
    return `
      <div style="padding:40px; font-family:Georgia;">
        <h2>eBook Title</h2>
       <div style="line-height:1.8;"><p>${formattedContent}</p></div>
      </div>
    `;
  }

  if (template === "legal-standard") {
    return `
      <div style="padding:40px; font-family:Georgia;">
        <h2 style="text-align:center;">Legal Document</h2>
        <div style="line-height:1.8;"><p>${formattedContent}</p></div>
      </div>
    `;
  }

  if (template === "business-formal") {
    return `
      <div style="padding:40px;">
        <h2>Business Document</h2>
        <div style="line-height:1.8;"><p>${formattedContent}</p></div>
      </div>
    `;
  }

  if (template === "general-professional") {
    return `
      <div style="padding:40px;">
        <h2>Professional Document</h2>
        <div style="line-height:1.8;"><p>${formattedContent}</p></div>
      </div>
    `;
  }

  return `
    <div style="padding:40px; background:#fff; min-height:100%;">
      <div style="line-height:1.8;"><p>${formattedContent}</p></div>
    </div>
  `;
}
function parseResumeSections(content = "") {
  const text = String(content || "").trim();

  const result = {
    name: "Your Name",
    contact: "City, State • Email • Phone",
    summary: "",
    skills: "",
    experience: "",
    education: ""
  };

  if (!text) return result;

  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length > 0) {
    const firstLine = lines[0];
    if (
      firstLine.length <= 60 &&
      !/summary|experience|education|skills|phone|email/i.test(firstLine)
    ) {
      result.name = firstLine;
      lines.shift();
    }
  }

  if (lines.length > 0) {
    const contactLine = lines[0];
    if (/phone|email|linkedin|\||•|city|state|address/i.test(contactLine)) {
      result.contact = contactLine;
      lines.shift();
    }
  }

  const fullText = lines.join("\n");

  function extractSection(labelPatterns, stopPatterns) {
    const startRegex = new RegExp(`(${labelPatterns})\\s*:?(.*?)((?=${stopPatterns})|$)`, "is");
    const match = fullText.match(startRegex);
    return match ? match[2].trim() : "";
  }

  const stopAll = "summary|professional summary|skills|core competencies|experience|professional experience|work history|education|certifications|references";

  result.summary = extractSection(
    "summary|professional summary|profile",
    stopAll
  );

  result.skills = extractSection(
    "skills|core competencies|areas of expertise",
    stopAll
  );

  result.experience = extractSection(
    "experience|professional experience|work history|employment history",
    stopAll
  );

  result.education = extractSection(
    "education|certifications|academic background",
    stopAll
  );

  if (!result.summary) {
    result.summary = fullText.slice(0, 700).trim();
  }

  return result;
}
