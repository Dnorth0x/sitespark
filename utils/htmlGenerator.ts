import { Product } from "@/types";

// Main generator function that calls the appropriate template generator
export const generateHtml = (nicheTitle: string, products: Product[], template: string = "classic", primaryColor: string = "#4f46e5", secondaryColor: string = "#10b981"): string => {
  // Create the HTML head with meta tags and styles
  const head = generateHtmlHead(nicheTitle, template, primaryColor, secondaryColor);
  
  // Generate the appropriate template based on selection
  let bodyContent = "";
  switch (template) {
    case "table":
      bodyContent = generateTableTemplate(nicheTitle, products);
      break;
    case "grid":
      bodyContent = generateGridTemplate(nicheTitle, products);
      break;
    case "analyst":
      bodyContent = generateAnalystTemplate(nicheTitle, products);
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
const generateHtmlHead = (nicheTitle: string, template: string, primaryColor: string, secondaryColor: string): string => {
  // CSS variables and common styles for all templates
  const commonStyles = `
    :root {
      --primary-color: ${primaryColor};
      --primary-color-hover: ${adjustColorBrightness(primaryColor, -20)};
      --secondary-color: ${secondaryColor};
      --secondary-color-light: ${adjustColorBrightness(secondaryColor, 40)};
    }
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
      background-color: var(--secondary-color-light); 
      border-radius: 8px; 
      margin-bottom: 30px;
      border: 2px solid var(--secondary-color);
    }
    .hero h1 {
      color: var(--secondary-color);
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
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
      background-color: var(--primary-color); 
      color: #ffffff; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 4px; 
      font-weight: bold; 
      text-align: center; 
      margin-top: 15px;
      transition: background-color 0.2s ease;
    }
    .buy-button:hover {
      background-color: var(--primary-color-hover);
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
          background-color: var(--primary-color);
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
    case "analyst":
      templateStyles = `
        .analyst-container {
          margin-bottom: 40px;
        }
        .analyst-product {
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }
        .analyst-header {
          display: flex;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        .analyst-image {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          margin-right: 24px;
        }
        .analyst-title-section {
          flex: 1;
        }
        .analyst-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1f2937;
        }
        .analyst-tagline {
          font-size: 16px;
          color: #6b7280;
          font-style: italic;
          margin-bottom: 16px;
        }
        .analyst-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 24px;
        }
        @media (max-width: 768px) {
          .analyst-content {
            grid-template-columns: 1fr;
          }
          .analyst-header {
            flex-direction: column;
            text-align: center;
          }
          .analyst-image {
            margin-right: 0;
            margin-bottom: 16px;
          }
        }
        .specifications-section {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 20px;
        }
        .specifications-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #374151;
          border-bottom: 2px solid var(--primary-color);
          padding-bottom: 8px;
        }
        .specifications-table {
          width: 100%;
          border-collapse: collapse;
        }
        .specifications-table tr {
          border-bottom: 1px solid #e5e7eb;
        }
        .specifications-table tr:last-child {
          border-bottom: none;
        }
        .spec-key {
          font-weight: 600;
          color: #374151;
          padding: 8px 12px 8px 0;
          width: 40%;
        }
        .spec-value {
          color: #6b7280;
          padding: 8px 0;
        }
        .pros-cons-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pros-section, .cons-section {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 16px;
        }
        .pros-title {
          font-size: 16px;
          font-weight: 600;
          color: #059669;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
        }
        .pros-title::before {
          content: "✓";
          margin-right: 8px;
          color: #10b981;
          font-weight: bold;
        }
        .cons-title {
          font-size: 16px;
          font-weight: 600;
          color: #dc2626;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
        }
        .cons-title::before {
          content: "✗";
          margin-right: 8px;
          color: #ef4444;
          font-weight: bold;
        }
        .pros-cons-section ul {
          margin: 0;
          padding-left: 0;
          list-style: none;
        }
        .pros-cons-section li {
          margin-bottom: 6px;
          padding-left: 16px;
          position: relative;
          font-size: 14px;
        }
        .pros-section li::before {
          content: "•";
          color: #10b981;
          position: absolute;
          left: 0;
          font-weight: bold;
        }
        .cons-section li::before {
          content: "•";
          color: #ef4444;
          position: absolute;
          left: 0;
          font-weight: bold;
        }
        .analyst-footer {
          padding: 24px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          background-color: #f9fafb;
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

// Helper function to adjust color brightness
const adjustColorBrightness = (hex: string, percent: number): string => {
  // Remove the hash if it exists
  const color = hex.replace('#', '');
  
  // Parse the hex color
  const num = parseInt(color, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  // Ensure values stay within 0-255 range
  const newR = Math.max(0, Math.min(255, R));
  const newG = Math.max(0, Math.min(255, G));
  const newB = Math.max(0, Math.min(255, B));
  
  return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
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

// Analyst template - professional layout with specifications
const generateAnalystTemplate = (nicheTitle: string, products: Product[]): string => {
  const heroSection = `<div class="hero">
    <h1>${nicheTitle}</h1>
  </div>`;

  const analystCards = products.map(product => {
    const prosListItems = product.pros.map(pro => `<li>${pro}</li>`).join("");
    const consListItems = product.cons.map(con => `<li>${con}</li>`).join("");
    
    // Generate specifications table
    const specificationsRows = product.specifications.map(spec => 
      `<tr>
        <td class="spec-key">${spec.key}</td>
        <td class="spec-value">${spec.value}</td>
      </tr>`
    ).join("");

    const specificationsTable = product.specifications.length > 0 ? `
      <table class="specifications-table">
        ${specificationsRows}
      </table>
    ` : `<p style="color: #6b7280; font-style: italic;">No specifications available</p>`;

    return `
<div class="analyst-product">
  <div class="analyst-header">
    <img src="${product.imageUrl}" alt="${product.name}" class="analyst-image">
    <div class="analyst-title-section">
      <h2 class="analyst-title">${product.name}</h2>
      <p class="analyst-tagline">${product.tagline}</p>
      <a href="${product.affiliateLink}" class="buy-button" target="_blank" rel="noopener noreferrer">Check Price</a>
    </div>
  </div>
  
  <div class="analyst-content">
    <div class="specifications-section">
      <h3 class="specifications-title">Technical Specifications</h3>
      ${specificationsTable}
    </div>
    
    <div class="pros-cons-section">
      <div class="pros-section">
        <h4 class="pros-title">Advantages</h4>
        <ul>${prosListItems}</ul>
      </div>
      
      <div class="cons-section">
        <h4 class="cons-title">Disadvantages</h4>
        <ul>${consListItems}</ul>
      </div>
    </div>
  </div>
</div>`;
  }).join("");

  return `${heroSection}<div class="analyst-container">${analystCards}</div>`;
};