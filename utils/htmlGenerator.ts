import { Product } from "@/types";

// Main generator function that calls the appropriate template generator
export const generateHtml = (nicheTitle: string, products: Product[], template: string = "classic"): string => {
  // Create the HTML head with meta tags and styles
  const head = generateHtmlHead(nicheTitle, template);
  
  // Generate the appropriate template based on selection
  let bodyContent = "";
  switch (template) {
    case "table":
      bodyContent = generateTableTemplate(nicheTitle, products);
      break;
    case "grid":
      bodyContent = generateGridTemplate(nicheTitle, products);
      break;
    case "classic":
    default:
      bodyContent = generateClassicTemplate(nicheTitle, products);
      break;
  }

  // Assemble the complete HTML
  const completeHtml = `${head}
<body>
  <div class="container">
    ${bodyContent}
  </div>
</body>
</html>`;

  return completeHtml;
};

// Generate the HTML head with appropriate styles based on template
const generateHtmlHead = (nicheTitle: string, template: string): string => {
  // Common styles for all templates
  const commonStyles = `
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
    ul { 
      padding-left: 20px; 
      margin-top: 5px;
    }
    li { 
      margin-bottom: 5px; 
    }
  `;

  // Template-specific styles
  let templateStyles = "";
  
  switch (template) {
    case "table":
      templateStyles = `
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        th {
          background-color: #4f46e5;
          color: white;
          text-align: left;
          padding: 16px;
          font-weight: 600;
        }
        td {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        tr:last-child td {
          border-bottom: none;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .product-image-small {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
          margin-right: 15px;
        }
        .product-cell {
          display: flex;
          align-items: center;
        }
        .pros-cons-cell ul {
          margin: 0;
          padding-left: 20px;
        }
      `;
      break;
    case "grid":
      templateStyles = `
        .products-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        @media (min-width: 640px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .grid-card {
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .grid-card-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }
        .grid-card-content {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .grid-card-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .grid-card-tagline {
          font-style: italic;
          margin-bottom: 12px;
          color: #6b7280;
          font-size: 14px;
        }
        .grid-card-features {
          margin-top: auto;
          margin-bottom: 15px;
        }
        .feature-list {
          font-size: 14px;
          margin-bottom: 8px;
        }
        .feature-list-title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .feature-list ul {
          margin: 0;
        }
      `;
      break;
    case "classic":
    default:
      templateStyles = `
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
      `;
      break;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nicheTitle}</title>
  <style>
    ${commonStyles}
    ${templateStyles}
  </style>
</head>`;
};

// Classic template - original card layout
const generateClassicTemplate = (nicheTitle: string, products: Product[]): string => {
  const heroSection = `<div class="hero">
    <h1>${nicheTitle}</h1>
  </div>`;

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

  return `${heroSection}${productCardsHtml}`;
};

// Table template - comparison table layout
const generateTableTemplate = (nicheTitle: string, products: Product[]): string => {
  const heroSection = `<div class="hero">
    <h1>${nicheTitle}</h1>
  </div>`;

  const tableRows = products.map(product => {
    const prosListItems = product.pros.map(pro => `<li>${pro}</li>`).join("");
    const consListItems = product.cons.map(con => `<li>${con}</li>`).join("");

    return `
<tr>
  <td class="product-cell">
    <img src="${product.imageUrl}" alt="${product.name}" class="product-image-small">
    <div>
      <strong>${product.name}</strong>
    </div>
  </td>
  <td>${product.tagline}</td>
  <td class="pros-cons-cell">
    <h4>Pros</h4>
    <ul>${prosListItems}</ul>
    <h4>Cons</h4>
    <ul>${consListItems}</ul>
  </td>
  <td>
    <a href="${product.affiliateLink}" class="buy-button" target="_blank" rel="noopener noreferrer">Check Price</a>
  </td>
</tr>`;
  }).join("");

  const tableHtml = `
<table>
  <thead>
    <tr>
      <th>Product</th>
      <th>Description</th>
      <th>Features</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    ${tableRows}
  </tbody>
</table>`;

  return `${heroSection}${tableHtml}`;
};

// Grid template - responsive grid layout
const generateGridTemplate = (nicheTitle: string, products: Product[]): string => {
  const heroSection = `<div class="hero">
    <h1>${nicheTitle}</h1>
  </div>`;

  const gridCards = products.map(product => {
    const prosListItems = product.pros.map(pro => `<li>${pro}</li>`).join("");
    const consListItems = product.cons.map(con => `<li>${con}</li>`).join("");

    return `
<div class="grid-card">
  <img src="${product.imageUrl}" alt="${product.name}" class="grid-card-image">
  <div class="grid-card-content">
    <div class="grid-card-title">${product.name}</div>
    <div class="grid-card-tagline">${product.tagline}</div>
    <div class="grid-card-features">
      <div class="feature-list">
        <div class="feature-list-title">Pros</div>
        <ul>${prosListItems}</ul>
      </div>
      <div class="feature-list">
        <div class="feature-list-title">Cons</div>
        <ul>${consListItems}</ul>
      </div>
    </div>
    <a href="${product.affiliateLink}" class="buy-button" target="_blank" rel="noopener noreferrer">Check Price</a>
  </div>
</div>`;
  }).join("");

  return `${heroSection}<div class="products-grid">${gridCards}</div>`;
};