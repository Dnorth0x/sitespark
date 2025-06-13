import { Product } from "@/types";

// Template interface that all template modules should implement
export interface TemplateModule {
  default: (nicheTitle: string, products: Product[], primaryColor: string, secondaryColor: string) => string;
}

// Main generator function that dynamically dispatches to appropriate template
export const generateHtml = async (
  nicheTitle: string, 
  products: Product[], 
  template: string = "classic", 
  primaryColor: string = "#4f46e5", 
  secondaryColor: string = "#10b981"
): Promise<string> => {
  try {
    // Dynamic import based on template selection
    let templateModule: TemplateModule;
    
    switch (template) {
      case "table":
        templateModule = await import("../templates/table");
        break;
      case "grid":
        templateModule = await import("../templates/grid");
        break;
      case "analyst":
        templateModule = await import("../templates/analyst");
        break;
      case "classic":
      default:
        templateModule = await import("../templates/classic");
        break;
    }
    
    // Call the template's default export function
    return templateModule.default(nicheTitle, products, primaryColor, secondaryColor);
  } catch (error) {
    console.error(`Error loading template "${template}":`, error);
    
    // Fallback to inline classic template if dynamic import fails
    return generateFallbackClassicTemplate(nicheTitle, products, primaryColor, secondaryColor);
  }
};

// Synchronous version for backward compatibility (will be deprecated)
export const generateHtmlSync = (
  nicheTitle: string, 
  products: Product[], 
  template: string = "classic", 
  primaryColor: string = "#4f46e5", 
  secondaryColor: string = "#10b981"
): string => {
  console.warn("generateHtmlSync is deprecated. Use generateHtml (async) instead.");
  return generateFallbackClassicTemplate(nicheTitle, products, primaryColor, secondaryColor);
};

// Helper function to adjust color brightness
export const adjustColorBrightness = (hex: string, percent: number): string => {
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

// Generate common HTML head that all templates can use
export const generateHtmlHead = (
  nicheTitle: string, 
  primaryColor: string, 
  secondaryColor: string,
  additionalStyles: string = ""
): string => {
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nicheTitle}</title>
  <style>
    ${commonStyles}
    ${additionalStyles}
  </style>
</head>`;
};

// Generate hero section that all templates can use
export const generateHeroSection = (nicheTitle: string): string => {
  return `<div class="hero">
    <h1>${nicheTitle}</h1>
  </div>`;
};

// Fallback classic template (inline) for error cases
const generateFallbackClassicTemplate = (
  nicheTitle: string, 
  products: Product[], 
  primaryColor: string, 
  secondaryColor: string
): string => {
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
  `;

  const head = generateHtmlHead(nicheTitle, primaryColor, secondaryColor, templateStyles);
  const heroSection = generateHeroSection(nicheTitle);

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

  return `${head}
<body>
  <div class="container">
    ${heroSection}${productCardsHtml}
  </div>
</body>
</html>`;
};