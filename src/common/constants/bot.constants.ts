export const ROLES = {
  registrar: 'registrar', // Katta harf emas, kichik harf
  operator: 'operator',   // Katta harf emas, kichik harf
  admin: 'admin'          // Katta harf emas, kichik harf
} as const;

export const SCENES = {
  addCar: 'ADD_CAR',
  myStats: 'MY_STATS',
  rules: 'RULES',
  hotLeads: 'HOT_LEADS',
  warmLeads: 'WARM_LEADS',
  coldLeads: 'COLD_LEADS',
  operatorStats: 'OPERATOR_STATS'
} as const;

export const BOT_MESSAGES = {
  welcome: '👋 Xush kelibsiz!',
  addCar: '🚗 Avtomobil qo\'shish',
  myStats: '🏠 Mening natijam',
  rules: '📄 Qoidalar',
  adminPanel: '👑 Admin panel',
  hotLeads: '🔥 Hot leadlar',
  warmLeads: '🌤 Warm leadlar'
} as const;