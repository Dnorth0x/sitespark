import { Product } from "@/types";
import { generateHtmlHead, generateHeroSection, generateBrandingFooter } from "@/utils/htmlGenerator";

export default function generateGridTemplate(
  nicheTitle: string, 
  products: Product[], 
  primaryColor: string, 
  secondaryColor: string,
  includeBranding: boolean = true
): string {
  const templateStyles = `
    .products-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin: 20px 0;
    }
    @media (min-width: 768px) {
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (min-width: 1024px) {
      .products-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .grid-card {
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .grid-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    .grid-card-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .grid-card-content {
      padding: 20px;
    }
    .grid-card-title {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #1f2937;
    }
    .grid-card-tagline {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 15px 0;
      font-style: italic;
    }
    .grid-pros-cons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 15px 0;
    }
    .grid-pros-cons h5 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
    }
    .grid-pros-cons ul {
      margin: 0;
      padding-left: 15px;
      font-size: 13px;
    }
    .grid-pros-cons li {
      margin-bottom: 4px;
    }
    .grid-specs {
      margin: 15px 0;
      padding: 12px;
      background-color: #f9fafb;
      border-radius: 6px;
    }
    .grid-specs h5 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
    .grid-spec-item {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 4px;
      padding: 2px 0;
    }
    .grid-spec-key {
      font-weight: 500;
      color: #4b5563;
    }
    .grid-spec-value {
      color: #6b7280;
    }
    .grid-buy-button {
      display: block;
      width: 100%;
      background-color: var(--primary-color);
      color: #ffffff;
      padding: 12px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin-top: 15px;
      transition: background-color 0.2s ease;
    }
    .grid-buy-button:hover {
      background-color: var(--primary-color-hover);
    }
  `;

  const head = generateHtmlHead(nicheTitle, primaryColor, secondaryColor, templateStyles, products);
  const heroSection = generateHeroSection(nicheTitle);
  const brandingFooter = generateBrandingFooter(includeBranding);

  const gridCardsHtml = products.map(product => {
    const prosListItems = product.pros.slice(0, 3).map(pro => `<li>${pro}</li>`).join("");
    const consListItems = product.cons.slice(0, 3).map(con => `<li>${con}</li>`).join("");
    
    // Generate specifications section if available
    const specificationsHtml = (product.specifications && product.specifications.length > 0) ? `
      <div class="grid-specs">
        <h5>Key Specs</h5>
        ${product.specifications.slice(0, 4).map(spec => `
          <div class="grid-spec-item">
            <span class="grid-spec-key">${spec.key}</span>
            <span class="grid-spec-value">${spec.value}</span>
          </div>
        `).join("")}
      </div>
    ` : "";

    return `
    <div class="grid-card">
      <img src="${product.imageUrl}" alt="${product.name}" class="grid-card-image">
      <div class="grid-card-content">
        <h3 class="grid-card-title">${product.name}</h3>
        <p class="grid-card-tagline">${product.tagline}</p>
        
        <div class="grid-pros-cons">
          <div>
            <h5>Pros</h5>
            <ul>
              ${prosListItems}
            </ul>
          </div>
          <div>
            <h5>Cons</h5>
            <ul>
              ${consListItems}
            </ul>
          </div>
        </div>
        
        ${specificationsHtml}
        
        <a href="${product.affiliateLink}" class="grid-buy-button" target="_blank" rel="noopener noreferrer">Check Price</a>
      </div>
    </div>`;
  }).join("");

  return `${head}
<body>
  <div class="container">
    ${heroSection}
    <div class="products-grid">
      ${gridCardsHtml}
    </div>
  </div>
  ${brandingFooter}
</body>
</html>`;
}