const FIELDS = ["name", "category", "price", "quantity", "description"];

// isUpdate = true -> only check the fields that were sent
function validateProduct(body, isUpdate = false) {
  const errors = [];

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return ["Request body must be a JSON object"];
  }

  const has = (f) => body[f] !== undefined;

  if (isUpdate && !FIELDS.some(has)) {
    errors.push(`Send at least one field to update: ${FIELDS.join(", ")}`);
  }
  if (!isUpdate || has("name")) {
    if (typeof body.name !== "string" || body.name.trim() === "") errors.push("name is required and must be text");
  }
  if (!isUpdate || has("category")) {
    if (typeof body.category !== "string" || body.category.trim() === "") errors.push("category is required and must be text");
  }
  if (!isUpdate || has("price")) {
    if (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price <= 0)
      errors.push("price must be a finite number greater than 0 (ETB)");
  }
  if (!isUpdate || has("quantity")) {
    if (!Number.isInteger(body.quantity) || body.quantity < 0)
      errors.push("quantity must be a non-negative integer");
  }
  if (has("description") && typeof body.description !== "string") {
    errors.push("description must be text");
  }
  return errors;
}

module.exports = { validateProduct, FIELDS };
