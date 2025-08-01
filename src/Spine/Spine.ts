import { MotionTable } from "../Motion";
import { SpineMotion } from "./Motion";


/**Spine模型*/
export type L2dvexSpineModel = {
    type?: number;
    version?:string;
    /**骨骼文件路径 */
    skeleton:string;
    /**文件引用
     * 实际Spine模型所有键全部使用小蛇型命名 但大小写不敏感
     */
    motions:MotionTable<SpineMotion>;
    /**spine控制器 */
    controllers?:SpineControllers;
    /**点击区域 */
    hit_areas?:SpineHitArea[];
    /**其他配置 */
    options:SpineOtherOptions;
    /**纹理信息 */
    atlases:Atlas[];
}
export type SpineControllers = Partial<{
    intimacy_system: Partial<{
        /**最大值 */
        max_value: number;
        /**是否启用 */
        enabled: boolean;
    }>;
    slot_opacity: {
        /**是否启用 */
        enabled?:boolean;
        items?:{
            name?: string;
            text?: string;
            ids?: string[];
            value?: number;
        }[];
    };
    slot_color: {};
}>;

export type SpineHitArea = {
    name: string;
    id: string;
    width: number;
    height: number;
};

export type SpineOtherOptions = {
    /**各向异性过滤等级 */
    aniso_level?: 0|1|2|3|4|5|6|7|8|9;
    /**边缘填充 */
    edge_padding?: boolean;
    /**着色器 */
    shader?: "Skeleton-Straight-Alpha";
    /**缩放系数 */
    scale_factor?: number;
};

export type Atlas = {
    /**打包纹理atlas文件路径 */
    atlas: string;
    /**纹理名称 */
    tex_names: string[];
    /**打包纹理png文件路径 */
    textures: string[];
};