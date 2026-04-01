import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

export interface Station {
  id: number;
  code: string;
  name: string;
  status: 0 | 1;
  coverTitle: string;
  coverPrompt: string;
}

export interface SopVersion {
  id: number;
  stationId: number;
  sopName: string;
  versionNo: string;
  filePath: string;
  totalPages: number;
  isActive: boolean;
  status: 0 | 1 | 2;
}

export interface TerminalBinding {
  terminalId: string;
  stationId: number;
  updatedAt: string;
}

export interface FeedbackRecord {
  id: number;
  stationName: string;
  terminalUuid: string;
  submitter: string;
  contact?: string;
  type: string;
  content: string;
  sopName?: string;
  sopVersion?: string;
  pageNo?: number;
  mailStatus: 0 | 1 | 2;
  createTime: string;
}

export interface MailLog {
  id: number;
  feedbackId: number;
  receiverEmail: string;
  sendTime: string;
  status: 0 | 1;
  failReason?: string;
}

@Injectable()
export class AppService {
  private readonly stations: Station[] = [
    { id: 1, code: 'A01', name: '组装工站A', status: 1, coverTitle: '组装工站 SOP', coverPrompt: '请按标准作业执行' },
    { id: 2, code: 'B02', name: '检测工站B', status: 1, coverTitle: '检测工站 SOP', coverPrompt: '请确认每项检测记录' },
    { id: 3, code: 'C03', name: '包装工站C', status: 1, coverTitle: '包装工站 SOP', coverPrompt: '请注意标签与防呆检查' },
  ];

  private readonly sopVersions: SopVersion[] = [
    {
      id: 1001,
      stationId: 1,
      sopName: '组装SOP',
      versionNo: 'V1.0.0',
      filePath: '/static/sop/a01-v1.pdf',
      totalPages: 21,
      isActive: true,
      status: 1,
    },
    {
      id: 1002,
      stationId: 2,
      sopName: '检测SOP',
      versionNo: 'V1.0.0',
      filePath: '/static/sop/b02-v1.pdf',
      totalPages: 18,
      isActive: true,
      status: 1,
    },
  ];

  private readonly bindings: TerminalBinding[] = [];
  private readonly feedbacks: FeedbackRecord[] = [];
  private readonly mailLogs: MailLog[] = [];

  private feedbackIdSeed = 1;
  private mailIdSeed = 1;

  private ok<T>(data: T, message = '成功') {
    return { code: 200, data, message };
  }

  getStations() {
    return this.ok(this.stations.filter((s) => s.status === 1));
  }

  getTerminalBinding(terminalId: string) {
    const binding = this.bindings.find((item) => item.terminalId === terminalId);
    if (!binding) {
      return this.ok({ isBound: false });
    }

    const station = this.stations.find((s) => s.id === binding.stationId);
    return this.ok({ isBound: true, station, bindTime: binding.updatedAt });
  }

  bindTerminal(terminalId: string, stationId: number) {
    const station = this.stations.find((item) => item.id === stationId && item.status === 1);
    if (!station) {
      throw new NotFoundException('工站不存在或已停用');
    }

    const existed = this.bindings.find((item) => item.terminalId === terminalId);
    if (existed) {
      throw new BadRequestException('终端已绑定工站，请使用切换接口');
    }

    this.bindings.push({ terminalId, stationId, updatedAt: new Date().toISOString() });
    return this.ok({ terminalId, stationId });
  }

  switchTerminal(terminalId: string, newStationId: number) {
    const station = this.stations.find((item) => item.id === newStationId && item.status === 1);
    if (!station) {
      throw new NotFoundException('目标工站不存在或已停用');
    }

    const existed = this.bindings.find((item) => item.terminalId === terminalId);
    if (!existed) {
      this.bindings.push({ terminalId, stationId: newStationId, updatedAt: new Date().toISOString() });
    } else {
      existed.stationId = newStationId;
      existed.updatedAt = new Date().toISOString();
    }

    return this.ok({ terminalId, stationId: newStationId });
  }

  getCover(stationId: number) {
    const station = this.stations.find((item) => item.id === stationId && item.status === 1);
    if (!station) {
      throw new NotFoundException('工站不存在或已停用');
    }

    return this.ok({
      backgroundImg: '',
      mainTitle: station.coverTitle,
      promptText: station.coverPrompt,
      stationName: station.name,
    });
  }

  getActiveSop(stationId: number) {
    const active = this.sopVersions.find((item) => item.stationId === stationId && item.isActive && item.status === 1);
    if (!active) {
      throw new NotFoundException('当前工站暂无生效SOP');
    }

    return this.ok({
      sopName: active.sopName,
      versionNo: active.versionNo,
      filePath: active.filePath,
      totalPages: active.totalPages,
      isZeroIndexed: true,
      displayTotalPages: active.totalPages - 1,
    });
  }

  submitFeedback(payload: Omit<FeedbackRecord, 'id' | 'mailStatus' | 'createTime'>) {
    const feedback: FeedbackRecord = {
      id: this.feedbackIdSeed++,
      ...payload,
      mailStatus: 0,
      createTime: new Date().toISOString(),
    };

    // 简化模拟：联系方式含 fail 触发发送失败，便于测试补偿流程
    const isMailSuccess = !payload.contact?.toLowerCase().includes('fail');
    feedback.mailStatus = isMailSuccess ? 1 : 2;
    this.feedbacks.unshift(feedback);

    this.mailLogs.unshift({
      id: this.mailIdSeed++,
      feedbackId: feedback.id,
      receiverEmail: 'quality@example.com',
      sendTime: new Date().toISOString(),
      status: isMailSuccess ? 1 : 0,
      failReason: isMailSuccess ? undefined : '模拟SMTP鉴权失败，请检查配置后重试',
    });

    return this.ok({ feedbackId: feedback.id, mailStatus: feedback.mailStatus }, '反馈提交成功');
  }

  adminLogin(username: string, password: string) {
    if (username !== 'admin' || password !== '123456') {
      throw new BadRequestException('账号或密码错误');
    }

    return this.ok({ token: 'mock-admin-token', name: '系统管理员' }, '登录成功');
  }

  listFeedbacks() {
    return this.ok(this.feedbacks);
  }

  listMailLogs() {
    return this.ok(this.mailLogs);
  }

  retryMail(id: number) {
    const log = this.mailLogs.find((item) => item.id === id);
    if (!log) {
      throw new NotFoundException('邮件记录不存在');
    }
    log.status = 1;
    log.failReason = undefined;
    log.sendTime = new Date().toISOString();

    const feedback = this.feedbacks.find((item) => item.id === log.feedbackId);
    if (feedback) {
      feedback.mailStatus = 1;
    }

    return this.ok({ id: log.id, status: 1 }, '补发成功');
  }
}
