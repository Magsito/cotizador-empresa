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

  products = [{ name, quantity, price }];
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

    const row = `
      <tr>
        <td>${p.name}</td>
        <td>${p.quantity}</td>
        <td>S/ ${p.price.toFixed(2)}</td>
        <td>S/ ${(total).toFixed(2)}</td>
      </tr>
    `;
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

async function exportToPDF() {
  console.log("Intentando guardar cotización...");

  const number = document.getElementById("quote-number").value;
  const date = document.getElementById("quote-date").value;
  const p = products[0];

  if (!number || !date || !p) {
    alert("Faltan datos para guardar la cotización.");
    return;
  }

  const totalProducto = p.quantity * p.price;
  const subtotal = totalProducto;
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  console.log("Datos a enviar:", { number, date, subtotal, igv, total });

  try {
    // Insertar cotización
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert([{ number, date, subtotal, igv, total }])
      .select()
      .single();

    if (quoteError) {
      console.error("Error al guardar cotización:", quoteError);
      alert("Error al guardar cotización.");
      return;
    }

    const quoteId = quote.id;

    console.log("Item a guardar:", {
      quoteId,
      product: p.name,
      quantity: p.quantity,
      price: p.price,
      totalProducto
    });

    // Insertar producto relacionado
    const { error: itemError } = await supabase
      .from("quote_items")
      .insert([
        {
          quote_id: quoteId,
          product: p.name,
          quantity: p.quantity,
          price: p.price,
          total_product: totalProducto
        }
      ]);

    if (itemError) {
      console.error("Error al guardar producto:", itemError);
      alert("Error al guardar producto.");
      return;
    }

    alert("Cotización guardada exitosamente.");
  } catch (e) {
    console.error("Error inesperado:", e);
    alert("Error inesperado al guardar.");
  }
}

window.addProduct = addProduct;
window.exportToPDF = exportToPDF;
