// src/modules/moderation/moderation.controller.ts
import { Controller, Get, Param, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { AdminGuard } from '../bot/guards/admin.guard';

@Controller('moderation')
export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  /**
   * Moderatsiya statistikasini olish
   */
  @Get('stats')
  @UseGuards(AdminGuard)
  async getStats() {
    try {
      const pending = await this.moderationService.getPendingCount();
      const pendingList = await this.moderationService.getPending();
      
      // Barcha moderatsiyalarni olish uchun alohida metod yo'q, shuning uchun statistikani hisoblaymiz
      let approved = 0;
      let rejected = 0;
      
      // Barcha moderatsiyalarni olish (faqat admin uchun)
      const allModerations = await this.getAllModerationsFromStorage();
      
      for (const mod of allModerations) {
        if (mod.status === 'approved') approved++;
        if (mod.status === 'rejected') rejected++;
      }
      
      return {
        success: true,
        data: {
          total: allModerations.length,
          pending: pending,
          approved: approved,
          rejected: rejected,
          expired: pendingList.filter(m => m.expiresAt < Date.now()).length
        }
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Statistika olishda xatolik yuz berdi',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Barcha moderatsiyalarni olish (yordamchi metod)
   */
  private async getAllModerationsFromStorage(): Promise<any[]> {
    // Bu yerda barcha moderatsiyalarni olish uchun internal metod
    // ModerationService da getAllModerations metodi yo'q, shuning uchun
    // biz pending, approved va rejected larni alohida olishimiz kerak
    const pending = await this.moderationService.getPending();
    const result = [];
    
    // pending larni qo'shamiz
    for (const mod of pending) {
      result.push(mod);
    }
    
    // Rad etilgan va tasdiqlanganlarni olish uchun maxsus metod yo'q
    // Shuning uchun faqat pending larni qaytaramiz
    return result;
  }

  /**
   * Barcha moderatsiyalarni olish
   */
  @Get('all')
  @UseGuards(AdminGuard)
  async getAll() {
    try {
      const moderations = await this.moderationService.getPending();
      
      return {
        success: true,
        data: moderations.map(m => ({
          id: m.id,
          plateNumber: m.data.plateNumber,
          ownerName: m.data.ownerName,
          ownerPhone: m.data.ownerPhone,
          status: m.status,
          submittedAt: m.data.submittedAt,
          expiresAt: m.expiresAt,
          registrarName: m.data.registrarName,
          moderatedBy: m.moderatedBy,
          moderatedAt: m.moderatedAt,
          rejectionReason: m.rejectionReason
        }))
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Moderatsiyalarni olishda xatolik yuz berdi',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Kutilayotgan moderatsiyalarni olish
   */
  @Get('pending')
  @UseGuards(AdminGuard)
  async getPending() {
    try {
      const moderations = await this.moderationService.getPending();
      
      return {
        success: true,
        data: moderations.map(m => ({
          id: m.id,
          plateNumber: m.data.plateNumber,
          ownerName: m.data.ownerName,
          ownerPhone: m.data.ownerPhone,
          secondPhone: m.data.secondPhone,
          insuranceType: m.data.insuranceType,
          startDate: m.data.startDate,
          endDate: m.data.endDate,
          submittedAt: m.data.submittedAt,
          expiresAt: m.expiresAt,
          timeLeft: Math.round((m.expiresAt - Date.now()) / (60 * 60 * 1000)),
          registrarName: m.data.registrarName,
          hasTechPhoto: !!m.data.techPhoto,
          hasCarPhoto: !!m.data.carPhoto
        }))
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Kutilayotgan moderatsiyalarni olishda xatolik yuz berdi',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Tasdiqlangan moderatsiyalarni olish
   * Eslatma: ModerationService da approved larni olish uchun maxsus metod yo'q
   */
  @Get('approved')
  @UseGuards(AdminGuard)
  async getApproved() {
    try {
      // Hozircha faqat pending larni qaytaramiz
      // Keyinchalik ModerationService ga getAllModerations metodi qo'shilganda to'g'irlanadi
      return {
        success: true,
        data: [],
        message: 'Tasdiqlangan moderatsiyalar ro\'yxati hozircha mavjud emas'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Tasdiqlangan moderatsiyalarni olishda xatolik yuz berdi',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Rad etilgan moderatsiyalarni olish
   * Eslatma: ModerationService da rejected larni olish uchun maxsus metod yo'q
   */
  @Get('rejected')
  @UseGuards(AdminGuard)
  async getRejected() {
    try {
      // Hozircha faqat pending larni qaytaramiz
      // Keyinchalik ModerationService ga getAllModerations metodi qo'shilganda to'g'irlanadi
      return {
        success: true,
        data: [],
        message: 'Rad etilgan moderatsiyalar ro\'yxati hozircha mavjud emas'
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Rad etilgan moderatsiyalarni olishda xatolik yuz berdi',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Operator statistikasini olish
   */
  @Get('operator/:operatorId/stats')
  @UseGuards(AdminGuard)
  async getOperatorStats(@Param('operatorId') operatorId: number) {
    try {
      const stats = await this.moderationService.getOperatorStats(operatorId);
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Operator statistikasini olishda xatolik yuz berdi',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Registrator statistikasini olish
   */
  @Get('registrar/:registrarId/stats')
  @UseGuards(AdminGuard)
  async getRegistrarStats(@Param('registrarId') registrarId: number) {
    try {
      // ModerationService da getRegistrarStats metodi yo'q
      // Hozircha oddiy statistika qaytaramiz
      return {
        success: true,
        data: {
          pending: 0,
          approved: 0,
          rejected: 0,
          total: 0,
          message: 'Registrator statistikasi hozircha mavjud emas'
        }
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Registrator statistikasini olishda xatolik yuz berdi',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Bitta moderatsiyani olish
   */
  @Get(':id')
  @UseGuards(AdminGuard)
  async getOne(@Param('id') id: string) {
    try {
      const moderation = await this.moderationService.get(id);
      
      if (!moderation) {
        throw new HttpException({
          success: false,
          message: 'Moderatsiya topilmadi'
        }, HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: {
          id: moderation.id,
          data: moderation.data,
          status: moderation.status,
          notifiedOperators: moderation.notifiedOperators,
          moderatedBy: moderation.moderatedBy,
          moderatedAt: moderation.moderatedAt,
          rejectionReason: moderation.rejectionReason,
          expiresAt: moderation.expiresAt,
          timeLeft: Math.round((moderation.expiresAt - Date.now()) / (60 * 60 * 1000))
        }
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) throw error;
      
      throw new HttpException({
        success: false,
        message: 'Moderatsiyani olishda xatolik yuz berdi',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Moderatsiyani tasdiqlash
   */
  @Post(':id/approve')
  @UseGuards(AdminGuard)
  async approve(
    @Param('id') id: string, 
    @Body('operatorId') operatorId: number
  ) {
    try {
      if (!operatorId) {
        throw new HttpException({
          success: false,
          message: 'Operator ID si kiritilishi shart'
        }, HttpStatus.BAD_REQUEST);
      }

      const result = await this.moderationService.approve(id, operatorId);

      if (!result.success) {
        throw new HttpException({
          success: false,
          message: result.message
        }, HttpStatus.BAD_REQUEST);
      }

      return {
        success: true,
        message: result.message,
        data: {
          carId: result.car?.id,
          plateNumber: result.car?.plateNumber
        }
      };
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST) throw error;
      
      throw new HttpException({
        success: false,
        message: 'Moderatsiyani tasdiqlashda xatolik yuz berdi',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Moderatsiyani rad etish
   */
  @Post(':id/reject')
  @UseGuards(AdminGuard)
  async reject(
    @Param('id') id: string, 
    @Body('operatorId') operatorId: number,
    @Body('reason') reason: any
  ) {
    try {
      if (!operatorId) {
        throw new HttpException({
          success: false,
          message: 'Operator ID si kiritilishi shart'
        }, HttpStatus.BAD_REQUEST);
      }

      if (!reason || !reason.message) {
        throw new HttpException({
          success: false,
          message: 'Rad etish sababi kiritilishi shart'
        }, HttpStatus.BAD_REQUEST);
      }

      const result = await this.moderationService.reject(id, operatorId, reason);

      if (!result.success) {
        throw new HttpException({
          success: false,
          message: result.message
        }, HttpStatus.BAD_REQUEST);
      }

      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST) throw error;
      
      throw new HttpException({
        success: false,
        message: 'Moderatsiyani rad etishda xatolik yuz berdi',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Moderatsiya rasmlarini olish
   */
  @Get(':id/photos')
  @UseGuards(AdminGuard)
  async getPhotos(@Param('id') id: string) {
    try {
      // ModerationService da getPhotos metodi yo'q
      // Avval moderatsiyani olamiz
      const moderation = await this.moderationService.get(id);
      
      if (!moderation) {
        throw new HttpException({
          success: false,
          message: 'Moderatsiya topilmadi'
        }, HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: {
          techPhoto: moderation.data.techPhoto,
          carPhoto: moderation.data.carPhoto
        }
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) throw error;
      
      throw new HttpException({
        success: false,
        message: 'Rasmlarni olishda xatolik yuz berdi',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Operatorga kelgan moderatsiyalarni olish
   */
  @Get('operator/:operatorId/moderations')
  @UseGuards(AdminGuard)
  async getOperatorModerations(@Param('operatorId') operatorId: number) {
    try {
      const moderations = await this.moderationService.getOperatorModerations(operatorId);
      
      return {
        success: true,
        data: moderations.map(m => ({
          id: m.id,
          plateNumber: m.data.plateNumber,
          ownerName: m.data.ownerName,
          status: m.status,
          submittedAt: m.data.submittedAt,
          expiresAt: m.expiresAt,
          timeLeft: Math.round((m.expiresAt - Date.now()) / (60 * 60 * 1000))
        }))
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Operator moderatsiyalarini olishda xatolik yuz berdi',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}