import { Repository } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { Kpi } from '../../../database/entities/kpi.entity';
import { SceneContext } from './scane-contestx.interface';
export declare class MyStatsScene {
    private userRepo;
    private kpiRepo;
    constructor(userRepo: Repository<User>, kpiRepo: Repository<Kpi>);
    onEnter(ctx: SceneContext): Promise<void>;
    private leaveScene;
}
