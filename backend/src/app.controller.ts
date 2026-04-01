import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api/v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('stations')
  getStations() {
    return this.appService.getStations();
  }

  @Get('terminal/binding')
  getBinding(@Query('terminalId') terminalId: string) {
    return this.appService.getTerminalBinding(terminalId);
  }

  @Post('terminal/binding')
  bindTerminal(@Body() body: { terminalId: string; stationId: number }) {
    return this.appService.bindTerminal(body.terminalId, Number(body.stationId));
  }

  @Post('terminal/switch')
  switchTerminal(@Body() body: { terminalId: string; newStationId: number }) {
    return this.appService.switchTerminal(body.terminalId, Number(body.newStationId));
  }

  @Get('station/:id/cover')
  getCover(@Param('id') id: string) {
    return this.appService.getCover(Number(id));
  }

  @Get('station/:id/active-sop')
  getActiveSop(@Param('id') id: string) {
    return this.appService.getActiveSop(Number(id));
  }

  @Post('feedback')
  submitFeedback(
    @Body()
    body: {
      stationName: string;
      terminalUuid: string;
      submitter: string;
      contact?: string;
      type: string;
      content: string;
      sopName?: string;
      sopVersion?: string;
      pageNo?: number;
    },
  ) {
    return this.appService.submitFeedback(body);
  }

  @Post('admin/login')
  adminLogin(@Body() body: { username: string; password: string }) {
    return this.appService.adminLogin(body.username, body.password);
  }

  @Get('admin/feedbacks')
  listFeedbacks() {
    return this.appService.listFeedbacks();
  }

  @Get('admin/mail-logs')
  listMailLogs() {
    return this.appService.listMailLogs();
  }

  @Post('admin/mail-logs/:id/retry')
  retryMail(@Param('id') id: string) {
    return this.appService.retryMail(Number(id));
  }
}
