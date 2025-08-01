





/**控制器 */
export type L2dControllers = Partial<{
    /**参数拖曳 */
    ParamHit: ParamHit;
    ParamLoop: {};
    KeyTrigger: {};
    ParamTrigger: {};
    AreaTrigger: {};
    HandTrigger: {};
    /**眨眼 */
    EyeBlink: EyeBlink;
    /**嘴型同步 */
    LipSync: LipSync;
    /**鼠标追踪 */
    MouseTracking: MouseTracking;
    /**自动呼吸 */
    AutoBreath: SwitchAble;
    /**小幅度动作 */
    ExtraMotion: SwitchAble;
    /**加速器 */
    Accelerometer: SwitchAble;
    /**麦克风 */
    Microphone: SwitchAble;
    Transform: SwitchAble;
    /**面部追踪 */
    FaceTracking: SwitchAble;
    /**手部追踪 */
    HandTracking: SwitchAble;
    /**参数值 */
    ParamValue: SwitchAble;
    /**部件透明度 */
    PartOpacity: {};
    /**网格透明度 */
    ArtmeshOpacity: ArtmeshOpacity;
    /**网格颜色 */
    ArtmeshColor: ArtmeshColor;
    /**好感度系统 */
    IntimacySystem: IntimacySystem;
}>;

/**可开关的 */
type SwitchAble = {
    /**是否启用 */
    Enabled: boolean;
}

type ControllerOption<T extends object>= Partial<T&SwitchAble>;

/**参数拖曳 */
export type ParamHit = ControllerOption<{
    Items: {
        /**组名 */
        Name: string;
        /**参数id */
        Id: string;
        /**触发区域 */
        HitArea: string;
        /**坐标轴 0:X 1:Y */
        Axis: 0|1;
        /**因子 */
        Factor: number;
        /**释放类型 0:线性 1:缓出 2:快出 3:缓入缓出 */
        ReleaseType: 0|1|2|3;
        /**最小值动作 */
        MinMtn: string;
        /**最大值动作 */
        MaxMtn: string;
    }[];
}>;
/**眨眼 */
export type EyeBlink = ControllerOption<{
    /**最小间隔 */
    MinInterval: number;
    /**最大间隔 */
    MaxInterval: number;
}>;
/**嘴型同步 */
export type LipSync = ControllerOption<{
    /**增益 */
    Gain: number;
    /**平花时间 */
    SmoothTime: number;
    /**项目 */
    Items: Partial<{
        /**参数ID */
        Id: string;
        /**最小值 */
        Min: number;
        /**最大值 */
        Max: number;
        /**翻转 */
        Inverted: boolean;
        /**混合模式 0|undefined:覆盖 1:叠加 2:乘算*/
        BlendMode: 0|1|2;
        /**比重 */
        Input: number;
    }>[];
}>
/**鼠标追踪 */
export type MouseTracking = ControllerOption<{
    /**平滑时间 */
    SmoothTime: number;
    /**项目 */
    Items:Partial<{
        /**参数ID */
        Id: string;
        /**最小值 */
        Min: number;
        /**最大值 */
        Max: number;
        /**混合模式 0|undefined:覆盖 1:叠加 2:乘算*/
        BlendMode: 0|1|2;
        /**坐标轴 0:X 1:Y */
        Axis: 0|1;
        /**比重 */
        Input: number;
    }>[];
}>
/**网格透明度 */
export type ArtmeshOpacity = ControllerOption<{
    Items: {
        /**组名 */
        Name: string;
        /**文本 */
        Text: string;
        /**网格id组 */
        Ids: string[];
        /**值 */
        Value: number;
    }[];
}>
/**网格颜色 */
export type ArtmeshColor = ControllerOption<{
    Items: Partial<{
        /**组名 */
        Name: string;
        /**文本 */
        Text: string;
        /**网格id组 */
        Ids: string[];
        /**当前值 hex颜色 */
        Value: number;
        /**可选关键值 */
        KeyValues: {
            /**颜色名 */
            Key: string;
            /**hex颜色 */
            Value: number;
        }[];
    }>[];
}>
/**好感度系统 */
export type IntimacySystem = ControllerOption<{
    /**最大值 */
    MaxValue: number;
}>