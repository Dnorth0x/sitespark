import { Product } from "@/types";
import { generateHtmlHead, generateHeroSection, generateBrandingFooter, generateClosingBodyTag } from "@/utils/htmlGenerator";

export default function generateClassicTemplate(
  nicheTitle: string, 
  products: Product[], 
  primaryColor: string, 
  secondaryColor: string,
  includeBranding: boolean = true
): string {
  const templateStyles = `
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
    .specifications {
      margin-top: 15px;
      background-color: #f9fafb;
      padding: 15px;
      border-radius: 6px;
    }
    .spec-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .spec-row:last-child {
      border-bottom: none;
    }
    .spec-key {
      font-weight: 600;
      color: #374151;
    }
    .spec-value {
      color: #6b7280;
    }
  `;

  const head = generateHtmlHead(nicheTitle, primaryColor, secondaryColor, templateStyles, products);
  const heroSection = generateHeroSection(nicheTitle);
  const brandingFooter = generateBrandingFooter(includeBranding);
  const closingBodyTag = generateClosingBodyTag();

  const productCardsHtml = products.map(product => {
    const prosListItems = product.pros.map(pro => `<li>${pro}</li>`).join("");
    const consListItems = product.cons.map(con => `<li>${con}</li>`).join("");
    
    // Generate specifications section if available
    const specificationsHtml = (product.specifications && product.specifications.length > 0) ? `
      <div class="specifications">
        <h4>Specifications</h4>
        ${product.specifications.map(spec => `
          <div class="spec-row">
            <span class="spec-key">${spec.key}</span>
            <span class="spec-value">${spec.value}</span>
          </div>
        `).join("")}
      </div>
    ` : "";

    return `
<div class="product-card" data-aos="fade-up">
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
    ${specificationsHtml}
    <a href="${product.affiliateLink}" class="buy-button" target="_blank" rel="noopener noreferrer">Check Price</a>
  </div>
</div>`;
  }).join("");

  return `${head}
<body>
  <div class="container">
    ${heroSection}${productCardsHtml}
  </div>
  ${brandingFooter}
  ${closingBodyTag}
</html>`;
}