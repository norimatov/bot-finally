import { LeadService } from './lead.service';
export declare class LeadController {
    private leadService;
    constructor(leadService: LeadService);
    getHotLeads(operatorId: string): Promise<import("../../database/entities/lead.entity").Lead[]>;
    getWarmLeads(operatorId: string): Promise<import("../../database/entities/lead.entity").Lead[]>;
    updateStatus(id: string, body: {
        status: string;
        operatorId: number;
    }): Promise<import("../../database/entities/lead.entity").Lead>;
    getStats(operatorId: string): Promise<any>;
}
