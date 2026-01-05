import axios from "../config/axios.config";

export const PROMO_BANNER_KEY = "promoBannerText";
export const DEFAULT_PROMO_BANNER_TEXT = "Upto 30% off on Catering Menu";
export const DELIVERY_FEE_KEY = "deliveryFee";
export const DEFAULT_DELIVERY_FEE = 50;

const readSettingValue = (payload) => {
  if (!payload) return null;
  if (payload?.data?.value !== undefined) return payload.data.value;
  if (payload?.value !== undefined) return payload.value;
  if (payload?.data?.data?.value !== undefined) return payload.data.data.value;
  return null;
};

const toNumberOrNull = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export async function fetchSettingValue(key) {
  try {
    const res = await axios.get(`settings/${key}`);
    return readSettingValue(res);
  } catch {
    return null;
  }
}

export async function fetchPromoBannerText() {
  const value = await fetchSettingValue(PROMO_BANNER_KEY);
  if (typeof value === "string") return value;
  return DEFAULT_PROMO_BANNER_TEXT;
}

export async function fetchDeliveryFee() {
  const value = await fetchSettingValue(DELIVERY_FEE_KEY);
  const numeric = toNumberOrNull(value);
  if (numeric === null) return DEFAULT_DELIVERY_FEE;
  return numeric;
}
