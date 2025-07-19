import { supabase } from './supabase.js';

let products = [];

function addProduct() {
  const name = document.getElementById("name").value;
  const quantity = parseFloat(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("price").value);

  if (!name || isNaN(quantity) || isNaN(price)) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  products = [{ name, quantity, price }]; // Un solo producto por cotización
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
  const date = new Date().toLocaleDateString("es-PE");
  const p = products[0];

  const totalProducto = p.quantity * p.price;
  const subtotal = totalProducto;
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  // Crear cotización en Supabase
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert([
      {
        number,
        date,
        subtotal,
        igv,
        total
      }
    ])
    .select()
    .single();

  if (quoteError) {
    alert("Error al guardar cotización.");
    console.error(quoteError);
    return;
  }

  const quoteId = quote.id;

  // Crear ítem relacionado
  const { error: itemError } = await supabase.from("quote_items").insert([
    {
      quote_id: quoteId,
      product: p.name,
      quantity: p.quantity,
      price: p.price,
      total_product: totalProducto
    }
  ]);

  if (itemError) {
    alert("Error al guardar producto.");
    console.error(itemError);
    return;
  }

  // Crear PDF
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
  doc.text(`S/ ${totalProducto.toFixed(2)}`, 160, y);

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

  doc.save(`${number}.pdf`);
}

window.addProduct = addProduct;
window.exportToPDF = exportToPDF;
