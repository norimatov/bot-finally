
import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { LeadService } from './lead.service';

@Controller('leads')
export class LeadController {
  constructor(private leadService: LeadService) {}

  @Get('hot/:operatorId')
  async getHotLeads(@Param('operatorId') operatorId: string) {
    return this.leadService.getHotLeads(+operatorId);
  }

  @Get('warm/:operatorId')
  async getWarmLeads(@Param('operatorId') operatorId: string) {
    return this.leadService.getWarmLeads(+operatorId);
  }

  @Post(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; operatorId: number }
  ) {
    return this.leadService.updateLeadStatus(+id, body.status, body.operatorId);
  }

  @Get('stats/:operatorId')
  async getStats(@Param('operatorId') operatorId: string) {
    return this.leadService.getOperatorStats(+operatorId);
  }
}
