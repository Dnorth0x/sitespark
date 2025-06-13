import { Product } from "@/types";

export const generateHtml = (nicheTitle: string, products: Product[]): string => {
  // Create the HTML head with meta tags and styles
  const head = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nicheTitle}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
      margin: 0; 
      background-color: #f9fafb; 
      color: #111827; 
    }
    .container { 
      max-width: 900px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .hero { 
      text-align: center; 
      padding: 40px 20px; 
      background-color: #eef2ff; 
      border-radius: 8px; 
      margin-bottom: 30px;
    }
    .product-card { 
      background-color: #ffffff; 
      border: 1px solid #e5e7eb; 
      border-radius: 8px; 
      padding: 20px; 
      margin-bottom: 20px; 
      display: flex; 
      flex-direction: column; 
    }
    @media (min-width: 768px) {
      .product-card {
        flex-direction: row;
        gap: 20px;
      }
    }
    .product-image { 
      max-width: 200px; 
      max-height: 200px; 
      object-fit: cover; 
      border-radius: 4px; 
      margin-bottom: 15px;
    }
    @media (min-width: 768px) {
      .product-image {
        margin-bottom: 0;
      }
    }
    .product-details {
      flex: 1;
    }
    .buy-button { 
      display: inline-block; 
      background-color: #4f46e5; 
      color: #ffffff; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 4px; 
      font-weight: bold; 
      text-align: center; 
      margin-top: 15px;
    }
    .buy-button:hover {
      background-color: #4338ca;
    }
    .pros-cons { 
      display: grid; 
      grid-template-columns: 1fr; 
      gap: 10px; 
      margin-top: 15px;
    }
    @media (min-width: 640px) {
      .pros-cons {
        grid-template-columns: 1fr 1fr;
      }
    }
    ul { 
      padding-left: 20px; 
      margin-top: 5px;
    }
    li { 
      margin-bottom: 5px; 
    }
    h1 {
      margin-top: 0;
      color: #1f2937;
    }
    h2 {
      margin-top: 0;
      color: #1f2937;
    }
    h4 {
      margin-bottom: 5px;
      color: #4b5563;
    }
  </style>
</head>
  `;

  // Generate product cards HTML
  const productCardsHtml = products.map(product => {
    const prosListItems = product.pros.map(pro => `<li>${pro}</li>`).join("");
    const consListItems = product.cons.map(con => `<li>${con}</li>`).join("");

    return `
<div class="product-card">
  <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
  <div class="product-details">
    <h2>${product.name}</h2>
    <p><em>${product.tagline}</em></p>
    <div class="pros-cons">
      <div>
        <h4>Pros</h4>
        <ul>
          ${prosListItems}
        </ul>
      </div>
      <div>
        <h4>Cons</h4>
        <ul>
          ${consListItems}
        </ul>
      </div>
    </div>
    <a href="${product.affiliateLink}" class="buy-button" target="_blank" rel="noopener noreferrer">Check Price</a>
  </div>
</div>`;
  }).join("");

  // Assemble the complete HTML
  const completeHtml = `${head}
<body>
  <div class="container">
    <div class="hero">
      <h1>${nicheTitle}</h1>
    </div>
    ${productCardsHtml}
  </div>
</body>
</html>`;

  return completeHtml;
};