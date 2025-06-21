import { Product } from "@/types";
import { generateHtmlHead, generateHeroSection, generateBrandingFooter, generateClosingBodyTag } from "@/utils/htmlGenerator";

export default function generateTableTemplate(
  nicheTitle: string, 
  products: Product[], 
  primaryColor: string, 
  secondaryColor: string,
  includeBranding: boolean = true
): string {
  const templateStyles = `
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .comparison-table th,
    .comparison-table td {
      padding: 15px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    .comparison-table th {
      background-color: var(--primary-color);
      color: #ffffff;
      font-weight: 600;
    }
    .comparison-table tr:hover {
      background-color: #f9fafb;
    }
    .product-name {
      font-weight: 600;
      color: var(--primary-color);
    }
    .product-image-small {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }
    .pros-cons-cell {
      max-width: 200px;
    }
    .pros-cons-cell ul {
      margin: 0;
      padding-left: 15px;
      font-size: 14px;
    }
    .pros-cons-cell li {
      margin-bottom: 3px;
    }
    .buy-button-small {
      display: inline-block;
      background-color: var(--primary-color);
      color: #ffffff;
      padding: 8px 16px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
      font-size: 14px;
      transition: background-color 0.2s ease;
    }
    .buy-button-small:hover {
      background-color: var(--primary-color-hover);
    }
    @media (max-width: 768px) {
      .comparison-table {
        font-size: 14px;
      }
      .comparison-table th,
      .comparison-table td {
        padding: 10px 8px;
      }
      .product-image-small {
        width: 60px;
        height: 60px;
      }
      .pros-cons-cell {
        max-width: 150px;
      }
    }
  `;

  const head = generateHtmlHead(nicheTitle, primaryColor, secondaryColor, templateStyles, products);
  const heroSection = generateHeroSection(nicheTitle);
  const brandingFooter = generateBrandingFooter(includeBranding);
  const closingBodyTag = generateClosingBodyTag();

  const tableRowsHtml = products.map(product => {
    const prosListItems = product.pros.slice(0, 3).map(pro => `<li>${pro}</li>`).join("");
    const consListItems = product.cons.slice(0, 3).map(con => `<li>${con}</li>`).join("");

    return `
    <tr data-aos="fade-up">
      <td>
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image-small">
      </td>
      <td>
        <div class="product-name">${product.name}</div>
        <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">${product.tagline}</div>
      </td>
      <td class="pros-cons-cell">
        <ul>
          ${prosListItems}
        </ul>
      </td>
      <td class="pros-cons-cell">
        <ul>
          ${consListItems}
        </ul>
      </td>
      <td>
        <a href="${product.affiliateLink}" class="buy-button-small" target="_blank" rel="noopener noreferrer">Check Price</a>
      </td>
    </tr>`;
  }).join("");

  return `${head}
<body>
  <div class="container">
    ${heroSection}
    <table class="comparison-table" data-aos="fade-up">
      <thead>
        <tr>
          <th>Image</th>
          <th>Product</th>
          <th>Pros</th>
          <th>Cons</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
    </table>
  </div>
  ${brandingFooter}
  ${closingBodyTag}
</html>`;
}