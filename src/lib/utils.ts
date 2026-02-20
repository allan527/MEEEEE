export const PROCESSING_FEE = 10000;

export const formatUGX = (amount: number): string => `UGX ${amount.toLocaleString('en-UG')}`;

export const normalizePhoneNumber = (phone: string): string => {
  let normalized = phone.replace(/\s+/g, '');
  if (normalized.startsWith('+256')) normalized = `0${normalized.slice(4)}`;
  if (normalized.startsWith('256')) normalized = `0${normalized.slice(3)}`;
  return normalized;
};

export const maskPhoneNumber = (phone: string): string => (phone.length === 10 ? `${phone.slice(0, 4)} XXX XXX` : phone);

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatTime = (date: Date): string => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

export const plus30Days = (date: Date): string => {
  const end = new Date(date);
  end.setDate(end.getDate() + 30);
  return formatDate(end);
};
