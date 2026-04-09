export declare const KPI: {
    readonly registrar: {
        readonly perCar: 2500;
        readonly perDayTarget: 10;
        readonly perMonthTarget: 200;
        readonly bonus: {
            readonly over10: 5000;
            readonly over20: 15000;
            readonly over30: 30000;
        };
    };
    readonly operator: {
        readonly perClose: 5000;
        readonly perHotClose: 7000;
        readonly perWarmClose: 5000;
        readonly perColdClose: 3000;
        readonly perDayTarget: 5;
        readonly perMonthTarget: 100;
        readonly bonus: {
            readonly top1: 100000;
            readonly top2: 50000;
            readonly top3: 25000;
        };
    };
    readonly leadTypes: {
        readonly hot: {
            readonly name: "HOT";
            readonly days: 10;
            readonly amount: 7000;
            readonly emoji: "🔥";
        };
        readonly warm: {
            readonly name: "WARM";
            readonly days: 20;
            readonly amount: 5000;
            readonly emoji: "🌤";
        };
        readonly cold: {
            readonly name: "COLD";
            readonly days: 30;
            readonly amount: 3000;
            readonly emoji: "❄️";
        };
    };
    readonly notificationDays: readonly [10, 5, 1];
    readonly status: {
        readonly car: {
            readonly active: "active";
            readonly expired: "expired";
            readonly cancelled: "cancelled";
            readonly renewed: "renewed";
        };
        readonly lead: {
            readonly new: "new";
            readonly inProgress: "inProgress";
            readonly closed: "closed";
            readonly postponed: "postponed";
            readonly rejected: "rejected";
        };
    };
    readonly actions: {
        readonly addCar: "addCar";
        readonly closeLead: "closeLead";
        readonly renewInsurance: "renewInsurance";
    };
};
