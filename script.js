let products = [];

function addProduct() {
  const name = document.getElementById("name").value;
  const quantity = parseFloat(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("price").value);

  if (!name || isNaN(quantity) || isNaN(price)) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  products = [{ name, quantity, price }]; // solo un producto
  renderTable();
  clearInputs();
}

function renderTable() {
  const tbody = document.querySelector("#quote-table tbody");
  tbody.innerHTML = "";

  let subtotal = 0;

  products.forEach(p => {
    const total = p.quantity * p.price;
    subtotal += total;

    const row = `<tr>
      <td>${p.name}</td>
      <td>${p.quantity}</td>
      <td>S/ ${p.price.toFixed(2)}</td>
      <td>S/ ${total.toFixed(2)}</td>
    </tr>`;
    tbody.innerHTML += row;
  });

  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("igv").textContent = igv.toFixed(2);
  document.getElementById("total").textContent = total.toFixed(2);
}

function clearInputs() {
  document.getElementById("name").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById("price").value = "";
}

let cotizacionCount = 0;

async function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  cotizacionCount++;
  const number = `C-${cotizacionCount.toString().padStart(4, "0")}`;
  const date = new Date().toLocaleDateString();

  const p = products[0];
  const subtotal = p.quantity * p.price;
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  let y = 20;
  doc.setFontSize(16);
  doc.text("Cotización", 105, y, { align: "center" });

  y += 10;
  doc.setFontSize(12);
  doc.text(`Número: ${number}`, 14, y);
  doc.text(`Fecha: ${date}`, 140, y);

  y += 10;
  doc.text("Productos:", 14, y);

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Producto", 14, y);
  doc.text("Cant.", 80, y);
  doc.text("P. Unit", 110, y);
  doc.text("Total", 160, y);
  doc.setFont("helvetica", "normal");

  y += 8;
  doc.text(p.name, 14, y);
  doc.text(String(p.quantity), 80, y);
  doc.text(`S/ ${p.price.toFixed(2)}`, 110, y);
  doc.text(`S/ ${(p.quantity * p.price).toFixed(2)}`, 160, y);

  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text(`Subtotal: S/ ${subtotal.toFixed(2)}`, 14, y);
  y += 8;
  doc.text(`IGV (18%): S/ ${igv.toFixed(2)}`, 14, y);
  y += 8;
  doc.text(`TOTAL: S/ ${total.toFixed(2)}`, 14, y);

  y += 20;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Generado automáticamente por el sistema de cotizaciones.", 14, y);

  // Envío a Google Sheets: solo una fila
  try {
    const payload = [{
      number,
      date,
      product: p.name,
      quantity: p.quantity,
      price: p.price.toFixed(2),
      total_product: (p.quantity * p.price).toFixed(2),
      subtotal: subtotal.toFixed(2),
      igv: igv.toFixed(2),
      total: total.toFixed(2)
    }];

    await fetch("https://sheetdb.io/api/v1/04jrhqgn3fjmd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: payload })
    });

  } catch (error) {
    alert("Error al enviar la cotización a Google Sheets.");
    console.error(error);
  }

  doc.save(`${number}.pdf`);
}
