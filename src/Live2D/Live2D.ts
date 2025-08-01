import { MotionTable } from "../Motion";
import { L2dControllers } from "./Controllers";



/**L2d模型 */
export type L2dvexLive2DModel = {
    Version?:number;
    Type:number;
    /**点击区域 */
    HitAreas?:L2dHitArea[];
    /**其它选项 */
    Options?:L2dOtherOptions;
    /**文件引用 */
    FileReferences:FileReferences;
    Controllers?:L2dControllers;
}


/**文件引用 */
export type FileReferences = {
    /**moc文件 */
    Moc:string
    /**贴图文件 */
    Textures:string
    /**物理文件 */
    Physics:string
    PhysicsV2?:{
        File:string
    }
    /**动作配置 */
    Motions?:MotionTable
};

/**点击区域 */
export type L2dHitArea = {
    /**区域名 */
    Name: string;
    /**网格ID */
    Id: string;
};

/**其它选项 */
export type L2dOtherOptions = Partial<{
    /**各向异性过滤等级 1~9 */
    AnisoLevel: 1|2|3|4|5|6|7|8|9;
}>;