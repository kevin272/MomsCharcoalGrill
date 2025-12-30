import axios from "../config/axios.config";

export const PROMO_BANNER_KEY = "promoBannerText";
export const DEFAULT_PROMO_BANNER_TEXT = "Upto 30% off on Catering Menu";

const readSettingValue = (payload) => {
  if (!payload) return null;
  if (payload?.data?.value !== undefined) return payload.data.value;
  if (payload?.value !== undefined) return payload.value;
  if (payload?.data?.data?.value !== undefined) return payload.data.data.value;
  return null;
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
