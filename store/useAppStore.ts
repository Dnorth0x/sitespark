import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Specification } from '@/types';

// Default data constants
const DEFAULT_NICHE_TITLE = "Best Laptops of 2025";
const DEFAULT_PRIMARY_COLOR = "#4f46e5";
const DEFAULT_SECONDARY_COLOR = "#10b981";
const DEFAULT_INCLUDE_BRANDING = true;
const DEFAULT_PASSWORD = "Spark2025!";

// Raw product data
const DEFAULT_TOP_PICKS_RAW = [
  {
    id: 1,
    name: "MacBook Pro M3",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1626&q=80",
    tagline: "Ultimate performance for professionals with the revolutionary M3 chip",
    pros: ["Exceptional battery life", "Powerful M3 processor", "Beautiful Retina display", "Premium build quality"],
    cons: ["Expensive", "Limited ports", "Not easily upgradable"],
    affiliateLink: "https://amazon.com/macbook-pro",
    specifications: [
      { id: 1, key: "Processor", value: "Apple M3 Pro 12-core CPU", include: true },
      { id: 2, key: "Memory", value: "18GB Unified Memory", include: true },
      { id: 3, key: "Storage", value: "512GB SSD", include: true },
      { id: 4, key: "Display", value: "14.2-inch Liquid Retina XDR", include: true },
      { id: 5, key: "Battery Life", value: "Up to 18 hours", include: true },
      { id: 6, key: "Weight", value: "3.5 lbs (1.6 kg)", include: true }
    ]
  },
  {
    id: 2,
    name: "Dell XPS 13 Plus",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1626&q=80",
    tagline: "Sleek Windows ultrabook with cutting-edge design and performance",
    pros: ["Stunning 4K display", "Premium build quality", "Fast Intel processor", "Compact and lightweight"],
    cons: ["Limited port selection", "Average battery life", "Can get warm under load"],
    affiliateLink: "https://amazon.com/dell-xps-13",
    specifications: [
      { id: 1, key: "Processor", value: "Intel Core i7-1360P", include: true },
      { id: 2, key: "Memory", value: "16GB LPDDR5", include: true },
      { id: 3, key: "Storage", value: "512GB PCIe SSD", include: true },
      { id: 4, key: "Display", value: "13.4-inch 4K OLED", include: true },
      { id: 5, key: "Battery Life", value: "Up to 12 hours", include: true },
      { id: 6, key: "Weight", value: "2.73 lbs (1.24 kg)", include: true }
    ]
  },
  {
    id: 3,
    name: "ASUS ROG Zephyrus G14",
    imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1626&q=80",
    tagline: "Powerful gaming laptop that does not compromise on portability",
    pros: ["Excellent gaming performance", "Great battery life for gaming laptop", "Compact 14-inch form factor", "High refresh rate display"],
    cons: ["Can get loud under load", "Limited webcam quality", "Premium price point"],
    affiliateLink: "https://amazon.com/asus-rog-zephyrus",
    specifications: [
      { id: 1, key: "Processor", value: "AMD Ryzen 9 7940HS", include: true },
      { id: 2, key: "Graphics", value: "NVIDIA RTX 4060", include: true },
      { id: 3, key: "Memory", value: "16GB DDR5", include: true },
      { id: 4, key: "Storage", value: "1TB PCIe SSD", include: true },
      { id: 5, key: "Display", value: "14-inch 165Hz QHD", include: true },
      { id: 6, key: "Weight", value: "3.64 lbs (1.65 kg)", include: true }
    ]
  }
];

interface AppState {
  // Core app data
  nicheTitle: string;
  products: Product[];
  primaryColor: string;
  secondaryColor: string;
  includeBranding: boolean;
  selectedTemplate: string;
  generatedHtml: string;
  
  // Settings
  pexelsApiKey: string;
  currentPassword: string;
  
  // UI state
  isResetModalOpen: boolean;
  showResetSuccessToast: boolean;
  saveStatus: string;
  isGenerating: boolean;
  
  // Actions
  setNicheTitle: (title: string) => void;
  setProducts: (products: Product[]) => void;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setIncludeBranding: (include: boolean) => void;
  setSelectedTemplate: (template: string) => void;
  setGeneratedHtml: (html: string) => void;
  setPexelsApiKey: (key: string) => void;
  setCurrentPassword: (password: string) => void;
  setSaveStatus: (status: string) => void;
  setIsGenerating: (generating: boolean) => void;
  
  // Product management
  addProduct: () => void;
  removeProduct: (index: number) => void;
  updateProduct: (index: number, field: keyof Product, value: any) => void;
  addSpecification: (productId: number) => void;
  removeSpecification: (productIndex: number, specIndex: number) => void;
  updateSpecification: (productId: number, specId: number, updates: Partial<Specification>) => void;
  updateSpecificationInclude: (productId: number, specId: number, include: boolean) => void;
  
  // Modal and toast management
  openResetModal: () => void;
  closeResetModal: () => void;
  confirmReset: () => void;
  showSuccessToast: () => void;
  hideSuccessToast: () => void;
}

// Helper function to ensure product has specifications array with include property
const ensureProductSpecifications = (product: any): Product => ({
  ...product,
  specifications: Array.isArray(product.specifications) 
    ? product.specifications.map((spec: any) => ({
        ...spec,
        include: spec.include !== undefined ? spec.include : true
      }))
    : []
});

