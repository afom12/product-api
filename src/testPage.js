// A basic test page served at "/" so the evaluator can try every operation.
module.exports = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Product CRUD API - Test Page</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 900px; margin: 20px auto; padding: 0 12px; }
  fieldset { margin-bottom: 14px; }
  label { display: inline-block; margin: 4px 8px 4px 0; }
  input { padding: 4px; }
  button { margin: 4px 4px 4px 0; padding: 6px 10px; cursor: pointer; }
  pre { background: #f4f4f4; padding: 10px; overflow-x: auto; min-height: 60px; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #ccc; padding: 4px 6px; text-align: left; font-size: 14px; }
  .ok { color: green; } .err { color: #b00; }
</style>
</head>
<body>
<h1>Product CRUD API - Test Page</h1>
<p>Endpoints: <code>GET/POST /api/products</code>, <code>GET/PUT/DELETE /api/products/:id</code></p>

<fieldset>
  <legend>1. List all products</legend>
  <button onclick="listAll()">GET /api/products</button>
  <div id="table"></div>
</fieldset>

<fieldset>
  <legend>2. Create a product</legend>
  <label>Name <input id="c-name" value="Gondar Clay Jebena"></label>
  <label>Category <input id="c-category" value="Home"></label>
  <label>Price (ETB) <input id="c-price" type="number" value="650"></label>
  <label>Quantity <input id="c-quantity" type="number" value="15"></label>
  <label>Description <input id="c-description" value="Traditional clay coffee pot"></label><br>
  <button onclick="createProduct()">POST /api/products</button>
</fieldset>

<fieldset>
  <legend>3. Work with one product by ID</legend>
  <label>ID <input id="id" size="40" placeholder="filled in automatically after create"></label><br>
  <button onclick="getOne()">GET by ID</button>
  <label>New price <input id="u-price" type="number" value="700"></label>
  <label>New quantity <input id="u-quantity" type="number" value="20"></label>
  <button onclick="updateOne()">PUT price + quantity</button>
  <button onclick="deleteOne()">DELETE by ID</button>
</fieldset>

<fieldset>
  <legend>4. Invalid examples (should all be rejected)</legend>
  <button onclick="send('POST','/api/products',{category:'Home',price:100,quantity:1})">Missing name</button>
  <button onclick="send('POST','/api/products',{name:'X',price:100,quantity:1})">Missing category</button>
  <button onclick="send('POST','/api/products',{name:'X',category:'Home',price:-50,quantity:1})">Negative price</button>
  <button onclick="send('POST','/api/products',{name:'X',category:'Home',price:'abc',quantity:1})">Price is text</button>
  <button onclick="send('POST','/api/products',{name:'X',category:'Home',price:100,quantity:2.5})">Decimal quantity</button>
  <button onclick="send('POST','/api/products',{name:'X',category:'Home',price:100,quantity:-3})">Negative quantity</button>
  <button onclick="send('POST','/api/products','{bad json',true)">Broken JSON</button>
  <button onclick="send('GET','/api/products/does-not-exist')">Unknown ID (404)</button>
</fieldset>

<h3>Response</h3>
<div id="status"></div>
<pre id="out"></pre>

<script>
  const $ = (id) => document.getElementById(id);

  async function send(method, url, body, raw) {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (body !== undefined) opts.body = raw ? body : JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json();
    $("status").innerHTML = '<b class="' + (res.ok ? "ok" : "err") + '">' + method + " " + url + " -> " + res.status + "</b>";
    $("out").textContent = JSON.stringify(data, null, 2);
    return { res, data };
  }

  async function listAll() {
    const { data } = await send("GET", "/api/products");
    let html = "<table><tr><th>ID</th><th>Name</th><th>Category</th><th>Price (ETB)</th><th>Qty</th><th>Description</th></tr>";
    for (const p of data) {
      html += "<tr><td><a href='#' onclick=\\"$('id').value='" + p.id + "';return false\\">" + p.id + "</a></td><td>" +
        p.name + "</td><td>" + p.category + "</td><td>" + p.price + "</td><td>" + p.quantity + "</td><td>" + p.description + "</td></tr>";
    }
    $("table").innerHTML = html + "</table><small>Click an ID to select it.</small>";
  }

  async function createProduct() {
    const { res, data } = await send("POST", "/api/products", {
      name: $("c-name").value,
      category: $("c-category").value,
      price: Number($("c-price").value),
      quantity: Number($("c-quantity").value),
      description: $("c-description").value,
    });
    if (res.ok) $("id").value = data.id;
  }

  const getOne = () => send("GET", "/api/products/" + $("id").value.trim());
  const deleteOne = () => send("DELETE", "/api/products/" + $("id").value.trim());
  const updateOne = () => send("PUT", "/api/products/" + $("id").value.trim(), {
    price: Number($("u-price").value),
    quantity: Number($("u-quantity").value),
  });
</script>
</body>
</html>`;
