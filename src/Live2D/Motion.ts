import { MotionCommand } from "../Motion";
import { VarFloatGetCode, VarFloatSetCode } from "../VarFloat";

export type L2dMotion = {
    /**动作名 */
    Name?:string;
    /**动作的动作json文件路径 */
    File?:string;
    /**动作的音效文件路径 */
    Sound?:string;
    /**声音出现的延迟 */
    SoundDelay?:number;
    /**声音通道 */
    SoundChannel?:0|1|2;
    /**音量 */
    SoundVolume?:number;
    /**循环声音 */
    SoundLoop?:boolean;
    /**循环动作 */
    FileLoop?:boolean
    /**动作的文本 */
    Text?:string;
    /**文本持续时间 */
    TextDuration?:number;
    /**表情文件 */
    Expression?:string;
    /**文本出现的延迟 */
    TextDelay?:number;
    /**淡入 */
    FadeIn?: number;
    /**淡出 */
    FadeOut?: number;
    /**动作持续时间 Spine若不设置, 连续动作则会出现明显卡顿 若设置仍有卡顿, 使用postprocess动作延长解决 */
    MotionDuration?:number
    /**前置动作指令 使用前置指令是唯一打断idle动作的方式 */
    Command?:MotionCommand;
    /**后置动作指令 */
    PostCommand?:MotionCommand;
    /**下一个动作 */
    NextMtn?:string;
    /**提前运行的动作 */
    PreMtn?:string;
    /**触发权重 */
    Weight?:number;
    /**变量操作 */
    VarFloats?:L2dVarFloatObject[];
    /**好感度 */
    Intimacy?:L2dIntimacyOption
    /**选项表 */
    Choices?:L2dChoice[];
    /**允许触发时间 */
    TimeLimit?:L2dTimeLimit;
    /**语言 */
    Language?:string;
}
/**好感度 */
export type L2dIntimacyOption={
    /**允许触发的最小值 */
    Min?:number
    /**允许触发的最大值 */
    Max?:number
    /**触发时的增量 */
    Bonus?:number
}
/**菜单选项 */
export type L2dChoice={
    /**选项文本 */
    Text: string
    /**下一个动作名称 */
    NextMtn: string
}
/**时间限制 */
export type L2dTimeLimit={
    /**允许触发时间范围的起始时 */
    Hour: number
    /**允许触发时间范围的起始分 */
    Minute: number
    /**允许触发时间的持续时间 */
    Sustain: number
}

export type L2dVarFloatObject = VarFloatGetObject|VarFloatSetObject;

type VarFloatGetObject={
    /**名称 */
    Name: string
    /**判断操作类型为1 */
    Type: 1
    /**判断命令 */
    Code: VarFloatGetCode
}
type VarFloatSetObject={
    /**名称 */
    Name: string
    /**写入操作类型为2 */
    Type: 2
    /**写入命令 */
    Code: VarFloatSetCode
}