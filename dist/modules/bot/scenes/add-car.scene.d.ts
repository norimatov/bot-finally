import { Repository } from 'typeorm';
import { Car } from '../../../database/entities/car.entity';
import { CarInsurance } from '../../../database/entities/insurance.entity';
import { User } from '../../../database/entities/user.entity';
import { BotService } from '../bot.service';
import { ModerationService } from '../../moderation/moderation.service';
import { SceneContext } from './scane-contestx.interface';
import { MainKeyboard } from '../keyboards/main.keyboard';
export declare class AddCarScene {
    private carRepo;
    private insuranceRepo;
    private userRepo;
    private botService;
    private moderationService;
    private mainKeyboard;
    private tempData;
    constructor(carRepo: Repository<Car>, insuranceRepo: Repository<CarInsurance>, userRepo: Repository<User>, botService: BotService, moderationService: ModerationService, mainKeyboard: MainKeyboard);
    onEnter(ctx: SceneContext): Promise<void>;
    onText(ctx: SceneContext): Promise<void>;
    onPhoto(ctx: SceneContext): Promise<void>;
    onInsuranceType(ctx: SceneContext): Promise<void>;
    private showConfirmation;
    onSendToModeration(ctx: SceneContext): Promise<void>;
    onCancel(ctx: SceneContext): Promise<void>;
    private downloadFile;
    private returnToMainMenu;
    onLeave(ctx: SceneContext): Promise<void>;
    private leaveScene;
}
