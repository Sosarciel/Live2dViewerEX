import { L2dChoice, L2dMotion, L2dTimeLimit } from "../Live2D";
import { VarFloatGetCode, VarFloatSetCode } from "../VarFloat";




export type SpineMotion = {
    /**动作名 */
    name?: L2dMotion['Name'];
    /**动作的动作json文件路径 */
    file?: L2dMotion['File'];
    /**动作的音效文件路径 */
    sound?: L2dMotion['Sound'];
    /**声音出现的延迟 */
    sound_delay?: L2dMotion['SoundDelay'];
    /**声音通道 */
    sound_channel?: L2dMotion['SoundChannel'];
    /**音量 */
    sound_volume?: L2dMotion['SoundVolume'];
    /**循环声音 */
    sound_loop?: L2dMotion['SoundLoop'];
    /**循环动作 */
    file_loop?: L2dMotion['FileLoop'];
    /**动作的文本 */
    text?: L2dMotion['Text'];
    /**文本持续时间 */
    text_duration?: L2dMotion['TextDuration'];
    /**表情文件 */
    expression?: L2dMotion['Expression'];
    /**文本出现的延迟 */
    text_delay?: L2dMotion['TextDelay'];
    /**动作持续时间 */
    motion_duration?: L2dMotion['MotionDuration'];
    /**淡入 */
    fade_in?:L2dMotion['FadeIn'];
    /**淡出 */
    fade_out?:L2dMotion['FadeOut'];
    /**前置动作指令 使用前置指令是唯一打断idle动作的方式 */
    command?: L2dMotion['Command'];
    /**后置动作指令 */
    post_command?: L2dMotion['PostCommand'];
    /**下一个动作 */
    next_mtn?: L2dMotion['NextMtn'];
    /**提前运行的动作 */
    pre_mtn?: L2dMotion['PreMtn'];
    /**触发权重 */
    weight?: L2dMotion['Weight'];
    /**变量操作 */
    var_floats?: SpineVarFloatObject[];
    /**好感度 */
    intimacy?:SpineIntimacyOption
    /**选项表 */
    choices?: SpineChoice[];
    /**允许触发时间 */
    time_limit?: SpineTimeLimit;
    /**语言 */
    language?: L2dMotion['Language'];
};

export type SpineChoice = {
    /**选项文本 */
    text: L2dChoice['Text'];
    /**下一个动作名称 */
    next_mtn: L2dChoice['NextMtn'];
};

export type SpineTimeLimit = {
    /**允许触发时间范围的起始时 */
    hour: L2dTimeLimit['Hour'];
    /**允许触发时间范围的起始分 */
    minute: L2dTimeLimit['Minute'];
    /**允许触发时间的持续时间 */
    sustain: L2dTimeLimit['Sustain'];
};


/**好感度 */
export type SpineIntimacyOption={
    /**允许触发的最小值 */
    min?:number
    /**允许触发的最大值 */
    max?:number
    /**触发时的增量 */
    bonus?:number
}

export type SpineVarFloatObject = VarFloatGetObject|VarFloatSetObject;

type VarFloatGetObject={
    /**名称 */
    name: string
    /**判断操作类型为1 */
    type: 1
    /**判断命令 */
    code: VarFloatGetCode
}
type VarFloatSetObject={
    /**名称 */
    name: string
    /**写入操作类型为2 */
    type: 2
    /**写入命令 */
    code: VarFloatSetCode
}