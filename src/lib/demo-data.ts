export type DemoPet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  emoji: string;
  alert?: string;
};

export const demoPets: DemoPet[] = [
  { id: "bamboo", name: "بامبو", species: "سگ", breed: "میکس", age: "۳ سال", weight: "۱۲٫۴ کیلوگرم", emoji: "🐕" },
  { id: "luna", name: "لونا", species: "گربه", breed: "خانگی", age: "۱ سال", weight: "۳٫۲ کیلوگرم", emoji: "🐈", alert: "حساسیت غذایی ثبت‌شده" },
  { id: "rio", name: "ریو", species: "پرنده", breed: "عروس هلندی", age: "۲ سال", weight: "۹۴ گرم", emoji: "🦜" },
];

export const demoTasks = [
  { id: "meal", title: "وعده غذایی صبح", pet: "بامبو", time: "۰۸:۰۰", category: "تغذیه" },
  { id: "journal", title: "ثبت وضعیت روزانه", pet: "لونا", time: "۱۹:۰۰", category: "ژورنال" },
  { id: "groom", title: "نظافت قفس", pet: "ریو", time: "۲۰:۳۰", category: "بهداشت" },
];

export const demoPatients = [
  { id: "P-1001", name: "بامبو", species: "سگ", owner: "کاربر نمونه ۱", visit: "معاینه دوره‌ای", state: "در انتظار" },
  { id: "P-1002", name: "لونا", species: "گربه", owner: "کاربر نمونه ۲", visit: "پیگیری تغذیه", state: "پذیرش شده" },
  { id: "P-1003", name: "ریو", species: "پرنده", owner: "کاربر نمونه ۳", visit: "معاینه", state: "برنامه‌ریزی شده" },
];
