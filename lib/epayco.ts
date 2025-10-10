export const epaycoConfig = {
  publicKey: process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY || '',
  privateKey: process.env.EPAYCO_PRIVATE_KEY || '',
  test: process.env.NODE_ENV === 'development', 
  customerId: process.env.EPAYCO_P_CUST_ID_CLIENTE || '',
  pKey: process.env.EPAYCO_P_KEY || '',
};

export interface EpaycoCheckoutData {
  name: string;
  description: string;
  invoice: string;
  currency: string;
  amount: string;
  tax_base: string;
  tax: string;
  country: string;
  lang: string;
  external: string;
  extra1?: string;
  extra2?: string;
  extra3?: string;
  confirmation: string;
  response: string;
  name_billing?: string;
  type_doc_billing?: string;
  number_doc_billing?: string;
  email_billing?: string;
  mobilephone_billing?: string;
  address_billing?: string;
}

export interface EpaycoPaymentResponse {
  success: boolean;
  title?: string;
  textResponse?: string;
  lastAction?: string;
  transactionID?: string;
  ref_payco?: string;
  extra1?: string;
  extra2?: string;
  extra3?: string;
  description?: string;
  invoice?: string;
  amount?: string;
  currency?: string;
  bank_name?: string;
  cardType?: string;
  response?: string;
  response_reason_text?: string;
  approval_code?: string;
  transaction_date?: string;
  errorCode?: string;
}

