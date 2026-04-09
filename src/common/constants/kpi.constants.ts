// src/common/constants/kpi.constants.ts
export const KPI = {
  registrar: {
    perCar: 2500,
    perDayTarget: 10,
    perMonthTarget: 200,
    bonus: {
      over10: 5000,
      over20: 15000,
      over30: 30000
    }
  },
  
  operator: {
    perClose: 5000,
    perHotClose: 7000,     // TO'G'RI
    perWarmClose: 5000,    // TO'G'RI
    perColdClose: 3000,
    perDayTarget: 5,
    perMonthTarget: 100,
    bonus: {
      top1: 100000,
      top2: 50000,
      top3: 25000
    }
  },
  
  leadTypes: {
    hot: {
      name: 'HOT',
      days: 10,
      amount: 7000,
      emoji: '🔥'
    },
    warm: {
      name: 'WARM',
      days: 20,
      amount: 5000,
      emoji: '🌤'
    },
    cold: {
      name: 'COLD',
      days: 30,
      amount: 3000,
      emoji: '❄️'
    }
  },
  
  notificationDays: [10, 5, 1],
  
  status: {
    car: {
      active: 'active',
      expired: 'expired',
      cancelled: 'cancelled',
      renewed: 'renewed'
    },
    lead: {
      new: 'new',
      inProgress: 'inProgress',
      closed: 'closed',
      postponed: 'postponed',
      rejected: 'rejected'
    }
  },
  
  actions: {
    addCar: 'addCar',
    closeLead: 'closeLead',
    renewInsurance: 'renewInsurance'
  }
} as const;