const getInitialState = () => {
  return {
    nicheTitle: DEFAULT_NICHE_TITLE,
    products: DEFAULT_TOP_PICKS_RAW.map(ensureProductSpecifications),
    primaryColor: DEFAULT_PRIMARY_COLOR,
    secondaryColor: DEFAULT_SECONDARY_COLOR,
    includeBranding: DEFAULT_INCLUDE_BRANDING,
    selectedTemplate: "classic",
    generatedHtml: "",
    pexelsApiKey: "",
    currentPassword: DEFAULT_PASSWORD,
    isResetModalOpen: false,
    showResetSuccessToast: false,
    saveStatus: "idle",
    isGenerating: false,
  };
};

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      // Basic setters
      setNicheTitle: (title: string) => set({ nicheTitle: title }),
      setProducts: (products: Product[]) => set({ products }),
      setPrimaryColor: (color: string) => set({ primaryColor: color }),
      setSecondaryColor: (color: string) => set({ secondaryColor: color }),
      setIncludeBranding: (include: boolean) => set({ includeBranding: include }),
      setSelectedTemplate: (template: string) => set({ selectedTemplate: template }),
      setGeneratedHtml: (html: string) => set({ generatedHtml: html }),
      setPexelsApiKey: (key: string) => set({ pexelsApiKey: key }),
      setCurrentPassword: (password: string) => set({ currentPassword: password }),
      setSaveStatus: (status: string) => set({ saveStatus: status }),
      setIsGenerating: (generating: boolean) => set({ isGenerating: generating }),

      // Product management
      addProduct: () => {
        const newProduct: Product = {
          id: Date.now(),
          name: "",
          imageUrl: "",
          tagline: "",
          pros: [],
          cons: [],
          affiliateLink: "",
          specifications: [],
        };
        
        set(state => ({ products: [...state.products, newProduct] }));
      },

      removeProduct: (index: number) => {
        set(state => {
          if (state.products.length > 1) {
            const updatedProducts = state.products.filter((_, i) => i !== index);
            return { products: updatedProducts };
          }
          return state;
        });
      },

      updateProduct: (index: number, field: keyof Product, value: any) => {
        set(state => {
          const updatedProducts = [...state.products];
          const product = ensureProductSpecifications(updatedProducts[index]);
          
          if (field === 'pros' || field === 'cons') {
            if (typeof value === 'string') {
              product[field] = value.split(',').map(item => item.trim()).filter(item => item !== '');
            } else {
              product[field] = value as string[];
            }
          } else if (field === 'specifications') {
            product[field] = value as Specification[];
          } else {
            // @ts-ignore
            product[field] = value;
          }
          
          updatedProducts[index] = product;
          return { products: updatedProducts };
        });
      },

      addSpecification: (productId: number) => {
        const newSpecification: Specification = {
          id: Date.now(),
          key: "",
          value: "",
          include: true,
        };
        
        set(state => {
          const updatedProducts = state.products.map(product => {
            if (product.id === productId) {
              return {
                ...product,
                specifications: [...product.specifications, newSpecification]
              };
            }
            return product;
          });
          return { products: updatedProducts };
        });
      },

      removeSpecification: (productIndex: number, specIndex: number) => {
        set(state => {
          const updatedProducts = [...state.products];
          updatedProducts[productIndex] = ensureProductSpecifications(updatedProducts[productIndex]);
          updatedProducts[productIndex].specifications = updatedProducts[productIndex].specifications.filter((_, i) => i !== specIndex);
          return { products: updatedProducts };
        });
      },

      updateSpecification: (productId: number, specId: number, updates: Partial<Specification>) => {
        set(state => {
          const updatedProducts = state.products.map(product => {
            if (product.id === productId) {
              return {
                ...product,
                specifications: product.specifications.map(spec => {
                  if (spec.id === specId) {
                    return { ...spec, ...updates };
                  }
                  return spec;
                })
              };
            }
            return product;
          });
          return { products: updatedProducts };
        });
      },

      // Public action for updating specification include status
      updateSpecificationInclude: (productId: number, specId: number, include: boolean) => {
        set(state => {
          const updatedProducts = state.products.map(product => {
            if (product.id === productId) {
              return {
                ...product,
                specifications: product.specifications.map(spec => {
                  if (spec.id === specId) {
                    return { ...spec, include };
                  }
                  return spec;
                })
              };
            }
            return product;
          });
          return { products: updatedProducts };
        });
      },

      // Modal and toast management
      openResetModal: () => set({ isResetModalOpen: true }),
      closeResetModal: () => set({ isResetModalOpen: false }),
      
      confirmReset: () => {
        const initialState = getInitialState();
        
        set({
          nicheTitle: initialState.nicheTitle,
          products: initialState.products,
          primaryColor: initialState.primaryColor,
          secondaryColor: initialState.secondaryColor,
          includeBranding: initialState.includeBranding,
          selectedTemplate: initialState.selectedTemplate,
          generatedHtml: initialState.generatedHtml,
          isResetModalOpen: false,
          showResetSuccessToast: true,
        });
      },

      showSuccessToast: () => set({ showResetSuccessToast: true }),
      hideSuccessToast: () => set({ showResetSuccessToast: false }),
    }),
    {
      name: 'site-spark-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain fields, not UI state
      partialize: (state) => ({
        nicheTitle: state.nicheTitle,
        products: state.products,
        primaryColor: state.primaryColor,
        secondaryColor: state.secondaryColor,
        includeBranding: state.includeBranding,
        selectedTemplate: state.selectedTemplate,
        pexelsApiKey: state.pexelsApiKey,
        currentPassword: state.currentPassword,
      }),
    }
  )
);

export default useAppStore;