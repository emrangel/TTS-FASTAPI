let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let textContent = '';
let mensaje = null;

function convertirPdfAAudio() {
  const archivoSeleccionado = document.getElementById('archivoPdf').files[0];
  const puntoInicio = parseInt(document.getElementById('puntoInicio').value);
  const idiomaSeleccionado = document.getElementById('idioma').value;

  const lector = new FileReader();
  lector.onload = function(e) {
    const contenido = e.target.result;

    pdfjsLib.getDocument({ data: new Uint8Array(contenido) }).promise.then(function(pdf) {
      pdfDoc = pdf;

      const totalPaginas = pdf.numPages;

      if (puntoInicio < 1 || puntoInicio > totalPaginas) {
        alert('El punto de inicio no es válido. Por favor, introduce un número de página válido.');
        return;
      }

      renderizarPagina(puntoInicio, idiomaSeleccionado);
    });
  };

  lector.readAsArrayBuffer(archivoSeleccionado);
}

function renderizarPagina(numeroPagina, idiomaSeleccionado) {
  pageRendering = true;
  pdfDoc.getPage(numeroPagina).then(function(page) {
    const canvas = document.getElementById('pdfCanvas');
    const context = canvas.getContext('2d');
    const viewport = page.getViewport({ scale: 1.5 });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    page.render(renderContext).promise.then(function() {
      pageRendering = false;

      if (pageNumPending !== null) {
        renderizarPagina(pageNumPending, idiomaSeleccionado);
        pageNumPending = null;
      } else {
        extraerTextoPagina(page, idiomaSeleccionado);
      }
    });
  });
}

function extraerTextoPagina(page, idiomaSeleccionado) {
  page.getTextContent().then(function(content) {
    textContent = content.items.map(function(item) {
      return item.str;
    }).join(' ');

    // Leer el texto extraído en voz alta
    if (mensaje) {
      window.speechSynthesis.cancel();
    }
    mensaje = new SpeechSynthesisUtterance(textContent);
    mensaje.lang = idiomaSeleccionado;
    window.speechSynthesis.speak(mensaje);
  });
}

function prevPage() {
  if (pageNum <= 1) {
    return;
  }

  pageNum--;
  renderizarPagina(pageNum, mensaje.lang);
}

function nextPage() {
  if (pageRendering) {
    pageNumPending = pageNum + 1;
  } else {
    if (pageNum < pdfDoc.numPages) {
      pageNum++;
      renderizarPagina(pageNum, mensaje.lang);
    }
  }
}

function stopAudio() {
  if (mensaje) {
    window.speechSynthesis.cancel();
  }
}