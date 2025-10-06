export type SellerSession = {
  id: string;
  companyId: string;
  companyName: string;
  contactName: string;
  email: string;
  role: "supplier";
};

export const mockSellerSession: SellerSession = {
  id: "seller-user-001",
  companyId: "demo-supplier-tr",
  companyName: "Demo Supplier TR",
  contactName: "Amal Yılmaz",
  email: "amal@demosuppliertr.com",
  role: "supplier",
};
