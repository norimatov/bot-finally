export declare class ExcelService {
    private readonly uploadDir;
    private readonly carsDir;
    private readonly exportsDir;
    constructor();
    generateFullReport(data: any): Promise<string>;
    generateOperatorReport(operators: any[]): Promise<string>;
    generateLeadReport(leads: any[]): Promise<string>;
    generateCarReport(cars: any[]): Promise<string>;
    generateFinanceReport(data: any): Promise<string>;
    generateCarListReport(cars: any[]): Promise<string>;
    generateInsuranceTypeReport(insurances: any[]): Promise<string>;
    exportToExcel(data: any[], type: string): Promise<Buffer>;
    exportUserRating(users: any[]): Promise<Buffer>;
    private formatHeaderRow;
    private formatHeader;
    private getStatusText;
    private calculateDaysLeft;
    private getFullUrl;
    private addCarSheet;
    private addLeadSheet;
    private addUserSheet;
    private addStatsSheet;
}
