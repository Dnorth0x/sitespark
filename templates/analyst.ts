import { Product } from "@/types";
import { generateHtmlHead, generateHeroSection, generateBrandingFooter, generateClosingBodyTag } from "@/utils/htmlGenerator";

export default function generateAnalystTemplate(
  nicheTitle: string, 
  products: Product[], 
  primaryColor: string, 
  secondaryColor: string,
  includeBranding: boolean = true
): string {
  const templateStyles = `
    .analyst-intro {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .analyst-intro h2 {
      color: var(--primary-color);
      margin-top: 0;
    }
    .product-analysis {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .product-header {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 25px;
    }
    @media (min-width: 768px) {
      .product-header {
        flex-direction: row;
        align-items: flex-start;
      }
    }
    .product-image-analyst {
      max-width: 250px;
      max-height: 200px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .product-header-content {
      flex: 1;
    }
    .product-title-analyst {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 10px 0;
      color: #1f2937;
    }
    .product-tagline-analyst {
      font-size: 16px;
      color: #6b7280;
      margin: 0 0 20px 0;
      font-style: italic;
    }
    .analysis-sections {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }
    @media (min-width: 768px) {
      .analysis-sections {
        grid-template-columns: 1fr 1fr;
      }
    }
    .analysis-section {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 6px;
    }
    .analysis-section h4 {
      margin: 0 0 12px 0;
      color: #374151;
      font-size: 16px;
      font-weight: 600;
    }
    .analysis-section ul {
      margin: 0;
      padding-left: 18px;
    }
    .analysis-section li {
      margin-bottom: 6px;
      line-height: 1.5;
    }
    .specifications-analyst {
      grid-column: 1 / -1;
      background-color: #f3f4f6;
      padding: 20px;
      border-radius: 6px;
      margin-top: 10px;
    }
    .specifications-analyst h4 {
      margin: 0 0 15px 0;
      color: #374151;
      font-size: 16px;
      font-weight: 600;
    }
    .specs-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }
    @media (min-width: 640px) {
      .specs-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    .spec-item-analyst {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background-color: #ffffff;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }
    .spec-key-analyst {
      font-weight: 600;
      color: #374151;
    }
    .spec-value-analyst {
      color: #6b7280;
    }
    .verdict-section {
      margin-top: 25px;
      padding: 20px;
      background-color: var(--secondary-color-light);
      border-radius: 6px;
      border: 1px solid var(--secondary-color);
    }
    .verdict-section h4 {
      margin: 0 0 10px 0;
      color: var(--secondary-color);
      font-size: 16px;
      font-weight: 600;
    }
    .analyst-buy-button {
      display: inline-block;
      background-color: var(--primary-color);
      color: #ffffff;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 20px;
      transition: background-color 0.2s ease;
      font-size: 16px;
    }
    .analyst-buy-button:hover {
      background-color: var(--primary-color-hover);
    }
  `;

  const head = generateHtmlHead(nicheTitle, primaryColor, secondaryColor, templateStyles, products);
  const heroSection = generateHeroSection(nicheTitle);
  const brandingFooter = generateBrandingFooter(includeBranding);
  const closingBodyTag = generateClosingBodyTag();

  const introText = `
    <div class="analyst-intro" data-aos="fade-up">
      <h2>Expert Analysis & Recommendations</h2>
      <p>Our team has thoroughly tested and analyzed each product in this category. Below you'll find detailed breakdowns of the top contenders, including comprehensive pros and cons analysis, technical specifications, and our expert verdict on each option.</p>
    </div>
  `;

  const productAnalysisHtml = products.map((product, index) => {
    const prosListItems = product.pros.map(pro => `<li>${pro}</li>`).join("");
    const consListItems = product.cons.map(con => `<li>${con}</li>`).join("");
    
    // Generate specifications section if available
    const specificationsHtml = (product.specifications && product.specifications.length > 0) ? `
      <div class="specifications-analyst">
        <h4>Technical Specifications</h4>
        <div class="specs-grid">
          ${product.specifications.map(spec => `
            <div class="spec-item-analyst">
              <span class="spec-key-analyst">${spec.key}</span>
              <span class="spec-value-analyst">${spec.value}</span>
            </div>
          `).join("")}
        </div>
      </div>
    ` : "";

    // Generate a simple verdict based on position
    const verdicts = [
      "Our top recommendation for most users. Offers the best balance of performance, features, and value.",
      "An excellent alternative with unique strengths. Perfect for users with specific requirements.",
      "A solid choice with distinct advantages. Great for budget-conscious buyers or niche use cases."
    ];
    const verdict = verdicts[index] || "A quality option worth considering for the right user.";

    return `
    <div class="product-analysis" data-aos="fade-up">
      <div class="product-header">
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image-analyst">
        <div class="product-header-content">
          <h3 class="product-title-analyst">${product.name}</h3>
          <p class="product-tagline-analyst">${product.tagline}</p>
        </div>
      </div>
      
      <div class="analysis-sections">
        <div class="analysis-section">
          <h4>Strengths</h4>
          <ul>
            ${prosListItems}
          </ul>
        </div>
        <div class="analysis-section">
          <h4>Limitations</h4>
          <ul>
            ${consListItems}
          </ul>
        </div>
        ${specificationsHtml}
      </div>
      
      <div class="verdict-section">
        <h4>Expert Verdict</h4>
        <p>${verdict}</p>
      </div>
      
      <a href="${product.affiliateLink}" class="analyst-buy-button" target="_blank" rel="noopener noreferrer">Check Current Price</a>
    </div>`;
  }).join("");

  return `${head}
<body>
  <div class="container">
    ${heroSection}
    ${introText}
    ${productAnalysisHtml}
  </div>
  ${brandingFooter}
  ${closingBodyTag}
</html>`;
}